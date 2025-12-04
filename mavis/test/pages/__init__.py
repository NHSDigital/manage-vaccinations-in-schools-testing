from .children import (
    ChildActivityLogPage,
    ChildArchivePage,
    ChildEditPage,
    ChildRecordPage,
    ChildrenSearchPage,
)
from .dashboard import DashboardPage
from .error_pages import BadRequestPage, ServiceErrorPage
from .flipper import FlipperPage
from .imports import ImportRecordsWizardPage, ImportsPage
from .log_in import LogInPage
from .log_out import LogOutPage
from .online_consent import OnlineConsentWizardPage
from .programmes import (
    ProgrammeChildrenPage,
    ProgrammeOverviewPage,
    ProgrammeSessionsPage,
    ProgrammesListPage,
)
from .reports import ReportsDownloadPage, ReportsVaccinationsPage
from .school_moves import DownloadSchoolMovesPage, ReviewSchoolMovePage, SchoolMovesPage
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
from .start import StartPage
from .team import TeamPage
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
