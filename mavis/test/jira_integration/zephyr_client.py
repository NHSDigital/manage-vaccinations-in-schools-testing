"""
Zephyr Scale REST API client for test management.
"""

import logging
from pathlib import Path

import requests
from requests.auth import HTTPBasicAuth

from .models import ZephyrTestCase, ZephyrTestExecution

logger = logging.getLogger(__name__)


class ZephyrClient:
    """Client for interacting with Zephyr Scale REST API."""

    def __init__(
        self,
        jira_url: str,
        username: str,
        api_token: str,
        project_key: str,
        zephyr_token: str | None = None,
    ) -> None:
        self.jira_url = jira_url.rstrip("/")
        self.username = username
        self.api_token = api_token
        self.project_key = project_key
        self.zephyr_token = zephyr_token or api_token
        self.auth = HTTPBasicAuth(username, api_token)
        self.session = requests.Session()
        self.session.auth = self.auth
        self.session.headers.update(
            {"Content-Type": "application/json", "Accept": "application/json"}
        )

    def _make_zephyr_request(
        self,
        method: str,
        endpoint: str,
        data: dict | None = None,
        params: dict | None = None,
    ) -> dict:
        """Make authenticated request to Zephyr Scale API."""
        # Zephyr Scale uses a different base URL
        base_url = f"{self.jira_url}/rest/atm/1.0"
        url = f"{base_url}/{endpoint}"

        try:
            headers = {
                "Authorization": f"Bearer {self.zephyr_token}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            }

            if method == "GET":
                response = requests.get(url, headers=headers, params=params, timeout=30)
            elif method == "POST":
                response = requests.post(url, headers=headers, json=data, timeout=30)
            elif method == "PUT":
                response = requests.put(url, headers=headers, json=data, timeout=30)
            elif method == "DELETE":
                response = requests.delete(url, headers=headers, timeout=30)
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
            logger.debug("Zephyr Scale API request failed: %s", e)
            if hasattr(e, "response") and e.response is not None:
                logger.debug("Response: %s", e.response.text)
            raise

    def get_project_id(self) -> int | None:
        """Get project ID by project key."""
        try:
            response = self._make_zephyr_request("GET", f"project/{self.project_key}")
            return response.get("id")
        except Exception as e:
            logger.debug("Error getting project ID: %s", e)
            return None

    def create_test_case(self, test_case: ZephyrTestCase) -> int | None:
        """
        Create a test case in Zephyr Scale.

        Args:
            test_case: ZephyrTestCase object

        Returns:
            Test case ID if successful, None otherwise
        """
        project_id = self.get_project_id()
        if not project_id:
            logger.error("Could not get project ID for %s", self.project_key)
            return None

        # Format test steps for Zephyr Scale
        test_steps = []
        for i, step in enumerate(test_case.test_steps, 1):
            test_steps.append(
                {
                    "index": i,
                    "description": step.step,
                    "expectedResult": step.expected_result,
                }
            )

        test_case_data = {
            "projectId": project_id,
            "name": test_case.summary,
            "objective": test_case.objective or test_case.description,
            "testScript": {"type": "STEP_BY_STEP", "steps": test_steps},
            "priority": test_case.priority,
            "status": "Approved",
        }

        # Add folder if specified
        if test_case.folder:
            folder_id = self._get_or_create_folder(project_id, test_case.folder)
            if folder_id:
                test_case_data["folderId"] = folder_id

        # Add labels if provided
        if test_case.labels:
            test_case_data["labels"] = test_case.labels

        try:
            response = self._make_zephyr_request("POST", "testcase", test_case_data)
            test_case_id = response.get("id")
            logger.info("Created test case with ID: %s", test_case_id)
            return test_case_id
        except requests.exceptions.RequestException as e:
            logger.error("Error creating test case: %s", e)
            return None

    def find_test_case_by_name(self, name: str) -> int | None:
        """
        Find test case by name.

        Args:
            name: Test case name to search for

        Returns:
            Test case ID if found, None otherwise
        """
        project_id = self.get_project_id()
        if not project_id:
            return None

        try:
            params = {"projectId": project_id, "query": f'name = "{name}"'}
            response = self._make_zephyr_request(
                "GET", "testcase/search", params=params
            )

            results = response.get("values", [])
            return results[0]["id"] if results else None
        except requests.exceptions.RequestException as e:
            logger.warning("Error searching for test case: %s", e)
            return None

    def create_test_cycle(self, name: str, description: str = "") -> int | None:
        """
        Create a test cycle in Zephyr Scale.

        Args:
            name: Cycle name
            description: Cycle description

        Returns:
            Test cycle ID if successful, None otherwise
        """
        project_id = self.get_project_id()
        if not project_id:
            return None

        cycle_data = {
            "projectId": project_id,
            "name": name,
            "description": description,
            "status": "In Progress",
        }

        try:
            response = self._make_zephyr_request("POST", "testcycle", cycle_data)
            cycle_id = response.get("id")
            return cycle_id
        except requests.exceptions.RequestException as e:
            logger.debug("Error creating test cycle: %s", e)
            return None

    def create_test_execution(self, execution: ZephyrTestExecution) -> int | None:
        """
        Create/update test execution in Zephyr Scale.

        Args:
            execution: ZephyrTestExecution object

        Returns:
            Execution ID if successful, None otherwise
        """
        project_id = self.get_project_id()
        if not project_id:
            return None

        execution_data = {
            "projectId": project_id,
            "testCaseId": execution.test_case_id,
            "statusName": execution.execution_status.value,
            "comment": execution.comment or "",
            "executedById": execution.executed_by,
        }

        # Add test cycle if specified
        if execution.test_cycle_id:
            execution_data["testCycleId"] = execution.test_cycle_id

        # Add environment if specified
        if execution.environment:
            execution_data["environment"] = execution.environment

        try:
            if execution.execution_id:
                # Update existing execution
                response = self._make_zephyr_request(
                    "PUT", f"testresult/{execution.execution_id}", execution_data
                )
            else:
                # Create new execution
                response = self._make_zephyr_request(
                    "POST", "testresult", execution_data
                )

            execution_id = response.get("id")
            logger.info("Created/updated test execution with ID: %s", execution_id)

            # Attach files if provided
            if execution.attachments:
                for attachment_path in execution.attachments:
                    self.attach_file_to_execution(execution_id, attachment_path)

            return execution_id
        except requests.exceptions.RequestException as e:
            logger.error("Error creating/updating test execution: %s", e)
            return None

    def attach_file_to_execution(self, execution_id: int, file_path: str) -> bool:
        """
        Attach a file to a test execution.

        Args:
            execution_id: Test execution ID
            file_path: Path to file to attach

        Returns:
            True if successful, False otherwise
        """
        file_path_obj = Path(file_path)
        if not file_path_obj.exists():
            logger.warning("File not found: %s", file_path)
            return False

        url = f"{self.jira_url}/rest/atm/1.0/testresult/{execution_id}/attachments"

        try:
            headers = {
                "Authorization": f"Bearer {self.zephyr_token}",
                "Accept": "application/json",
            }

            with file_path_obj.open("rb") as f:
                files = {"file": (file_path_obj.name, f)}
                response = requests.post(url, headers=headers, files=files, timeout=30)
                response.raise_for_status()
                logger.info("Attached file %s to execution %s", file_path, execution_id)
                return True

        except (requests.exceptions.RequestException, OSError) as e:
            logger.warning("Error attaching file: %s", e)
            return False

    def _get_or_create_folder(self, project_id: int, folder_name: str) -> int | None:
        """Get or create a folder in the project."""
        try:
            # Search for existing folder
            params = {"projectId": project_id}
            response = self._make_zephyr_request("GET", "folder", params=params)

            for folder in response.get("values", []):
                if folder.get("name") == folder_name:
                    return folder.get("id")

            # Create new folder if not found
            folder_data = {
                "projectId": project_id,
                "name": folder_name,
                "type": "TEST_CASE",
            }

            response = self._make_zephyr_request("POST", "folder", folder_data)
            return response.get("id")

        except requests.exceptions.RequestException as e:
            logger.warning("Error getting/creating folder: %s", e)
            return None
