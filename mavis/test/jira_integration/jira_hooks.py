"""
Pytest hooks for Jira integration.
"""

import logging
import os
import re
from datetime import UTC, datetime

import pytest
from _pytest.config import Config

from .jira_reporter import JiraTestReporter
from .jira_state import (
    add_screenshot,
    cleanup_test_data,
    ensure_test_data,
    get_test_case_key,
    get_test_page,
    get_test_screenshots,
    mark_reported,
    set_page,
    set_test_case_key,
    was_reported,
)

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


@pytest.hookimpl(tryfirst=True)
def pytest_runtest_setup(item: pytest.Item) -> None:
    """Create or retrieve Jira test cases and capture page for screenshots."""
    if not _jira_reporter or not _jira_reporter.is_enabled():
        return

    nodeid = item.nodeid
    test_name = item.name
    test_docstring = None
    if hasattr(item, "function") and item.function:
        test_docstring = item.function.__doc__

    ensure_test_data(nodeid=nodeid, name=test_name, reporter=_jira_reporter, item=item)

    if get_test_case_key(test_name, item):
        return

    try:
        test_case_key = _jira_reporter.get_or_create_test_case(
            test_name, test_docstring or ""
        )
        if test_case_key:
            set_test_case_key(test_name, test_case_key, item)
            logger.info("Created test case %s for %s", test_case_key, nodeid)
        else:
            logger.warning("Test case creation returned None for %s", nodeid)
    except (RuntimeError, ValueError, KeyError, AttributeError, TypeError) as e:
        logger.warning("Failed to create test case for %s: %s", nodeid, e)

    # Page fixture is resolved after setup; capture it later in teardown.


@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item: object, call: object) -> object:  # noqa: ARG001
    """Capture test reports for Jira integration."""
    outcome = yield
    rep = outcome.get_result()

    # Store reports on the test item for access in fixtures
    setattr(item, f"rep_{rep.when}", rep)

    if rep.when == "call":
        _capture_call_screenshot(item, rep)


def _take_screenshot(
    page: object, test_name: str, suffix: str, screenshots_dir: object
) -> str | None:
    """Take a Playwright screenshot with timeout protection."""
    try:
        safe_test_name = re.sub(r"[^A-Za-z0-9_.-]+", "_", test_name)
        if hasattr(page, "is_closed") and page.is_closed():
            logger.info("Page already closed for %s, skipping screenshot", test_name)
            return None
        try:
            page.wait_for_load_state("domcontentloaded", timeout=1000)
        except (TimeoutError, RuntimeError):
            logger.info("Page not responsive for screenshot in %s, skipping", test_name)
            return None

        timestamp = datetime.now(tz=UTC).strftime("%Y%m%d_%H%M%S")
        filename = f"{safe_test_name}_{suffix}_{timestamp}.png" if suffix else None
        if not filename:
            filename = f"{safe_test_name}_{timestamp}.png"

        screenshots_dir.mkdir(exist_ok=True)
        screenshot_path = screenshots_dir / filename

        page.screenshot(path=str(screenshot_path), full_page=True, timeout=3000)
        logger.info("Screenshot saved: %s", screenshot_path)
        return str(screenshot_path)
    except Exception as e:  # noqa: BLE001
        logger.info("Failed to take screenshot for %s: %s", test_name, e)
        return None


def _capture_call_screenshot(item: pytest.Item, rep: object) -> None:
    """Capture a screenshot during the call phase while the page is open."""
    if not _jira_reporter or not _jira_reporter.is_enabled():
        return

    test_name = item.nodeid
    test_case_key = get_test_case_key(test_name, item)
    if not test_case_key:
        return

    page = get_test_page(test_name, item)
    if not page and hasattr(item, "funcargs"):
        page = item.funcargs.get("page")
        if page is not None:
            set_page(test_name, page, item)

    if not page:
        return

    screenshot_suffix = "test_completed"
    if getattr(rep, "passed", False):
        screenshot_suffix = "test_passed"
    elif getattr(rep, "failed", False):
        screenshot_suffix = "test_failed"

    screenshot_path = _take_screenshot(
        page, test_name, screenshot_suffix, _jira_reporter.config.screenshots_dir
    )
    if screenshot_path:
        add_screenshot(test_name, screenshot_path, item)


def _capture_final_screenshot(item: pytest.Item, test_name: str) -> None:
    """Capture final screenshot after test execution."""
    if not _jira_reporter:
        return

    if get_test_screenshots(test_name, item):
        return

    page = get_test_page(test_name, item)
    test_case_key = get_test_case_key(test_name, item)
    if not page or not test_case_key:
        return

    screenshot_suffix = "test_completed"
    rep = getattr(item, "rep_call", None)
    if rep:
        if rep.passed:
            screenshot_suffix = "test_passed"
        elif rep.failed:
            screenshot_suffix = "test_failed"

    screenshot_path = _take_screenshot(
        page, test_name, screenshot_suffix, _jira_reporter.config.screenshots_dir
    )
    if screenshot_path:
        add_screenshot(test_name, screenshot_path, item)


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

    if not get_test_page(test_name, item):
        page = None
        if hasattr(item, "funcargs"):
            page = item.funcargs.get("page")
        if page is not None:
            set_page(test_name, page, item)

    _capture_final_screenshot(item, test_name)

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
