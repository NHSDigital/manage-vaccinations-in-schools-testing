import pytest

from ..pages import (
    AddBatchPage,
    ArchiveBatchPage,
    ArchiveConsentResponsePage,
    ChildrenPage,
    ConsentPage,
    ConsentResponsePage,
    CreateNewRecordConsentResponsePage,
    DashboardPage,
    DownloadSchoolMovesPage,
    EditBatchPage,
    ImportRecordsPage,
    LogInPage,
    MatchConsentResponsePage,
    ProgrammesPage,
    ReviewSchoolMovePage,
    SchoolMovesPage,
    SessionsPage,
    StartPage,
    UnmatchedConsentResponsesPage,
    VaccinesPage,
)


@pytest.fixture
def add_batch_page(page):
    return AddBatchPage(page)


@pytest.fixture
def archive_batch_page(page):
    return ArchiveBatchPage(page)


@pytest.fixture
def archive_consent_response_page(page):
    return ArchiveConsentResponsePage(page)


@pytest.fixture
def children_page(page, test_data):
    return ChildrenPage(page, test_data)


@pytest.fixture
def consent_page(page):
    return ConsentPage(page)


@pytest.fixture
def consent_response_page(page):
    return ConsentResponsePage(page)


@pytest.fixture
def create_new_record_consent_response_page(page):
    return CreateNewRecordConsentResponsePage(page)


@pytest.fixture
def dashboard_page(page):
    return DashboardPage(page)


@pytest.fixture
def download_school_moves_page(page):
    return DownloadSchoolMovesPage(page)


@pytest.fixture
def edit_batch_page(page):
    return EditBatchPage(page)


@pytest.fixture
def import_records_page(test_data, page):
    return ImportRecordsPage(test_data, page)


@pytest.fixture
def log_in_page(page):
    return LogInPage(page)


@pytest.fixture
def match_consent_response_page(page):
    return MatchConsentResponsePage(page)


@pytest.fixture
def programmes_page(page, test_data):
    return ProgrammesPage(page, test_data)


@pytest.fixture
def review_school_move_page(page):
    return ReviewSchoolMovePage(page)


@pytest.fixture
def school_moves_page(page):
    return SchoolMovesPage(page)


@pytest.fixture
def sessions_page(
    test_data,
    page,
):
    return SessionsPage(
        test_data,
        page,
    )


@pytest.fixture
def start_page(page):
    return StartPage(page)


@pytest.fixture
def unmatched_consent_responses_page(page):
    return UnmatchedConsentResponsesPage(page)


@pytest.fixture
def vaccines_page(page):
    return VaccinesPage(page)
