import pytest

from libs import CurrentExecution as ce
from libs import file_ops as fo
from libs.constants import workflow_type
from libs.wrappers import *


def pytest_addoption(parser):
    parser.addoption("--browser_or_device", action="store", default="chromium")


@pytest.fixture(scope="session")
def start_exe_session(request):
    _browser_name = request.config.getoption("browser_or_device")
    ce.current_browser_name = _browser_name
    ce.get_env_values()
    ce.session_screenshots_dir = create_session_screenshot_dir()
    ce.start_browser(browser_name=_browser_name)
    yield
    ce.quit_browser()


@pytest.fixture
def create_browser_page(start_exe_session):
    ce.start_test(w_type=workflow_type.APPLICATION)
    yield ce.page
    ce.end_test()


@pytest.fixture
def start_consent_workflow(start_exe_session):
    ce.start_test(w_type=workflow_type.PARENTAL_CONSENT)
    yield ce.page
    ce.end_test()


def create_session_screenshot_dir() -> str:
    if ce.capture_screenshot_flag:
        _session_name = f"{get_new_datetime()}-{ce.current_browser_name}"
        fo.file_operations().create_dir(dir_path=f"screenshots/{_session_name}")
        return f"screenshots/{_session_name}"
