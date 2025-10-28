from .children import ChildrenPage
from .consent_responses import (
    ArchiveConsentResponsePage,
    ConsentResponsePage,
    CreateNewRecordConsentResponsePage,
    MatchConsentResponsePage,
    UnmatchedConsentResponsesPage,
)
from .dashboard import DashboardPage
from .flipper import FlipperPage
from .import_records import ImportRecordsPage
from .log_in import LogInPage, LogOutPage
from .online_consent import OnlineConsentPage
from .programmes import (
    ProgrammeChildrenPage,
    ProgrammeOverviewPage,
    ProgrammeSessionsPage,
    ProgrammesListPage,
)
from .school_moves import DownloadSchoolMovesPage, ReviewSchoolMovePage, SchoolMovesPage
from .sessions import SessionsPage
from .start import StartPage
from .team import TeamPage
from .vaccination_record import EditVaccinationRecordPage, VaccinationRecordPage
from .vaccines import AddBatchPage, ArchiveBatchPage, EditBatchPage, VaccinesPage
from .verbal_consent import VerbalConsentPage

__all__ = [
    "AddBatchPage",
    "ArchiveBatchPage",
    "ArchiveConsentResponsePage",
    "ChildrenPage",
    "ConsentResponsePage",
    "CreateNewRecordConsentResponsePage",
    "DashboardPage",
    "DownloadSchoolMovesPage",
    "EditBatchPage",
    "EditVaccinationRecordPage",
    "FlipperPage",
    "ImportRecordsPage",
    "LogInPage",
    "LogOutPage",
    "MatchConsentResponsePage",
    "OnlineConsentPage",
    "ProgrammeChildrenPage",
    "ProgrammeOverviewPage",
    "ProgrammeSessionsPage",
    "ProgrammesListPage",
    "ReviewSchoolMovePage",
    "SchoolMovesPage",
    "SessionsPage",
    "StartPage",
    "TeamPage",
    "UnmatchedConsentResponsesPage",
    "VaccinationRecordPage",
    "VaccinesPage",
    "VerbalConsentPage",
]
