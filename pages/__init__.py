import pytest

from .children import ChildrenPage
from .consent_doubles import ConsentDoublesPage
from .consent_hpv import ConsentHPVPage
from .dashboard import DashboardPage
from .import_records import ImportRecordsPage
from .login import LoginPage
from .programmes import ProgrammesPage
from .school_moves import SchoolMovesPage
from .sessions import SessionsPage
from .unmatched import UnmatchedPage
from .vaccines import VaccinesPage


@pytest.fixture
def children_page():
    return ChildrenPage()


@pytest.fixture
def consent_doubles_page():
    return ConsentDoublesPage()


@pytest.fixture
def consent_hpv_page():
    return ConsentHPVPage()


@pytest.fixture
def dashboard_page():
    return DashboardPage()


@pytest.fixture
def import_records_page():
    return ImportRecordsPage()


@pytest.fixture
def login_page():
    return LoginPage()


@pytest.fixture
def programmes_page():
    return ProgrammesPage()


@pytest.fixture
def school_moves_page():
    return SchoolMovesPage()


@pytest.fixture
def sessions_page():
    return SessionsPage()


@pytest.fixture
def unmatched_page():
    return UnmatchedPage()


@pytest.fixture
def vaccines_page():
    return VaccinesPage()
