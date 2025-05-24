from pathlib import Path
from typing import Optional

import pytest

from ..playwright_ops import PlaywrightOperations
from ..wrappers import get_current_datetime


@pytest.fixture(scope="session")
def screenshot(pytestconfig):
    return pytestconfig.getoption("screenshot")


@pytest.fixture(scope="session")
def screenshots_path(screenshot: str, browser_name: str) -> Optional[Path]:
    if screenshot == "off":
        return None

    session_name = f"{get_current_datetime()}-{browser_name}"
    path = Path("screenshots") / session_name
    path.mkdir(parents=True, exist_ok=True)
    return path


@pytest.fixture
def playwright_operations(page, screenshots_path):
    return PlaywrightOperations(page, screenshots_path)
