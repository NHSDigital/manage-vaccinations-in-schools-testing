from datetime import datetime
from pathlib import Path

import pytest


path = Path("logs") / "report.log"


@pytest.hookimpl(tryfirst=True)
def pytest_sessionstart(session):
    path.parent.mkdir(parents=True, exist_ok=True)

    with path.open("a") as file:
        file.write(f"Test Session Started: {datetime.now()}\n")


@pytest.hookimpl(trylast=True)
def pytest_sessionfinish(session, exitstatus):
    with path.open("a") as file:
        file.write(f"Test Session Ended: {datetime.now()}\n")


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_logreport(report):
    yield

    if report.when == "call":  # Log only actual test results
        test_name = report.nodeid
        test_result = report.outcome.upper()  # 'passed', 'failed', or 'skipped'
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        with path.open("a") as file:
            file.write(f"{timestamp} | {test_name} | {test_result}\n")
