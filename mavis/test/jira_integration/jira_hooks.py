"""
Pytest hooks for JIRA integration.
"""

import logging

import pytest
from _pytest.config import Config
from _pytest.reports import TestReport

from .auto_fixtures import cleanup_test_data, get_test_case_key, get_test_screenshots
from .jira_reporter import JiraTestReporter

logger = logging.getLogger(__name__)

# Global Jira reporter instance
_jira_reporter = None


def pytest_configure(config: Config) -> None:  # noqa: ARG001
    """Configure Jira reporter at the start of test session."""
    global _jira_reporter  # noqa: PLW0603  # pylint: disable=global-statement
    _jira_reporter = JiraTestReporter()

    if _jira_reporter.is_enabled():
        logger.info(
            "Jira integration enabled - all tests will be automatically tracked"
        )
    else:
        logger.debug("Jira integration disabled (missing configuration)")


@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item: object, call: object) -> object:  # noqa: ARG001
    """Capture test reports for JIRA integration."""
    outcome = yield
    rep = outcome.get_result()

    # Store reports on the test item for access in fixtures
    setattr(item, f"rep_{rep.when}", rep)


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_logreport(report: TestReport) -> object:
    """Enhanced log reporting with automatic Jira integration."""
    # Call the existing hook first
    yield

    # Only process actual test results (not setup/teardown)
    if report.when != "call":
        return

    if not _jira_reporter or not _jira_reporter.is_enabled():
        return

    # Extract test information
    test_name = (
        report.nodeid.split("::")[-1] if "::" in report.nodeid else report.nodeid
    )

    # Get test case key and screenshots from the auto-fixture
    test_case_key = get_test_case_key(test_name)
    screenshots = get_test_screenshots(test_name)

    if test_case_key:
        try:
            # Report test result with screenshots
            jira_result = _jira_reporter.pytest_result_to_jira_result(report.outcome)
            error_message = str(report.longrepr) if report.failed else None

            _jira_reporter.report_test_result(
                test_case_key=test_case_key,
                result=jira_result,
                error_message=error_message,
                screenshots=screenshots,
            )
        except (ValueError, TypeError, AttributeError) as e:
            logger.warning(
                "Failed to report test results to Jira for %s: %s", test_name, e
            )
        finally:
            # Clean up test data regardless of success/failure
            cleanup_test_data(test_name)
