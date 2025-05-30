import os
from pathlib import Path
from typing import Optional
from datetime import datetime

import pytest

from mavis.test.generic_constants import audit_log_paths
from mavis.test.playwright_ops import PlaywrightOperations
from mavis.test.wrappers import get_current_datetime


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
def screenshots_path(pytestconfig, browser_name: str) -> Optional[Path]:
    screenshot = pytestconfig.getoption("screenshot")

    if screenshot == "off":
        return None

    session_name = f"{get_current_datetime()}-{browser_name}"
    path = Path("screenshots") / session_name
    path.mkdir(parents=True, exist_ok=True)
    return path


@pytest.fixture(scope="session")
def browser_context_args(browser_context_args, basic_auth):
    return {**browser_context_args, "http_credentials": basic_auth}


@pytest.fixture(scope="session")
def browser_type_launch_args(browser_type_launch_args, pytestconfig):
    slowmo_option = pytestconfig.getoption("slowmo")
    slow_mo = max(200, slowmo_option)  # FIXME: Find a way to disable this by default.
    return {**browser_type_launch_args, "slow_mo": slow_mo}


@pytest.fixture
def playwright_operations(page, screenshots_path):
    return PlaywrightOperations(page, screenshots_path)


@pytest.fixture
def log_in_as_nurse(nurse, organisation, log_in_page):
    log_in_page.navigate()
    log_in_page.log_in_and_select_organisation(nurse, organisation)
    yield
    log_in_page.log_out()


@pytest.fixture
def log_in_as_admin(admin, organisation, log_in_page):
    log_in_page.navigate()
    log_in_page.log_in_and_select_organisation(admin, organisation)
    yield
    log_in_page.log_out()


@pytest.fixture
def get_online_consent_url(
    nurse, organisation, schools, dashboard_page, log_in_page, sessions_page
):
    def wrapper(*programmes):
        try:
            log_in_page.navigate()
            log_in_page.log_in_and_select_organisation(nurse, organisation)
            dashboard_page.click_sessions()
            sessions_page.schedule_a_valid_session(schools[0])
            url = sessions_page.get_online_consent_url(*programmes)
            log_in_page.log_out()
            yield url
        finally:
            log_in_page.navigate()
            log_in_page.log_in_and_select_organisation(nurse, organisation)
            dashboard_page.click_sessions()
            sessions_page.delete_all_sessions(schools[0])
            log_in_page.log_out()

    return wrapper


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
