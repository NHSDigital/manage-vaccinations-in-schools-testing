import pytest
from playwright.sync_api import Page

from mavis.test.data import TestData
from mavis.test.pages import (
    AddBatchPage,
    ArchiveBatchPage,
    ArchiveConsentResponsePage,
    ChildrenPage,
    ConsentResponsePage,
    CreateNewRecordConsentResponsePage,
    DashboardPage,
    DownloadSchoolMovesPage,
    EditBatchPage,
    FlipperPage,
    ImportRecordsPage,
    LogInPage,
    LogOutPage,
    MatchConsentResponsePage,
    OnlineConsentPage,
    ProgrammesPage,
    ReviewSchoolMovePage,
    SchoolMovesPage,
    SessionsPage,
    StartPage,
    TeamPage,
    UnmatchedConsentResponsesPage,
    VaccinesPage,
    VerbalConsentPage,
)


@pytest.fixture
def add_batch_page(page: Page) -> AddBatchPage:
    return AddBatchPage(page)


@pytest.fixture
def archive_batch_page(page: Page) -> ArchiveBatchPage:
    return ArchiveBatchPage(page)


@pytest.fixture
def archive_consent_response_page(page: Page) -> ArchiveConsentResponsePage:
    return ArchiveConsentResponsePage(page)


@pytest.fixture
def children_page(page: Page, test_data: TestData) -> ChildrenPage:
    return ChildrenPage(page, test_data)


@pytest.fixture
def consent_response_page(page: Page) -> ConsentResponsePage:
    return ConsentResponsePage(page)


@pytest.fixture
def create_new_record_consent_response_page(
    page: Page,
) -> CreateNewRecordConsentResponsePage:
    return CreateNewRecordConsentResponsePage(page)


@pytest.fixture
def dashboard_page(page: Page) -> DashboardPage:
    return DashboardPage(page)


@pytest.fixture
def download_school_moves_page(page: Page) -> DownloadSchoolMovesPage:
    return DownloadSchoolMovesPage(page)


@pytest.fixture
def edit_batch_page(page: Page) -> EditBatchPage:
    return EditBatchPage(page)


@pytest.fixture
def flipper_page(page: Page) -> FlipperPage:
    return FlipperPage(page)


@pytest.fixture
def import_records_page(page: Page, test_data: TestData) -> ImportRecordsPage:
    return ImportRecordsPage(page, test_data)


@pytest.fixture
def log_in_page(page: Page) -> LogInPage:
    return LogInPage(page)


@pytest.fixture
def match_consent_response_page(page: Page) -> MatchConsentResponsePage:
    return MatchConsentResponsePage(page)


@pytest.fixture
def online_consent_page(page: Page) -> OnlineConsentPage:
    return OnlineConsentPage(page)


@pytest.fixture
def programmes_page(page: Page, test_data: TestData) -> ProgrammesPage:
    return ProgrammesPage(page, test_data)


@pytest.fixture
def review_school_move_page(page: Page) -> ReviewSchoolMovePage:
    return ReviewSchoolMovePage(page)


@pytest.fixture
def school_moves_page(page: Page) -> SchoolMovesPage:
    return SchoolMovesPage(page)


@pytest.fixture
def sessions_page(page: Page, test_data: TestData) -> SessionsPage:
    return SessionsPage(page, test_data)


@pytest.fixture
def start_page(page: Page) -> StartPage:
    return StartPage(page)


@pytest.fixture
def team_page(page: Page) -> TeamPage:
    return TeamPage(page)


@pytest.fixture
def unmatched_consent_responses_page(page: Page) -> UnmatchedConsentResponsesPage:
    return UnmatchedConsentResponsesPage(page)


@pytest.fixture
def vaccines_page(page: Page) -> VaccinesPage:
    return VaccinesPage(page)


@pytest.fixture
def verbal_consent_page(page: Page) -> VerbalConsentPage:
    return VerbalConsentPage(page)


@pytest.fixture
def log_out_page(page: Page) -> LogOutPage:
    return LogOutPage(page)
