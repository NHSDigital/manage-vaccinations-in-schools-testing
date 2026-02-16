"""
Pytest hooks for Jira integration.
"""

from __future__ import annotations

import logging
import os
import re
from datetime import UTC, datetime

import pytest

from .reporter import JiraTestReporter, extract_issue_keys_from_item

logger = logging.getLogger(__name__)


# ===== Shared Test Data Management =====

_test_data: dict[str, dict] = {}


def _get_item_attr(item: pytest.Item, attr: str, default: object = None) -> object:
    return getattr(item, f"_jira_{attr}", default)


def _set_item_attr(item: pytest.Item, attr: str, value: object) -> None:
    setattr(item, f"_jira_{attr}", value)


def _get_test_data(test_key: str) -> dict:
    if test_key in _test_data:
        return _test_data[test_key]
    if "::" in test_key:
        return _test_data.get(test_key.rsplit("::", 1)[-1], {})
    return {}


def ensure_test_data(
    *, nodeid: str, name: str, reporter: object, item: pytest.Item | None = None
) -> dict:
    existing = _get_test_data(nodeid) or _get_test_data(name)
    if existing:
        if item is not None:
            if _get_item_attr(item, "screenshots") is None:
                _set_item_attr(item, "screenshots", [])
            if _get_item_attr(item, "reported") is None:
                _set_item_attr(item, "reported", value=False)
        return existing
    test_data = {
        "screenshots": [],
        "test_case_key": None,
        "page": None,
        "jira_reporter": reporter,
    }
    _test_data[nodeid] = _test_data[name] = test_data
    if item is not None:
        _set_item_attr(item, "screenshots", [])
        _set_item_attr(item, "reported", value=False)
    return test_data


def set_test_case_key(
    test_name: str, test_case_key: str | None, item: pytest.Item | None = None
) -> None:
    if test_data := _get_test_data(test_name):
        test_data["test_case_key"] = test_case_key
    if item is not None:
        _set_item_attr(item, "test_case_key", test_case_key)


def set_page(
    test_name: str, page: object | None, item: pytest.Item | None = None
) -> None:
    if test_data := _get_test_data(test_name):
        test_data["page"] = page
    if item is not None:
        _set_item_attr(item, "page", page)


def add_screenshot(
    test_name: str, screenshot_path: str, item: pytest.Item | None = None
) -> None:
    if test_data := _get_test_data(test_name):
        test_data.setdefault("screenshots", []).append(screenshot_path)
    if item is not None and isinstance(
        screenshots := _get_item_attr(item, "screenshots", []), list
    ):
        screenshots.append(screenshot_path)
        _set_item_attr(item, "screenshots", screenshots)


def get_test_page(test_name: str, item: pytest.Item | None = None) -> object | None:
    if item is not None and (page := _get_item_attr(item, "page")) is not None:
        return page
    return _get_test_data(test_name).get("page")


def get_test_screenshots(test_name: str, item: pytest.Item | None = None) -> list[str]:
    if item and isinstance(
        screenshots := _get_item_attr(item, "screenshots", []), list
    ):
        return screenshots
    return _get_test_data(test_name).get("screenshots", [])


def get_test_case_key(test_name: str, item: pytest.Item | None = None) -> str | None:
    if item and isinstance(result := _get_item_attr(item, "test_case_key"), str):
        return result
    return _get_test_data(test_name).get("test_case_key")


def was_reported(test_name: str, item: pytest.Item | None = None) -> bool:
    return (
        bool(_get_item_attr(item, "reported", default=False))
        if item
        else bool(_get_test_data(test_name).get("reported"))
    )


def mark_reported(test_name: str, item: pytest.Item | None = None) -> None:
    if item:
        _set_item_attr(item, "reported", value=True)
        return
    if not (test_data := _get_test_data(test_name)):
        _test_data[test_name] = {"reported": True}
        return
    test_data["reported"] = True


def cleanup_test_data(test_name: str) -> None:
    _test_data.pop(test_name, None)
    if "::" in test_name:
        _test_data.pop(test_name.rsplit("::", 1)[-1], None)


# ===== Pytest Hooks =====

# Global Jira reporter instance
_jira_reporter = None


def pytest_configure(config: pytest.Config) -> None:  # noqa: ARG001
    """Configure Jira reporter at the start of test session."""
    global _jira_reporter  # noqa: PLW0603
    if os.getenv("JIRA_INTEGRATION_ENABLED", "true").lower() != "true":
        logger.debug("Jira integration disabled via JIRA_INTEGRATION_ENABLED=false")
        _jira_reporter = None
        return
    if not any([os.getenv("JIRA_REPORTING_URL"), os.getenv("JIRA_API_TOKEN")]):
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
    nodeid, test_name = item.nodeid, item.name
    test_docstring = (
        item.function.__doc__ if hasattr(item, "function") and item.function else None
    )
    ensure_test_data(nodeid=nodeid, name=test_name, reporter=_jira_reporter, item=item)
    if get_test_case_key(test_name, item):
        return
    try:
        if test_case_key := _jira_reporter.get_or_create_test_case(
            test_name, test_docstring or ""
        ):
            set_test_case_key(test_name, test_case_key, item)
            logger.info("Created test case %s for %s", test_case_key, nodeid)
        else:
            logger.warning("Test case creation returned None for %s", nodeid)
    except (RuntimeError, ValueError, KeyError, AttributeError, TypeError) as e:
        logger.warning("Failed to create test case for %s: %s", nodeid, e)


@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item: object, call: object) -> object:  # noqa: ARG001
    """Capture test reports for Jira integration."""
    outcome = yield
    rep = outcome.get_result()

    # Store reports on the test item for access in other hooks
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
        filename = (
            f"{safe_test_name}_{suffix}_{timestamp}.png"
            if suffix
            else f"{safe_test_name}_{timestamp}.png"
        )
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
    if not (_ := get_test_case_key(test_name, item)):
        return
    if not (page := get_test_page(test_name, item)):
        page = item.funcargs.get("page") if hasattr(item, "funcargs") else None
        if page is not None:
            set_page(test_name, page, item)
    if not page:
        return

    screenshot_suffix = (
        "test_failed"
        if getattr(rep, "failed", False)
        else "test_passed"
        if getattr(rep, "passed", False)
        else "test_completed"
    )
    if screenshot_path := _take_screenshot(
        page, test_name, screenshot_suffix, _jira_reporter.config.screenshots_dir
    ):
        add_screenshot(test_name, screenshot_path, item)


def _capture_final_screenshot(item: pytest.Item, test_name: str) -> None:
    """Capture final screenshot after test execution."""
    if not _jira_reporter or get_test_screenshots(test_name, item):
        return
    if not (page := get_test_page(test_name, item)) or not get_test_case_key(
        test_name, item
    ):
        return

    screenshot_suffix = "test_completed"
    if rep := getattr(item, "rep_call", None):
        screenshot_suffix = (
            "test_passed"
            if rep.passed
            else "test_failed"
            if rep.failed
            else "test_completed"
        )

    if screenshot_path := _take_screenshot(
        page, test_name, screenshot_suffix, _jira_reporter.config.screenshots_dir
    ):
        add_screenshot(test_name, screenshot_path, item)


@pytest.hookimpl(trylast=True)
def pytest_runtest_teardown(item: pytest.Item) -> None:
    """Run after test teardown to report results with screenshots."""
    test_name = item.nodeid
    if was_reported(test_name, item):
        logger.info(
            "Test %s already reported at teardown entry, skipping entirely", test_name
        )
        cleanup_test_data(test_name)
        return
    if not _jira_reporter or not _jira_reporter.is_enabled():
        logger.debug("Jira reporter not available or disabled for %s", test_name)
        return
    if not (test_report := getattr(item, "rep_call", None)):
        logger.warning("No test report found for %s", test_name)
        return

    logger.info(
        "Teardown reporting for %s with outcome %s", test_name, test_report.outcome
    )
    if (
        not get_test_page(test_name, item)
        and hasattr(item, "funcargs")
        and (page := item.funcargs.get("page")) is not None
    ):
        set_page(test_name, page, item)

    _capture_final_screenshot(item, test_name)
    test_case_key, screenshots = (
        get_test_case_key(test_name, item),
        get_test_screenshots(test_name, item),
    )
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
            jira_result = _jira_reporter.pytest_result_to_jira_result(
                test_report.outcome
            )
            error_message = str(test_report.longrepr) if test_report.failed else None
            issue_keys = extract_issue_keys_from_item(item)
            if issue_keys:
                logger.info(
                    "Found %d issue key(s) to link: %s",
                    len(issue_keys),
                    ", ".join(issue_keys),
                )
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
                issue_keys=issue_keys,
            )
            mark_reported(test_name, item)
            logger.info("Successfully reported test %s to Jira", test_name)
        except (ConnectionError, TimeoutError, ValueError, KeyError, AttributeError):
            logger.exception("Failed to report test results to Jira for %s", test_name)
        finally:
            cleanup_test_data(test_name)
    else:
        logger.warning(
            "No test case key found for %s - cannot report to Jira", test_name
        )
