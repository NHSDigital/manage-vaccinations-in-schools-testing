import os

import pytest


@pytest.fixture(scope="session")
def base_url() -> str:
    return os.environ["BASE_URL"]


@pytest.fixture(scope="session")
def browser_context_args(browser_context_args, basic_auth):
    return {**browser_context_args, "http_credentials": basic_auth}


@pytest.fixture(scope="session")
def browser_type_launch_args(browser_type_launch_args, pytestconfig):
    slowmo_option = pytestconfig.getoption("--slowmo")
    slow_mo = max(200, slowmo_option)  # FIXME: Find a way to disable this by default.
    return {**browser_type_launch_args, "slow_mo": slow_mo}


@pytest.fixture
def page(page):
    page.goto("/")
    return page
