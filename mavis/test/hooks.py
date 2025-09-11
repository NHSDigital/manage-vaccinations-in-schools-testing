from pathlib import Path

import pytest
from _pytest.main import Session
from _pytest.reports import TestReport

from mavis.test.utils import get_current_datetime

path = Path("logs") / "report.log"


@pytest.hookimpl(tryfirst=True)
def pytest_sessionstart(session: Session) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)

    with path.open("a") as file:
        file.write(f"Test Session Started: {get_current_datetime()}\n")


@pytest.hookimpl(trylast=True)
def pytest_sessionfinish(session: Session, exitstatus: int) -> None:
    with path.open("a") as file:
        file.write(f"Test Session Ended: {get_current_datetime()}\n")


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_logreport(report: TestReport):
    yield

    if report.when == "call":  # Log only actual test results
        test_name = report.nodeid
        test_result = report.outcome.upper()  # 'passed', 'failed', or 'skipped'
        timestamp = get_current_datetime().strftime("%Y-%m-%d %H:%M:%S")

        with path.open("a") as file:
            file.write(f"{timestamp} | {test_name} | {test_result}\n")
