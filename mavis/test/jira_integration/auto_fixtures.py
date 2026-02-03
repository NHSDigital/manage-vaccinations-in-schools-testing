"""
Auto-use fixtures for automatic Jira integration.
"""

import logging
import os
from collections.abc import Generator

import pytest

from .config import JiraConfig
from .test_reporter import TestReporter

logger = logging.getLogger(__name__)

# Global storage for test data (per-test item storage for xdist compatibility)
_test_data: dict[str, dict] = {}
# Track execution IDs to prevent duplicate executions
_execution_ids: dict[str, str] = {}


def get_execution_id(test_case_key: str) -> str | None:
    """Get the execution ID for a test case if already created."""
    return _execution_ids.get(test_case_key)


def set_execution_id(test_case_key: str, execution_id: str) -> None:
    """Store execution ID to prevent duplicate creation."""
    _execution_ids[test_case_key] = execution_id


# Item-level storage accessors (xdist-compatible)
def _get_item_attr(item: pytest.Item, attr: str, default: object = None) -> object:
    """Get attribute from pytest item (works with xdist)."""
    return getattr(item, f"_jira_{attr}", default)


def _set_item_attr(item: pytest.Item, attr: str, value: object) -> None:
    """Set attribute on pytest item (works with xdist)."""
    setattr(item, f"_jira_{attr}", value)


def _get_test_keys(request: pytest.FixtureRequest) -> tuple[str, str]:
    """Return normalized (nodeid, name) keys for storage/lookup."""
    nodeid = request.node.nodeid
    name = request.node.name
    return nodeid, name


def _get_test_data(test_key: str) -> dict:
    """Get stored test data by nodeid or name."""
    if test_key in _test_data:
        return _test_data[test_key]
    if "::" in test_key:
        short_name = test_key.split("::")[-1]
        return _test_data.get(short_name, {})
    return {}


@pytest.fixture(scope="session")
def jira_reporter_session() -> TestReporter:
    """Session-scoped Jira integration reporter."""
    try:
        return TestReporter()
    except (ValueError, ConnectionError, OSError, ImportError) as e:
        logger.warning("Failed to initialize Jira reporter: %s", e)
        # Return a disabled reporter
        config = JiraConfig.from_env()
        config.enabled = False
        return TestReporter(config)


@pytest.fixture(autouse=True)
def auto_jira_integration(
    request: pytest.FixtureRequest, jira_reporter_session: TestReporter
) -> Generator[None]:
    """
    Automatic Jira integration fixture that runs for every test.
    Only activates when proper environment variables are configured and integration is enabled.
    """

    # Check if JIRA integration is explicitly disabled
    jira_enabled = os.getenv("JIRA_INTEGRATION_ENABLED", "true").lower() == "true"
    if not jira_enabled:
        yield
        return

    # Skip entirely if no JIRA environment variables are set
    if not any(
        [
            os.getenv("JIRA_URL"),
            os.getenv("JIRA_API_TOKEN"),
        ]
    ):
        yield
        return

    # Quick check - if integration is not enabled, skip everything
    if not jira_reporter_session.is_enabled():
        yield
        return

    nodeid, test_name = _get_test_keys(request)
    test_docstring = request.node.function.__doc__ if request.node.function else None

    # Check if we've already processed this test in this run
    if nodeid in _test_data or test_name in _test_data:
        logger.info(
            "Test case %s already processed, skipping duplicate creation", test_name
        )
        # Still need to continue with fixture setup for pytest
    else:
        # Initialize test data storage
        test_data = {
            "screenshots": [],
            "test_case_key": None,
            "page": None,
            "jira_reporter": jira_reporter_session,
        }
        _test_data[nodeid] = test_data
        _test_data[test_name] = test_data

        # Create test case in Jira for tracking
        try:
            logger.info("Creating test case for %s in Jira", test_name)
            test_case_key = jira_reporter_session.get_or_create_test_case(
                test_name, test_docstring or ""
            )
            test_data["test_case_key"] = test_case_key

            # Also store on the item for xdist compatibility
            _set_item_attr(request.node, "test_case_key", test_case_key)
            _set_item_attr(request.node, "screenshots", [])
            _set_item_attr(request.node, "reported", value=False)

            if test_case_key:
                logger.info("Created test case %s for %s", test_case_key, test_name)
            else:
                logger.warning("Test case creation returned None for %s", test_name)
        except (RuntimeError, ValueError, KeyError, AttributeError, TypeError) as e:
            logger.warning("Failed to create test case for %s: %s", test_name, e)
            # Continue with test execution even if Jira creation fails

    logger.debug("Auto integration active for %s", test_name)

    # Try to get the page fixture if it exists
    page = None
    try:
        page = request.getfixturevalue("page")
        test_data = _test_data.get(nodeid) or _test_data.get(test_name)
        if test_data is not None:
            test_data["page"] = page
    except (LookupError, AttributeError) as e:
        # Fixture not available (not a UI test) or other lookup error
        logger.info(
            "No page fixture available for %s (not a UI test): %s", test_name, e
        )

    # Yield control to run the test
    yield

    # After test execution - handle screenshots with timeout protection
    try:
        _handle_post_test_screenshots(request, nodeid, jira_reporter_session)
    except (RuntimeError, TimeoutError, OSError) as e:
        logger.info("Error in post-test screenshot handling for %s: %s", test_name, e)


# Legacy compatibility alias
auto_zephyr_integration = auto_jira_integration


def _handle_post_test_screenshots(
    request: pytest.FixtureRequest,
    test_name: str,
    jira_reporter_session: TestReporter,
) -> None:
    """
    Handle screenshot capture after test execution.

    Includes proper timeout and error handling.
    """
    test_data = _get_test_data(test_name)
    page = test_data.get("page")
    test_case_key = test_data.get("test_case_key")

    # Take screenshots based on test outcome with timeout protection
    if page and test_case_key:
        try:
            # Check if page is still available and responsive with very short timeout
            try:
                page.wait_for_load_state(
                    "domcontentloaded", timeout=1000
                )  # 1 second timeout
            except (TimeoutError, RuntimeError):
                logger.info(
                    "Page not responsive for screenshots in %s, skipping", test_name
                )
                return

            # Only take final screenshot based on test outcome
            screenshot_suffix = "test_completed"
            if hasattr(request.node, "rep_call"):
                rep = request.node.rep_call
                if rep.passed:
                    screenshot_suffix = "test_passed"
                elif rep.failed:
                    screenshot_suffix = "test_failed"

            # Take screenshot with timeout protection
            try:
                screenshot_path = jira_reporter_session.take_screenshot(
                    page, test_name, screenshot_suffix
                )
                if screenshot_path:
                    test_data["screenshots"].append(screenshot_path)
                    # Also store on item for xdist
                    screenshots = _get_item_attr(request.node, "screenshots", [])
                    _set_item_attr(request.node, "screenshots", screenshots)
            except (RuntimeError, OSError, TimeoutError) as screenshot_error:
                logger.info("Screenshot failed for %s: %s", test_name, screenshot_error)

        except (RuntimeError, TimeoutError, OSError) as e:
            logger.info("Screenshot capture failed for %s: %s", test_name, e)


def get_test_screenshots(test_name: str, item: pytest.Item | None = None) -> list[str]:
    """Get screenshots for a specific test (used by hooks)."""
    if item:
        screenshots = _get_item_attr(item, "screenshots", [])
        return screenshots if isinstance(screenshots, list) else []
    return _get_test_data(test_name).get("screenshots", [])


def get_test_case_key(test_name: str, item: pytest.Item | None = None) -> str | None:
    """Get JIRA test case key for a specific test (used by hooks)."""
    if item:
        result = _get_item_attr(item, "test_case_key")
        return result if isinstance(result, str) else None
    return _get_test_data(test_name).get("test_case_key")


def was_reported(test_name: str, item: pytest.Item | None = None) -> bool:
    """Check if a test has already been reported."""
    if item:
        return bool(_get_item_attr(item, "reported", default=False))
    return bool(_get_test_data(test_name).get("reported"))


def mark_reported(test_name: str, item: pytest.Item | None = None) -> None:
    """Mark a test as reported to avoid duplicate executions."""
    if item:
        _set_item_attr(item, "reported", value=True)
        return
    test_data = _get_test_data(test_name)
    if not test_data:
        _test_data[test_name] = {"reported": True}
        return
    test_data["reported"] = True


def cleanup_test_data(test_name: str) -> None:
    """Clean up test data after reporting."""
    _test_data.pop(test_name, None)
    # Also clean up execution ID tracking
    test_case_key = get_test_case_key(test_name)
    if test_case_key:
        _execution_ids.pop(test_case_key, None)
