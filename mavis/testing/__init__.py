from datetime import datetime

import pytest

from .fixtures import *  # noqa: F403
from mavis.testing.generic_constants import audit_log_paths


def pytest_addoption(parser):
    parser.addoption("--skip-reset", action="store_true", default=False)


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
