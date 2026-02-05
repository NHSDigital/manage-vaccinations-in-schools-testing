"""Jira test reporter for pytest integration."""

import logging

from .client import JiraClient
from .config import JiraConfig
from .models import TestResult

logger = logging.getLogger(__name__)


class JiraReporter:
    """Handles reporting pytest test results to Jira/Zephyr."""

    def __init__(self) -> None:
        """Initialize Jira reporter.

        Args:
            config: Jira configuration (loads from env if not provided)

        Raises:
            ValueError: If configuration is invalid or initialization fails
        """
        self.config = JiraConfig.from_env()

        # Validate configuration
        if not self.config.is_valid():
            msg = "Jira integration disabled: invalid or incomplete configuration"
            raise ValueError(msg)

        # Initialize client
        self.client = JiraClient(
            url=self.config.url,
            api_token=self.config.api_token,
            project_key=self.config.project_key,
        )

        # Get test cycle ID (raises ValueError if not found)
        self.cycle_id = self.client.get_test_cycle_id(
            project_id=self.config.project_id,
            cycle_name=self.config.test_cycle_name,
            version=self.config.test_cycle_version,
        )

        logger.info("Jira integration initialized successfully")

    def report_test_result(
        self, test_name: str, outcome: str, error_message: str | None = None
    ) -> None:
        """Report a test result to Jira.

        Args:
            test_name: Name of the test
            outcome: Pytest outcome (passed, failed, skipped)
            error_message: Error message if test failed
        """
        try:
            # Convert pytest outcome to Jira result
            result = TestResult.from_pytest_outcome(outcome)

            # Find or create test case
            test_case_key = self._get_or_create_test_case(test_name)
            if not test_case_key:
                logger.warning("Could not get test case for %s", test_name)
                return

            # Create execution
            execution_id = self.client.create_execution(
                test_case_key=test_case_key,
                cycle_id=self.cycle_id,
                project_id=self.config.project_id,
            )

            if not execution_id:
                logger.warning("Could not create execution for %s", test_name)
                return

            # Update execution status
            comment = error_message or None
            success = self.client.update_execution_status(
                execution_id=execution_id,
                result=result,
                comment=comment,
            )

            if success:
                logger.info(
                    "Successfully reported test %s (%s) to Jira",
                    test_name,
                    result.value,
                )
            else:
                logger.warning("Failed to update execution status for %s", test_name)

        except Exception:
            logger.exception("Error reporting test result for %s", test_name)

    def _get_or_create_test_case(self, test_name: str) -> str | None:
        """Get existing test case or create a new one.

        Args:
            test_name: Name of the test

        Returns:
            Test case issue key, or None if failed
        """
        # Search for existing test case
        test_case_key = self.client.search_test_case(test_name)

        if test_case_key:
            return test_case_key

        # Create new test case if not found
        logger.info("Test case not found, creating new one: %s", test_name)
        return self.client.create_test_case(test_name)
