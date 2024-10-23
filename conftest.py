from datetime import datetime

import pytest

from libs import CurrentExecution as ce
from libs import file_ops as fo
from libs.constants import workflow_type


def pytest_addoption(parser):
    parser.addoption("--browser_or_device", action="store", default="chromium")


@pytest.fixture(scope="session")
def start_exe_session(request):
    ce.execution_start_time = datetime.now()
    ce.get_env_values()
    _browser_name = request.config.getoption("browser_or_device")
    ce.session_screenshots_dir = create_session_screenshot_dir()
    ce.start_browser(browser_name=_browser_name)
    yield
    ce.quit_browser()
    ce.execution_end_time = datetime.now()
    ce.execution_duration = ce.execution_end_time - ce.execution_start_time


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
        _start_time = str(ce.execution_start_time).replace("-", "").replace(" ", "").replace(":", "").split(".")[0]
        _session_name = f"Execution-{_start_time}"
        fo.file_operations().create_dir(dir_path=f"screenshots/{_session_name}")
        return f"screenshots/{_session_name}"
