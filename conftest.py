import pytest
from playwright.sync_api import sync_playwright

from libs import CurrentExecution as ce
from libs import file_ops as fo
from libs.generic_constants import fixture_scope
from libs.mavis_constants import browsers_and_devices, playwright_constants
from libs.wrappers import *


def pytest_addoption(parser):
    parser.addoption("--browser_or_device", action="store", default=browsers_and_devices.CHROMIUM)


@pytest.fixture(scope=fixture_scope.SESSION)
def start_playwright_session(request):
    ce.get_env_values()
    ce.reset_environment()
    ce.current_browser_name = request.config.getoption("browser_or_device")
    ce.session_screenshots_dir = create_session_screenshot_dir()
    with sync_playwright() as _playwright:
        _playwright.selectors.set_test_id_attribute(playwright_constants.TEST_ID_ATTRIBUTE)
        yield _playwright
    # ce.reset_environment()  # Clean up the environment after execution


@pytest.fixture(scope=fixture_scope.FUNCTION)
def start_mavis(start_playwright_session):
    _browser, _context = start_browser(pw=start_playwright_session, browser_or_device=ce.current_browser_name)
    ce.browser = _browser
    ce.page = _context.new_page()
    ce.page.set_default_timeout(playwright_constants.DEFAULT_TIMEOUT)
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
            case browsers_and_devices.IPHONE_14:
                _browser = pw.webkit.launch(headless=ce.headless_mode, slow_mo=ce.slow_motion)
                _context = _browser.new_context(**pw.devices["iPhone 14"], http_credentials=_http_credentials)
            case browsers_and_devices.IPHONE_15:
                _browser = pw.chromium.launch(channel="chrome", headless=ce.headless_mode, slow_mo=ce.slow_motion)
                _context = _browser.new_context(**pw.devices["iPhone 15"], http_credentials=_http_credentials)
            case browsers_and_devices.IPAD_7:
                _browser = pw.chromium.launch(headless=ce.headless_mode, slow_mo=ce.slow_motion)
                _context = _browser.new_context(
                    **pw.devices["iPad (gen 7) landscape"], http_credentials=_http_credentials
                )
            case browsers_and_devices.PIXEL_5:
                _browser = pw.webkit.launch(headless=ce.headless_mode, slow_mo=ce.slow_motion)
                _context = _browser.new_context(**pw.devices["Pixel 5"], http_credentials=_http_credentials)
            case browsers_and_devices.GALAXY_S9_PLUS:
                _browser = pw.chromium.launch(channel="chromium", headless=ce.headless_mode, slow_mo=ce.slow_motion)
                _context = _browser.new_context(**pw.devices["Galaxy S9+"], http_credentials=_http_credentials)
            case browsers_and_devices.CHROME:
                _browser = pw.chromium.launch(channel="chrome", headless=ce.headless_mode, slow_mo=ce.slow_motion)
                _context = _browser.new_context(http_credentials=_http_credentials)
            case browsers_and_devices.MSEDGE:
                _browser = pw.chromium.launch(channel="msedge", headless=ce.headless_mode, slow_mo=ce.slow_motion)
                _context = _browser.new_context(http_credentials=_http_credentials)
            case browsers_and_devices.FIREFOX:
                _browser = pw.firefox.launch(headless=ce.headless_mode, slow_mo=ce.slow_motion)
                _context = _browser.new_context(http_credentials=_http_credentials)
            case _:  # Desktop Chromium for all other cases
                _browser = pw.chromium.launch(headless=ce.headless_mode, slow_mo=ce.slow_motion)
                _context = _browser.new_context(http_credentials=_http_credentials)
        return _browser, _context
    except Exception as e:
        raise AssertionError(f"Error launching {browser_or_device}: {e}")


def close_browser(browser, page):
    if page.get_by_role("button", name="Log out").is_visible():
        page.get_by_role("button", name="Log out").click()
    page.close()
    browser.close()
