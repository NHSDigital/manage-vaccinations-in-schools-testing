"""
Auto-use fixtures for automatic Jira integration.
"""

import logging

import pytest

from .test_reporter import TestReporter

logger = logging.getLogger(__name__)

# Global storage for test data
_test_data = {}


@pytest.fixture(scope="session")
def jira_reporter_session() -> TestReporter:
    """Session-scoped Jira integration reporter."""
    try:
        return TestReporter()
    except Exception as e:
        logger.warning("Failed to initialize Jira reporter: %s", e)
        # Return a disabled reporter
        from .config import JiraConfig

        config = JiraConfig.from_env()
        config.enabled = False
        return TestReporter(config)


@pytest.fixture(autouse=True)
def auto_jira_integration(
    request: pytest.FixtureRequest, jira_reporter_session: TestReporter
) -> None:
    """
    Automatic Jira integration fixture that runs for every test.
    Only activates when proper environment variables are configured.
    """
    import os

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

    test_name = request.node.name
    test_docstring = request.node.function.__doc__ if request.node.function else None

    # Check if we've already processed this test in this run
    if test_name in _test_data:
        logger.info(
            "Test case %s already processed, skipping duplicate creation", test_name
        )
        # Still need to continue with fixture setup for pytest
    else:
        # Initialize test data storage
        _test_data[test_name] = {
            "screenshots": [],
            "test_case_key": None,
            "page": None,
            "jira_reporter": jira_reporter_session,
        }

        # Create test case in Jira for tracking
        try:
            logger.info("Creating test case for %s in Jira", test_name)
            test_case_key = jira_reporter_session.get_or_create_test_case(
                test_name, test_docstring or ""
            )
            _test_data[test_name]["test_case_key"] = test_case_key
            logger.info("Created test case %s for %s", test_case_key, test_name)
        except Exception as e:
            logger.warning("Failed to create test case for %s: %s", test_name, e)
            # Continue with test execution even if Jira creation fails

    logger.debug("Auto integration active for %s", test_name)

    # Try to get the page fixture if it exists
    page = None
    try:
        page = request.getfixturevalue("page")
        _test_data[test_name]["page"] = page
    except pytest.FixtureNotAvailable:
        # Test doesn't use page fixture - that's fine
        pass
    except Exception as e:
        # Other error getting page - log but don't fail the test
        logger.info(
            "No page fixture available for %s (not a UI test): %s", test_name, e
        )

    # Yield control to run the test
    yield

    # After test execution - handle screenshots with timeout protection
    try:
        _handle_post_test_screenshots(request, test_name, jira_reporter_session)
    except Exception as e:
        logger.info("Error in post-test screenshot handling for %s: %s", test_name, e)


# Legacy compatibility alias
auto_zephyr_integration = auto_jira_integration


def _handle_post_test_screenshots(
    request: pytest.FixtureRequest,
    test_name: str,
    jira_reporter_session: TestReporter,
) -> None:
    """Handle screenshot capture after test execution with proper timeout and error handling."""
    test_data = _test_data.get(test_name, {})
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
            except Exception:
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
            except Exception as screenshot_error:
                logger.info("Screenshot failed for %s: %s", test_name, screenshot_error)

        except Exception as e:
            logger.info("Screenshot capture failed for %s: %s", test_name, e)


def get_test_screenshots(test_name: str) -> list[str]:
    """Get screenshots for a specific test (used by hooks)."""
    return _test_data.get(test_name, {}).get("screenshots", [])


def get_test_case_key(test_name: str) -> str | None:
    """Get JIRA test case key for a specific test (used by hooks)."""
    return _test_data.get(test_name, {}).get("test_case_key")


def cleanup_test_data(test_name: str) -> None:
    """Clean up test data after reporting."""
    _test_data.pop(test_name, None)
