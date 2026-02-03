"""
Pytest hooks for Jira integration.
"""

import logging
import os

import pytest
from _pytest.config import Config
from _pytest.reports import TestReport

from .auto_fixtures import (
    cleanup_test_data,
    get_test_case_key,
    get_test_screenshots,
    mark_reported,
    was_reported,
)
from .jira_reporter import JiraTestReporter

logger = logging.getLogger(__name__)

# Global Jira reporter instance
_jira_reporter = None


def pytest_configure(config: Config) -> None:  # noqa: ARG001
    """Configure Jira reporter at the start of test session."""
    global _jira_reporter  # noqa: PLW0603  # pylint: disable=global-statement

    # Check if JIRA integration is explicitly disabled
    jira_enabled = os.getenv("JIRA_INTEGRATION_ENABLED", "true").lower() == "true"
    if not jira_enabled:
        logger.debug("Jira integration disabled via JIRA_INTEGRATION_ENABLED=false")
        _jira_reporter = None
        return

    # Only initialize if environment variables are set
    if not any(
        [
            os.getenv("JIRA_REPORTING_URL"),
            os.getenv("JIRA_API_TOKEN"),
        ]
    ):
        logger.debug("Jira integration disabled - no environment variables set")
        _jira_reporter = None
        return

    try:
        _jira_reporter = JiraTestReporter()

        if _jira_reporter.is_enabled():
            logger.info(
                "Jira integration enabled - all tests will be automatically tracked"
            )
        else:
            logger.debug("Jira integration disabled (invalid configuration)")
    except (ConnectionError, TimeoutError, ValueError, KeyError, AttributeError) as e:
        logger.warning("Failed to initialize Jira reporter: %s", e)
        _jira_reporter = None


@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item: object, call: object) -> object:  # noqa: ARG001
    """Capture test reports for Jira integration."""
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

    logger.info("Processing test report for %s", report.nodeid)

    if not _jira_reporter or not _jira_reporter.is_enabled():
        logger.info("Jira reporter not available or not enabled")
        return

    # Extract test information - use full nodeid for consistency
    test_name = report.nodeid

    # Get test case key from the auto-fixture
    test_case_key = get_test_case_key(test_name)

    # If no test case key, try to create one now
    if not test_case_key and _jira_reporter:
        try:
            logger.info("Creating test case on-demand for %s", test_name)
            # Try to get test docstring from the test item
            test_docstring = None
            if hasattr(report, "item") and hasattr(report.item, "function"):
                test_docstring = report.item.function.__doc__

            test_case_key = _jira_reporter.get_or_create_test_case(
                test_name, test_docstring or ""
            )
            logger.info(
                "Created on-demand test case %s for %s", test_case_key, test_name
            )
        except (
            ConnectionError,
            TimeoutError,
            ValueError,
            KeyError,
            AttributeError,
        ) as e:
            logger.warning(
                "Failed to create on-demand test case for %s: %s", test_name, e
            )

    if test_case_key:
        logger.info(
            "Found test case key %s for test %s - deferring to teardown",
            test_case_key,
            test_name,
        )
        # Skip immediate reporting, let pytest_runtest_teardown handle it
        # This ensures screenshots are captured first
        return


@pytest.hookimpl(trylast=True)
def pytest_runtest_teardown(item: pytest.Item) -> None:
    """Run after test teardown to report results with screenshots."""
    # Extract test information first
    test_name = item.nodeid

    # CHECK IMMEDIATELY if already reported to avoid any duplicate processing
    if was_reported(test_name, item):
        logger.info(
            "Test %s already reported at teardown entry, skipping entirely", test_name
        )
        cleanup_test_data(test_name)
        return

    if not _jira_reporter or not _jira_reporter.is_enabled():
        logger.debug("Jira reporter not available or disabled for %s", test_name)
        return

    # Get the test result from the stored report
    test_report = getattr(item, "rep_call", None)
    if not test_report:
        logger.warning("No test report found for %s", test_name)
        return

    logger.info(
        "Teardown reporting for %s with outcome %s", test_name, test_report.outcome
    )

    # Get test case key and screenshots (should be available now after teardown)
    test_case_key = get_test_case_key(test_name, item)
    screenshots = get_test_screenshots(test_name, item)

    logger.info(
        "Teardown - Test case key: %s, Screenshots: %d",
        test_case_key,
        len(screenshots) if screenshots else 0,
    )

    if test_case_key:
        if was_reported(test_name, item):
            logger.info("Test %s already reported, skipping duplicate", test_name)
            cleanup_test_data(test_name)
            return
        try:
            # Report test result with screenshots
            jira_result = _jira_reporter.pytest_result_to_jira_result(
                test_report.outcome
            )
            error_message = str(test_report.longrepr) if test_report.failed else None

            logger.info(
                "Reporting test result %s for test case %s with %d screenshots",
                jira_result.value,
                test_case_key,
                len(screenshots) if screenshots else 0,
            )

            _jira_reporter.report_test_result(
                test_case_key=test_case_key,
                result=jira_result,
                error_message=error_message,
                screenshots=screenshots,
            )
            mark_reported(test_name, item)
            logger.info("Successfully reported test %s to Jira", test_name)

        except (
            ConnectionError,
            TimeoutError,
            ValueError,
            KeyError,
            AttributeError,
        ):
            logger.exception("Failed to report test results to Jira for %s", test_name)
        finally:
            # Clean up test data
            cleanup_test_data(test_name)
    else:
        logger.warning(
            "No test case key found for %s - cannot report to Jira", test_name
        )
