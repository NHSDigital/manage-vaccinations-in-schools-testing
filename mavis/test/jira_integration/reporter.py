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

from .client import JiraClient
from .config import JiraConfig
from .models import JiraTestCase, TestResult, TestStep

logger = logging.getLogger(__name__)

T = TypeVar("T")


# ===== Execution ID State Management =====

_execution_ids: dict[str, str] = {}
_execution_types: dict[str, str] = {}


def get_execution_id(test_case_key: str) -> str | None:
    return _execution_ids.get(test_case_key)


def set_execution_id(
    test_case_key: str, execution_id: str, execution_type: str = "fallback"
) -> None:
    _execution_ids[test_case_key] = execution_id
    _execution_types[test_case_key] = execution_type


def get_execution_type(test_case_key: str) -> str:
    return _execution_types.get(test_case_key, "fallback")


# ===== Exception and Retry Logic =====


class FunctionFailedWithoutError(RuntimeError):
    """Exception raised when a function fails without raising an exception."""

    def __init__(self) -> None:
        super().__init__("Function failed without raising an exception")


def retry_on_failure(
    max_retries: int = 3, delay: float = 1.0
) -> Callable[[Callable[..., T]], Callable[..., T]]:
    """Decorator to retry operations on failure."""

    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        def wrapper(*args: object, **kwargs: object) -> T:
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
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
                        raise
            raise FunctionFailedWithoutError

        return wrapper

    return decorator


def extract_issue_keys_from_item(item: object) -> list[str]:
    """
    Extract issue keys from pytest item's allure-pytest markers.

    Args:
        item: Pytest test item

    Returns:
        List of issue keys found in @issue decorators
    """
    issue_keys = []
    if not hasattr(item, "own_markers"):
        logger.debug("Item has no own_markers attribute")
        return issue_keys

    for marker in item.own_markers:
        # Allure-pytest's @issue decorator creates 'allure_link' markers with link_type='issue'
        if marker.name == "allure_link" and marker.kwargs.get("link_type") == "issue":
            # The issue key is in kwargs['name']
            issue_key = marker.kwargs.get("name")
            if issue_key:
                # Extract just the key if it's a URL (from args)
                if marker.args and "/" in marker.args[0]:
                    issue_key = marker.args[0].rstrip("/").split("/")[-1]
                # Validate it looks like a Jira issue key
                if re.match(r"^[A-Z]+-\d+$", issue_key):
                    issue_keys.append(issue_key)
                    logger.debug("Found issue key %s on test item", issue_key)

    return issue_keys


class JiraTestReporter:
    """Handles Jira test reporting integration."""

    def __init__(self, config: JiraConfig | None = None) -> None:
        """Initialize Jira reporter with configuration."""
        self.config = config or JiraConfig.from_env()
        self.client = None
        self.current_test_plan_key = None
        self.config.screenshots_dir.mkdir(exist_ok=True)

        if not self.config.is_valid():
            logger.info(
                "Jira integration explicitly disabled JIRA_INTEGRATION_ENABLED=false"
                if not self.config.enabled
                else "Jira integration disabled:"
                "Invalid configuration - missing required fields"
            )
            return

        try:
            self.client = JiraClient(
                self.config.jira_reporting_url.removesuffix("/rest/api/2/")
                if self.config.jira_reporting_url
                else "",
                self.config.jira_api_token or "",
                self.config.project_key,
                zephyr_project_id=self.config.zephyr_project_id,
            )
            self._initialize_test_plan()
        except RuntimeError as e:
            logger.info("Failed to initialize Jira client: %s", e)
            self.client = None

    def _initialize_test_plan(self) -> None:
        """Initialize test plan for current test session."""
        if not self.client:
            return
        plan_name = (
            "Automated Test Plan - "
            f"{datetime.now(tz=UTC).strftime('%Y-%m-%d %H:%M:%S')}"
        )
        try:
            self.current_test_plan_key = self.client.create_test_plan(
                plan_name, "Automated test execution plan created by pytest integration"
            )
            if not self.current_test_plan_key:
                logger.warning("Failed to create test plan - continuing without plan")
            else:
                logger.info(
                    "Created test plan with key: %s", self.current_test_plan_key
                )
        except RuntimeError as e:
            logger.warning(
                "Failed to initialize test plan: %s - continuing without plan", e
            )

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
        steps, current_step, in_steps_section, verification_section = (
            [],
            None,
            False,
            False,
        )
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
            return TestStep(
                description=re.sub(r"^\d+\.\s*", "", line), expected_result=""
            ), steps
        if current_step and line:
            current_step.description += f" {line}"
        return current_step, steps

    def _format_test_steps_as_description(
        self, description: str, test_steps: list[TestStep]
    ) -> str:
        """Format test steps as text to include in the description field."""
        if not test_steps:
            return description
        parts = [description, "\n\n"] if description else []
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
        """Get existing test case or create a new one in Jira."""
        if not self.is_enabled() or not self.client:
            logger.debug("Jira integration disabled or client not initialized")
            return None

        if (
            issue_key := self._extract_issue_key(test_name)
            or self._extract_issue_key(docstring)
        ) and self.client.issue_exists(issue_key):
            logger.info("Using existing test case by key: %s", issue_key)
            return issue_key

        if test_case_key := self.client.find_test_case_by_name(test_name):
            logger.info("Found existing test case: %s", test_case_key)
            return test_case_key

        test_steps = self.parse_test_steps_from_docstring(docstring)
        base_description = self._extract_description_from_docstring(docstring)
        test_case = JiraTestCase(
            name=test_name,
            description=self._format_test_steps_as_description(
                base_description, test_steps
            ),
            test_steps=(test_steps if base_description else None),
            objective=base_description,
            labels=["Automated"],
        )

        try:
            if not (test_case_key := self.client.create_test_case(test_case)):
                logger.warning("Failed to create test case")
                return None
            logger.info("Created new test case: %s", test_case_key)
            return test_case_key
        except RuntimeError:
            logger.exception("Failed to create test case")
            return None

    def _extract_description_from_docstring(self, docstring: str) -> str:
        """Extract description from docstring."""
        if not docstring:
            return ""
        description_lines = []
        for line in (
            original_line.strip() for original_line in docstring.strip().split("\n")
        ):
            if line.lower().startswith(("test:", "steps:", "verification:")):
                break
            if line and not line.startswith(("Args:", "Returns:")):
                description_lines.append(line)
        return " ".join(description_lines)

    def pytest_result_to_jira_result(self, pytest_outcome: str) -> TestResult:
        """Convert pytest result to Jira result."""
        return {
            "passed": TestResult.PASS,
            "failed": TestResult.FAIL,
            "skipped": TestResult.SKIPPED,
            "blocked": TestResult.BLOCKED,
        }.get(pytest_outcome.lower(), TestResult.FAIL)

    def report_test_result(
        self,
        test_case_key: str,
        result: TestResult,
        error_message: str | None = None,
        screenshots: list[str] | None = None,
        issue_keys: list[str] | None = None,
    ) -> None:
        """Report test execution result to Jira using Zephyr Squad API."""
        if not self.is_enabled() or not self.client:
            logger.debug("Jira integration disabled or client not initialized")
            return

        if existing_execution_id := get_execution_id(test_case_key):
            self._handle_existing_execution(
                test_case_key, existing_execution_id, result, error_message, screenshots
            )
            self._link_related_issues(test_case_key, issue_keys)
            return

        execution_id = self._create_new_execution(test_case_key, result, error_message)
        self._add_result_comment(test_case_key, execution_id, result, error_message)
        self._attach_screenshots(execution_id, result, screenshots, test_case_key)
        self._link_related_issues(test_case_key, issue_keys)
        logger.info(
            "Completed test execution %s with result: %s", execution_id, result.value
        )

    def _handle_existing_execution(
        self,
        test_case_key: str,
        execution_id: str,
        result: TestResult,
        error_message: str | None,
        screenshots: list[str] | None,
    ) -> None:
        """Handle updating an existing test execution."""
        logger.info(
            "Execution %s already exists for %s, updating status",
            execution_id,
            test_case_key,
        )
        self._update_zephyr_execution(execution_id, result, error_message)
        self._add_result_comment(test_case_key, execution_id, result, error_message)
        self._attach_screenshots(execution_id, result, screenshots, test_case_key)

    def _update_zephyr_execution(
        self, execution_id: str, result: TestResult, error_message: str | None
    ) -> None:
        """Update Zephyr execution status."""
        if not self.client:
            logger.warning("Jira client not initialized for Zephyr execution update")
            return
        if self.client.update_zephyr_execution_status(
            execution_id, result, comment=error_message
        ):
            logger.info("Updated execution %s status to %s", execution_id, result.value)
        else:
            logger.warning("Failed to update execution %s status", execution_id)

    def _create_new_execution(
        self, test_case_key: str, result: TestResult, error_message: str | None
    ) -> str:
        """Create a new test execution and return the execution ID."""
        if execution_id := self._create_zephyr_execution(
            test_case_key, result, error_message
        ):
            return execution_id
        logger.warning(
            "Failed to create Zephyr execution for %s, using test case as fallback",
            test_case_key,
        )
        return self._create_fallback_execution(test_case_key)

    def _create_zephyr_execution(
        self, test_case_key: str, result: TestResult, error_message: str | None
    ) -> str | None:
        """Create Zephyr test execution."""
        logger.info("Attempting Zephyr execution creation for %s", test_case_key)
        if not self.client:
            logger.warning("Jira client not initialized for Zephyr execution creation")
            return None

        if not (cycle_id_version := self._resolve_cycle_and_version())[0]:
            return None
        cycle_id, version_id = cycle_id_version

        if execution_id := self.client.add_test_to_cycle(
            test_case_key=test_case_key, cycle_id=int(cycle_id), version_id=version_id
        ):
            set_execution_id(test_case_key, execution_id, "zephyr")
            logger.info("Created execution %s for test %s", execution_id, test_case_key)
            self._update_zephyr_execution(execution_id, result, error_message)
            return execution_id
        logger.warning("Failed to add test %s to cycle %s", test_case_key, cycle_id)
        return None

    def _resolve_cycle_and_version(self) -> tuple[str | None, int]:
        """Resolve cycle ID and version ID from configuration."""
        version_id = -1
        if not self.config.test_cycle_key:
            logger.info("No test cycle configured")
            return None, version_id
        if not self.client:
            logger.warning("Jira client not initialized")
            return None, version_id

        if self.config.test_cycle_version and (
            resolved_version_id := self.client.get_version_id_by_name(
                self.config.test_cycle_version
            )
        ):
            version_id = resolved_version_id
            logger.info("Resolved version ID %s", version_id)

        if cycle_id := self.client.get_zephyr_cycle_id(
            self.config.test_cycle_key, version_id
        ):
            logger.info("Resolved cycle ID %s", cycle_id)
        else:
            logger.warning(
                "Could not resolve cycle ID for %s", self.config.test_cycle_key
            )
        return str(cycle_id) if cycle_id is not None else None, version_id

    def _create_fallback_execution(self, test_case_key: str) -> str:
        """Create fallback execution using test case key."""
        logger.info("Using test case as execution: %s", test_case_key)
        set_execution_id(test_case_key, test_case_key, "fallback")
        return test_case_key

    def _add_result_comment(
        self,
        test_case_key: str,
        execution_id: str,
        result: TestResult,
        error_message: str | None,
    ) -> None:
        """Add a result comment to the test case."""
        result_comment = (
            f"*Automated Test Execution {execution_id}*\n\nResult: *{result.value}*\n"
            f"Timestamp: {datetime.now(UTC).strftime('%Y-%m-%d %H:%M:%S')} UTC\n"
        )
        if error_message:
            result_comment += f"\nError details:\n{{code}}\n{error_message}\n{{code}}"

        if not self.client:
            logger.warning("Jira client not initialized")
            return

        if self.client.add_comment(test_case_key, result_comment):
            logger.info(
                "Added result comment to test case %s: %s", test_case_key, result.value
            )
        else:
            logger.warning(
                "Could not add comment to test case %s for execution %s",
                test_case_key,
                execution_id,
            )

    def _attach_screenshots(
        self,
        execution_id: str,
        result: TestResult,
        screenshots: list[str] | None,
        test_case_key: str | None = None,
    ) -> None:
        """Attach screenshots to the execution and/or test case issue."""
        screenshots_to_attach = (
            screenshots
            if result != TestResult.PASS or self.config.screenshot_all_steps
            else []
        )
        if not screenshots_to_attach:
            logger.info("No screenshots to attach for execution %s", execution_id)
            return

        if not self.client:
            logger.warning("Jira client not initialized for attachments")
            return

        logger.info(
            "Attaching %d screenshots to execution %s",
            len(screenshots_to_attach),
            execution_id,
        )
        execution_type = (
            get_execution_type(test_case_key) if test_case_key else "fallback"
        )
        attached = False

        if execution_type == "zephyr":
            try:
                self.client.attach_zephyr_execution_files(
                    execution_id, screenshots_to_attach
                )
                logger.info(
                    "Successfully attached screenshots to Zephyr execution %s",
                    execution_id,
                )
                attached = True
            except (RuntimeError, ConnectionError, TimeoutError) as e:
                logger.warning("Failed to attach to Zephyr execution: %s", e)

        if not attached and test_case_key:
            try:
                self.client.attach_files_to_issue(test_case_key, screenshots_to_attach)
                logger.info(
                    "Successfully attached screenshots to test case %s", test_case_key
                )
            except Exception:
                logger.exception("Failed to attach to test case %s", test_case_key)

    def _link_related_issues(
        self, test_case_key: str, issue_keys: list[str] | None
    ) -> None:
        """Link related issues from @issue decorators to the test case."""
        if not issue_keys or not self.client:
            return

        logger.info(
            "Linking %d related issue(s) to test case %s",
            len(issue_keys),
            test_case_key,
        )

        for issue_key in issue_keys:
            # Skip if trying to link to itself
            if issue_key == test_case_key:
                logger.debug("Skipping self-link for %s", issue_key)
                continue

            # Verify the issue exists before trying to link
            if not self.client.issue_exists(issue_key):
                logger.warning(
                    "Issue %s does not exist, skipping link to %s",
                    issue_key,
                    test_case_key,
                )
                continue

            # Create the link with the test case as the outward issue (tests)
            # and the related issue as the inward issue (is tested by)
            if self.client.link_issues(
                inward_issue=issue_key,
                outward_issue=test_case_key,
                link_type="Relates",
            ):
                logger.info(
                    "Successfully linked test case %s to issue %s",
                    test_case_key,
                    issue_key,
                )
            else:
                logger.warning(
                    "Failed to link test case %s to issue %s",
                    test_case_key,
                    issue_key,
                )


class TestReporter:
    """Handles test reporting integration with JIRA."""

    __test__ = False

    def __init__(self, config: JiraConfig | None = None) -> None:
        """Initialize test reporter with JIRA configuration."""
        self.config = config or JiraConfig.from_env()
        self.client = None
        self.jira_reporter = None
        self.current_test_cycle_key = None
        self.config.screenshots_dir.mkdir(exist_ok=True)

        if not self.config.is_valid():
            logger.info(
                "Integration explicitly disabled via JIRA_INTEGRATION_ENABLED=false"
                if not self.config.enabled
                else "Integration disabled:"
                "Invalid configuration - missing required fields"
            )
            return
        if not any([os.getenv("JIRA_REPORTING_URL"), os.getenv("JIRA_API_TOKEN")]):
            logger.debug(
                "Integration disabled: No JIRA environment variables configured"
            )
            return

        if self.config.use_jira_integration():
            logger.info("Using JIRA integration")
            try:
                self.jira_reporter = JiraTestReporter(self.config)
                logger.info("JIRA integration enabled")
            except (RuntimeError, ImportError, AttributeError) as e:
                logger.info("Failed to initialize JIRA client: %s", e)
                self.client = None

    def is_enabled(self) -> bool:
        return self.jira_reporter is not None or self.client is not None

    def parse_test_steps_from_docstring(self, docstring: str) -> list[TestStep]:
        """Parse test steps from pytest docstring."""
        if not docstring:
            return []
        if self.jira_reporter:
            return self.jira_reporter.parse_test_steps_from_docstring(docstring)
        return self._process_docstring_lines(
            [line.strip() for line in docstring.strip().split("\n")]
        )

    def _process_docstring_lines(self, lines: list[str]) -> list[TestStep]:
        """Process docstring lines to extract test steps."""
        steps, current_step, in_steps_section, verification_section = (
            [],
            None,
            False,
            False,
        )
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
            return TestStep(
                description=re.sub(r"^\d+\.\s*", "", line), expected_result=""
            ), steps
        if current_step and line:
            current_step.description += f" {line}"
        return current_step, steps

    def _extract_issue_key(self, text: str) -> str | None:
        if not text:
            return None
        return (
            match.group(0)
            if (
                match := re.compile(
                    rf"\b{re.escape(self.config.project_key)}-\d+\b"
                ).search(text)
            )
            else None
        )

    @retry_on_failure(max_retries=3, delay=1.0)
    def get_or_create_test_case(
        self, test_name: str, docstring: str = ""
    ) -> str | None:
        """Get existing test case or create a new one."""
        if self.jira_reporter:
            return self.jira_reporter.get_or_create_test_case(test_name, docstring)
        if not self.client:
            logger.warning("No integration client initialized")
            return None

        if (
            issue_key := self._extract_issue_key(test_name)
            or self._extract_issue_key(docstring)
        ) and self.client.issue_exists(issue_key):
            logger.info("Using existing test case by key: %s", issue_key)
            return issue_key
        if test_case_key := self.client.find_test_case_by_name(test_name):
            logger.info("Found existing test case: %s", test_case_key)
            return test_case_key

        test_steps = self.parse_test_steps_from_docstring(docstring)
        base_description = self._extract_description_from_docstring(docstring)
        test_case = JiraTestCase(
            name=test_name,
            description=self._format_test_steps_as_description(
                base_description, test_steps
            ),
            test_steps=None,
            precondition=base_description,
            labels=["Automated"],
        )
        try:
            if test_case_key := self.client.create_test_case(test_case):
                logger.info("Created new test case: %s", test_case_key)
            else:
                logger.warning("Failed to create test case")
            return test_case_key
        except RuntimeError:
            logger.exception("Failed to create test case")
            return None

    def _extract_description_from_docstring(self, docstring: str) -> str:
        if not docstring:
            return ""
        description_lines = []
        for line in (
            original_line.strip() for original_line in docstring.strip().split("\n")
        ):
            if line.lower().startswith(("test:", "steps:", "verification:")):
                break
            if line and not line.startswith(("Args:", "Returns:")):
                description_lines.append(line)
        return " ".join(description_lines)

    def _format_test_steps_as_description(
        self, description: str, test_steps: list[TestStep]
    ) -> str:
        if not test_steps:
            return description
        parts = [description, "\n\n"] if description else []
        parts.append("h3. Test Steps\n\n")
        for i, step in enumerate(test_steps, 1):
            parts.append(f"{i}. {step.description}\n")
            if step.expected_result:
                parts.append(f"   *Expected:* {step.expected_result}\n")
            parts.append("\n")
        return "".join(parts)

    def pytest_result_to_jira_result(self, pytest_outcome: str) -> TestResult:
        return {
            "passed": TestResult.PASS,
            "failed": TestResult.FAIL,
            "skipped": TestResult.NOT_EXECUTED,
            "blocked": TestResult.BLOCKED,
        }.get(pytest_outcome.lower(), TestResult.FAIL)

    def take_screenshot(
        self, page: Page, test_name: str, suffix: str = ""
    ) -> str | None:
        """Take a screenshot and save it with timeout protection."""
        try:
            try:
                page.wait_for_load_state("domcontentloaded", timeout=1000)
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
            page.screenshot(path=str(screenshot_path), full_page=True, timeout=3000)
            logger.info("Screenshot saved: %s", screenshot_path)
            return str(screenshot_path)
        except (RuntimeError, OSError, TimeoutError) as e:
            logger.warning("Failed to take screenshot for %s: %s", test_name, e)
            return None

    def create_or_update_test_case(
        self, test_name: str, docstring: str = ""
    ) -> str | None:
        return self.get_or_create_test_case(test_name, docstring)
