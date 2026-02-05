"""Jira and Zephyr API client."""

import logging
from typing import Any

import requests

from .models import TestResult

logger = logging.getLogger(__name__)


class JiraClient:
    """Client for Jira and Zephyr API operations."""

    def __init__(self, url: str, api_token: str, project_key: str) -> None:
        """Initialize Jira client.

        Args:
            url: Jira base URL
            api_token: Jira API token for Bearer authentication
            project_key: Jira project key
        """
        self.base_url = url.rstrip("/")
        self.project_key = project_key
        self.timeout = 30

        self.session = requests.Session()
        self.session.headers.update(
            {
                "Authorization": f"Bearer {api_token}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            }
        )

    def _make_request(
        self,
        method: str,
        endpoint: str,
        data: dict | None = None,
        params: dict | None = None,
    ) -> dict[str, Any]:
        """Make authenticated request to Jira API.

        Args:
            method: HTTP method (GET, POST, PUT)
            endpoint: API endpoint (e.g., 'issue', 'search')
            data: Request body data
            params: Query parameters

        Returns:
            Response JSON data
        """
        url = f"{self.base_url}/{endpoint}"

        try:
            if method == "GET":
                response = self.session.get(url, params=params, timeout=self.timeout)
            elif method == "POST":
                response = self.session.post(url, json=data, timeout=self.timeout)
            elif method == "PUT":
                response = self.session.put(url, json=data, timeout=self.timeout)
            else:
                msg = f"Unsupported method: {method}"
                raise ValueError(msg)

            response.raise_for_status()
            return response.json() if response.content else {}

        except requests.exceptions.RequestException as e:
            logger.exception("API request failed: %s %s", method, url)
            if hasattr(e, "response") and e.response is not None:
                logger.exception("Response: %s", e.response.text)
            raise

    def search_test_case(self, test_name: str) -> str | None:
        """Search for existing test case by name.

        Args:
            test_name: Name of the test case to find

        Returns:
            Issue key if found, None otherwise
        """
        # Escape special JQL characters
        escaped_name = test_name.replace("\\", "\\\\").replace('"', '\\"')

        # Use fuzzy match with ordering by key for consistency when duplicates exist
        jql = (
            f'project = "{self.project_key}" '
            f'AND issuetype = "Test" '
            f'AND summary ~ "{escaped_name}" '
            f'ORDER BY key DESC'
        )

        params = {"jql": jql, "maxResults": 1, "fields": "key,summary"}

        try:
            response = self._make_request("GET", "rest/api/2/search", params=params)
            issues = response.get("issues", [])

            if issues:
                issue_key = issues[0]["key"]
                logger.info("Found existing test case: %s", issue_key)
                return issue_key

            return None

        except requests.exceptions.RequestException:
            logger.warning("Failed to search for test case: %s", test_name)
            return None

    def create_test_case(self, test_name: str, description: str = "") -> str | None:
        """Create a new test case in Jira.

        Args:
            test_name: Name for the test case
            description: Description for the test case

        Returns:
            Issue key of created test case, None if failed
        """
        issue_data = {
            "fields": {
                "project": {"key": self.project_key},
                "summary": test_name,
                "description": description or f"Automated test: {test_name}",
                "issuetype": {"name": "Test"},
            }
        }

        try:
            response = self._make_request("POST", "rest/api/2/issue", data=issue_data)
            issue_key = response.get("key")

            if issue_key:
                logger.info("Created test case: %s", issue_key)
                return issue_key

            logger.warning("Failed to get issue key from response")
            return None

        except requests.exceptions.RequestException:
            logger.exception("Failed to create test case: %s", test_name)
            return None

    def get_test_cycle_id(self, project_id: str, cycle_name: str, version: str) -> str:
        """Get test cycle ID by name and version.

        Args:
            project_id: Jira project ID
            cycle_name: Name of the test cycle
            version: Version name to filter by

        Returns:
            Cycle ID

        Raises:
            ValueError: If test cycle not found
            requests.exceptions.RequestException: If API request fails
        """
        params = {"projectId": project_id}

        response = self._make_request("GET", "rest/zapi/latest/cycle", params=params)

        # Response format: {versionId: [{cycleId: {cycle_data}, ...}], ...}
        # Iterate through version IDs
        for version_data in response.values():
            if not isinstance(version_data, list) or not version_data:
                continue

            # Each version contains a list with one element containing cycles
            cycles_dict = version_data[0]
            if not isinstance(cycles_dict, dict):
                continue

            # Iterate through cycles in this version
            for cycle_id, cycle_data in cycles_dict.items():
                if not isinstance(cycle_data, dict) or cycle_id == "recordsCount":
                    continue

                # Check name matches
                if cycle_data.get("name") != cycle_name:
                    continue

                # Check version matches
                cycle_version = cycle_data.get("versionName")
                if cycle_version != version:
                    continue

                logger.info(
                    "Found test cycle: %s (ID: %s) version: %s",
                    cycle_name,
                    cycle_id,
                    version,
                )
                return cycle_id

        msg = (
            f"Test cycle '{cycle_name}' with version '{version}' "
            f"not found in project {project_id}"
        )
        raise ValueError(msg)

    def get_zephyr_status_id(self, result: TestResult) -> int:
        """Get Zephyr execution status ID for a test result.

        Args:
            result: Test result enum

        Returns:
            Status ID for Zephyr
        """
        try:
            response = self._make_request(
                "GET", "rest/zapi/latest/util/testExecutionStatus"
            )

            if isinstance(response, list):
                for status in response:
                    if isinstance(status, dict):
                        name = str(status.get("name", "")).upper()
                        if name == result.value:
                            return int(status.get("id", -1))

        except requests.exceptions.RequestException:
            logger.warning("Failed to get Zephyr status list, using defaults")

        # Fallback to default Zephyr status IDs
        defaults = {
            TestResult.PASS: 1,
            TestResult.FAIL: 2,
            TestResult.SKIPPED: -1,
        }
        return defaults.get(result, 2)

    def create_execution(
        self, test_case_key: str, cycle_id: str, project_id: str
    ) -> str | None:
        """Create a test execution in Zephyr.

        Args:
            test_case_key: Test case issue key
            cycle_id: Test cycle ID
            project_id: Project ID

        Returns:
            Execution ID if successful, None otherwise
        """
        # First, get the issue ID from the issue key
        try:
            issue_response = self._make_request(
                "GET", f"rest/api/2/issue/{test_case_key}", params={"fields": "id"}
            )
            issue_id = issue_response.get("id")

            if not issue_id:
                logger.warning("Could not get issue ID for %s", test_case_key)
                return None

        except requests.exceptions.RequestException:
            logger.exception("Failed to get issue ID for %s", test_case_key)
            return None

        # Create execution
        execution_data = {
            "issueId": issue_id,
            "cycleId": cycle_id,
            "projectId": project_id,
            "versionId": -1,  # -1 means "Unscheduled"
        }

        try:
            response = self._make_request(
                "POST", "rest/zapi/latest/execution", data=execution_data
            )

            # Extract execution ID from response
            execution_id = response.get("id") or response.get("executionId")

            if not execution_id and isinstance(response, dict):
                # Sometimes response is {execution_id: {execution_data}}
                for key, value in response.items():
                    if not execution_id and isinstance(value, dict):
                        execution_id = key
                        break

            if execution_id:
                logger.info(
                    "Created execution %s for test case %s", execution_id, test_case_key
                )
                return str(execution_id)

            logger.warning("Could not extract execution ID from response")
            return None

        except requests.exceptions.RequestException:
            logger.exception("Failed to create execution for %s", test_case_key)
            return None

    def update_execution_status(
        self, execution_id: str, result: TestResult, comment: str | None = None
    ) -> bool:
        """Update test execution status in Zephyr.

        Args:
            execution_id: Execution ID
            result: Test result
            comment: Optional comment

        Returns:
            True if successful, False otherwise
        """
        status_id = self.get_zephyr_status_id(result)

        payload = {"status": status_id}

        try:
            self._make_request(
                "PUT",
                f"rest/zapi/latest/execution/{execution_id}/execute",
                data=payload,
            )
            logger.info("Updated execution %s to status %s", execution_id, result.value)

            # Add comment if provided
            if comment:
                try:
                    self._make_request(
                        "PUT",
                        f"rest/zapi/latest/execution/{execution_id}",
                        data={"comment": comment},
                    )
                except requests.exceptions.RequestException:
                    logger.warning(
                        "Failed to add comment to execution %s", execution_id
                    )

            return True

        except requests.exceptions.RequestException:
            logger.exception("Failed to update execution %s", execution_id)
            return False
