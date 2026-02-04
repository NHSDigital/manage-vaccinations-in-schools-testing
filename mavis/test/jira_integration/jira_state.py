"""Shared Jira integration state for pytest hooks."""

from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    import pytest

# Global storage for test data (per-test item storage for xdist compatibility)
_test_data: dict[str, dict] = {}
# Track execution IDs to prevent duplicate executions
_execution_ids: dict[str, str] = {}
# Track execution types ("zephyr", "atm", or "fallback")
_execution_types: dict[str, str] = {}


def get_execution_id(test_case_key: str) -> str | None:
    """Get the execution ID for a test case if already created."""
    return _execution_ids.get(test_case_key)


def set_execution_id(
    test_case_key: str, execution_id: str, execution_type: str = "fallback"
) -> None:
    """Store execution ID and type to prevent duplicate creation."""
    _execution_ids[test_case_key] = execution_id
    _execution_types[test_case_key] = execution_type


def get_execution_type(test_case_key: str) -> str:
    """Get the execution type (zephyr, atm, or fallback)."""
    return _execution_types.get(test_case_key, "fallback")


# Item-level storage accessors (xdist-compatible)
def _get_item_attr(item: pytest.Item, attr: str, default: object = None) -> object:
    """Get attribute from pytest item (works with xdist)."""
    return getattr(item, f"_jira_{attr}", default)


def _set_item_attr(item: pytest.Item, attr: str, value: object) -> None:
    """Set attribute on pytest item (works with xdist)."""
    setattr(item, f"_jira_{attr}", value)


def _get_test_data(test_key: str) -> dict:
    """Get stored test data by nodeid or name."""
    if test_key in _test_data:
        return _test_data[test_key]
    if "::" in test_key:
        short_name = test_key.rsplit("::", 1)[-1]
        return _test_data.get(short_name, {})
    return {}


def ensure_test_data(
    *, nodeid: str, name: str, reporter: object, item: pytest.Item | None = None
) -> dict:
    """Ensure per-test data exists and return it."""
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
    _test_data[nodeid] = test_data
    _test_data[name] = test_data

    if item is not None:
        _set_item_attr(item, "screenshots", [])
        _set_item_attr(item, "reported", value=False)

    return test_data


def set_test_case_key(
    test_name: str, test_case_key: str | None, item: pytest.Item | None = None
) -> None:
    """Store test case key for a specific test."""
    test_data = _get_test_data(test_name)
    if test_data:
        test_data["test_case_key"] = test_case_key
    if item is not None:
        _set_item_attr(item, "test_case_key", test_case_key)


def set_page(
    test_name: str, page: object | None, item: pytest.Item | None = None
) -> None:
    """Store the Playwright page for a specific test."""
    test_data = _get_test_data(test_name)
    if test_data:
        test_data["page"] = page
    if item is not None:
        _set_item_attr(item, "page", page)


def add_screenshot(
    test_name: str, screenshot_path: str, item: pytest.Item | None = None
) -> None:
    """Add a screenshot path for a test."""
    test_data = _get_test_data(test_name)
    if test_data:
        test_data.setdefault("screenshots", []).append(screenshot_path)

    if item is not None:
        screenshots = _get_item_attr(item, "screenshots", [])
        if isinstance(screenshots, list):
            screenshots.append(screenshot_path)
            _set_item_attr(item, "screenshots", screenshots)


def get_test_page(test_name: str, item: pytest.Item | None = None) -> object | None:
    """Get the Playwright page for a specific test."""
    if item is not None:
        page = _get_item_attr(item, "page")
        if page is not None:
            return page
    return _get_test_data(test_name).get("page")


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
    if "::" in test_name:
        short_name = test_name.rsplit("::", 1)[-1]
        _test_data.pop(short_name, None)
    # Also clean up execution ID tracking
    test_case_key = get_test_case_key(test_name)
    if test_case_key:
        _execution_ids.pop(test_case_key, None)
