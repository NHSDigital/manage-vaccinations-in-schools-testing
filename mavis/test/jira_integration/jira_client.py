"""
Jira REST API client for test management.
"""

import logging
import re
from dataclasses import dataclass
from pathlib import Path

import requests

from .models import JiraTestCase, TestResult


@dataclass
class ZephyrConfig:
    """Configuration for Zephyr integration."""

    api_token: str | None = None
    project_id: str | None = None
    url: str | None = None


logger = logging.getLogger(__name__)


class JiraClient:
    """Client for interacting with Jira REST API."""

    def __init__(
        self,
        jira_reporting_url: str,
        username: str,
        api_token: str,
        project_key: str,
        zephyr_config: ZephyrConfig | None = None,
    ) -> None:
        self.jira_reporting_url = jira_reporting_url.rstrip("/")
        self.username = username
        self.api_token = api_token
        self.project_key = project_key

        # Handle Zephyr configuration
        if zephyr_config is None:
            zephyr_config = ZephyrConfig()

        self.zephyr_api_token = zephyr_config.api_token
        self.zephyr_project_id = zephyr_config.project_id
        self.zephyr_url = zephyr_config.url

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

    def _make_jira_request(
        self,
        method: str,
        endpoint: str,
        data: dict | None = None,
        params: dict | None = None,
        files: dict | None = None,
    ) -> dict:
        """Make authenticated request to Jira API."""
        url = f"{self.jira_reporting_url}/rest/api/2/{endpoint}"

        try:
            if method == "GET":
                response = self.session.get(url, params=params, timeout=30)
            elif method == "POST":
                if files:
                    response = self.session.post(
                        url, data=data, files=files, timeout=30
                    )
                else:
                    response = self.session.post(url, json=data, timeout=30)
            elif method == "PUT":
                response = self.session.put(url, json=data, timeout=30)
            elif method == "DELETE":
                response = self.session.delete(url, timeout=30)
            else:
                msg = f"Unsupported method: {method}"
                raise ValueError(msg)

            response.raise_for_status()
            try:
                return response.json() if response.content else {}
            except ValueError as e:
                # Handle JSON decode errors more gracefully
                logger.debug("Failed to parse JSON response: %s", e)
                return {}

        except requests.exceptions.RequestException as e:
            logger.debug("Jira API request failed: %s", e)
            if hasattr(e, "response") and e.response is not None:
                logger.debug("Response: %s", e.response.text)
            raise

    def _make_atm_request(
        self,
        method: str,
        endpoint: str,
        data: dict | None = None,
        params: dict | None = None,
        files: dict | None = None,
    ) -> dict:
        """Make authenticated request to Jira Tests (ATM) API."""
        url = f"{self.jira_reporting_url}/rest/atm/1.0/{endpoint}"

        try:
            if method == "GET":
                response = self.session.get(url, params=params, timeout=30)
            elif method == "POST":
                if files:
                    response = self.session.post(
                        url, data=data, files=files, timeout=30
                    )
                else:
                    response = self.session.post(url, json=data, timeout=30)
            elif method == "PUT":
                response = self.session.put(url, json=data, timeout=30)
            elif method == "DELETE":
                response = self.session.delete(url, timeout=30)
            else:
                msg = f"Unsupported method: {method}"
                raise ValueError(msg)

            response.raise_for_status()
            try:
                return response.json() if response.content else {}
            except ValueError as e:
                logger.debug("Failed to parse ATM JSON response: %s", e)
                return {}

        except requests.exceptions.RequestException as e:
            logger.debug("ATM API request failed: %s", e)
            if hasattr(e, "response") and e.response is not None:
                logger.debug("ATM response: %s", e.response.text)
            raise

    def _make_zephyr_request(
        self,
        method: str,
        endpoint: str,
        data: dict | None = None,
        params: dict | None = None,
        files: dict | None = None,
    ) -> dict:
        """Make authenticated request to Zephyr Essential DC API."""
        token = self._get_zephyr_token()
        url = self._build_zephyr_url(endpoint)
        headers = self._build_zephyr_headers(token, files)

        try:
            request_data = {"data": data, "params": params, "files": files}
            response = self._execute_zephyr_request(method, url, headers, request_data)
            response.raise_for_status()
            return self._parse_zephyr_response(response)
        except requests.exceptions.RequestException as e:
            self._log_zephyr_error(e)
            raise

    def _get_zephyr_token(self) -> str:
        """Get Zephyr API token."""
        token = self.zephyr_api_token or self.api_token
        if not token:
            msg = "Zephyr API token not configured"
            raise ValueError(msg)
        return token

    def _build_zephyr_url(self, endpoint: str) -> str:
        """Build complete Zephyr API URL."""
        url_base = (self.zephyr_url or self.jira_reporting_url).rstrip("/")
        url_base = self._normalize_url_base(url_base)

        if url_base.endswith("/rest/zapi/latest"):
            return f"{url_base}/{endpoint}"
        return f"{url_base}/rest/zapi/latest/{endpoint}"

    def _normalize_url_base(self, url_base: str) -> str:
        """Normalize URL base for Zephyr requests."""
        if url_base.startswith("/"):
            return f"{self.jira_reporting_url.rstrip('/')}{url_base}"
        if not url_base.startswith(("http://", "https://")):
            return f"{self.jira_reporting_url.rstrip('/')}/{url_base}"
        return url_base

    def _build_zephyr_headers(self, token: str, files: dict | None) -> dict:
        """Build headers for Zephyr API request."""
        headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
        }
        if not files:
            headers["Content-Type"] = "application/json"
        return headers

    def _execute_zephyr_request(
        self,
        method: str,
        url: str,
        headers: dict,
        request_data: dict[str, dict | None],
    ) -> requests.Response:
        """Execute the actual HTTP request to Zephyr API."""
        data = request_data.get("data")
        params = request_data.get("params")
        files = request_data.get("files")
        request_kwargs = {"headers": headers, "params": params}

        if method == "GET":
            return requests.get(url, timeout=30, **request_kwargs)
        if method == "POST":
            return self._execute_post_request(
                url,
                request_kwargs,
                data if isinstance(data, dict) else None,
                files if isinstance(files, dict) else None,
            )
        if method == "PUT":
            request_kwargs["json"] = data
            return requests.put(url, timeout=30, **request_kwargs)
        if method == "DELETE":
            return requests.delete(url, timeout=30, **request_kwargs)
        msg = f"Unsupported method: {method}"
        raise ValueError(msg)

    def _execute_post_request(
        self, url: str, request_kwargs: dict, data: dict | None, files: dict | None
    ) -> requests.Response:
        """Execute POST request with appropriate data format."""
        if files:
            request_kwargs["data"] = data
            request_kwargs["files"] = files
        else:
            request_kwargs["json"] = data
        return requests.post(url, timeout=30, **request_kwargs)

    def _parse_zephyr_response(self, response: requests.Response) -> dict:
        """Parse Zephyr API response."""
        if not response.content:
            return {}
        try:
            return response.json()
        except ValueError as e:
            logger.debug("Failed to parse Zephyr JSON response: %s", e)
            return {}

    def _log_zephyr_error(self, error: requests.exceptions.RequestException) -> None:
        """Log Zephyr API errors."""
        logger.debug("Zephyr API request failed: %s", error)
        if hasattr(error, "response") and error.response is not None:
            logger.debug("Zephyr response: %s", error.response.text)

    def create_atm_test_execution(
        self,
        test_case_key: str,
        test_cycle_version: str | None = None,
        test_cycle_key: str | None = None,
        environment: str | None = None,
    ) -> str | None:
        """Create a Jira Tests (ATM) execution, optionally with cycle version."""
        payloads: list[dict] = []

        base_payload = {
            "testCaseKey": test_case_key,
            "projectKey": self.project_key,
        }

        if environment:
            base_payload["environment"] = environment

        if test_cycle_version:
            payloads.append({**base_payload, "testCycleVersion": test_cycle_version})
            payloads.append(
                {**base_payload, "testCycle": {"version": test_cycle_version}}
            )

        if test_cycle_key:
            payloads.append({**base_payload, "testCycleKey": test_cycle_key})
            payloads.append({**base_payload, "testCycle": {"key": test_cycle_key}})

        if test_cycle_key and test_cycle_version:
            payloads.append(
                {
                    **base_payload,
                    "testCycleKey": test_cycle_key,
                    "testCycleVersion": test_cycle_version,
                }
            )
            payloads.append(
                {
                    **base_payload,
                    "testCycle": {
                        "key": test_cycle_key,
                        "version": test_cycle_version,
                    },
                }
            )

        payloads.append(base_payload)

        last_error: Exception | None = None
        for payload in payloads:
            try:
                response = self._make_atm_request("POST", "testexecution", data=payload)
                execution_key = response.get("key") or response.get("id")
                if execution_key:
                    logger.info("Created ATM test execution: %s", execution_key)
                    return str(execution_key)
            except requests.exceptions.RequestException as e:
                last_error = e
                continue

        if last_error:
            logger.warning("Failed to create ATM test execution: %s", last_error)
        return None

    def update_atm_test_execution(
        self,
        execution_key: str,
        result: TestResult,
        comment: str | None = None,
        environment: str | None = None,
    ) -> bool:
        """Update a Jira Tests (ATM) execution status."""
        payloads = []
        base_payload: dict[str, object] = {}

        if environment:
            base_payload["environment"] = environment
        if comment:
            base_payload["comment"] = comment

        payloads.append({**base_payload, "statusName": result.value})
        payloads.append({**base_payload, "status": result.value})
        payloads.append({**base_payload, "executionStatus": result.value})

        last_error: Exception | None = None
        for payload in payloads:
            try:
                self._make_atm_request(
                    "PUT", f"testexecution/{execution_key}", data=payload
                )
                logger.info("Updated ATM test execution %s", execution_key)
                return True
            except requests.exceptions.RequestException as e:
                last_error = e
                continue

        if last_error:
            logger.warning("Failed to update ATM test execution: %s", last_error)
        return False

    def get_zephyr_test_cycles(self, version_id: int | None = None) -> list[dict]:
        """Get all test cycles from Zephyr Essential DC for the project."""
        project_id = self.zephyr_project_id or self.get_project_id()
        if not project_id:
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
            elif isinstance(response, dict):
                if "records" in response and isinstance(response["records"], list):
                    cycles = response["records"]
                else:
                    # Response format: {cycle_id: {cycle_data}, recordsCount: n}
                    # Extract cycles and add the ID from the key
                    cycles = []
                    for key, value in response.items():
                        if isinstance(value, dict) and "name" in value:
                            # Add the cycle ID from the dictionary key
                            cycle_data = dict(value)
                            cycle_data["id"] = key
                            cycles.append(cycle_data)
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
            response = self._make_jira_request(
                "GET", f"issue/{issue_key}", params={"fields": "id"}
            )
            return response.get("id")
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
        cache_key = result.value
        if cache_key in self._zephyr_status_cache:
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
                    if not isinstance(status, dict):
                        continue
                    name = str(status.get("name", "")).upper()
                    if name == desired_name:
                        status_id_value = status.get("id")
                        if status_id_value is not None:
                            status_id = int(status_id_value)
                            self._zephyr_status_cache[cache_key] = status_id
                            return status_id
        except requests.exceptions.RequestException:
            logger.debug("Failed to load Zephyr status list")

        # Fallback map based on Zephyr Squad default statuses
        fallback_map = {
            TestResult.PASS: 1,  # PASS
            TestResult.FAIL: 2,  # FAIL
            TestResult.BLOCKED: 4,  # BLOCKED
            TestResult.SKIPPED: -1,  # UNEXECUTED
            TestResult.NOT_EXECUTED: -1,  # UNEXECUTED
        }
        status_id = fallback_map.get(result, 2)
        self._zephyr_status_cache[cache_key] = status_id
        return status_id

    def add_test_to_cycle(
        self,
        test_case_key: str,
        cycle_id: int,
        version_id: int = -1,
        project_id: int | None = None,
    ) -> str | None:
        """
        Add a test case to a Zephyr cycle, creating a test execution.

        This follows the Zephyr Squad API workflow for creating executions:
        1. Add test to cycle (creates execution with UNEXECUTED status)
        2. Later update execution status using update_zephyr_execution_status()

        Args:
            test_case_key: The issue key of the test case
            cycle_id: The ID of the test cycle
            version_id: The version ID (defaults to -1 for "Unscheduled")
            project_id: The project ID (will be looked up if not provided)

        Returns:
            Execution ID as string if successful, None otherwise
        """
        project_id = self._resolve_project_id(project_id)
        if not project_id:
            return None

        issue_id = self._get_issue_id(test_case_key)
        if not issue_id:
            logger.warning("Unable to resolve issue id for %s", test_case_key)
            return None

        payload = {
            "issues": [issue_id],
            "versionId": version_id,
            "cycleId": str(cycle_id),
            "projectId": str(project_id),
        }

        return self._execute_add_test_to_cycle(test_case_key, cycle_id, payload)

    def _resolve_project_id(self, project_id: int | None) -> int | None:
        """Resolve project ID for Zephyr operations."""
        if project_id is not None:
            return project_id

        resolved_id = self.zephyr_project_id or self.get_project_id()
        if not resolved_id:
            logger.warning("Zephyr project id not configured")
            return None
        # Ensure we return an integer
        if isinstance(resolved_id, str):
            try:
                return int(resolved_id)
            except (ValueError, TypeError):
                logger.warning("Invalid project id format: %s", resolved_id)
                return None
        return resolved_id

    def _execute_add_test_to_cycle(
        self, test_case_key: str, cycle_id: int, payload: dict
    ) -> str | None:
        """Execute the API call to add test to cycle and extract execution ID."""
        try:
            logger.info("Adding test %s to cycle %s", test_case_key, cycle_id)

            # For Ad hoc cycle or direct execution creation, use POST /execution
            # This is more reliable than addTestsToCycle which uses async processing
            issue_id = self._get_issue_id(test_case_key)
            if not issue_id:
                return None

            project_id = payload.get("projectId")
            version_id = payload.get("versionId", -1)

            # Create execution directly
            execution_payload = {
                "issueId": issue_id,
                "cycleId": str(cycle_id),
                "projectId": str(project_id),
                "versionId": version_id,
                "status": {"id": "-1"},  # UNEXECUTED
            }

            response = self._make_zephyr_request(
                "POST", "execution", data=execution_payload
            )

            # Extract execution ID from response
            if isinstance(response, dict):
                # Try to get execution ID from response
                # It could be: {"id": 123} or {"123": {exec_data}}
                exec_id = response.get("id") or response.get("executionId")
                if exec_id:
                    logger.info(
                        "Created execution %s for test %s in cycle %s",
                        exec_id,
                        test_case_key,
                        cycle_id,
                    )
                    return str(exec_id)

                # Check if response is {execution_id: {execution_data}}
                for key, value in response.items():
                    if isinstance(value, dict) and (
                        "id" in value or "issueId" in value
                    ):
                        # The key is the execution ID
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

    def _extract_execution_id_from_response(self, response: dict) -> str | None:
        """Extract execution ID from Zephyr API response."""
        if not isinstance(response, dict):
            return None

        # Try to find execution ID in nested structure
        for value in response.items():
            if isinstance(value, dict):
                execution_id = self._find_execution_id_in_nested_dict(value)
                if execution_id:
                    return execution_id
            elif isinstance(value, (int, str)):
                return str(value)
        return None

    def _find_execution_id_in_nested_dict(self, nested_dict: dict) -> str | None:
        """Find execution ID within a nested dictionary structure."""
        for exec_key, exec_value in nested_dict.items():
            if exec_key.isdigit() or isinstance(exec_value, (int, str)):
                return str(exec_key) if exec_key.isdigit() else str(exec_value)
        return None

    def update_zephyr_execution_status(
        self,
        execution_id: str,
        result: TestResult,
        comment: str | None = None,
    ) -> bool:
        """
        Update a Zephyr Squad test execution status.

        Follows the Zephyr Squad API specification:
        PUT /rest/zapi/latest/execution/{id}/execute

        Args:
            execution_id: The execution ID
            result: The test result
            comment: Optional comment for the execution

        Returns:
            True if successful, False otherwise
        """
        status_id = self.get_zephyr_status_id(result)
        logger.info(
            "Updating Zephyr execution %s with status %s (ID: %s)",
            execution_id,
            result.value,
            status_id,
        )

        # Use the official Zephyr Squad API endpoint for updating execution status
        payload = {"status": status_id}

        try:
            _ = self._make_zephyr_request(
                "PUT",
                f"execution/{execution_id}/execute",
                data=payload,
            )
            logger.info(
                "Successfully updated Zephyr execution %s to status %s",
                execution_id,
                result.value,
            )

            # Optionally add comment if provided
            if comment:
                try:
                    self.add_zephyr_execution_comment(execution_id, comment)
                except requests.exceptions.RequestException as e:
                    logger.warning(
                        "Failed to add comment to execution %s: %s",
                        execution_id,
                        e,
                    )

            return True

        except requests.exceptions.RequestException as e:
            logger.warning(
                "Failed to update Zephyr execution %s: %s",
                execution_id,
                e,
            )
            return False

    def add_zephyr_execution_comment(
        self,
        execution_id: str,
        comment: str,
    ) -> bool:
        """Add a comment to a Zephyr execution to indicate result
        (workaround for status update limitations)."""
        try:
            self._make_zephyr_request(
                "PUT",
                f"execution/{execution_id}",
                data={"comment": comment},
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

        for file_path in file_paths:
            try:
                file_path_obj = Path(file_path)
                if not file_path_obj.exists():
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

            except (OSError, requests.exceptions.RequestException) as e:
                logger.warning("Error attaching file %s to Zephyr: %s", file_path, e)

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
            projects = response.get("projects", [])
            if not projects:
                return []
            issue_types = projects[0].get("issuetypes", [])
            return issue_types if isinstance(issue_types, list) else []
        except requests.exceptions.RequestException as e:
            logger.debug(
                "Failed to fetch issue types for project %s: %s", self.project_key, e
            )
            return []

    def _apply_required_field_defaults(
        self, issue_data: dict, issue_type: dict
    ) -> None:
        """Apply default values for required fields from createmeta if available."""
        fields = issue_type.get("fields", {}) if isinstance(issue_type, dict) else {}
        if not isinstance(fields, dict):
            return

        for field_id, field_meta in fields.items():
            if not isinstance(field_meta, dict):
                continue
            if not field_meta.get("required"):
                continue
            if field_id in issue_data["fields"]:
                continue

            default_value = field_meta.get("defaultValue")
            if default_value is not None:
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
            response = self._make_jira_request("GET", f"project/{self.project_key}")
            return response.get("id")
        except requests.exceptions.RequestException as e:
            logger.debug("Error getting project ID: %s", e)
            return None

    def issue_exists(self, issue_key: str) -> bool:
        """Check if a Jira issue exists by key."""
        try:
            self._make_jira_request(
                "GET",
                f"issue/{issue_key}",
                params={"fields": "key"},
            )
            return True
        except requests.exceptions.RequestException as e:
            http_not_found = 404
            if (
                hasattr(e, "response")
                and e.response is not None
                and e.response.status_code == http_not_found
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
            name = str(cycle.get("name") or cycle.get("cycleName") or "")
            key = str(cycle.get("key") or "")
            logger.debug(
                "Checking cycle: name='%s', key='%s', id=%s", name, key, cycle.get("id")
            )
            if name.lower() == cycle_ref.lower() or key.lower() == cycle_ref.lower():
                cycle_id = cycle.get("id")
                if cycle_id is not None:
                    try:
                        logger.info(
                            "Found cycle match: '%s' -> ID %s", cycle_ref, cycle_id
                        )
                        return int(cycle_id)
                    except (TypeError, ValueError):
                        continue
        logger.warning("Cycle '%s' not found among %d cycles", cycle_ref, len(cycles))
        return None

    def create_test_case(self, test_case: JiraTestCase) -> str | None:
        """
        Create a test case in Jira as an issue with Test issue type.

        Args:
            test_case: JiraTestCase object

        Returns:
            Issue key of created test case, None if failed
        """
        try:
            # Check for existing test case
            existing_key = self._find_existing_test_case(test_case)
            if existing_key:
                return existing_key

            # Create new test case
            issue_data = self._build_test_case_issue_data(test_case)
            issue_key = self._create_issue_with_fallback_types(issue_data)

            if issue_key:
                self._add_test_steps_if_provided(issue_key, test_case.test_steps)
                return issue_key

            logger.warning("Failed to create test case")
            return None

        except requests.exceptions.RequestException:
            logger.exception("Failed to create test case")
            return None

    def _find_existing_test_case(self, test_case: JiraTestCase) -> str | None:
        """Check if test case already exists by key pattern or name."""
        # Check for issue key pattern in name
        if test_case.name:
            key_pattern = re.compile(rf"\b{re.escape(self.project_key)}-\d+\b")
            issue_key_match = key_pattern.search(test_case.name)
            if issue_key_match:
                issue_key = issue_key_match.group(0)
                if self.issue_exists(issue_key):
                    logger.info("Test case already exists: %s", issue_key)
                    return issue_key

        # Check by name
        existing_key = self.find_test_case_by_name(test_case.name)
        if existing_key:
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

        # Apply required field overrides if provided
        if self.required_fields:
            issue_data["fields"].update(self.required_fields)

        # Add labels if provided
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

        # Preferred candidates first if available in project
        resolved_candidates = []
        for name in issuetype_candidates:
            issue_type = available_types.get(name)
            if issue_type:
                resolved_candidates.append(issue_type)

        # Fallback to any available issue type
        if not resolved_candidates and issue_types:
            resolved_candidates = issue_types

        # Last resort: use provided names
        if not resolved_candidates:
            resolved_candidates = [{"name": name} for name in issuetype_candidates]

        return resolved_candidates

    def _create_issue_with_fallback_types(self, issue_data: dict) -> str | None:
        """Try to create issue with different issue types as fallback."""
        resolved_candidates = self._get_issue_type_candidates()
        last_error = None

        for issue_type in resolved_candidates:
            issuetype_payload = (
                {"id": issue_type["id"]}
                if issue_type.get("id")
                else {"name": issue_type.get("name", "Test")}
            )
            issue_data["fields"]["issuetype"] = issuetype_payload
            self._apply_required_field_defaults(issue_data, issue_type)

            try:
                response = self._make_jira_request("POST", "issue", data=issue_data)
                issue_key = response.get("key")
                if issue_key:
                    logger.info("Created test case issue: %s", issue_key)
                    return issue_key
            except requests.exceptions.RequestException as e:
                last_error = e
                logger.debug(
                    "Failed to create test case with issuetype %s: %s",
                    issue_type.get("name"),
                    e,
                )
                continue

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

        formatted_steps = []
        for i, step in enumerate(test_steps, 1):
            step_data = {
                "index": i,
                "step": step.description,
                "result": step.expected_result or step.description,
            }
            formatted_steps.append(step_data)

        return formatted_steps

    def _add_test_steps_to_issue(self, issue_key: str, test_steps: list) -> bool:
        """Add test steps to an existing Jira issue."""
        try:
            # Get the issue to see what custom fields are available
            issue_response = self._make_jira_request("GET", f"issue/{issue_key}")
            if issue_response:
                available_fields = list(issue_response.get("fields", {}).keys())
                custom_fields = [
                    f for f in available_fields if f.startswith("customfield_")
                ]
                logger.info(
                    "Available custom fields for issue %s: %s",
                    issue_key,
                    custom_fields[:5],
                )

            # Different approaches for different Jira test management add-ons

            # Approach 1: Try to update with common test step custom fields
            test_steps_data = self._format_test_steps_for_jira(test_steps)

            # Try common custom field patterns for different test management tools
            custom_field_names = [
                "customfield_10000",  # Common default
                "customfield_10001",
                "customfield_10002",
                "customfield_10100",  # Sometimes used for test steps
                "customfield_10014",  # Often used by Xray
                "customfield_10015",  # Xray test steps
                "customfield_10016",  # Alternative Xray field
                "customfield_11000",  # Higher number range
                "customfield_11001",
                "teststeps",  # Some plugins use this
                "test_steps",  # Alternative naming
                "steps",  # Simple naming
            ]

            for field_name in custom_field_names:
                try:
                    update_data = {"fields": {field_name: test_steps_data}}

                    response = self._make_jira_request(
                        "PUT", f"issue/{issue_key}", data=update_data
                    )
                    if response:
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
                    continue

            # Approach 2: If custom fields don't work, try to add as comments
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
            # Create a structured comment with test steps
            comment_body = "*Test Steps:*\\n\\n"

            for i, step in enumerate(test_steps, 1):
                comment_body += f"*Step {i}:* {step.description}\\n"
                if step.expected_result:
                    comment_body += f"*Expected Result:* {step.expected_result}\\n"
                comment_body += "\\n"

            comment_data = {"body": comment_body}

            response = self._make_jira_request(
                "POST", f"issue/{issue_key}/comment", data=comment_data
            )
            if response:
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
        """
        Find test case by name using JQL search.

        Args:
            test_name: Name of the test case

        Returns:
            Issue key of found test case, None if not found
        """
        try:
            issuetype_candidates = ["Test", "Test Case", "Task"]
            issuetype_filter = ", ".join(
                f'"{candidate}"' for candidate in issuetype_candidates
            )
            escaped_name = self._escape_jql(test_name)

            # Prefer exact summary match
            exact_jql = (
                f'project = "{self.project_key}" '
                f"AND issuetype in ({issuetype_filter}) "
                f'AND summary = "{escaped_name}"'
            )

            params = {"jql": exact_jql, "maxResults": 1, "fields": "key,summary"}
            response = self._make_jira_request("GET", "search", params=params)
            issues = response.get("issues", [])
            if issues:
                issue_key = issues[0]["key"]
                logger.info("Found existing test case: %s", issue_key)
                return issue_key

            # Fallback to fuzzy match
            fuzzy_jql = (
                f'project = "{self.project_key}" '
                f"AND issuetype in ({issuetype_filter}) "
                f'AND summary ~ "{escaped_name}"'
            )

            params = {"jql": fuzzy_jql, "maxResults": 1, "fields": "key,summary"}
            response = self._make_jira_request("GET", "search", params=params)
            issues = response.get("issues", [])

            if issues:
                issue_key = issues[0]["key"]
                logger.info("Found existing test case: %s", issue_key)
                return issue_key

            # Final fallback: search without issuetype filter
            any_type_jql = (
                f'project = "{self.project_key}" AND summary = "{escaped_name}"'
            )
            params = {"jql": any_type_jql, "maxResults": 1, "fields": "key,summary"}
            response = self._make_jira_request("GET", "search", params=params)
            issues = response.get("issues", [])
            if issues:
                issue_key = issues[0]["key"]
                logger.info("Found existing test case: %s", issue_key)
                return issue_key
            return None

        except requests.exceptions.RequestException as e:
            logger.debug("Error searching for test case: %s", e)
            return None

    def create_test_plan(self, plan_name: str, description: str) -> str | None:
        """
        Create a test plan as a Jira issue.

        Args:
            plan_name: Name of the test plan
            description: Description of the test plan

        Returns:
            Issue key of created test plan, None if failed
        """
        try:
            issue_data = {
                "fields": {
                    "project": {"key": self.project_key},
                    "summary": plan_name,
                    "description": description,
                    "issuetype": {"name": "Task"},  # Use Task for test plans
                    "priority": {"name": "Medium"},
                }
            }

            response = self._make_jira_request("POST", "issue", data=issue_data)
            issue_key = response.get("key")

            if not issue_key:
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

    def attach_files_to_issue(self, issue_key: str, file_paths: list[str]) -> None:
        """
        Attach files to a JIRA issue using the REST API.

        Uses the endpoint: POST /rest/api/2/issue/{issueKey}/attachments

        Args:
            issue_key: JIRA issue key (e.g., 'TESTEXEC-789')
            file_paths: List of file paths to attach
        """
        logger.info("Attaching %d files to JIRA issue %s", len(file_paths), issue_key)
        self._attach_files(issue_key, file_paths)

    def _attach_files(self, issue_key: str, file_paths: list[str]) -> None:
        """Attach files to a Jira issue."""
        for file_path in file_paths:
            try:
                file_path_obj = Path(file_path)
                if not file_path_obj.exists():
                    logger.warning("File not found for attachment: %s", file_path)
                    continue

                with file_path_obj.open("rb") as file:
                    # Determine content type based on file extension
                    content_type = (
                        "image/png"
                        if file_path_obj.suffix.lower() == ".png"
                        else "application/octet-stream"
                    )

                    files = {"file": (file_path_obj.name, file, content_type)}

                    url = (
                        f"{self.jira_reporting_url}/rest/api/2/issue/"
                        f"{issue_key}/attachments"
                    )

                    # For attachments, we remove Content-Type header and
                    # use special X-Atlassian-Token
                    # Create a new session for this request without Content-Type
                    attachment_session = requests.Session()

                    # Copy auth from main session
                    attachment_session.headers.update(
                        {
                            "Authorization": f"Bearer {self.api_token}",
                            "X-Atlassian-Token": "no-check",
                        }
                    )

                    http_ok = 200
                    response = attachment_session.post(url, files=files, timeout=30)

                    if response.status_code == http_ok:
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
