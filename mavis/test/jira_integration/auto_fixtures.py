"""
Auto-use fixtures for automatic Zephyr Scale integration.
"""

import logging

import pytest

from .zephyr_reporter import ZephyrTestReporter

logger = logging.getLogger(__name__)

# Global storage for test data
_test_data = {}


@pytest.fixture(scope="session")
def zephyr_reporter_session() -> ZephyrTestReporter:
    """Session-scoped Zephyr Scale reporter."""
    return ZephyrTestReporter()


@pytest.fixture(autouse=True)
def auto_zephyr_integration(
    request: pytest.FixtureRequest, zephyr_reporter_session: ZephyrTestReporter
) -> None:
    """
    Automatic Zephyr Scale integration fixture that runs for every test.

    This fixture:
    - Runs automatically for all tests (autouse=True)
    - Creates test cases in Zephyr Scale from test docstrings
    - Captures screenshots at key points
    - Stores data for pytest hooks to use
    """
    if not zephyr_reporter_session.is_enabled():
        yield
        return

    test_name = request.node.name
    test_docstring = request.node.function.__doc__ if request.node.function else None

    # Initialize test data storage
    _test_data[test_name] = {
        "screenshots": [],
        "test_case_id": None,
        "page": None,
        "zephyr_reporter": zephyr_reporter_session,
    }

    # Create or find test case in Zephyr Scale
    try:
        test_case_id = zephyr_reporter_session.get_or_create_test_case(
            test_name, test_docstring
        )
        _test_data[test_name]["test_case_id"] = test_case_id
    except (ValueError, TypeError) as e:
        logger.warning("Failed to create Zephyr Scale test case for %s: %s", test_name, e)

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
    _handle_post_test_screenshots(request, test_name, zephyr_reporter_session)


def _handle_post_test_screenshots(
    request: pytest.FixtureRequest,
    test_name: str,
    zephyr_reporter_session: ZephyrTestReporter,
) -> None:
    """Handle screenshot capture after test execution."""
    test_data = _test_data.get(test_name, {})
    page = test_data.get("page")
    test_case_id = test_data.get("test_case_id")

    # Take screenshots based on test outcome
    if page and test_case_id:
        try:
            # Take start screenshot
            screenshot_path = zephyr_reporter_session.take_screenshot(
                page, test_name, "test_start"
            )
            if screenshot_path:
                test_data["screenshots"].append(screenshot_path)

            # Get test result and take appropriate screenshot
            if hasattr(request.node, "rep_call"):
                rep = request.node.rep_call
                if rep.passed:
                    screenshot_path = zephyr_reporter_session.take_screenshot(
                        page, test_name, "test_passed"
                    )
                elif rep.failed:
                    screenshot_path = zephyr_reporter_session.take_screenshot(
                        page, test_name, "test_failed"
                    )
                else:
                    screenshot_path = zephyr_reporter_session.take_screenshot(
                        page, test_name, "test_completed"
                    )

                if screenshot_path:
                    test_data["screenshots"].append(screenshot_path)
        except (ValueError, TypeError, OSError) as e:
            logger.warning("Screenshot capture failed for %s: %s", test_name, e)


def get_test_screenshots(test_name: str) -> list[str]:
    """Get screenshots for a specific test (used by hooks)."""
    return _test_data.get(test_name, {}).get("screenshots", [])


def get_test_case_key(test_name: str) -> int | None:
    """Get Zephyr Scale test case ID for a specific test (used by hooks)."""
    return _test_data.get(test_name, {}).get("test_case_id")


def cleanup_test_data(test_name: str) -> None:
    """Clean up test data after reporting."""
    _test_data.pop(test_name, None)
