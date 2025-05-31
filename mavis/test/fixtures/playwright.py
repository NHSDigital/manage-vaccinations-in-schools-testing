from datetime import datetime
from pathlib import Path
import os
from typing import Optional

from playwright.sync_api import BrowserType, Playwright
import pytest

from ..playwright_ops import PlaywrightOperations


@pytest.fixture(scope="session")
def base_url() -> str:
    return os.environ["BASE_URL"]


@pytest.fixture(scope="session")
def basic_auth() -> dict[str, str]:
    return {
        "username": os.environ["BASIC_AUTH_USERNAME"],
        "password": os.environ["BASIC_AUTH_PASSWORD"],
    }


@pytest.fixture(scope="session")
def screenshots_path(pytestconfig) -> Optional[Path]:
    screenshot = pytestconfig.getoption("screenshot")

    if screenshot == "off":
        return None

    session_name = datetime.now().isoformat()
    path = Path("screenshots") / session_name
    path.mkdir(parents=True, exist_ok=True)
    return path


@pytest.fixture(scope="session")
def browser_type(playwright: Playwright, device: Optional[str]) -> BrowserType:
    device = device or "Desktop Chrome"
    browser_name = playwright.devices[device]["default_browser_type"]
    return getattr(playwright, browser_name)


@pytest.fixture(scope="session")
def browser_context_args(browser_context_args, basic_auth):
    return {**browser_context_args, "http_credentials": basic_auth}


@pytest.fixture
def playwright_operations(page, screenshots_path):
    return PlaywrightOperations(page, screenshots_path)
