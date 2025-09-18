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
from .log_in import LogInPage
from .online_consent import OnlineConsentPage
from .programmes import ProgrammesPage
from .school_moves import DownloadSchoolMovesPage, ReviewSchoolMovePage, SchoolMovesPage
from .sessions import SessionsPage
from .start import StartPage
from .team import TeamPage
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
    "FlipperPage",
    "ImportRecordsPage",
    "LogInPage",
    "MatchConsentResponsePage",
    "OnlineConsentPage",
    "ProgrammesPage",
    "ReviewSchoolMovePage",
    "SchoolMovesPage",
    "SessionsPage",
    "StartPage",
    "TeamPage",
    "UnmatchedConsentResponsesPage",
    "VaccinesPage",
    "VerbalConsentPage",
]
