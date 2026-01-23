"""
Pytest fixtures for JIRA integration.
"""

import pytest
from playwright.sync_api import Page

from .jira_reporter import JiraTestReporter


@pytest.fixture(scope="session")
def jira_reporter() -> JiraTestReporter:
    """Session-scoped JIRA reporter fixture."""
    return JiraTestReporter()


@pytest.fixture
def jira_test_tracker(
    request: pytest.FixtureRequest,
    jira_reporter: JiraTestReporter,
    page: Page,
) -> dict[str, str] | None:
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
    test_case_key = jira_reporter.create_or_update_test_case(test_name, test_docstring)

    # Container for screenshots taken during test
    screenshots = []

    class JiraTestTracker:
        def __init__(self) -> None:
            self.test_case_key = test_case_key
            self.screenshots = screenshots
            self.jira_reporter = jira_reporter

        def take_screenshot(self, step_name: str = "") -> str | None:
            """Take a screenshot and add to the list for JIRA attachment."""
            if page:
                screenshot_path = jira_reporter.take_screenshot(
                    page, test_name, step_name
                )
                if screenshot_path:
                    self.screenshots.append(screenshot_path)
                    return screenshot_path
            return None

    tracker = JiraTestTracker()

    yield tracker

    # After test execution - report results to JIRA
    if test_case_key:
        # Get test result from pytest
        if hasattr(request.node, "rep_call"):
            outcome = request.node.rep_call.outcome
            error_message = (
                str(request.node.rep_call.longrepr)
                if request.node.rep_call.failed
                else None
            )
        else:
            # Fallback - test is still running
            outcome = "passed"
            error_message = None

        jira_result = jira_reporter.pytest_result_to_jira_result(outcome)
        jira_reporter.report_test_result(
            test_case_key=test_case_key,
            result=jira_result,
            test_name=test_name,
            error_message=error_message,
            screenshots=screenshots,
        )
