"""
JIRA test reporter for pytest integration.
"""

import logging
import os
import re
import time
from datetime import UTC, datetime
from functools import wraps
from pathlib import Path

from playwright.sync_api import Page

from .config import JiraConfig
from .models import TestResult, TestStep, ZephyrTestCase

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


class JiraTestReporter:
    """Handles JIRA test reporting integration."""

    def __init__(self, config: JiraConfig | None = None) -> None:
        """Initialize JIRA reporter with configuration."""
        self.config = config or JiraConfig.from_env()
        self.client = None

        # Create screenshots directory
        self.config.screenshots_dir.mkdir(exist_ok=True)

        # Initialize JIRA client if configuration is valid
        if (
            self.config.is_valid()
            and self.config.url is not None
            and self.config.username is not None
            and self.config.api_token is not None
        ):
            try:
                self.client = JiraClient(
                    self.config.url,
                    self.config.username,
                    self.config.api_token,
                    self.config.project_key,
                )
                logger.info("JIRA integration enabled")
            except Exception as e:
                logger.error("Failed to initialize JIRA client: %s", e)
        else:
            logger.info("JIRA integration disabled: Invalid configuration")

    def is_enabled(self) -> bool:
        """Check if JIRA integration is enabled."""
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
        in_verification_section = False
        verification_items = []

        for line in lines:
            if not line:
                continue

            section_change = self._check_section_change(line)
            if section_change:
                in_steps_section = section_change == "steps"
                in_verification_section = section_change == "verification"
                continue

            if self._should_skip_line(line):
                continue

            if in_steps_section:
                current_step, steps = self._process_step_line(line, current_step, steps)
            elif in_verification_section:
                verification_items = self._process_verification_line(
                    line, verification_items
                )

        return self._finalize_steps(steps, current_step, verification_items)

    def _check_section_change(self, line: str) -> str | None:
        """Check if line indicates a section change."""
        if line.lower().startswith("steps:"):
            return "steps"
        if line.lower().startswith("verification:"):
            return "verification"
        return None

    def _should_skip_line(self, line: str) -> bool:
        """Check if line should be skipped during parsing."""
        return line.startswith(("Test:", "Description:"))

    def _process_step_line(
        self,
        line: str,
        current_step: str | None,
        steps: list[TestStep],
    ) -> tuple[str | None, list[TestStep]]:
        """Process a line in the steps section."""
        step_match = re.match(r"^(\d+)\.\s*(.+)", line)
        if step_match:
            # Save previous step if exists
            if current_step:
                steps.append(
                    TestStep(
                        step=current_step,
                        expected_result="Step completes successfully",
                    )
                )
            return step_match.group(2), steps
        if line and current_step:
            # Continuation of current step
            return f"{current_step} {line}", steps
        return current_step, steps

    def _process_verification_line(
        self, line: str, verification_items: list[str]
    ) -> list[str]:
        """Process a line in the verification section."""
        if line.startswith("-"):
            verification_items.append(line[1:].strip())
        return verification_items

    def _finalize_steps(
        self,
        steps: list[TestStep],
        current_step: str | None,
        verification_items: list[str],
    ) -> list[TestStep]:
        """Finalize the parsed steps."""
        # Add final step if exists
        if current_step:
            expected_result = (
                "; ".join(verification_items)
                if verification_items
                else "Step completes successfully"
            )
            steps.append(TestStep(step=current_step, expected_result=expected_result))

        # If we have verification items but no explicit steps, create verification steps
        if verification_items and not steps:
            steps.extend(
                TestStep(step="Verify system behavior", expected_result=item)
                for item in verification_items
            )

        return steps

    def extract_test_info(self, test_name: str, test_docstring: str) -> ZephyrTestCase:
        """
        Extract test information to create JIRA test case.

        Args:
            test_name: Name of the test function
            test_docstring: Test function docstring

        Returns:
            ZephyrTestCase object
        """
        # Clean test name for summary
        summary = test_name.replace("test_", "").replace("_", " ").title()

        # Extract description from docstring
        description = ""
        if test_docstring:
            docstring_lines = test_docstring.strip().split("\n")
            for _, original_line in enumerate(docstring_lines):
                line = original_line.strip()
                if line.startswith("Test:"):
                    description = line[5:].strip()
                    break
                if line and not line.lower().startswith(("steps:", "verification:")):
                    description = line
                    break

        if not description:
            description = f"Automated test: {summary}"

        # Parse test steps
        test_steps = self.parse_test_steps_from_docstring(test_docstring)

        # If no steps found, create a generic one
        if not test_steps:
            test_steps = [
                TestStep(
                    step="Execute automated test",
                    expected_result="Test passes without errors",
                )
            ]

        return ZephyrTestCase(
            summary=summary,
            description=description,
            test_steps=test_steps,
            project_key=self.config.project_key,
            labels=["automation", "pytest"],
        )

    def take_screenshot(
        self, page: Page, test_name: str, step_name: str = ""
    ) -> str | None:
        """Take screenshot with better error handling and cleanup."""
        if not page:
            return None

        try:
            # Clean test name for filename
            safe_test_name = "".join(c for c in test_name if c.isalnum() or c in "._-")
            safe_step_name = (
                "".join(c for c in step_name if c.isalnum() or c in "._-")
                if step_name
                else ""
            )

            timestamp = datetime.now(tz=UTC).strftime("%Y%m%d_%H%M%S")
            step_suffix = f"_{safe_step_name}" if safe_step_name else ""
            filename = f"{safe_test_name}{step_suffix}_{timestamp}.png"
            filepath = self.config.screenshots_dir / filename

            page.screenshot(path=str(filepath), full_page=True)

            # Verify file was created and has reasonable size
            if filepath.exists() and filepath.stat().st_size > 0:
                logger.debug("Screenshot saved: %s", filepath)
                return str(filepath)
            logger.warning("Screenshot file is empty or missing: %s", filepath)
            return None

        except Exception as e:
            logger.warning("Error taking screenshot: %s", e)
            return None

    @retry_on_failure(max_retries=3)
    def create_or_update_test_case(
        self, test_name: str, test_docstring: str
    ) -> str | None:
        """Create or find existing test case in JIRA with retry logic."""
        if not self.is_enabled() or self.client is None:
            return None

        test_case = self.extract_test_info(test_name, test_docstring)

        # First, try to find existing test case
        existing_key = self.client.find_test_case_by_summary(test_case.summary)
        if existing_key:
            logger.debug("Found existing test case: %s", existing_key)
            return existing_key

        # Create new test case
        logger.info("Creating new test case: %s", test_case.summary)
        issue_key = self.client.create_test_case(test_case)
        if issue_key:
            logger.info("Created test case: %s", issue_key)
            return issue_key

        raise ValueError("Failed to create test case")

    def report_test_result(
        self,
        test_case_key: str,
        result: TestResult,
        error_message: str | None = None,
        screenshots: list[str] | None = None,
    ) -> None:
        """
        Report test execution result to JIRA.

        Args:
            test_case_key: JIRA test case key
            result: Test execution result
            test_name: Name of the test
            error_message: Error message if test failed
            screenshots: List of screenshot file paths
        """
        if not self.is_enabled() or not test_case_key or self.client is None:
            return

        try:
            execution = JiraTestExecution(
                test_case_key=test_case_key,
                execution_status=result,
                executed_by=os.getenv("USER", "automation"),
                execution_date=datetime.now(tz=UTC),
                comment=error_message if error_message else None,
            )

            # Update test execution
            execution_id = self.client.update_test_execution(execution)
            if execution_id:
                logger.info("Updated test execution for %s", test_case_key)

            # Attach screenshots
            if screenshots:
                for screenshot_path in screenshots:
                    screenshot_file = Path(screenshot_path)
                    if screenshot_file.exists():
                        if self.client.attach_file(test_case_key, screenshot_path):
                            logger.info("Attached screenshot: %s", screenshot_path)
                        else:
                            logger.warning(
                                "Failed to attach screenshot: %s", screenshot_path
                            )

        except (ValueError, TypeError) as e:
            logger.warning("Error reporting test result: %s", e)

    def pytest_result_to_jira_result(self, pytest_outcome: str) -> TestResult:
        """Convert pytest outcome to JIRA test result."""
        mapping = {
            "passed": TestResult.PASS,
            "failed": TestResult.FAIL,
            "skipped": TestResult.SKIPPED,
            "error": TestResult.BLOCKED,
        }
        return mapping.get(pytest_outcome.lower(), TestResult.BLOCKED)

    def _generate_test_summary(self, test_name: str) -> str:
        """Generate a more readable test summary from test name."""
        # Remove common prefixes
        name = test_name
        for prefix in ["test_", "Test"]:
            name = name.removeprefix(prefix)

        # Split on underscores and convert to title case
        words = name.split("_")
        # Handle common abbreviations
        abbreviations = {"ui": "UI", "api": "API", "url": "URL", "http": "HTTP"}

        processed_words = []
        for word in words:
            if word.lower() in abbreviations:
                processed_words.append(abbreviations[word.lower()])
            else:
                processed_words.append(word.capitalize())

        return " ".join(processed_words)
