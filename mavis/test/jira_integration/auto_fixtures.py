"""
Auto-use fixtures for automatic Jira integration.
"""

import logging

import pytest

from .jira_reporter import JiraTestReporter

logger = logging.getLogger(__name__)

# Global storage for test data
_test_data = {}


@pytest.fixture(scope="session")
def jira_reporter_session() -> JiraTestReporter:
    """Session-scoped Jira reporter."""
    return JiraTestReporter()


@pytest.fixture(autouse=True)
def auto_jira_integration(
    request: pytest.FixtureRequest, jira_reporter_session: JiraTestReporter
) -> None:
    """
    Automatic Jira integration fixture that runs for every test.

    This fixture:
    - Runs automatically for all tests (autouse=True)
    - Creates test cases in Jira from test docstrings
    - Captures screenshots at key points
    - Stores data for pytest hooks to use
    """
    if not jira_reporter_session.is_enabled():
        yield
        return

    test_name = request.node.name
    test_docstring = request.node.function.__doc__ if request.node.function else None

    # Initialize test data storage
    _test_data[test_name] = {
        "screenshots": [],
        "test_case_key": None,
        "page": None,
        "jira_reporter": jira_reporter_session,
    }

    # Create or find test case in Jira
    try:
        test_case_key = jira_reporter_session.get_or_create_test_case(
            test_name, test_docstring
        )
        _test_data[test_name]["test_case_key"] = test_case_key
    except (ValueError, TypeError) as e:
        logger.warning("Failed to create Jira test case for %s: %s", test_name, e)

    # Try to get the page fixture if it exists
    page = None
    try:
        page = request.getfixturevalue("page")
        _test_data[test_name]["page"] = page
    except pytest.FixtureNotAvailable:
        # Test doesn't use page fixture - that's fine
        pass
    except (ValueError, TypeError) as e:
        # Other error getting page - log but don't fail the test
        logger.info(
            "No page fixture available for %s (not a UI test): %s", test_name, e
        )

    # Yield control to run the test
    yield

    # After test execution - handle screenshots
    _handle_post_test_screenshots(request, test_name, jira_reporter_session)


def _handle_post_test_screenshots(
    request: pytest.FixtureRequest,
    test_name: str,
    jira_reporter_session: JiraTestReporter,
) -> None:
    """Handle screenshot capture after test execution."""
    test_data = _test_data.get(test_name, {})
    page = test_data.get("page")
    test_case_key = test_data.get("test_case_key")

    # Take screenshots based on test outcome
    if page and test_case_key:
        try:
            # Take start screenshot
            screenshot_path = jira_reporter_session.take_screenshot(
                page, test_name, "test_start"
            )
            if screenshot_path:
                test_data["screenshots"].append(screenshot_path)

            # Get test result and take appropriate screenshot
            if hasattr(request.node, "rep_call"):
                rep = request.node.rep_call
                if rep.passed:
                    screenshot_path = jira_reporter_session.take_screenshot(
                        page, test_name, "test_passed"
                    )
                elif rep.failed:
                    screenshot_path = jira_reporter_session.take_screenshot(
                        page, test_name, "test_failed"
                    )
                else:
                    screenshot_path = jira_reporter_session.take_screenshot(
                        page, test_name, "test_completed"
                    )

                if screenshot_path:
                    test_data["screenshots"].append(screenshot_path)
        except (ValueError, TypeError, OSError) as e:
            logger.warning("Screenshot capture failed for %s: %s", test_name, e)


def get_test_screenshots(test_name: str) -> list[str]:
    """Get screenshots for a specific test (used by hooks)."""
    return _test_data.get(test_name, {}).get("screenshots", [])


def get_test_case_key(test_name: str) -> str | None:
    """Get Jira test case key for a specific test (used by hooks)."""
    return _test_data.get(test_name, {}).get("test_case_key")


def cleanup_test_data(test_name: str) -> None:
    """Clean up test data after reporting."""
    _test_data.pop(test_name, None)
