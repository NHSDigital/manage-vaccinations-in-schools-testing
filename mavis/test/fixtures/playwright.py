import os
from typing import Optional

import pytest
from playwright.sync_api import BrowserType, Playwright


@pytest.fixture(scope="session")
def base_url() -> str:
    return os.environ["BASE_URL"]


@pytest.fixture(scope="session")
def basic_auth_credentials() -> dict[str, str]:
    return {
        "username": os.environ["BASIC_AUTH_USERNAME"],
        "password": os.environ["BASIC_AUTH_PASSWORD"],
    }


@pytest.fixture(scope="session")
def basic_auth_token() -> str:
    return os.environ["BASIC_AUTH_TOKEN"]


@pytest.fixture(scope="session")
def browser_type(playwright: Playwright, device: Optional[str]) -> BrowserType:
    device = device or "Desktop Chrome"
    browser_name = playwright.devices[device]["default_browser_type"]
    return getattr(playwright, browser_name)


@pytest.fixture(scope="session")
def browser_context_args(
    browser_context_args, basic_auth_credentials, basic_auth_token
) -> dict:
    if basic_auth_token:
        return {
            **browser_context_args,
            "extra_http_headers": {"Authorization": f"Basic {basic_auth_token}"},
        }

    return {**browser_context_args, "http_credentials": basic_auth_credentials}
