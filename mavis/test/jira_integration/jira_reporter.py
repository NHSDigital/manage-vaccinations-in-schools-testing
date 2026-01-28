"""
Jira test reporter for pytest integration.
"""

import logging
import os
import re
import time
from collections.abc import Callable
from datetime import UTC, datetime
from functools import wraps
from typing import TypeVar

from playwright.sync_api import Page

from .config import JiraConfig
from .jira_client import JiraClient
from .models import JiraTestCase, JiraTestExecution, TestResult, TestStep

logger = logging.getLogger(__name__)

T = TypeVar("T")


def retry_on_failure(
    max_retries: int = 3, delay: float = 1.0
) -> Callable[[Callable[..., T]], Callable[..., T]]:
    """Decorator to retry operations on failure."""

    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        def wrapper(*args: object, **kwargs: object) -> T:
            last_exception = None
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    if attempt < max_retries - 1:
                        logger.warning(
                            "Attempt %d failed: %s. Retrying in %ss...",
                            attempt + 1,
                            e,
                            delay,
                        )
                        time.sleep(delay)
                    else:
                        logger.exception("All %d attempts failed.", max_retries)
            if last_exception is not None:
                raise last_exception

            error_msg = "Function failed without raising an exception"
            raise RuntimeError(error_msg)

        return wrapper

    return decorator


class JiraTestReporter:
    """Handles Jira test reporting integration."""

    def __init__(self, config: JiraConfig | None = None) -> None:
        """Initialize Jira reporter with configuration."""
        self.config = config or JiraConfig.from_env()
        self.client = None
        self.current_test_plan_key = None

        # Create screenshots directory
        self.config.screenshots_dir.mkdir(exist_ok=True)

        # Only initialize if configuration is valid and enabled
        if not self.config.is_valid():
            logger.debug("Jira integration disabled: Invalid or disabled configuration")
            return

        # Initialize Jira client
        try:
            self.client = JiraClient(
                self.config.url,
                self.config.username,
                self.config.api_token,
                self.config.project_key,
            )
            logger.info("Jira integration enabled")

            # Create or get test plan for current session
            self._initialize_test_plan()
        except RuntimeError as e:
            logger.info("Failed to initialize Jira client: %s", e)
            self.client = None

    def _initialize_test_plan(self) -> None:
        """Initialize test plan for current test session."""
        if not self.client:
            return

        plan_name = f"Automated Test Plan - {datetime.now(tz=UTC).strftime('%Y-%m-%d %H:%M:%S')}"
        plan_description = "Automated test execution plan created by pytest integration"

        try:
            self.current_test_plan_key = self.client.create_test_plan(
                plan_name, plan_description
            )
            if not self.current_test_plan_key:
                logger.info("Failed to create test plan - integration will be disabled")
                self.client = None
            else:
                logger.info(
                    "Created test plan with key: %s", self.current_test_plan_key
                )
        except RuntimeError as e:
            logger.info(
                "Failed to initialize test plan: %s - integration will be disabled", e
            )
            self.client = None

    def is_enabled(self) -> bool:
        """Check if Jira integration is enabled."""
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
            section_changed, in_steps_section, verification_section = (
                self._check_section_headers(
                    line, in_steps_section, verification_section
                )
            )
            if section_changed:
                continue

            current_step, steps = self._process_line_content(
                line, current_step, steps, in_steps_section, verification_section
            )

        # Add final step if exists
        if current_step:
            steps.append(current_step)

        return steps

    def _check_section_headers(
        self, line: str, in_steps: bool, in_verification: bool
    ) -> tuple[bool, bool, bool]:
        """Check if line is a section header and return updated section states."""
        if line.lower().startswith("steps:"):
            return True, True, False
        if line.lower().startswith("verification:"):
            return True, False, True
        if line.startswith(("Test:", "Description:")):
            return True, False, False
        return False, in_steps, in_verification

    def _process_line_content(
        self,
        line: str,
        current_step: TestStep | None,
        steps: list[TestStep],
        in_steps_section: bool,
        verification_section: bool,
    ) -> tuple[TestStep | None, list[TestStep]]:
        """Process line content and return updated step and steps list."""
        if in_steps_section and line:
            return self._process_step_line(line, current_step, steps)
        if verification_section and current_step and line.startswith("-"):
            current_step.expected_result = line[1:].strip()
        return current_step, steps

    def _process_step_line(
        self, line: str, current_step: TestStep | None, steps: list[TestStep]
    ) -> tuple[TestStep | None, list[TestStep]]:
        """Process a line in the steps section."""
        if re.match(r"^\d+\.", line):
            if current_step:
                steps.append(current_step)
            cleaned_line = re.sub(r"^\d+\.\s*", "", line)
            return TestStep(step=cleaned_line, expected_result=""), steps
        if current_step and line:
            current_step.step += f" {line}"
        return current_step, steps

    @retry_on_failure(max_retries=3, delay=1.0)
    def get_or_create_test_case(
        self, test_name: str, docstring: str = ""
    ) -> str | None:
        """
        Get existing test case or create a new one in Jira.

        Args:
            test_name: Name of the test
            docstring: Test docstring containing steps

        Returns:
            Test case issue key if successful, None otherwise
        """
        if not self.client:
            logger.warning("Jira client not initialized")
            return None

        # First, try to find existing test case
        test_case_key = self.client.find_test_case_by_name(test_name)
        if test_case_key:
            logger.info("Found existing test case: %s", test_case_key)
            return test_case_key

        # Create new test case
        test_steps = self.parse_test_steps_from_docstring(docstring)

        test_case = JiraTestCase(
            summary=test_name,
            description=self._extract_description_from_docstring(docstring),
            test_steps=test_steps,
            project_key=self.config.project_key,
            folder="Automated Tests",
            objective=self._extract_description_from_docstring(docstring),
        )

        try:
            test_case_key = self.client.create_test_case(test_case)
        except RuntimeError:
            logger.exception("Failed to create test case")
            return None
        else:
            if not test_case_key:
                logger.warning("Failed to create test case")
                return None
            logger.info("Created new test case: %s", test_case_key)
            return test_case_key

    def _extract_description_from_docstring(self, docstring: str) -> str:
        """Extract description from docstring."""
        if not docstring:
            return ""

        lines = docstring.strip().split("\n")
        description_lines = []

        for original_line in lines:
            line = original_line.strip()
            if line.lower().startswith(("test:", "steps:", "verification:")):
                break
            if (
                line
                and not line.startswith("Args:")
                and not line.startswith("Returns:")
            ):
                description_lines.append(line)

        return " ".join(description_lines)

    def pytest_result_to_jira_result(self, pytest_outcome: str) -> TestResult:
        """
        Convert pytest result to Jira result.

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
        test_case_key: str,
        result: TestResult,
        error_message: str | None = None,
        screenshots: list[str] | None = None,
    ) -> None:
        """
        Report test execution result to Jira.

        Args:
            test_case_key: Test case issue key in Jira
            result: Test execution result
            error_message: Error message if test failed
            screenshots: List of screenshot file paths
        """
        if not self.client:
            logger.warning("Jira client not initialized")
            return

        try:
            execution = JiraTestExecution(
                test_case_key=test_case_key,
                test_plan_key=self.current_test_plan_key,
                execution_status=result,
                executed_by=self.config.username,
                execution_date=datetime.now(tz=UTC),
                comment=error_message or "",
                attachments=screenshots or [],
                environment=os.getenv("TEST_ENVIRONMENT", "local"),
            )

            execution_key = self.client.create_test_execution(execution)
            if not execution_key:
                logger.warning("Failed to report test result to Jira")
            else:
                logger.info("Reported test result to Jira: %s", execution_key)

        except RuntimeError:
            logger.exception("Error reporting test result")
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
            timestamp = datetime.now(tz=UTC).strftime("%Y%m%d_%H%M%S")
            filename = (
                f"{test_name}_{suffix}_{timestamp}.png"
                if suffix
                else f"{test_name}_{timestamp}.png"
            )
            screenshot_path = self.config.screenshots_dir / filename

            page.screenshot(path=str(screenshot_path), full_page=True)
            logger.info("Screenshot saved: %s", screenshot_path)
            return str(screenshot_path)

        except RuntimeError as e:
            logger.warning("Failed to take screenshot: %s", e)
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
                    logger.debug("Deleted old screenshot: %s", screenshot_file)

        except RuntimeError as e:
            logger.warning("Failed to cleanup old screenshots: %s", e)
