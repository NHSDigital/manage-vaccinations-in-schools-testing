"""
Jira REST API client for test management.
"""

import logging
from pathlib import Path

import requests
from requests.auth import HTTPBasicAuth

from .models import JiraTestCase, JiraTestExecution

logger = logging.getLogger(__name__)


class JiraClient:
    """Client for interacting with Jira REST API."""

    def __init__(
        self,
        jira_url: str,
        username: str,
        api_token: str,
        project_key: str,
    ) -> None:
        self.jira_url = jira_url.rstrip("/")
        self.username = username
        self.api_token = api_token
        self.project_key = project_key
        self.auth = HTTPBasicAuth(username, api_token)
        self.session = requests.Session()
        self.session.auth = self.auth
        self.session.headers.update(
            {"Content-Type": "application/json", "Accept": "application/json"}
        )

    def _make_jira_request(
        self,
        method: str,
        endpoint: str,
        data: dict | None = None,
        params: dict | None = None,
        files: dict | None = None,
    ) -> dict:
        """Make authenticated request to Jira API."""
        url = f"{self.jira_url}/rest/api/2/{endpoint}"

        try:
            headers = {}
            if files is None:
                headers = {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                }

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

    def get_project_id(self) -> int | None:
        """Get project ID by project key."""
        try:
            response = self._make_jira_request("GET", f"project/{self.project_key}")
            return response.get("id")
        except requests.exceptions.RequestException as e:
            logger.debug("Error getting project ID: %s", e)
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
            # Format test steps as description
            steps_text = self._format_test_steps(test_case.test_steps)
            full_description = (
                f"{test_case.description}\n\n{steps_text}"
                if test_case.description
                else steps_text
            )

            issue_data = {
                "fields": {
                    "project": {"key": self.project_key},
                    "summary": test_case.summary,
                    "description": full_description,
                    "issuetype": {"name": "Test"},  # Use Test issue type if available
                    "priority": {"name": test_case.priority},
                }
            }

            # Add labels if provided
            if test_case.labels:
                issue_data["fields"]["labels"] = test_case.labels

            # Add components if folder is specified
            if test_case.folder:
                issue_data["fields"]["components"] = [{"name": test_case.folder}]

            response = self._make_jira_request("POST", "issue", data=issue_data)
            issue_key = response.get("key")

            if issue_key:
                logger.info("Created test case issue: %s", issue_key)
                return issue_key
            logger.warning("Failed to get issue key from response")
            return None

        except requests.exceptions.RequestException as e:
            logger.exception("Failed to create test case: %s", e)
            return None

    def _format_test_steps(self, test_steps: list) -> str:
        """Format test steps as markdown text."""
        if not test_steps:
            return ""

        steps_text = "h3. Test Steps:\n\n"
        for i, step in enumerate(test_steps, 1):
            steps_text += f"{i}. {step.step}\n"
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
            # Search for issues with matching summary in the project
            jql = f'project = "{self.project_key}" AND summary ~ "{test_name}" AND issuetype = "Test"'

            params = {"jql": jql, "maxResults": 1, "fields": "key,summary"}

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
                    "issuetype": {"name": "Epic"},  # Use Epic for test plans
                    "priority": {"name": "Medium"},
                }
            }

            response = self._make_jira_request("POST", "issue", data=issue_data)
            issue_key = response.get("key")

            if issue_key:
                logger.info("Created test plan: %s", issue_key)
                return issue_key
            logger.warning("Failed to get issue key from test plan creation")
            return None

        except requests.exceptions.RequestException as e:
            logger.exception("Failed to create test plan: %s", e)
            return None

    def create_test_execution(self, execution: JiraTestExecution) -> str | None:
        """
        Create a test execution by updating the test case or creating a linked execution issue.

        Args:
            execution: JiraTestExecution object

        Returns:
            Issue key of execution result, None if failed
        """
        try:
            # Create a sub-task under the test case to represent the execution
            execution_summary = f"Execution of {execution.test_case_key} - {execution.execution_status.value}"

            # Get the test case issue to link to
            test_case_response = self._make_jira_request(
                "GET", f"issue/{execution.test_case_key}"
            )
            if not test_case_response:
                logger.warning("Could not find test case %s", execution.test_case_key)
                return None

            issue_data = {
                "fields": {
                    "project": {"key": self.project_key},
                    "parent": {"key": execution.test_case_key},
                    "summary": execution_summary,
                    "description": self._format_execution_description(execution),
                    "issuetype": {"name": "Sub-task"},
                    "priority": {"name": "Medium"},
                }
            }

            response = self._make_jira_request("POST", "issue", data=issue_data)
            execution_key = response.get("key")

            if execution_key:
                logger.info("Created test execution: %s", execution_key)

                # Attach screenshots if provided
                if execution.attachments:
                    self._attach_files(execution_key, execution.attachments)

                return execution_key
            logger.warning("Failed to create test execution")
            return None

        except requests.exceptions.RequestException as e:
            logger.exception("Failed to create test execution: %s", e)
            return None

    def _format_execution_description(self, execution: JiraTestExecution) -> str:
        """Format execution details as description."""
        desc = f"Test execution result: *{execution.execution_status.value}*\n\n"

        if execution.executed_by:
            desc += f"Executed by: {execution.executed_by}\n"

        if execution.execution_date:
            desc += f"Execution date: {execution.execution_date.strftime('%Y-%m-%d %H:%M:%S')}\n"

        if execution.environment:
            desc += f"Environment: {execution.environment}\n"

        if execution.comment:
            desc += f"\nComments:\n{execution.comment}\n"

        if execution.test_plan_key:
            desc += f"\nTest Plan: {execution.test_plan_key}\n"

        return desc

    def _attach_files(self, issue_key: str, file_paths: list[str]) -> None:
        """Attach files to a Jira issue."""
        for file_path in file_paths:
            try:
                file_path_obj = Path(file_path)
                if not file_path_obj.exists():
                    logger.warning("File not found for attachment: %s", file_path)
                    continue

                with file_path_obj.open("rb") as file:
                    files = {
                        "file": (file_path_obj.name, file, "application/octet-stream")
                    }

                    url = f"{self.jira_url}/rest/api/2/issue/{issue_key}/attachments"

                    # Attachment requires different headers
                    headers = {"X-Atlassian-Token": "no-check"}

                    response = requests.post(
                        url, auth=self.auth, files=files, headers=headers, timeout=30
                    )

                    if response.status_code == 200:
                        logger.info(
                            "Attached file %s to issue %s",
                            file_path_obj.name,
                            issue_key,
                        )
                    else:
                        logger.warning(
                            "Failed to attach file %s: %s", file_path, response.text
                        )

            except Exception as e:
                logger.warning("Error attaching file %s: %s", file_path, e)

    def update_issue_status(self, issue_key: str, status: str) -> bool:
        """
        Update issue status through transitions.

        Args:
            issue_key: Issue key to update
            status: Target status name

        Returns:
            True if successful, False otherwise
        """
        try:
            # Get available transitions
            transitions_response = self._make_jira_request(
                "GET", f"issue/{issue_key}/transitions"
            )
            transitions = transitions_response.get("transitions", [])

            # Find transition to target status
            target_transition = None
            for transition in transitions:
                if transition["to"]["name"].lower() == status.lower():
                    target_transition = transition
                    break

            if not target_transition:
                logger.warning(
                    "No transition found to status '%s' for issue %s", status, issue_key
                )
                return False

            # Execute transition
            transition_data = {"transition": {"id": target_transition["id"]}}

            self._make_jira_request(
                "POST", f"issue/{issue_key}/transitions", data=transition_data
            )
            logger.info("Updated issue %s status to %s", issue_key, status)
            return True

        except requests.exceptions.RequestException as e:
            logger.warning("Failed to update issue status: %s", e)
            return False
