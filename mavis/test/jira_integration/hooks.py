"""
Pytest hooks for Jira integration.
"""

from __future__ import annotations

import atexit
import logging
import os
import re
import time
from dataclasses import dataclass, field
from datetime import UTC, datetime
from queue import Empty, Queue
from threading import Thread
from typing import TYPE_CHECKING

import pytest

from .reporter import JiraTestReporter, extract_issue_keys_from_item

if TYPE_CHECKING:
    from .models import TestResult

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class JiraReportData:
    """Data for queued Jira test reports."""

    test_case_key: str
    result: TestResult
    test_name: str
    error_message: str | None = None
    screenshots: list[str] = field(default_factory=list)
    issue_keys: list[str] = field(default_factory=list)


_report_queue: Queue = Queue()
_reporter_thread: Thread | None = None
_shutdown_flag = False
_jira_reporter = None


def _reporter_worker() -> None:
    """Background thread that processes queued Jira reports."""
    logger.info("Jira reporter worker thread started")
    processed_count = 0

    while not _shutdown_flag or not _report_queue.empty():
        try:
            # Get report with timeout to allow checking shutdown flag
            try:
                report_data = _report_queue.get(timeout=0.5)
            except Empty:
                continue

            if report_data is None:  # Shutdown signal
                logger.info(
                    "Received shutdown signal, processed %d reports", processed_count
                )
                _report_queue.task_done()
                break

            try:
                _jira_reporter.report_test_result(
                    test_case_key=report_data.test_case_key,
                    result=report_data.result,
                    error_message=report_data.error_message,
                    screenshots=report_data.screenshots,
                    issue_keys=report_data.issue_keys,
                )
                processed_count += 1
            except Exception:
                logger.exception(
                    "Failed to report test %s to Jira", report_data.test_name
                )
            finally:
                _report_queue.task_done()

        except Exception:
            logger.exception("Error in reporter worker thread")

    logger.info(
        "Jira reporter worker thread shutting down (total processed: %d)",
        processed_count,
    )


def _start_reporter_thread() -> None:
    """Start the background reporter thread."""
    global _reporter_thread, _shutdown_flag  # noqa: PLW0603 - Required for thread coordination

    if _reporter_thread is not None and _reporter_thread.is_alive():
        return

    _shutdown_flag = False
    _reporter_thread = Thread(
        target=_reporter_worker, daemon=False, name="JiraReporter"
    )
    _reporter_thread.start()
    logger.info("Started Jira reporter background thread")

    # Register cleanup handler
    atexit.register(_shutdown_reporter_thread)


def _shutdown_reporter_thread() -> None:
    """Shutdown the reporter thread and wait for queue to empty."""
    global _shutdown_flag, _reporter_thread  # noqa: PLW0603 - Required for thread coordination

    if _reporter_thread is None or not _reporter_thread.is_alive():
        return

    queue_size = _report_queue.qsize()
    logger.info("Waiting for %d Jira reports to complete...", queue_size)
    _shutdown_flag = True

    # Wait for queue to empty with timeout
    timeout = 60  # seconds
    start_time = time.time()
    while not _report_queue.empty() and (time.time() - start_time) < timeout:
        time.sleep(0.1)

    # Send shutdown signal
    _report_queue.put(None)

    # Wait for thread to finish
    _reporter_thread.join(timeout=10)
    _reporter_thread = None

    if _report_queue.empty():
        logger.info("All Jira reports completed")
    else:
        remaining = _report_queue.qsize()
        logger.warning("%d Jira reports did not complete in time", remaining)


def pytest_configure(config: pytest.Config) -> None:
    """Configure Jira reporter at the start of test session."""
    global _jira_reporter  # noqa: PLW0603

    # Check if running with xdist
    is_xdist_worker = hasattr(config, "workerinput")
    is_xdist_controller = (
        hasattr(config, "option")
        and hasattr(config.option, "numprocesses")
        and config.option.numprocesses
    )

    if is_xdist_worker:
        logger.debug("Running in xdist worker - Jira reporter initialized per worker")
    elif is_xdist_controller:
        logger.info(
            "Running with pytest-xdist (%s workers) - "
            "using queued reporting for complete coverage",
            config.option.numprocesses,
        )

    if os.getenv("JIRA_INTEGRATION_ENABLED", "true").lower() != "true":
        logger.debug("Jira integration disabled via JIRA_INTEGRATION_ENABLED=false")
        _jira_reporter = None
        return
    if not any([os.getenv("JIRA_REPORTING_URL"), os.getenv("JIRA_API_TOKEN")]):
        logger.debug("Jira integration disabled - no environment variables set")
        _jira_reporter = None
        return
    try:
        _jira_reporter = JiraTestReporter(is_xdist_worker=is_xdist_worker)
        if _jira_reporter.is_enabled():
            logger.info(
                "Jira integration enabled - all tests will be automatically tracked"
            )
            # Start background reporter thread for parallel execution
            _start_reporter_thread()
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

    if getattr(item, "jira_test_case_key", None):
        return

    test_name = item.nodeid  # Use full nodeid for unique test identification
    test_docstring = (
        item.function.__doc__ if hasattr(item, "function") and item.function else None
    )
    try:
        logger.info("Creating/retrieving test case for %s", test_name)
        if test_case_key := _jira_reporter.get_or_create_test_case(
            test_name, test_docstring or ""
        ):
            item.jira_test_case_key = test_case_key
            logger.info("Created test case %s for %s", test_case_key, item.nodeid)
        else:
            logger.error(
                "Test case creation returned None for %s - "
                "THIS TEST WILL NOT BE REPORTED",
                item.nodeid,
            )
    except (RuntimeError, ValueError, KeyError, AttributeError, TypeError):
        logger.exception(
            "Failed to create test case for %s - THIS TEST WILL NOT BE REPORTED",
            item.nodeid,
        )


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
    if not getattr(item, "jira_test_case_key", None):
        return

    page = getattr(item, "jira_page", None)
    if not page:
        page = item.funcargs.get("page") if hasattr(item, "funcargs") else None
        if page is not None:
            item.jira_page = page
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
        page, item.nodeid, screenshot_suffix, _jira_reporter.config.screenshots_dir
    ):
        screenshots = getattr(item, "jira_screenshots", [])
        screenshots.append(screenshot_path)
        item.jira_screenshots = screenshots


def _capture_final_screenshot(item: pytest.Item) -> None:
    """Capture final screenshot after test execution."""
    if not _jira_reporter or getattr(item, "jira_screenshots", []):
        return
    if not (page := getattr(item, "jira_page", None)) or not getattr(
        item, "jira_test_case_key", None
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
        page, item.nodeid, screenshot_suffix, _jira_reporter.config.screenshots_dir
    ):
        screenshots = getattr(item, "jira_screenshots", [])
        screenshots.append(screenshot_path)
        item.jira_screenshots = screenshots


@pytest.hookimpl(trylast=True)
def pytest_runtest_teardown(item: pytest.Item) -> None:
    """Run after test teardown to report results with screenshots."""
    test_name = item.nodeid
    if getattr(item, "jira_reported", False):
        logger.info(
            "Test %s already reported at teardown entry, skipping entirely", test_name
        )
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
        not getattr(item, "jira_page", None)
        and hasattr(item, "funcargs")
        and (page := item.funcargs.get("page")) is not None
    ):
        item.jira_page = page

    _capture_final_screenshot(item)
    test_case_key = getattr(item, "jira_test_case_key", None)
    screenshots = getattr(item, "jira_screenshots", [])
    logger.info(
        "Teardown - Test case key: %s, Screenshots: %d",
        test_case_key,
        len(screenshots),
    )

    if test_case_key:
        if getattr(item, "jira_reported", False):
            logger.info("Test %s already reported, skipping duplicate", test_name)
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

            # Queue the report for background processing (enables parallel execution)
            report_data = JiraReportData(
                test_case_key=test_case_key,
                result=jira_result,
                test_name=test_name,
                error_message=error_message,
                screenshots=screenshots,
                issue_keys=issue_keys,
            )
            _report_queue.put(report_data)
            item.jira_reported = True

            logger.info(
                "Queued test result %s for test case %s with %d screenshots",
                jira_result.value,
                test_case_key,
                len(screenshots),
            )
        except Exception:
            logger.exception(
                "Failed to report test results to Jira for %s",
                test_name,
            )
    else:
        logger.error("No test case key found for %s - CANNOT REPORT TO JIRA", test_name)


def pytest_sessionfinish(session: pytest.Session, exitstatus: int) -> None:  # noqa: ARG001
    """Shutdown Jira reporter thread at the end of the test session."""
    if _reporter_thread is None:
        return

    is_xdist_worker = hasattr(session.config, "workerinput")
    worker_msg = "[Worker] " if is_xdist_worker else ""
    logger.info("%sShutting down Jira reporter...", worker_msg)
    _shutdown_reporter_thread()
