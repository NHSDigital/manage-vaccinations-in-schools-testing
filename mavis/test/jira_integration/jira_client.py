"""
JIRA REST API client for test management.
"""

import logging
from pathlib import Path
from urllib.parse import quote

import requests
from requests.auth import HTTPBasicAuth

from .models import JiraTestCase, JiraTestExecution

logger = logging.getLogger(__name__)


class JiraClient:
    """Client for interacting with JIRA REST API."""

    def __init__(
        self, jira_url: str, username: str, api_token: str, project_key: str
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

    def _make_request(
        self, method: str, endpoint: str, data: dict | None = None
    ) -> dict:
        """Make authenticated request to JIRA API."""
        url = f"{self.jira_url}/rest/api/3/{endpoint}"

        try:
            if method == "GET":
                response = self.session.get(url)
            elif method == "POST":
                response = self.session.post(url, json=data)
            elif method == "PUT":
                response = self.session.put(url, json=data)
            else:
                msg = f"Unsupported method: {method}"
                raise ValueError(msg)

            response.raise_for_status()
            return response.json() if response.content else {}

        except requests.exceptions.RequestException as e:
            logger.exception("JIRA API request failed")
            if hasattr(e, "response") and e.response is not None:
                logger.exception("Response: %s", e.response.text)
            raise

    def create_test_case(self, test_case: JiraTestCase) -> str:
        """
        Create a test case in JIRA.

        Args:
            test_case: JiraTestCase object

        Returns:
            JIRA issue key of created test case
        """
        # Format test steps for description
        steps_text = "\\n\\n*Test Steps:*\\n"
        for i, step in enumerate(test_case.test_steps, 1):
            steps_text += f"\\n{i}. {step.step}"
            steps_text += f"\\n   _Expected:_ {step.expected_result}\\n"

        full_description = test_case.description + steps_text

        issue_data = {
            "fields": {
                "project": {"key": self.project_key},
                "summary": test_case.summary,
                "description": {
                    "type": "doc",
                    "version": 1,
                    "content": [
                        {
                            "type": "paragraph",
                            "content": [{"type": "text", "text": full_description}],
                        }
                    ],
                },
                "issuetype": {"name": "Test"},
                "priority": {"name": test_case.priority},
            }
        }

        # Add labels if provided
        if test_case.labels:
            issue_data["fields"]["labels"] = test_case.labels

        response = self._make_request("POST", "issue", issue_data)
        return response["key"]

    def find_test_case_by_summary(self, summary: str) -> str | None:
        """
        Find test case by summary.

        Args:
            summary: Test case summary to search for

        Returns:
            JIRA issue key if found, None otherwise
        """
        jql = (
            f'project = "{self.project_key}" '
            f'AND issuetype = "Test" '
            f'AND summary ~ "{summary}"'
        )

        try:
            response = self._make_request(
                "GET", f"search?jql={quote(jql)}"
            )
            issues = response.get("issues", [])
            return issues[0]["key"] if issues else None
        except requests.exceptions.RequestException as e:
            logger.warning("Error searching for test case: %s", e)
            return None

    def update_test_execution(self, execution: JiraTestExecution) -> str | None:
        """
        Update test execution results.

        Args:
            execution: JiraTestExecution object

        Returns:
            Execution key if successful, None otherwise
        """
        # For basic JIRA without Xray/Zephyr, we'll add a comment to the test case
        comment_text = f"""
Test Execution Results:
Status: {execution.execution_status.value}
Executed By: {execution.executed_by}
Execution Date: {execution.execution_date.strftime("%Y-%m-%d %H:%M:%S")}
"""

        if execution.comment:
            comment_text += f"\\nComment: {execution.comment}"

        comment_data = {
            "body": {
                "type": "doc",
                "version": 1,
                "content": [
                    {
                        "type": "paragraph",
                        "content": [{"type": "text", "text": comment_text}],
                    }
                ],
            }
        }

        try:
            response = self._make_request(
                "POST", f"issue/{execution.test_case_key}/comment", comment_data
            )
            return response.get("id")
        except requests.exceptions.RequestException as e:
            logger.warning("Error updating test execution: %s", e)
            return None

    def attach_file(self, issue_key: str, file_path: str) -> bool:
        """
        Attach a file to a JIRA issue.

        Args:
            issue_key: JIRA issue key
            file_path: Path to file to attach

        Returns:
            True if successful, False otherwise
        """

        file_path_obj = Path(file_path)
        if not file_path_obj.exists():
            logger.warning("File not found: %s", file_path)
            return False

        url = f"{self.jira_url}/rest/api/3/issue/{issue_key}/attachments"

        # Remove Content-Type header for file upload
        headers = {"X-Atlassian-Token": "no-check", "Accept": "application/json"}

        try:
            with file_path_obj.open("rb") as f:
                files = {"file": (file_path_obj.name, f)}
                response = requests.post(
                    url, auth=self.auth, headers=headers, files=files, timeout=30
                )
                response.raise_for_status()
                return True

        except (requests.exceptions.RequestException, OSError) as e:
            logger.warning("Error attaching file: %s", e)
            return False
