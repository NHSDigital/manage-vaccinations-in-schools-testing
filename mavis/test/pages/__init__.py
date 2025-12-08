from .children import (
    ChildActivityLogPage,
    ChildArchivePage,
    ChildEditPage,
    ChildRecordPage,
    ChildrenSearchPage,
)
from .dashboard_page import DashboardPage
from .error_pages import BadRequestPage, ServiceErrorPage
from .flipper_page import FlipperPage
from .imports import ImportRecordsWizardPage, ImportsPage
from .log_in_page import LogInPage
from .log_out_page import LogOutPage
from .online_consent_wizard_page import OnlineConsentWizardPage
from .programmes import (
    ProgrammeChildrenPage,
    ProgrammeOverviewPage,
    ProgrammeSessionsPage,
    ProgrammesListPage,
)
from .reports import ReportsDownloadPage, ReportsVaccinationsPage
from .school_moves import DownloadSchoolMovesPage, ReviewSchoolMovePage, SchoolMovesPage
from .schools import SchoolsChildrenPage, SchoolsSearchPage, SchoolsSessionsPage
from .sessions import (
    GillickCompetencePage,
    NurseConsentWizardPage,
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
)
from .start_page import StartPage
from .team_page import TeamPage
from .unmatched_responses import (
    ArchiveConsentResponsePage,
    ConsentResponsePage,
    CreateNewRecordConsentResponsePage,
    MatchConsentResponsePage,
    UnmatchedConsentResponsesPage,
)
from .vaccination_record import EditVaccinationRecordPage, VaccinationRecordPage
from .vaccines import AddBatchPage, ArchiveBatchPage, EditBatchPage, VaccinesPage

__all__ = [
    "AddBatchPage",
    "ArchiveBatchPage",
    "ArchiveConsentResponsePage",
    "BadRequestPage",
    "ChildActivityLogPage",
    "ChildArchivePage",
    "ChildEditPage",
    "ChildRecordPage",
    "ChildrenSearchPage",
    "ConsentResponsePage",
    "CreateNewRecordConsentResponsePage",
    "DashboardPage",
    "DownloadSchoolMovesPage",
    "EditBatchPage",
    "EditVaccinationRecordPage",
    "FlipperPage",
    "GillickCompetencePage",
    "ImportRecordsWizardPage",
    "ImportsPage",
    "LogInPage",
    "LogOutPage",
    "MatchConsentResponsePage",
    "NurseConsentWizardPage",
    "OnlineConsentWizardPage",
    "ProgrammeChildrenPage",
    "ProgrammeOverviewPage",
    "ProgrammeSessionsPage",
    "ProgrammesListPage",
    "ReportsDownloadPage",
    "ReportsVaccinationsPage",
    "ReviewSchoolMovePage",
    "SchoolMovesPage",
    "SchoolsChildrenPage",
    "SchoolsSearchPage",
    "SchoolsSessionsPage",
    "ServiceErrorPage",
    "SessionsChildrenPage",
    "SessionsEditPage",
    "SessionsOverviewPage",
    "SessionsPatientPage",
    "SessionsPatientSessionActivityPage",
    "SessionsPsdPage",
    "SessionsRecordVaccinationsPage",
    "SessionsRegisterPage",
    "SessionsSearchPage",
    "SessionsVaccinationWizardPage",
    "StartPage",
    "TeamPage",
    "UnmatchedConsentResponsesPage",
    "VaccinationRecordPage",
    "VaccinesPage",
]
