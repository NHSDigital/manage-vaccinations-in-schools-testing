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
    GillickCompetencePage,
    ImportRecordsWizardPage,
    ImportsPage,
    LogInPage,
    LogOutPage,
    MatchConsentResponsePage,
    NurseConsentWizardPage,
    OnlineConsentWizardPage,
    ProgrammeChildrenPage,
    ProgrammeOverviewPage,
    ProgrammeSessionsPage,
    ProgrammesListPage,
    ReportsDownloadPage,
    ReportsVaccinationsPage,
    ReviewSchoolMovePage,
    SchoolMovesPage,
    SessionsChildrenPage,
    SessionsEditPage,
    SessionsOverviewPage,
    SessionsPatientPage,
    SessionsPatientSessionActivityPage,
    SessionsPsdPage,
    SessionsRecordVaccinationsPage,
    SessionsRegisterPage,
    SessionsSearchPage,
    SessionsVaccinationWizardPage,
    StartPage,
    TeamPage,
    UnmatchedConsentResponsesPage,
    VaccinationRecordPage,
    VaccinesPage,
)
from mavis.test.pages.error_pages import BadRequestPage, ServiceErrorPage


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
def gillick_competence_page(page: Page) -> GillickCompetencePage:
    return GillickCompetencePage(page)


@pytest.fixture
def imports_page(page: Page) -> ImportsPage:
    return ImportsPage(page)


@pytest.fixture
def import_records_wizard_page(
    page: Page, test_data: TestData
) -> ImportRecordsWizardPage:
    return ImportRecordsWizardPage(page, test_data)


@pytest.fixture
def log_in_page(page: Page) -> LogInPage:
    return LogInPage(page)


@pytest.fixture
def match_consent_response_page(page: Page) -> MatchConsentResponsePage:
    return MatchConsentResponsePage(page)


@pytest.fixture
def online_consent_wizard_page(page: Page) -> OnlineConsentWizardPage:
    return OnlineConsentWizardPage(page)


@pytest.fixture
def programmes_list_page(page: Page) -> ProgrammesListPage:
    return ProgrammesListPage(page)


@pytest.fixture
def programme_overview_page(page: Page) -> ProgrammeOverviewPage:
    return ProgrammeOverviewPage(page)


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
def sessions_psd_page(page: Page) -> SessionsPsdPage:
    return SessionsPsdPage(page)


@pytest.fixture
def sessions_search_page(page: Page) -> SessionsSearchPage:
    return SessionsSearchPage(page)


@pytest.fixture
def sessions_overview_page(page: Page) -> SessionsOverviewPage:
    return SessionsOverviewPage(page)


@pytest.fixture
def sessions_edit_page(page: Page) -> SessionsEditPage:
    return SessionsEditPage(page)


@pytest.fixture
def sessions_children_page(page: Page) -> SessionsChildrenPage:
    return SessionsChildrenPage(page)


@pytest.fixture
def sessions_register_page(page: Page) -> SessionsRegisterPage:
    return SessionsRegisterPage(page)


@pytest.fixture
def sessions_record_vaccinations_page(page: Page) -> SessionsRecordVaccinationsPage:
    return SessionsRecordVaccinationsPage(page)


@pytest.fixture
def sessions_patient_page(page: Page) -> SessionsPatientPage:
    return SessionsPatientPage(page)


@pytest.fixture
def sessions_patient_session_activity_page(
    page: Page,
) -> SessionsPatientSessionActivityPage:
    return SessionsPatientSessionActivityPage(page)


@pytest.fixture
def sessions_vaccination_wizard_page(page: Page) -> SessionsVaccinationWizardPage:
    return SessionsVaccinationWizardPage(page)


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
def nurse_consent_wizard_page(page: Page) -> NurseConsentWizardPage:
    return NurseConsentWizardPage(page)


@pytest.fixture
def log_out_page(page: Page) -> LogOutPage:
    return LogOutPage(page)


@pytest.fixture
def service_error_page(page: Page) -> ServiceErrorPage:
    return ServiceErrorPage(page)


@pytest.fixture
def bad_request_page(page: Page) -> BadRequestPage:
    return BadRequestPage(page)
