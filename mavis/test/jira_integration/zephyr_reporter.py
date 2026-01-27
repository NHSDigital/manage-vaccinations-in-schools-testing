"""
Zephyr Scale test reporter for pytest integration.
"""

import logging
import os
import re
import time
from datetime import UTC, datetime
from functools import wraps

from playwright.sync_api import Page

from .config import JiraConfig
from .models import TestResult, TestStep, ZephyrTestCase, ZephyrTestExecution
from .zephyr_client import ZephyrClient

logger = logging.getLogger(__name__)


def retry_on_failure(max_retries: int = 3, delay: float = 1.0):
    """Decorator to retry operations on failure."""

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    if attempt < max_retries - 1:
                        logger.warning(
                            f"Attempt {attempt + 1} failed: {e}. Retrying in {delay}s..."
                        )
                        time.sleep(delay)
                    else:
                        logger.error(
                            f"All {max_retries} attempts failed. Last error: {e}"
                        )
            if last_exception is not None:
                raise last_exception
            raise RuntimeError("Function failed without raising an exception")

        return wrapper

    return decorator


class ZephyrTestReporter:
    """Handles Zephyr Scale test reporting integration."""

    def __init__(self, config: JiraConfig | None = None) -> None:
        """Initialize Zephyr Scale reporter with configuration."""
        self.config = config or JiraConfig.from_env()
        self.client = None
        self.current_cycle_id = None

        # Create screenshots directory
        self.config.screenshots_dir.mkdir(exist_ok=True)

        # Only initialize if configuration is valid and enabled
        if not self.config.is_valid():
            logger.debug(
                "Zephyr Scale integration disabled: Invalid or disabled configuration"
            )
            return

        # Initialize Zephyr Scale client
        try:
            self.client = ZephyrClient(
                self.config.url,
                self.config.username,
                self.config.api_token,
                self.config.project_key,
                zephyr_token=getattr(self.config, "zephyr_token", None),
            )
            logger.info("Zephyr Scale integration enabled")

            # Create or get test cycle for current session
            self._initialize_test_cycle()
        except Exception as e:
            logger.info("Failed to initialize Zephyr Scale client: %s", e)
            self.client = None

    def _initialize_test_cycle(self) -> None:
        """Initialize test cycle for current test session."""
        if not self.client:
            return

        cycle_name = (
            f"Automated Test Run - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        )
        cycle_description = (
            "Automated test execution cycle created by pytest integration"
        )

        try:
            self.current_cycle_id = self.client.create_test_cycle(
                cycle_name, cycle_description
            )
            if self.current_cycle_id:
                logger.info("Created test cycle with ID: %s", self.current_cycle_id)
            else:
                logger.info(
                    "Failed to create test cycle - integration will be disabled"
                )
                self.client = None
        except Exception as e:
            logger.info(
                "Failed to initialize test cycle: %s - integration will be disabled", e
            )
            self.client = None

    def is_enabled(self) -> bool:
        """Check if Zephyr Scale integration is enabled."""
        return self.client is not None

    def parse_test_steps_from_docstring(self, docstring: str) -> list[TestStep]:
        """
        Parse test steps from pytest docstring.

        Args:
            docstring: Test function docstring

        Returns:
            List of TestStep objects
        """
        if not docstring:
            return []

        lines = [line.strip() for line in docstring.strip().split("\n")]
        return self._process_docstring_lines(lines)

    def _process_docstring_lines(self, lines: list[str]) -> list[TestStep]:
        """Process docstring lines to extract test steps."""
        steps = []
        current_step = None
        in_steps_section = False
        verification_section = False

        for line in lines:
            if line.lower().startswith("steps:"):
                in_steps_section = True
                verification_section = False
                continue
            if line.lower().startswith("verification:"):
                verification_section = True
                in_steps_section = False
                continue
            if line.startswith("Test:") or line.startswith("Description:"):
                in_steps_section = False
                verification_section = False
                continue

            if in_steps_section and line:
                if re.match(r"^\d+\.", line):
                    if current_step:
                        steps.append(current_step)
                    current_step = TestStep(
                        step=re.sub(r"^\d+\.\s*", "", line), expected_result=""
                    )
                elif current_step and line:
                    current_step.step += f" {line}"

            elif verification_section and current_step and line.startswith("-"):
                current_step.expected_result = line[1:].strip()

        if current_step:
            steps.append(current_step)

        return steps

    @retry_on_failure(max_retries=3, delay=1.0)
    def get_or_create_test_case(
        self, test_name: str, docstring: str = ""
    ) -> int | None:
        """
        Get existing test case or create a new one in Zephyr Scale.

        Args:
            test_name: Name of the test
            docstring: Test docstring containing steps

        Returns:
            Test case ID if successful, None otherwise
        """
        if not self.client:
            logger.warning("Zephyr Scale client not initialized")
            return None

        # First, try to find existing test case
        test_case_id = self.client.find_test_case_by_name(test_name)
        if test_case_id:
            logger.info(f"Found existing test case: {test_case_id}")
            return test_case_id

        # Create new test case
        test_steps = self.parse_test_steps_from_docstring(docstring)

        test_case = ZephyrTestCase(
            summary=test_name,
            description=self._extract_description_from_docstring(docstring),
            test_steps=test_steps,
            project_key=self.config.project_key,
            folder="Automated Tests",
            objective=self._extract_description_from_docstring(docstring),
        )

        try:
            test_case_id = self.client.create_test_case(test_case)
            if test_case_id:
                logger.info(f"Created new test case: {test_case_id}")
            return test_case_id
        except Exception as e:
            logger.error(f"Failed to create test case: {e}")
            return None

    def _extract_description_from_docstring(self, docstring: str) -> str:
        """Extract description from docstring."""
        if not docstring:
            return ""

        lines = docstring.strip().split("\n")
        description_lines = []

        for line in lines:
            line = line.strip()
            if line.lower().startswith(("test:", "steps:", "verification:")):
                break
            if (
                line
                and not line.startswith("Args:")
                and not line.startswith("Returns:")
            ):
                description_lines.append(line)

        return " ".join(description_lines)

    def pytest_result_to_zephyr_result(self, pytest_outcome: str) -> TestResult:
        """
        Convert pytest result to Zephyr Scale result.

        Args:
            pytest_outcome: pytest test outcome

        Returns:
            TestResult enum value
        """
        mapping = {
            "passed": TestResult.PASS,
            "failed": TestResult.FAIL,
            "skipped": TestResult.SKIPPED,
            "blocked": TestResult.BLOCKED,
        }
        return mapping.get(pytest_outcome.lower(), TestResult.FAIL)

    @retry_on_failure(max_retries=3, delay=1.0)
    def report_test_result(
        self,
        test_case_id: int,
        result: TestResult,
        error_message: str | None = None,
        screenshots: list[str] | None = None,
    ) -> None:
        """
        Report test execution result to Zephyr Scale.

        Args:
            test_case_id: Test case ID in Zephyr Scale
            result: Test execution result
            error_message: Error message if test failed
            screenshots: List of screenshot file paths
        """
        if not self.client:
            logger.warning("Zephyr Scale client not initialized")
            return

        try:
            execution = ZephyrTestExecution(
                test_case_id=test_case_id,
                test_cycle_id=self.current_cycle_id,
                execution_status=result,
                executed_by=self.config.username,
                execution_date=datetime.now(UTC),
                comment=error_message or "",
                attachments=screenshots or [],
                environment=os.getenv("TEST_ENVIRONMENT", "local"),
            )

            execution_id = self.client.create_test_execution(execution)
            if execution_id:
                logger.info(f"Reported test result to Zephyr Scale: {execution_id}")
            else:
                logger.warning("Failed to report test result to Zephyr Scale")

        except Exception as e:
            logger.error(f"Error reporting test result: {e}")
            raise

    def take_screenshot(
        self, page: Page, test_name: str, suffix: str = ""
    ) -> str | None:
        """
        Take a screenshot and save it.

        Args:
            page: Playwright page object
            test_name: Name of the test
            suffix: Optional suffix for screenshot filename

        Returns:
            Screenshot file path if successful, None otherwise
        """
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = (
                f"{test_name}_{suffix}_{timestamp}.png"
                if suffix
                else f"{test_name}_{timestamp}.png"
            )
            screenshot_path = self.config.screenshots_dir / filename

            page.screenshot(path=str(screenshot_path), full_page=True)
            logger.info(f"Screenshot saved: {screenshot_path}")
            return str(screenshot_path)

        except Exception as e:
            logger.warning(f"Failed to take screenshot: {e}")
            return None

    def cleanup_old_screenshots(self, days_old: int = 7) -> None:
        """
        Clean up old screenshot files.

        Args:
            days_old: Number of days after which screenshots should be deleted
        """
        try:
            cutoff_time = time.time() - (days_old * 24 * 60 * 60)

            for screenshot_file in self.config.screenshots_dir.glob("*.png"):
                if screenshot_file.stat().st_mtime < cutoff_time:
                    screenshot_file.unlink()
                    logger.debug(f"Deleted old screenshot: {screenshot_file}")

        except Exception as e:
            logger.warning(f"Failed to cleanup old screenshots: {e}")
