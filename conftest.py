from datetime import datetime
import os
import pathlib
import time
import urllib.parse


import pytest
from playwright.sync_api import sync_playwright
import requests
from requests.auth import HTTPBasicAuth


from libs import CurrentExecution as ce
from libs.mavis_constants import playwright_constants
from libs.generic_constants import audit_log_paths
from libs.wrappers import get_current_datetime


def pytest_addoption(parser):
    parser.addoption("--browser", default="chromium")
    parser.addoption("--browser-channel", default=None)
    parser.addoption("--device", default=None)
    parser.addoption("--slowmo", type=int, default=0)
    parser.addoption("--headed", action="store_true", default="CI" not in os.environ)
    parser.addoption("--skip-reset", action="store_true", default=False)


ce.get_env_values()


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
def browser_name(request):
    return request.config.getoption("browser")


@pytest.fixture(scope="session")
def browser_channel(request):
    return request.config.getoption("browser_channel")


@pytest.fixture(scope="session")
def device(request):
    return request.config.getoption("device")


@pytest.fixture(scope="session")
def headed(request) -> bool:
    return request.config.getoption("headed")


@pytest.fixture(scope="session")
def slow_mo(request) -> int:
    return request.config.getoption("slowmo")


@pytest.fixture(scope="session")
def reset_endpoint(base_url) -> str:
    return urllib.parse.urljoin(base_url, os.environ["RESET_ENDPOINT"])


@pytest.fixture(scope="session")
def skip_reset(request) -> bool:
    return request.config.getoption("skip_reset")


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
def start_playwright_session(request, browser_name, reset_environment):
    reset_environment()

    ce.session_screenshots_dir = create_session_screenshot_dir(browser_name)

    with sync_playwright() as _playwright:
        _playwright.selectors.set_test_id_attribute(
            playwright_constants.TEST_ID_ATTRIBUTE
        )
        yield _playwright


@pytest.fixture(scope="function")
def start_mavis(
    start_playwright_session,
    base_url,
    basic_auth,
    browser_name,
    browser_channel,
    device,
    headed,
    slow_mo,
):
    _browser, _context = start_browser(
        start_playwright_session,
        base_url,
        basic_auth,
        browser_name,
        browser_channel,
        device,
        headed,
        slow_mo,
    )

    ce.browser = _browser
    ce.page = _context.new_page()
    # ce.page.set_default_timeout(playwright_constants.DEFAULT_TIMEOUT)
    ce.page.goto("/")

    yield
    close_browser(browser=_browser, page=ce.page)


def create_session_screenshot_dir(browser_name: str) -> str:
    if ce.capture_screenshot_flag:
        session_name = f"{get_current_datetime()}-{browser_name}"
        path = pathlib.Path("screenshots") / session_name
        path.mkdir(parents=True, exist_ok=True)
        return str(path)
    else:
        return ""


def start_browser(
    playwright,
    base_url,
    basic_auth,
    browser_name,
    browser_channel,
    device,
    headed,
    slow_mo,
):
    browser_type = getattr(playwright, browser_name)
    browser = browser_type.launch(
        channel=browser_channel, headless=not headed, slow_mo=slow_mo
    )

    kwargs = {}
    if device:
        kwargs = playwright.devices[device]

    context = browser.new_context(
        **kwargs, base_url=base_url, http_credentials=basic_auth
    )

    return [browser, context]


def close_browser(browser, page):
    if page.get_by_role("button", name="Log out").is_visible():
        page.get_by_role("button", name="Log out").click()
    page.close()
    browser.close()


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
