import pytest

from .children import ChildrenPage
from .consent import ConsentPage
from .dashboard import DashboardPage
from .import_records import ImportRecordsPage
from .login import LoginPage
from .programmes import ProgrammesPage
from .school_moves import SchoolMovesPage
from .sessions import SessionsPage
from .start import StartPage
from .unmatched import UnmatchedPage
from .vaccines import VaccinesPage


@pytest.fixture
def children_page(playwright_operations):
    return ChildrenPage(playwright_operations)


@pytest.fixture
def consent_page(playwright_operations):
    return ConsentPage(playwright_operations)


@pytest.fixture
def dashboard_page(playwright_operations):
    return DashboardPage(playwright_operations)


@pytest.fixture
def import_records_page(playwright_operations):
    return ImportRecordsPage(playwright_operations)


@pytest.fixture
def login_page(playwright_operations):
    return LoginPage(playwright_operations)


@pytest.fixture
def programmes_page(playwright_operations):
    return ProgrammesPage(playwright_operations)


@pytest.fixture
def school_moves_page(playwright_operations):
    return SchoolMovesPage(playwright_operations)


@pytest.fixture
def sessions_page(playwright_operations):
    return SessionsPage(playwright_operations)


@pytest.fixture
def start_page(page):
    return StartPage(page)


@pytest.fixture
def unmatched_page(playwright_operations):
    return UnmatchedPage(playwright_operations)


@pytest.fixture
def vaccines_page(playwright_operations):
    return VaccinesPage(playwright_operations)
