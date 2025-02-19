import pytest
from playwright.sync_api import sync_playwright

from libs import CurrentExecution as ce
from libs import file_ops as fo
from libs.wrappers import *


def pytest_addoption(parser):
    parser.addoption("--browser_or_device", action="store", default="chromium")


@pytest.fixture(scope="session")
def start_playwright_session(request):
    ce.get_env_values()
    ce.reset_environment()
    ce.current_browser_name = request.config.getoption("browser_or_device")
    ce.session_screenshots_dir = create_session_screenshot_dir()
    with sync_playwright() as _playwright:
        _playwright.selectors.set_test_id_attribute("data-qa")
        yield _playwright
    # ce.reset_environment()  # Clean up the environment after execution


@pytest.fixture(scope="function")
def start_mavis(start_playwright_session):
    _browser, _context = start_browser(pw=start_playwright_session, browser_or_device=ce.current_browser_name)
    ce.browser = _browser
    ce.page = _context.new_page()
    ce.page.goto(url=ce.service_url)
    yield
    close_browser(browser=_browser, page=ce.page)


def create_session_screenshot_dir() -> str:
    if ce.capture_screenshot_flag:
        _session_name = f"{get_current_datetime()}-{ce.current_browser_name}"
        fo.file_operations().create_dir(dir_path=f"screenshots/{_session_name}")
        return f"screenshots/{_session_name}"


def start_browser(pw, browser_or_device: str):
    _http_credentials = {
        "username": ce.base_auth_username,
        "password": ce.base_auth_password,
    }
    try:
        match browser_or_device.lower():
            case "iphone_14":
                _browser = pw.webkit.launch(headless=ce.headless_mode)
                _context = _browser.new_context(**pw.devices["iPhone 14"], http_credentials=_http_credentials)
            case "iphone_15":
                _browser = pw.chromium.launch(channel="chrome", headless=ce.headless_mode)
                _context = _browser.new_context(**pw.devices["iPhone 15"], http_credentials=_http_credentials)
            case "ipad_7":
                _browser = pw.chromium.launch(headless=ce.headless_mode)
                _context = _browser.new_context(
                    **pw.devices["iPad (gen 7) landscape"], http_credentials=_http_credentials
                )
            case "pixel_5":
                _browser = pw.webkit.launch(headless=ce.headless_mode)
                _context = _browser.new_context(**pw.devices["Pixel 5"], http_credentials=_http_credentials)
            case "s9+":
                _browser = pw.chromium.launch(channel="chromium", headless=ce.headless_mode)
                _context = _browser.new_context(**pw.devices["Galaxy S9+"], http_credentials=_http_credentials)
            case "chrome":
                _browser = pw.chromium.launch(channel="chrome", headless=ce.headless_mode)
                _context = _browser.new_context(http_credentials=_http_credentials)
            case "msedge":
                _browser = pw.chromium.launch(channel="msedge", headless=ce.headless_mode)
                _context = _browser.new_context(http_credentials=_http_credentials)
            case "firefox":
                _browser = pw.firefox.launch(headless=ce.headless_mode)
                _context = _browser.new_context(http_credentials=_http_credentials)
            case _:  # Desktop Chromium for all other cases
                _browser = pw.chromium.launch(headless=ce.headless_mode)
                _context = _browser.new_context(http_credentials=_http_credentials)
        return _browser, _context
    except Exception as e:
        raise AssertionError(f"Error launching {browser_or_device}: {e}")


def close_browser(browser, page):
    if page.get_by_role("button", name="Log out").is_visible():
        page.get_by_role("button", name="Log out").click()
    page.close()
    browser.close()
