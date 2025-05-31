import pytest

from .data import TestData
from .hooks import pytest_runtest_logreport, pytest_sessionfinish, pytest_sessionstart
from .fixtures import (
    base_url,
    basic_auth,
    browser_context_args,
    children_page,
    consent_page,
    dashboard_page,
    import_records_page,
    log_in_page,
    playwright_operations,
    programmes_page,
    school_moves_page,
    screenshots_path,
    sessions_page,
    start_page,
    unmatched_page,
    vaccines_page,
)
from .onboarding import (
    admin,
    clinics,
    nurse,
    onboard,
    onboarding,
    organisation,
    reset,
    schools,
    superuser,
    team,
    users,
)


__all__ = [
    "admin",
    "base_url",
    "basic_auth",
    "browser_context_args",
    "children_page",
    "clinics",
    "consent_page",
    "dashboard_page",
    "import_records_page",
    "log_in_page",
    "nurse",
    "onboard",
    "onboarding",
    "organisation",
    "playwright_operations",
    "programmes_page",
    "pytest_runtest_logreport",
    "pytest_sessionfinish",
    "pytest_sessionstart",
    "reset",
    "school_moves_page",
    "schools",
    "screenshots_path",
    "sessions_page",
    "start_page",
    "superuser",
    "team",
    "unmatched_page",
    "users",
    "vaccines_page",
]


@pytest.fixture(scope="session")
def test_data(organisation, schools):
    return TestData(organisation, schools)
