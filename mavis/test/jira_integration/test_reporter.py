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


class TestReporter:
    """Handles test reporting integration with JIRA."""

    def __init__(self, config: JiraConfig | None = None) -> None:
        """Initialize test reporter with JIRA configuration."""
        self.config = config or JiraConfig.from_env()
        self.client = None
        self.jira_reporter = None
        self.current_test_cycle_key = None

        # Create screenshots directory
        self.config.screenshots_dir.mkdir(exist_ok=True)

        # Only initialize if configuration is valid and enabled
        if not self.config.is_valid():
            if not self.config.enabled:
                logger.info(
                    "Integration explicitly disabled via JIRA_INTEGRATION_ENABLED=false"
                )
            else:
                logger.debug(
                    "Integration disabled: Invalid configuration - missing required fields"
                )
            return

        if not any(
            [
                os.getenv("JIRA_URL"),
                os.getenv("JIRA_API_TOKEN"),
            ]
        ):
            logger.debug(
                "Integration disabled: No JIRA environment variables configured"
            )
            return

        # Check if we should use JIRA integration
        if self.config.use_jira_integration():
            logger.info("Using JIRA integration")
            try:
                # Avoid circular dependency
                from .jira_reporter import JiraTestReporter  # noqa: PLC0415

                self.jira_reporter = JiraTestReporter(self.config)
                logger.info("JIRA integration enabled")
                return
            except (RuntimeError, ImportError, AttributeError) as e:
                logger.info("Failed to initialize JIRA client: %s", e)
                self.client = None

    def is_enabled(self) -> bool:
        """Check if integration is enabled."""
        return self.jira_reporter is not None or self.client is not None

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
        self,
        line: str,
        current_step: TestStep | None,
        steps: list[TestStep],
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
        Get existing test case or create a new one.

        Args:
            test_name: Name of the test
            docstring: Test docstring containing steps

        Returns:
            Test case key if successful, None otherwise
        """
        # Use JIRA reporter if available
        if self.jira_reporter:
            return self.jira_reporter.get_or_create_test_case(test_name, docstring)

        # Legacy fallback (deprecated)
        if not self.client:
            logger.warning("No integration client initialized")
            return None

        # First, try to use a Jira issue key if provided
        issue_key = self._extract_issue_key(test_name) or self._extract_issue_key(
            docstring
        )
        if issue_key and self.client.issue_exists(issue_key):
            logger.info("Using existing test case by key: %s", issue_key)
            return issue_key

        # Next, try to find existing test case
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
            test_steps=None,
            precondition=base_description,
            labels=["Automated"],
        )

        try:
            test_case_key = self.client.create_test_case(test_case)
            if test_case_key:
                logger.info("Created new test case: %s", test_case_key)
            else:
                logger.warning("Failed to create test case")
            return test_case_key
        except RuntimeError:
            logger.exception("Failed to create test case")
            return None

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

    def pytest_result_to_jira_result(self, pytest_outcome: str) -> TestResult:
        """
        Convert pytest result to JIRA test execution result.

        Args:
            pytest_outcome: pytest test outcome

        Returns:
            TestResult enum value
        """
        mapping = {
            "passed": TestResult.PASS,
            "failed": TestResult.FAIL,
            "skipped": TestResult.NOT_EXECUTED,
            "blocked": TestResult.BLOCKED,
        }
        return mapping.get(pytest_outcome.lower(), TestResult.FAIL)

    def take_screenshot(
        self, page: Page, test_name: str, suffix: str = ""
    ) -> str | None:
        """
        Take a screenshot and save it with timeout protection.

        Args:
            page: Playwright page object
            test_name: Name of the test
            suffix: Optional suffix for screenshot filename

        Returns:
            Screenshot file path if successful, None otherwise
        """
        try:
            # Check if page is still available with timeout
            try:
                page.wait_for_load_state(
                    "domcontentloaded", timeout=1000
                )  # 1 second timeout
            except (TimeoutError, RuntimeError):
                logger.info("Page not responsive for screenshot, skipping")
                return None

            timestamp = datetime.now(tz=UTC).strftime("%Y%m%d_%H%M%S")
            filename = (
                f"{test_name}_{suffix}_{timestamp}.png"
                if suffix
                else f"{test_name}_{timestamp}.png"
            )
            screenshot_path = self.config.screenshots_dir / filename

            # Take screenshot with timeout
            page.screenshot(
                path=str(screenshot_path), full_page=True, timeout=3000
            )  # 3 second timeout
            logger.info("Screenshot saved: %s", screenshot_path)
            return str(screenshot_path)

        except (RuntimeError, OSError, TimeoutError) as e:
            logger.warning("Failed to take screenshot for %s: %s", test_name, e)
            return None

    # Backward compatibility methods
    def create_or_update_test_case(
        self, test_name: str, docstring: str = ""
    ) -> str | None:
        """Backward compatibility alias for get_or_create_test_case."""
        return self.get_or_create_test_case(test_name, docstring)
