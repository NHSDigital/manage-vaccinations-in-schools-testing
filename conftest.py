import os
from pathlib import Path
import time
from typing import Optional
import urllib.parse
from datetime import datetime

import pytest
import requests
from requests.auth import HTTPBasicAuth

from mavis.test.generic_constants import audit_log_paths
from mavis.test.playwright_ops import PlaywrightOperations
from mavis.test.wrappers import get_current_datetime


def pytest_addoption(parser):
    parser.addoption("--skip-reset", action="store_true", default=False)


@pytest.fixture(scope="session")
def base_url() -> str:
    return os.environ["BASE_URL"]


@pytest.fixture(scope="session")
def admin() -> dict[str, str]:
    return {
        "username": os.environ["ADMIN_USERNAME"],
        "password": os.environ["ADMIN_PASSWORD"],
    }


@pytest.fixture(scope="session")
def basic_auth() -> dict[str, str]:
    return {
        "username": os.environ["BASIC_AUTH_USERNAME"],
        "password": os.environ["BASIC_AUTH_PASSWORD"],
    }


@pytest.fixture(scope="session")
def nurse() -> dict[str, str]:
    return {
        "username": os.environ["NURSE_USERNAME"],
        "password": os.environ["NURSE_PASSWORD"],
    }


@pytest.fixture(scope="session")
def superuser() -> dict[str, str]:
    return {
        "username": os.environ["SUPERUSER_USERNAME"],
        "password": os.environ["SUPERUSER_PASSWORD"],
    }


@pytest.fixture(scope="session")
def reset_endpoint(base_url) -> str:
    return urllib.parse.urljoin(base_url, os.environ["RESET_ENDPOINT"])


@pytest.fixture(scope="session")
def skip_reset(pytestconfig) -> bool:
    return pytestconfig.getoption("skip_reset")


@pytest.fixture(scope="session")
def screenshots_path(pytestconfig, browser_name: str) -> Optional[Path]:
    screenshot = pytestconfig.getoption("screenshot")

    if screenshot == "off":
        return None

    session_name = f"{get_current_datetime()}-{browser_name}"
    path = Path("screenshots") / session_name
    path.mkdir(parents=True, exist_ok=True)
    return path


@pytest.fixture(scope="session")
def reset_environment(reset_endpoint, basic_auth, skip_reset):
    if skip_reset:

        def _reset_environment():
            pass

        return _reset_environment
    else:
        auth = HTTPBasicAuth(**basic_auth)

        def _reset_environment():
            for _ in range(3):
                response = requests.get(url=reset_endpoint, auth=auth)
                if response.ok:
                    break
                time.sleep(3)
            else:
                response.raise_for_status()

        return _reset_environment


@pytest.fixture(scope="session")
def browser_context_args(browser_context_args, basic_auth):
    return {**browser_context_args, "http_credentials": basic_auth}


@pytest.fixture(scope="session")
def browser_type_launch_args(browser_type_launch_args, pytestconfig):
    slowmo_option = pytestconfig.getoption("slowmo")
    slow_mo = max(200, slowmo_option)  # FIXME: Find a way to disable this by default.
    return {**browser_type_launch_args, "slow_mo": slow_mo}


@pytest.fixture(scope="session")
def reset_environment_before_run(reset_environment):
    reset_environment()


@pytest.fixture
def page(reset_environment_before_run, page):
    return page


@pytest.fixture
def playwright_operations(page, screenshots_path):
    return PlaywrightOperations(page, screenshots_path)


@pytest.fixture
def log_in_as_nurse(nurse, organisation, log_in_page):
    log_in_page.navigate()
    log_in_page.log_in_and_select_organisation(**nurse, organisation=organisation)
    yield
    log_in_page.log_out()


@pytest.fixture
def log_in_as_admin(admin, organisation, log_in_page):
    log_in_page.navigate()
    log_in_page.log_in_and_select_organisation(**admin, organisation=organisation)
    yield
    log_in_page.log_out()


@pytest.hookimpl(tryfirst=True)
def pytest_sessionstart(session):
    with open(audit_log_paths.TEST_LEVEL_LOG, "a") as log_file:
        log_file.write(f"Test Session Started: {datetime.now()}\n")


@pytest.hookimpl(trylast=True)
def pytest_sessionfinish(session, exitstatus):
    with open(audit_log_paths.TEST_LEVEL_LOG, "a") as log_file:
        log_file.write(f"Test Session Ended: {datetime.now()}\n")


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_logreport(report):
    yield

    if report.when == "call":  # Log only actual test results
        test_name = report.nodeid
        test_result = report.outcome.upper()  # 'passed', 'failed', or 'skipped'
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        with open(audit_log_paths.TEST_LEVEL_LOG, "a") as log_file:
            log_file.write(f"{timestamp} | {test_name} | {test_result}\n")


pytest_plugins = ["mavis.test"]
