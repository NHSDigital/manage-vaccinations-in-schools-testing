from datetime import datetime

import pytest
from playwright.sync_api import sync_playwright

from libs import CurrentExecution as ce
from libs import file_ops as fo
from libs.generic_constants import audit_log_paths, file_mode
from libs.mavis_constants import playwright_constants
from libs.wrappers import get_current_datetime


def pytest_addoption(parser):
    parser.addoption("--browser", default="chromium")
    parser.addoption("--browser-channel", default=None)
    parser.addoption("--device", default=None)


@pytest.fixture(scope="session")
def browser_name(request):
    return request.config.getoption("browser")


@pytest.fixture(scope="session")
def browser_channel(request):
    return request.config.getoption("browser_channel")


@pytest.fixture(scope="session")
def device(request):
    return request.config.getoption("device")


@pytest.fixture(scope="session")
def start_playwright_session(browser_name):
    ce.get_env_values()
    ce.reset_environment()

    ce.session_screenshots_dir = create_session_screenshot_dir(browser_name)

    with sync_playwright() as _playwright:
        _playwright.selectors.set_test_id_attribute(
            playwright_constants.TEST_ID_ATTRIBUTE
        )
        yield _playwright
    # ce.reset_environment()  # Clean up the environment after execution


@pytest.fixture(scope="function")
def start_mavis(start_playwright_session, browser_name, browser_channel, device):
    _browser, _context = start_browser(
        start_playwright_session, browser_name, browser_channel, device
    )

    ce.browser = _browser
    ce.page = _context.new_page()
    # ce.page.set_default_timeout(playwright_constants.DEFAULT_TIMEOUT)
    ce.page.goto(url=ce.service_url)
    yield
    close_browser(browser=_browser, page=ce.page)


def create_session_screenshot_dir(browser_name: str) -> str:
    if ce.capture_screenshot_flag:
        _session_name = f"{get_current_datetime()}-{browser_name}"
        fo.file_operations().create_dir(dir_path=f"screenshots/{_session_name}")
        return f"screenshots/{_session_name}"
    else:
        return ""


def start_browser(playwright, browser_name, browser_channel, device):
    _http_credentials = {
        "username": ce.base_auth_username,
        "password": ce.base_auth_password,
    }

    browser_type = getattr(playwright, browser_name)
    browser = browser_type.launch(
        channel=browser_channel, headless=ce.headless_mode, slow_mo=ce.slow_motion
    )

    kwargs = {}
    if device:
        kwargs = playwright.devices[device]

    context = browser.new_context(**kwargs, http_credentials=_http_credentials)

    return [browser, context]


def close_browser(browser, page):
    if page.get_by_role("button", name="Log out").is_visible():
        page.get_by_role("button", name="Log out").click()
    page.close()
    browser.close()


@pytest.hookimpl(tryfirst=True)
def pytest_sessionstart(session):
    with open(audit_log_paths.TEST_LEVEL_LOG, file_mode.APPEND) as log_file:
        log_file.write(f"Test Session Started: {datetime.now()}\n")


@pytest.hookimpl(trylast=True)
def pytest_sessionfinish(session, exitstatus):
    with open(audit_log_paths.TEST_LEVEL_LOG, file_mode.APPEND) as log_file:
        log_file.write(f"Test Session Ended: {datetime.now()}\n")


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_logreport(report):
    yield

    if report.when == "call":  # Log only actual test results
        test_name = report.nodeid
        test_result = report.outcome.upper()  # 'passed', 'failed', or 'skipped'
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        with open(audit_log_paths.TEST_LEVEL_LOG, file_mode.APPEND) as log_file:
            log_file.write(f"{timestamp} | {test_name} | {test_result}\n")
