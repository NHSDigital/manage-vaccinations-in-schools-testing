import pytest

from ..models import (
    ChildrenPage,
    ConsentPage,
    DashboardPage,
    ImportRecordsPage,
    LogInPage,
    ProgrammesPage,
    SchoolMovesPage,
    SessionsPage,
    StartPage,
    UnmatchedPage,
    VaccinesPage,
)


@pytest.fixture
def children_page(playwright_operations, dashboard_page):
    return ChildrenPage(playwright_operations, dashboard_page)


@pytest.fixture
def consent_page(playwright_operations):
    return ConsentPage(playwright_operations)


@pytest.fixture
def dashboard_page(page):
    return DashboardPage(page)


@pytest.fixture
def import_records_page(test_data, playwright_operations, dashboard_page):
    return ImportRecordsPage(test_data, playwright_operations, dashboard_page)


@pytest.fixture
def log_in_page(page):
    return LogInPage(page)


@pytest.fixture
def programmes_page(page, test_data, import_records_page):
    return ProgrammesPage(page, test_data, import_records_page)


@pytest.fixture
def school_moves_page(playwright_operations, dashboard_page):
    return SchoolMovesPage(playwright_operations, dashboard_page)


@pytest.fixture
def sessions_page(test_data, playwright_operations, dashboard_page):
    return SessionsPage(test_data, playwright_operations, dashboard_page)


@pytest.fixture
def start_page(page):
    return StartPage(page)


@pytest.fixture
def unmatched_page(playwright_operations, dashboard_page):
    return UnmatchedPage(playwright_operations, dashboard_page)


@pytest.fixture
def vaccines_page(page):
    return VaccinesPage(page)
