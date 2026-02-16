"""
Jira REST API client for test management.
"""

import logging
import re
from pathlib import Path

import requests

from .models import JiraTestCase, TestResult

logger = logging.getLogger(__name__)


class JiraClient:
    """Client for interacting with Jira REST API."""

    def __init__(
        self,
        jira_reporting_url: str,
        api_token: str,
        project_key: str,
        zephyr_project_id: str | None = None,
    ) -> None:
        self.jira_reporting_url = jira_reporting_url.rstrip("/")
        self.api_token = api_token
        self.project_key = project_key
        self.timeout = 30
        self.zephyr_project_id = zephyr_project_id

        self.session = requests.Session()

        self.session.headers.update(
            {
                "Authorization": f"Bearer {api_token}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            }
        )

        self.required_fields: dict[str, object] = {}

        self._field_id_cache: dict[str, str | None] = {}
        self._zephyr_status_cache: dict[str, int] = {}

    def _make_request(  # noqa: PLR0913
        self,
        method: str,
        url: str,
        data: dict | None = None,
        params: dict | None = None,
        files: dict | None = None,
        api_name: str = "Jira",
    ) -> dict:
        """Make authenticated API request."""
        try:
            kwargs = {"params": params, "timeout": self.timeout}
            if method == "GET":
                response = self.session.get(url, **kwargs)
            elif method == "POST":
                kwargs["files" if files else "json"] = files or data
                if files:
                    kwargs["data"] = data
                response = self.session.post(url, **kwargs)
            elif method == "PUT":
                response = self.session.put(url, json=data, **kwargs)
            elif method == "DELETE":
                response = self.session.delete(url, **kwargs)
            else:
                error_msg = f"Unsupported method: {method}"
                raise ValueError(error_msg)
            response.raise_for_status()
            try:
                return response.json() if response.content else {}
            except ValueError as e:
                logger.debug("Failed to parse %s JSON response: %s", api_name, e)
                return {}
        except requests.exceptions.RequestException as e:
            logger.debug("%s API request failed: %s", api_name, e)
            if hasattr(e, "response") and e.response is not None:
                logger.debug("%s response: %s", api_name, e.response.text)
            raise

    def _make_jira_request(
        self,
        method: str,
        endpoint: str,
        data: dict | None = None,
        params: dict | None = None,
        files: dict | None = None,
    ) -> dict:
        """Make authenticated request to Jira API."""
        return self._make_request(
            method,
            f"{self.jira_reporting_url}/rest/api/2/{endpoint}",
            data,
            params,
            files,
            "Jira",
        )

    def _make_zephyr_request(
        self,
        method: str,
        endpoint: str,
        data: dict | None = None,
        params: dict | None = None,
        files: dict | None = None,
    ) -> dict:
        """Make authenticated request to Zephyr Essential DC API."""
        url = f"{self.jira_reporting_url.rstrip('/')}/rest/zapi/latest/{endpoint}"
        return self._make_request(method, url, data=data, params=params, files=files)

    def get_zephyr_test_cycles(self, version_id: int | None = None) -> list[dict]:
        """Get all test cycles from Zephyr Essential DC for the project."""
        if not (project_id := self.zephyr_project_id or self.get_project_id()):
            logger.warning("Zephyr project id not configured")
            return []

        params: dict[str, object] = {"projectId": int(project_id)}
        if version_id is not None:
            params["versionId"] = int(version_id)

        try:
            response = self._make_zephyr_request("GET", "cycle", params=params)
            logger.debug("Zephyr cycles API response type: %s", type(response))
            logger.debug("Zephyr cycles API response: %s", response)

            if isinstance(response, list):
                cycles = response
            elif (
                isinstance(response, dict)
                and "records" in response
                and isinstance(response["records"], list)
            ):
                cycles = response["records"]
            elif isinstance(response, dict):
                cycles = [
                    {**value, "id": key}
                    for key, value in response.items()
                    if isinstance(value, dict) and "name" in value
                ]
            else:
                cycles = []

            logger.info("Retrieved %d test cycles from Zephyr", len(cycles))
            return cycles
        except requests.exceptions.RequestException as e:
            logger.warning("Failed to get Zephyr test cycles: %s", e)
            return []

    def _get_issue_id(self, issue_key: str) -> str | None:
        """Resolve Jira issue id from issue key."""
        try:
            return self._make_jira_request(
                "GET", f"issue/{issue_key}", params={"fields": "id"}
            ).get("id")
        except requests.exceptions.RequestException:
            logger.exception("Failed to resolve issue id for %s", issue_key)
            return None

    def get_version_id_by_name(self, version_name: str) -> int | None:
        """Resolve Jira version id from version name."""
        try:
            response = self._make_jira_request(
                "GET", f"project/{self.project_key}/versions"
            )
            if not isinstance(response, list):
                return None
            for version in response:
                if (
                    isinstance(version, dict)
                    and version.get("name", "").lower() == version_name.lower()
                ):
                    version_id = version.get("id")
                    return int(version_id) if version_id is not None else None
            return None
        except requests.exceptions.RequestException:
            logger.exception("Failed to resolve version id for %s", version_name)
            return None

    def get_zephyr_status_id(self, result: TestResult) -> int:
        """Resolve Zephyr execution status id for a result."""
        if (cache_key := result.value) in self._zephyr_status_cache:
            return self._zephyr_status_cache[cache_key]

        desired_name = {
            TestResult.PASS: "PASS",
            TestResult.FAIL: "FAIL",
            TestResult.BLOCKED: "BLOCKED",
            TestResult.SKIPPED: "UNEXECUTED",
            TestResult.NOT_EXECUTED: "UNEXECUTED",
        }.get(result, "FAIL")

        try:
            response = self._make_zephyr_request("GET", "util/testExecutionStatus")
            if isinstance(response, list):
                for status in response:
                    if (
                        isinstance(status, dict)
                        and str(status.get("name", "")).upper() == desired_name
                        and (status_id_value := status.get("id")) is not None
                    ):
                        status_id = int(status_id_value)
                        self._zephyr_status_cache[cache_key] = status_id
                        return status_id
        except requests.exceptions.RequestException:
            logger.debug("Failed to load Zephyr status list")

        fallback_map = {
            TestResult.PASS: 1,
            TestResult.FAIL: 2,
            TestResult.BLOCKED: 4,
            TestResult.SKIPPED: -1,
            TestResult.NOT_EXECUTED: -1,
        }
        status_id = fallback_map.get(result, 2)
        self._zephyr_status_cache[cache_key] = status_id
        return status_id

    def add_test_to_cycle(  # noqa: PLR0911
        self,
        test_case_key: str,
        cycle_id: int,
        version_id: int = -1,
        project_id: int | None = None,
    ) -> str | None:
        """Add a test case to a Zephyr cycle, creating a test execution."""
        if not (resolved_project_id := self._resolve_project_id(project_id)):
            return None
        if not (issue_id := self._get_issue_id(test_case_key)):
            logger.warning("Unable to resolve issue id for %s", test_case_key)
            return None

        try:
            logger.info("Adding test %s to cycle %s", test_case_key, cycle_id)
            execution_payload = {
                "issueId": issue_id,
                "cycleId": str(cycle_id),
                "projectId": str(resolved_project_id),
                "versionId": version_id,
                "status": {"id": "-1"},
            }
            response = self._make_zephyr_request(
                "POST", "execution", data=execution_payload
            )

            if isinstance(response, dict):
                if exec_id := response.get("id") or response.get("executionId"):
                    logger.info(
                        "Created execution %s for test %s in cycle %s",
                        exec_id,
                        test_case_key,
                        cycle_id,
                    )
                    return str(exec_id)
                for key, value in response.items():
                    if isinstance(value, dict) and (
                        "id" in value or "issueId" in value
                    ):
                        logger.info(
                            "Created execution %s for test %s in cycle %s",
                            key,
                            test_case_key,
                            cycle_id,
                        )
                        return str(key)
            elif isinstance(response, (int, str)):
                logger.info(
                    "Created execution %s for test %s in cycle %s",
                    response,
                    test_case_key,
                    cycle_id,
                )
                return str(response)

            logger.warning("Failed to extract execution ID from response: %s", response)
            return None
        except requests.exceptions.RequestException as e:
            logger.warning("Failed to add test to cycle: %s", e)
            return None

    def _resolve_project_id(self, project_id: int | None) -> int | None:
        """Resolve project ID for Zephyr operations."""
        if project_id is not None:
            return project_id
        if not (resolved_id := self.zephyr_project_id or self.get_project_id()):
            logger.warning("Zephyr project id not configured")
            return None
        if isinstance(resolved_id, str):
            try:
                return int(resolved_id)
            except (ValueError, TypeError):
                logger.warning("Invalid project id format: %s", resolved_id)
                return None
        return resolved_id

    def update_zephyr_execution_status(
        self, execution_id: str, result: TestResult, comment: str | None = None
    ) -> bool:
        """Update a Zephyr Squad test execution status."""
        status_id = self.get_zephyr_status_id(result)
        logger.info(
            "Updating Zephyr execution %s with status %s (ID: %s)",
            execution_id,
            result.value,
            status_id,
        )

        try:
            self._make_zephyr_request(
                "PUT", f"execution/{execution_id}/execute", data={"status": status_id}
            )
            logger.info(
                "Successfully updated Zephyr execution %s to status %s",
                execution_id,
                result.value,
            )
            if comment:
                try:
                    self.add_zephyr_execution_comment(execution_id, comment)
                except requests.exceptions.RequestException as e:
                    logger.warning(
                        "Failed to add comment to execution %s: %s", execution_id, e
                    )
            return True
        except requests.exceptions.RequestException as e:
            logger.warning("Failed to update Zephyr execution %s: %s", execution_id, e)
            return False

    def add_zephyr_execution_comment(self, execution_id: str, comment: str) -> bool:
        """Add a comment to a Zephyr execution."""
        try:
            self._make_zephyr_request(
                "PUT", f"execution/{execution_id}", data={"comment": comment}
            )
            logger.info("Added comment to Zephyr execution %s", execution_id)
            return True
        except requests.exceptions.RequestException as e:
            logger.debug("Failed to add comment to Zephyr execution: %s", e)
            return False

    def attach_zephyr_execution_files(
        self, execution_id: str, file_paths: list[str]
    ) -> None:
        """Attach files to a Zephyr Essential DC test execution."""
        attached_count, errors = 0, []
        for file_path in file_paths:
            try:
                if not (file_path_obj := Path(file_path)).exists():
                    logger.warning("File not found for attachment: %s", file_path)
                    continue
                with file_path_obj.open("rb") as file:
                    content_type = (
                        "image/png"
                        if file_path_obj.suffix.lower() == ".png"
                        else "application/octet-stream"
                    )
                    files = {"file": (file_path_obj.name, file, content_type)}
                    self._make_zephyr_request(
                        "POST",
                        "attachment",
                        files=files,
                        params={"entityId": execution_id, "entityType": "EXECUTION"},
                    )
                    logger.info(
                        "Attached file %s to Zephyr execution %s",
                        file_path_obj.name,
                        execution_id,
                    )
                    attached_count += 1
            except (OSError, requests.exceptions.RequestException) as e:
                error_msg = f"Error attaching {file_path}: {e}"
                logger.warning(error_msg)
                errors.append(error_msg)
        if errors and attached_count == 0:
            error_summary = (
                f"Failed to attach any files to Zephyr execution: {'; '.join(errors)}"
            )
            raise RuntimeError(error_summary)

    def _get_project_issue_types(self) -> list[dict]:
        """Fetch available issue types for the project from createmeta."""
        try:
            response = self._make_jira_request(
                "GET",
                "issue/createmeta",
                params={
                    "projectKeys": self.project_key,
                    "expand": "projects.issuetypes.fields",
                },
            )
            if projects := response.get("projects", []):
                return (
                    projects[0].get("issuetypes", [])
                    if isinstance(projects[0].get("issuetypes", []), list)
                    else []
                )
            return []
        except requests.exceptions.RequestException as e:
            logger.debug(
                "Failed to fetch issue types for project %s: %s", self.project_key, e
            )
            return []

    def _apply_required_field_defaults(
        self, issue_data: dict, issue_type: dict
    ) -> None:
        """Apply default values for required fields from createmeta if available."""
        if not isinstance(
            fields := issue_type.get("fields", {})
            if isinstance(issue_type, dict)
            else {},
            dict,
        ):
            return
        for field_id, field_meta in fields.items():
            if (
                isinstance(field_meta, dict)
                and field_meta.get("required")
                and field_id not in issue_data["fields"]
            ):
                if (default_value := field_meta.get("defaultValue")) is not None:
                    issue_data["fields"][field_id] = default_value
                else:
                    logger.debug(
                        "Required field %s has no default for issue type %s",
                        field_id,
                        issue_type.get("name"),
                    )

    def get_project_id(self) -> int | None:
        """Get project ID by project key."""
        try:
            return self._make_jira_request("GET", f"project/{self.project_key}").get(
                "id"
            )
        except requests.exceptions.RequestException as e:
            logger.debug("Error getting project ID: %s", e)
            return None

    def issue_exists(self, issue_key: str) -> bool:
        """Check if a Jira issue exists by key."""
        try:
            self._make_jira_request(
                "GET", f"issue/{issue_key}", params={"fields": "key"}
            )
            return True
        except requests.exceptions.RequestException as e:
            if (
                hasattr(e, "response")
                and e.response is not None
                and e.response.status_code == 404  # noqa: PLR2004
            ):
                return False
            logger.debug("Failed to resolve issue %s: %s", issue_key, e)
            return False

    def _escape_jql(self, value: str) -> str:
        """Escape a string value for JQL usage."""
        return value.replace("\\", "\\\\").replace('"', '\\"')

    def get_zephyr_cycle_id(self, cycle_ref: str, version_id: int | None) -> int | None:
        """Resolve Zephyr cycle id from numeric id or name."""
        try:
            return int(cycle_ref)
        except ValueError:
            pass
        cycles = self.get_zephyr_test_cycles(version_id=version_id)
        logger.debug("Looking for cycle '%s' in %d cycles", cycle_ref, len(cycles))
        for cycle in cycles:
            if not isinstance(cycle, dict):
                continue
            name, key = (
                str(cycle.get("name") or cycle.get("cycleName") or ""),
                str(cycle.get("key") or ""),
            )
            logger.debug(
                "Checking cycle: name='%s', key='%s', id=%s", name, key, cycle.get("id")
            )
            if (
                name.lower() == cycle_ref.lower() or key.lower() == cycle_ref.lower()
            ) and (cycle_id := cycle.get("id")) is not None:
                try:
                    logger.info("Found cycle match: '%s' -> ID %s", cycle_ref, cycle_id)
                    return int(cycle_id)
                except (TypeError, ValueError):
                    continue
        logger.warning("Cycle '%s' not found among %d cycles", cycle_ref, len(cycles))
        return None

    def create_test_case(self, test_case: JiraTestCase) -> str | None:
        """Create a test case in Jira as an issue with Test issue type."""
        try:
            if existing_key := self._find_existing_test_case(test_case):
                return existing_key
            issue_data = self._build_test_case_issue_data(test_case)
            if issue_key := self._create_issue_with_fallback_types(issue_data):
                self._add_test_steps_if_provided(issue_key, test_case.test_steps)
                return issue_key
            logger.warning("Failed to create test case")
            return None
        except requests.exceptions.RequestException:
            logger.exception("Failed to create test case")
            return None

    def _find_existing_test_case(self, test_case: JiraTestCase) -> str | None:
        """Check if test case already exists by key pattern or name."""
        if (
            test_case.name
            and (
                issue_key_match := re.compile(
                    rf"\b{re.escape(self.project_key)}-\d+\b"
                ).search(test_case.name)
            )
            and (issue_key := issue_key_match.group(0))
            and self.issue_exists(issue_key)
        ):
            logger.info("Test case already exists: %s", issue_key)
            return issue_key
        if existing_key := self.find_test_case_by_name(test_case.name):
            logger.info("Test case already exists: %s", existing_key)
            return existing_key
        return None

    def _build_test_case_issue_data(self, test_case: JiraTestCase) -> dict:
        """Build issue data dictionary for test case creation."""
        issue_data = {
            "fields": {
                "project": {"key": self.project_key},
                "summary": test_case.name,
                "description": test_case.description or "",
                "issuetype": {"name": "Test"},
                "priority": {"name": "Medium"},
            }
        }
        if self.required_fields:
            issue_data["fields"].update(self.required_fields)
        if test_case.labels:
            issue_data["fields"]["labels"] = test_case.labels
        return issue_data

    def _get_issue_type_candidates(self) -> list[dict]:
        """Get available issue type candidates for test case creation."""
        issuetype_candidates = ["Test", "Test Case", "Task"]
        issue_types = self._get_project_issue_types()
        available_types = {
            issue_type.get("name", ""): issue_type for issue_type in issue_types
        }
        resolved_candidates = [
            available_types[name]
            for name in issuetype_candidates
            if name in available_types
        ]
        if not resolved_candidates and issue_types:
            resolved_candidates = issue_types
        if not resolved_candidates:
            resolved_candidates = [{"name": name} for name in issuetype_candidates]
        return resolved_candidates

    def _create_issue_with_fallback_types(self, issue_data: dict) -> str | None:
        """Try to create issue with different issue types as fallback."""
        last_error = None
        for issue_type in self._get_issue_type_candidates():
            issue_data["fields"]["issuetype"] = (
                {"id": issue_type["id"]}
                if issue_type.get("id")
                else {"name": issue_type.get("name", "Test")}
            )
            self._apply_required_field_defaults(issue_data, issue_type)
            try:
                if issue_key := self._make_jira_request(
                    "POST", "issue", data=issue_data
                ).get("key"):
                    logger.info("Created test case issue: %s", issue_key)
                    return issue_key
            except requests.exceptions.RequestException as e:
                last_error = e
                logger.debug(
                    "Failed to create test case with issuetype %s: %s",
                    issue_type.get("name"),
                    e,
                )
        self._log_creation_failure(last_error)
        return None

    def _add_test_steps_if_provided(
        self, issue_key: str, test_steps: list | None
    ) -> None:
        """Add test steps to issue if they are provided."""
        if test_steps:
            self._add_test_steps_to_issue(issue_key, test_steps)

    def _log_creation_failure(self, last_error: Exception | None) -> None:
        """Log test case creation failure with appropriate message."""
        if last_error:
            if (
                isinstance(last_error, requests.exceptions.RequestException)
                and hasattr(last_error, "response")
                and last_error.response is not None
            ):
                logger.warning(
                    "Failed to create test case: %s | %s",
                    last_error,
                    last_error.response.text,
                )
            else:
                logger.warning("Failed to create test case: %s", last_error)
        else:
            logger.warning("Failed to get issue key from response")

    def _format_test_steps_for_jira(self, test_steps: list) -> list[dict]:
        """Format test steps as structured data for Jira API."""
        if not test_steps:
            return []
        return [
            {
                "index": i,
                "step": step.description,
                "result": step.expected_result or step.description,
            }
            for i, step in enumerate(test_steps, 1)
        ]

    def _add_test_steps_to_issue(self, issue_key: str, test_steps: list) -> bool:
        """Add test steps to an existing Jira issue."""
        try:
            issue_response = self._make_jira_request("GET", f"issue/{issue_key}")
            if issue_response:
                custom_fields = [
                    f
                    for f in issue_response.get("fields", {})
                    if f.startswith("customfield_")
                ]
                logger.info(
                    "Available custom fields for issue %s: %s",
                    issue_key,
                    custom_fields[:5],
                )

            test_steps_data = self._format_test_steps_for_jira(test_steps)
            custom_field_names = [
                "customfield_10000",
                "customfield_10001",
                "customfield_10002",
                "customfield_10100",
                "customfield_10014",
                "customfield_10015",
                "customfield_10016",
                "customfield_11000",
                "customfield_11001",
                "teststeps",
                "test_steps",
                "steps",
            ]

            for field_name in custom_field_names:
                try:
                    if _ := self._make_jira_request(
                        "PUT",
                        f"issue/{issue_key}",
                        data={"fields": {field_name: test_steps_data}},
                    ):
                        logger.info(
                            "Added test steps to issue %s using field %s",
                            issue_key,
                            field_name,
                        )
                        return True
                except (
                    requests.exceptions.RequestException,
                    ValueError,
                    KeyError,
                ) as e:
                    logger.debug(
                        "Failed to add test steps with field %s: %s", field_name, e
                    )

            logger.info(
                "Custom fields not available, adding test steps as comment to %s",
                issue_key,
            )
            return self._add_test_steps_as_comment(issue_key, test_steps)
        except (requests.exceptions.RequestException, ValueError, KeyError) as e:
            logger.warning("Failed to add test steps to issue %s: %s", issue_key, e)
            return False

    def _add_test_steps_as_comment(self, issue_key: str, test_steps: list) -> bool:
        """Add test steps as a well-formatted comment to the issue."""
        try:
            comment_body = "*Test Steps:*\\n\\n"
            for i, step in enumerate(test_steps, 1):
                comment_body += f"*Step {i}:* {step.description}\\n"
                if step.expected_result:
                    comment_body += f"*Expected Result:* {step.expected_result}\\n"
                comment_body += "\\n"
            if _ := self._make_jira_request(
                "POST", f"issue/{issue_key}/comment", data={"body": comment_body}
            ):
                logger.info("Added test steps as comment to issue %s", issue_key)
                return True
            return False
        except (requests.exceptions.RequestException, ValueError, KeyError) as e:
            logger.warning("Failed to add test steps as comment: %s", e)
            return False

    def _format_test_steps(self, test_steps: list) -> str:
        """Format test steps as markdown text."""
        if not test_steps:
            return ""

        steps_text = "h3. Test Steps:\n\n"
        for i, step in enumerate(test_steps, 1):
            steps_text += f"{i}. {step.description}\n"
            if step.expected_result:
                steps_text += f"   *Expected:* {step.expected_result}\n"
            steps_text += "\n"

        return steps_text

    def find_test_case_by_name(self, test_name: str) -> str | None:
        """Find test case by name using JQL search."""
        try:
            issuetype_candidates = ["Test", "Test Case", "Task"]
            issuetype_filter = ", ".join(
                f'"{candidate}"' for candidate in issuetype_candidates
            )
            escaped_name = self._escape_jql(test_name)

            for jql in [
                (
                    f'project = "{self.project_key}" AND issuetype in '
                    f'({issuetype_filter}) AND summary = "{escaped_name}"'
                ),
                (
                    f'project = "{self.project_key}" AND issuetype in '
                    f'({issuetype_filter}) AND summary ~ "{escaped_name}"'
                ),
                f'project = "{self.project_key}" AND summary = "{escaped_name}"',
            ]:
                response = self._make_jira_request(
                    "GET",
                    "search",
                    params={"jql": jql, "maxResults": 1, "fields": "key,summary"},
                )
                if issues := response.get("issues", []):
                    issue_key = issues[0]["key"]
                    logger.info("Found existing test case: %s", issue_key)
                    return issue_key
            return None
        except requests.exceptions.RequestException as e:
            logger.debug("Error searching for test case: %s", e)
            return None

    def create_test_plan(self, plan_name: str, description: str) -> str | None:
        """Create a test plan as a Jira issue."""
        try:
            issue_data = {
                "fields": {
                    "project": {"key": self.project_key},
                    "summary": plan_name,
                    "description": description,
                    "issuetype": {"name": "Task"},
                    "priority": {"name": "Medium"},
                }
            }
            if not (
                issue_key := self._make_jira_request(
                    "POST", "issue", data=issue_data
                ).get("key")
            ):
                logger.warning("Failed to get issue key from test plan creation")
                return None
            logger.info("Created test plan: %s", issue_key)
            return issue_key
        except requests.exceptions.RequestException:
            logger.exception("Failed to create test plan")
            return None

    def add_comment(self, issue_key: str, body: str) -> bool:
        """Add a comment to a Jira issue."""
        try:
            self._make_jira_request(
                "POST", f"issue/{issue_key}/comment", data={"body": body}
            )
            return True
        except requests.exceptions.RequestException:
            logger.exception("Failed to add comment to %s", issue_key)
            return False

    def link_issues(
        self,
        inward_issue: str,
        outward_issue: str,
        link_type: str = "Relates",
    ) -> bool:
        """
        Create a link between two Jira issues.

        Args:
            inward_issue: The issue key for the inward side of the link
            outward_issue: The issue key for the outward side of the link
            link_type: The type of link to create (default: "Relates")

        Returns:
            True if the link was created successfully, False otherwise
        """
        try:
            link_data = {
                "type": {"name": link_type},
                "inwardIssue": {"key": inward_issue},
                "outwardIssue": {"key": outward_issue},
            }
            self._make_jira_request("POST", "issueLink", data=link_data)
            logger.info(
                "Created link between %s and %s (type: %s)",
                inward_issue,
                outward_issue,
                link_type,
            )
            return True
        except requests.exceptions.RequestException as e:
            logger.warning(
                "Failed to link %s to %s: %s", inward_issue, outward_issue, e
            )
            return False

    def transition_issue_to_done(self, issue_key: str) -> bool:
        """
        Transition a Jira issue to 'Done' status.

        Args:
            issue_key: The issue key to transition

        Returns:
            True if the transition was successful, False otherwise
        """
        try:
            # Get available transitions for the issue
            transitions_response = self._make_jira_request(
                "GET", f"issue/{issue_key}/transitions"
            )
            transitions = transitions_response.get("transitions", [])

            if not transitions:
                logger.warning("No transitions available for issue %s", issue_key)
                return False

            # Find the transition to "Done" status
            done_transition = None
            for transition in transitions:
                to_status = transition.get("to", {}).get("name", "").lower()
                if to_status == "done":
                    done_transition = transition
                    break

            if not done_transition:
                logger.info(
                    "No 'Done' transition available for issue %s. Available transitions: %s",
                    issue_key,
                    ", ".join(
                        t.get("to", {}).get("name", "Unknown") for t in transitions
                    ),
                )
                return False

            # Execute the transition
            self._make_jira_request(
                "POST",
                f"issue/{issue_key}/transitions",
                data={"transition": {"id": done_transition["id"]}},
            )
            logger.info("Transitioned issue %s to Done", issue_key)
            return True

        except requests.exceptions.RequestException as e:
            logger.warning("Failed to transition issue %s to Done: %s", issue_key, e)
            return False

    def attach_files_to_issue(self, issue_key: str, file_paths: list[str]) -> None:
        """Attach files to a JIRA issue using the REST API."""
        logger.info("Attaching %d files to JIRA issue %s", len(file_paths), issue_key)
        self._attach_files(issue_key, file_paths)

    def _attach_files(self, issue_key: str, file_paths: list[str]) -> None:
        """Attach files to a Jira issue."""
        if not file_paths:
            return
        url = f"{self.jira_reporting_url}/rest/api/2/issue/{issue_key}/attachments"
        original_headers = dict(self.session.headers)
        self.session.headers.update({"X-Atlassian-Token": "no-check"})
        self.session.headers.pop("Content-Type", None)

        try:
            for file_path in file_paths:
                try:
                    if not (file_path_obj := Path(file_path)).exists():
                        logger.warning("File not found for attachment: %s", file_path)
                        continue
                    with file_path_obj.open("rb") as file:
                        content_type = (
                            "image/png"
                            if file_path_obj.suffix.lower() == ".png"
                            else "application/octet-stream"
                        )
                        files = {"file": (file_path_obj.name, file, content_type)}
                        response = self.session.post(
                            url, files=files, timeout=self.timeout
                        )
                        if response.status_code == 200:  # noqa: PLR2004
                            logger.info(
                                "Attached file %s to issue %s",
                                file_path_obj.name,
                                issue_key,
                            )
                        else:
                            logger.warning(
                                "Failed to attach file %s: %s", file_path, response.text
                            )
                except (OSError, requests.exceptions.RequestException) as e:
                    logger.warning("Error attaching file %s: %s", file_path, e)
        finally:
            self.session.headers.clear()
            self.session.headers.update(original_headers)
