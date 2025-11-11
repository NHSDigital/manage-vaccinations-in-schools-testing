import pytest
from playwright.sync_api import Page

from mavis.test.data import TestData
from mavis.test.pages import (
    AddBatchPage,
    ArchiveBatchPage,
    ArchiveConsentResponsePage,
    ChildActivityLogPage,
    ChildArchivePage,
    ChildEditPage,
    ChildRecordPage,
    ChildrenSearchPage,
    ConsentResponsePage,
    CreateNewRecordConsentResponsePage,
    DashboardPage,
    DownloadSchoolMovesPage,
    EditBatchPage,
    EditVaccinationRecordPage,
    FlipperPage,
    ImportRecordsJourney,
    ImportsPage,
    LogInPage,
    LogOutPage,
    MatchConsentResponsePage,
    OnlineConsentPage,
    ProgrammeChildrenPage,
    ProgrammeOverviewPage,
    ProgrammeSessionsPage,
    ProgrammesListPage,
    ReportsDownloadPage,
    ReportsVaccinationsPage,
    ReviewSchoolMovePage,
    SchoolMovesPage,
    SessionsPage,
    StartPage,
    TeamPage,
    UnmatchedConsentResponsesPage,
    VaccinationRecordPage,
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
def child_activity_log_page(page: Page) -> ChildActivityLogPage:
    return ChildActivityLogPage(page)


@pytest.fixture
def child_archive_page(page: Page) -> ChildArchivePage:
    return ChildArchivePage(page)


@pytest.fixture
def child_record_page(page: Page) -> ChildRecordPage:
    return ChildRecordPage(page)


@pytest.fixture
def child_edit_page(page: Page) -> ChildEditPage:
    return ChildEditPage(page)


@pytest.fixture
def children_search_page(page: Page) -> ChildrenSearchPage:
    return ChildrenSearchPage(page)


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
def edit_vaccination_record_page(page: Page) -> EditVaccinationRecordPage:
    return EditVaccinationRecordPage(page)


@pytest.fixture
def flipper_page(page: Page) -> FlipperPage:
    return FlipperPage(page)


@pytest.fixture
def imports_page(page: Page) -> ImportsPage:
    return ImportsPage(page)


@pytest.fixture
def import_records_journey(page: Page, test_data: TestData) -> ImportRecordsJourney:
    return ImportRecordsJourney(page, test_data)


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
def programmes_list_page(page: Page) -> ProgrammesListPage:
    return ProgrammesListPage(page)


@pytest.fixture
def programme_overview_page(page: Page, test_data: TestData) -> ProgrammeOverviewPage:
    return ProgrammeOverviewPage(page, test_data)


@pytest.fixture
def programme_sessions_page(page: Page) -> ProgrammeSessionsPage:
    return ProgrammeSessionsPage(page)


@pytest.fixture
def programme_children_page(page: Page) -> ProgrammeChildrenPage:
    return ProgrammeChildrenPage(page)


@pytest.fixture
def reports_download_page(page: Page) -> ReportsDownloadPage:
    return ReportsDownloadPage(page)


@pytest.fixture
def reports_vaccinations_page(page: Page) -> ReportsVaccinationsPage:
    return ReportsVaccinationsPage(page)


@pytest.fixture
def review_school_move_page(page: Page) -> ReviewSchoolMovePage:
    return ReviewSchoolMovePage(page)


@pytest.fixture
def school_moves_page(page: Page) -> SchoolMovesPage:
    return SchoolMovesPage(page)


@pytest.fixture
def sessions_page(page: Page) -> SessionsPage:
    return SessionsPage(page)


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
def vaccination_record_page(page: Page) -> VaccinationRecordPage:
    return VaccinationRecordPage(page)


@pytest.fixture
def vaccines_page(page: Page) -> VaccinesPage:
    return VaccinesPage(page)


@pytest.fixture
def verbal_consent_page(page: Page) -> VerbalConsentPage:
    return VerbalConsentPage(page)


@pytest.fixture
def log_out_page(page: Page) -> LogOutPage:
    return LogOutPage(page)
