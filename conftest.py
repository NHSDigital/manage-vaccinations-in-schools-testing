import pytest
from libs import CurrentExecution as ce
from libs import file_ops as fo
from datetime import datetime


@pytest.fixture(scope="session")
def start_exe_session():
    ce.execution_start_time = datetime.now()
    ce.get_env_values()
    ce.session_screenshots_dir = create_session_screenshot_dir()
    ce.start_browser()
    yield
    ce.quit_browser()
    ce.execution_end_time = datetime.now()
    ce.execution_duration = ce.execution_end_time - ce.execution_start_time


@pytest.fixture
def create_browser_page(start_exe_session):
    ce.start_test()
    yield ce.page
    ce.end_test()


def create_session_screenshot_dir() -> str:
    if ce.capture_screenshot_flag:
        _start_time = str(ce.execution_start_time).replace("-", "").replace(" ", "").replace(":", "").split(".")[0]
        _session_name = f"Execution-{_start_time}"
        fo.file_operations().create_dir(dir_path=f"screenshots/{_session_name}")
        return f"screenshots/{_session_name}"
