"""
Pytest fixtures for JIRA integration.
"""

import pytest
from playwright.sync_api import Page
from typing import Generator, Optional, Callable
import traceback

from .jira_reporter import JiraTestReporter
from .config import JiraConfig


class JiraTestTracker:
    """Tracker for JIRA test case integration."""
    def __init__(self, test_case_key: str, screenshots: list[str], jira_reporter: JiraTestReporter) -> None:
        self.test_case_key = test_case_key
        self.screenshots = screenshots
        self.jira_reporter = jira_reporter

    def take_screenshot(self, step_name: str = "") -> Optional[str]:
        """Take a screenshot and add to the list for JIRA attachment."""
        return None


@pytest.fixture(scope="session")
def jira_config() -> JiraConfig:
    """Session-scoped JIRA configuration fixture."""
    return JiraConfig.from_env()


@pytest.fixture(scope="session")
def jira_reporter(jira_config: JiraConfig) -> JiraTestReporter:
    """Session-scoped JIRA reporter fixture."""
    return JiraTestReporter(jira_config)


# Add pytest hook to capture test results properly
def pytest_runtest_makereport(item, call):
    """Pytest hook to capture test results."""
    if call.when == "call":
        setattr(item, "rep_call", call)


@pytest.fixture
def jira_test_tracker(
    request: pytest.FixtureRequest,
    jira_reporter: JiraTestReporter,
    page: Page,
) -> Generator[Optional[JiraTestTracker], None, None]:
    """
    Fixture to track test execution and integrate with JIRA.

    This fixture:
    1. Creates/finds the test case in JIRA before test execution
    2. Takes screenshots during test execution
    3. Reports results to JIRA after test execution
    """
    if not jira_reporter.is_enabled():
        yield None
        return

    test_name = request.node.name
    test_docstring = request.node.function.__doc__ if request.node.function else None

    # Create or find test case in JIRA
    test_case_key = None
    try:
        test_case_key = jira_reporter.create_or_update_test_case(test_name, test_docstring or "")
    except Exception as e:
        pytest.warnings.warn(f"Failed to create/update JIRA test case: {e}")

    screenshots = []

    class ActualJiraTestTracker(JiraTestTracker):
        def take_screenshot(self, step_name: str = "") -> Optional[str]:
            """Take a screenshot and add to the list for JIRA attachment."""
            try:
                if page:
                    screenshot_path = self.jira_reporter.take_screenshot(
                        page, test_name, step_name
                    )
                    if screenshot_path:
                        self.screenshots.append(screenshot_path)
                        return screenshot_path
            except Exception as e:
                pytest.warnings.warn(f"Failed to take screenshot: {e}")
            return None

    tracker = ActualJiraTestTracker(test_case_key or "", screenshots, jira_reporter) if test_case_key else None

    yield tracker

    # After test execution - report results to JIRA
    if test_case_key and tracker:
        try:
            # Get test result with better error handling
            outcome = "passed"
            error_message = None
            
            if hasattr(request.node, "rep_call"):
                outcome = request.node.rep_call.outcome
                if hasattr(request.node.rep_call, "longrepr") and request.node.rep_call.longrepr:
                    error_message = str(request.node.rep_call.longrepr)

            jira_result = jira_reporter.pytest_result_to_jira_result(outcome)
            jira_reporter.report_test_result(
                test_case_key=test_case_key,
                result=jira_result,
                error_message=error_message,
                screenshots=screenshots,
            )
        except Exception as e:
            pytest.warnings.warn(f"Failed to report test result to JIRA: {e}")


@pytest.fixture
def jira_screenshot(jira_test_tracker: Optional[JiraTestTracker]) -> Callable[[str], Optional[str]]:
    """
    Convenience fixture for taking screenshots that are automatically attached to JIRA.
    
    Returns:
        A callable that takes an optional step name and returns the screenshot path
    """
    def take_screenshot(step_name: str = "") -> Optional[str]:
        """Take a screenshot with optional step name."""
        if jira_test_tracker:
            return jira_test_tracker.take_screenshot(step_name)
        return None
    
    return take_screenshot
