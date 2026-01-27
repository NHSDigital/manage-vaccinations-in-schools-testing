"""
Pytest hooks for JIRA integration.
"""

import logging

import pytest
from _pytest.config import Config
from _pytest.reports import TestReport

from .auto_fixtures import cleanup_test_data, get_test_case_key, get_test_screenshots
from .zephyr_reporter import ZephyrTestReporter

logger = logging.getLogger(__name__)

# Global Zephyr Scale reporter instance
_zephyr_reporter = None


def pytest_configure(config: Config) -> None:  # noqa: ARG001
    """Configure Zephyr Scale reporter at the start of test session."""
    global _zephyr_reporter  # noqa: PLW0603  # pylint: disable=global-statement
    _zephyr_reporter = ZephyrTestReporter()

    if _zephyr_reporter.is_enabled():
        logger.info(
            "Zephyr Scale integration enabled - all tests will be automatically tracked"
        )
    else:
        logger.debug("Zephyr Scale integration disabled (missing configuration)")


@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item: object, call: object) -> object:  # noqa: ARG001
    """Capture test reports for JIRA integration."""
    outcome = yield
    rep = outcome.get_result()

    # Store reports on the test item for access in fixtures
    setattr(item, f"rep_{rep.when}", rep)


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_logreport(report: TestReport) -> object:
    """Enhanced log reporting with automatic Zephyr Scale integration."""
    # Call the existing hook first
    yield

    # Only process actual test results (not setup/teardown)
    if report.when != "call":
        return

    if not _zephyr_reporter or not _zephyr_reporter.is_enabled():
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
            zephyr_result = _zephyr_reporter.pytest_result_to_zephyr_result(
                report.outcome
            )
            error_message = str(report.longrepr) if report.failed else None

            _zephyr_reporter.report_test_result(
                test_case_id=test_case_key,
                result=zephyr_result,
                error_message=error_message,
                screenshots=screenshots,
            )
        except (ValueError, TypeError, AttributeError) as e:
            logger.warning(
                "Failed to report test results to Zephyr Scale for %s: %s", test_name, e
            )
        finally:
            # Clean up test data regardless of success/failure
            cleanup_test_data(test_name)
