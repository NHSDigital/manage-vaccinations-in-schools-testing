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
from .models import JiraTestCase, TestResult, TestStep

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
                self.config.jira_url.removesuffix("/rest/api/2/")
                if self.config.jira_url
                else "",
                self.config.jira_username or "",
                self.config.jira_api_token or "",
                self.config.project_key,
                zephyr_api_token=self.config.zephyr_api_token,
                zephyr_project_id=self.config.zephyr_project_id,
                zephyr_url=self.config.zephyr_url,
            )

            # Create or get test plan for current session
            self._initialize_test_plan()
        except RuntimeError as e:
            logger.info("Failed to initialize Jira client: %s", e)
            self.client = None

    def _initialize_test_plan(self) -> None:
        """Initialize test plan for current test session."""
        if not self.client:
            return

        plan_name = (
            f"Automated Test Plan - "
            f"{datetime.now(tz=UTC).strftime('%Y-%m-%d %H:%M:%S')}"
        )
        plan_description = "Automated test execution plan created by pytest integration"

        try:
            self.current_test_plan_key = self.client.create_test_plan(
                plan_name, plan_description
            )
            if not self.current_test_plan_key:
                logger.warning("Failed to create test plan - continuing without plan")
                # Don't disable client, just continue without test plan
            else:
                logger.info(
                    "Created test plan with key: %s", self.current_test_plan_key
                )
        except RuntimeError as e:
            logger.warning(
                "Failed to initialize test plan: %s - continuing without plan", e
            )
            # Don't disable client, just continue without test plan

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
                    line,
                    in_steps=in_steps_section,
                    in_verification=verification_section,
                )
            )
            if section_changed:
                continue

            current_step, steps = self._process_line_content(
                line,
                current_step,
                steps,
                in_steps_section=in_steps_section,
                verification_section=verification_section,
            )

        # Add final step if exists
        if current_step:
            steps.append(current_step)

        return steps

    def _check_section_headers(
        self, line: str, *, in_steps: bool, in_verification: bool
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
        *,
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
            return TestStep(description=cleaned_line, expected_result=""), steps
        if current_step and line:
            current_step.description += f" {line}"
        return current_step, steps

    def _format_test_steps_as_description(
        self, description: str, test_steps: list[TestStep]
    ) -> str:
        """Format test steps as text to include in the description field."""
        if not test_steps:
            return description

        # Build the full description with test steps
        parts = []

        # Add the original description if present
        if description:
            parts.append(description)
            parts.append("\n\n")

        # Add test steps section
        parts.append("h3. Test Steps\n\n")
        for i, step in enumerate(test_steps, 1):
            parts.append(f"{i}. {step.description}\n")
            if step.expected_result:
                parts.append(f"   *Expected:* {step.expected_result}\n")
            parts.append("\n")

        return "".join(parts)

    def _extract_issue_key(self, text: str) -> str | None:
        """Extract a Jira issue key from text when present."""
        if not text:
            return None
        pattern = re.compile(rf"\b{re.escape(self.config.project_key)}-\d+\b")
        match = pattern.search(text)
        return match.group(0) if match else None

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

        # First, try to use a Jira issue key if provided
        issue_key = self._extract_issue_key(test_name) or self._extract_issue_key(
            docstring
        )
        if issue_key and self.client.issue_exists(issue_key):
            logger.info("Using existing test case by key: %s", issue_key)
            return issue_key

        # Next, try to find existing test case by name
        test_case_key = self.client.find_test_case_by_name(test_name)
        if test_case_key:
            logger.info("Found existing test case: %s", test_case_key)
            return test_case_key

        # Create new test case
        test_steps = self.parse_test_steps_from_docstring(docstring)
        base_description = self._extract_description_from_docstring(docstring)
        full_description = self._format_test_steps_as_description(
            base_description, test_steps
        )

        test_case = JiraTestCase(
            name=test_name,
            description=full_description,
            test_steps=(full_description and test_steps) or None,
            objective=base_description,
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

    def report_test_result(
        self,
        test_case_key: str,
        result: TestResult,
        error_message: str | None = None,
        screenshots: list[str] | None = None,
    ) -> None:
        """
        Report test execution result to Jira.

        This method follows the workflow:
        1. Start test execution
        2. Update with results
        3. End test execution

        Args:
            test_case_key: Test case issue key in Jira
            result: Test execution result
            error_message: Error message if test failed
            screenshots: List of screenshot file paths
        """
        if not self.client:
            logger.warning("Jira client not initialized")
            return

        # Import here to avoid circular dependency
        from .auto_fixtures import get_execution_id, set_execution_id

        # Check if we already created an execution for this test case
        existing_execution_id = get_execution_id(test_case_key)
        if existing_execution_id:
            logger.info(
                "Execution %s already exists for %s, skipping duplicate creation",
                existing_execution_id,
                test_case_key,
            )
            # Don't try to update, Zephyr Essential DC doesn't support status updates
            logger.warning(
                "Zephyr Essential DC does not support execution status updates via API. "
                "Status will remain as initially created."
            )
            return

        zephyr_enabled = bool(self.config.zephyr_url or self.config.zephyr_api_token)

        # Step 1: Create Zephyr test execution WITH the final status
        # (Zephyr Essential DC doesn't support updates, so we set status at creation)
        execution_key = self.client.create_zephyr_test_execution(
            test_case_key=test_case_key,
            test_cycle_key=self.config.test_cycle_key,
            version_name=self.config.test_cycle_version,
            environment=os.getenv("TEST_ENVIRONMENT", "unknown"),
            initial_status=result,  # Set the status at creation time
        )

        # Store execution ID to prevent duplicates
        if execution_key:
            set_execution_id(test_case_key, execution_key)
            logger.info(
                "Created and stored execution %s for %s with status %s",
                execution_key,
                test_case_key,
                result.value,
            )
        else:
            # Fallback to ATM test execution if Zephyr is unavailable
            if not zephyr_enabled:
                logger.info(
                    "Zephyr execution failed, falling back to ATM for %s",
                    test_case_key,
                )
                execution_key = self.client.create_atm_test_execution(
                    test_case_key=test_case_key,
                    test_cycle_version=self.config.test_cycle_version,
                    test_cycle_key=self.config.test_cycle_key,
                    environment=os.getenv("TEST_ENVIRONMENT", "unknown"),
                )
                if execution_key:
                    set_execution_id(test_case_key, execution_key)

            # Final fallback to Jira issue-based execution
            if not execution_key and not zephyr_enabled:
                logger.info(
                    "ATM execution failed, falling back to Jira issue-based for %s",
                    test_case_key,
                )
                execution_key = self.client.start_test_execution(
                    test_case_key=test_case_key,
                    test_cycle_key=self.current_test_plan_key,
                )
                if execution_key:
                    set_execution_id(test_case_key, execution_key)

            if not execution_key:
                logger.warning("Failed to start test execution for %s", test_case_key)
                return

            logger.info("Started test execution: %s", execution_key)

        # Step 2: Add result as comment on the Jira test case issue
        # (Zephyr execution API is too limited, but Jira issue comments work)
        result_comment = f"*Automated Test Execution {execution_key}*\n\n"
        result_comment += f"Result: *{result.value}*\n"
        result_comment += (
            f"Timestamp: {datetime.now(UTC).strftime('%Y-%m-%d %H:%M:%S')} UTC\n"
        )
        if error_message:
            result_comment += f"\nError details:\n{{code}}\n{error_message}\n{{code}}"

        comment_added = self.client._add_comment(test_case_key, result_comment)

        if comment_added:
            logger.info(
                "Added result comment to test case %s: %s", test_case_key, result.value
            )
        else:
            logger.warning(
                "Could not add comment to execution %s - result is %s",
                execution_key,
                result.value,
            )

        # Step 3: Attach screenshots
        screenshots_to_attach = (
            screenshots
            if result != TestResult.PASS or self.config.attach_passed_screenshots
            else []
        )

        # Attach screenshots if any
        if screenshots_to_attach:
            logger.info(
                "Attaching %d screenshots to execution %s",
                len(screenshots_to_attach),
                execution_key,
            )
            self.client.attach_zephyr_execution_files(
                execution_key, screenshots_to_attach
            )
        else:
            logger.info("No screenshots to attach for execution %s", execution_key)

        logger.info(
            "Completed test execution %s with result: %s",
            execution_key,
            result.value,
        )

        # End execution (only for non-Zephyr executions)
        # Zephyr executions don't need explicit ending
        if not zephyr_enabled:
            end_success = self.client.end_test_execution(
                execution_key=execution_key,
                result=result,
            )

            if not end_success:
                logger.warning("Failed to end test execution %s", execution_key)
            else:
                logger.info("Ended test execution: %s", execution_key)

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
