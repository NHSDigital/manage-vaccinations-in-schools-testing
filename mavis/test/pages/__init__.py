from .children import ChildrenPage
from .consent import ConsentPage
from .dashboard import DashboardPage
from .import_records import ImportRecordsPage
from .log_in import LogInPage
from .programmes import ProgrammesPage
from .school_moves import DownloadSchoolMovesPage, ReviewSchoolMovePage, SchoolMovesPage
from .sessions import SessionsPage
from .start import StartPage
from .consent_responses import (
    ArchiveConsentResponsePage,
    ConsentResponsePage,
    CreateNewRecordConsentResponsePage,
    MatchConsentResponsePage,
    UnmatchedConsentResponsesPage,
)
from .vaccines import AddBatchPage, ArchiveBatchPage, EditBatchPage, VaccinesPage


__all__ = [
    "AddBatchPage",
    "ArchiveBatchPage",
    "ArchiveConsentResponsePage",
    "ChildrenPage",
    "ConsentPage",
    "ConsentResponsePage",
    "CreateNewRecordConsentResponsePage",
    "DashboardPage",
    "DownloadSchoolMovesPage",
    "EditBatchPage",
    "ImportRecordsPage",
    "LogInPage",
    "MatchConsentResponsePage",
    "ProgrammesPage",
    "ReviewSchoolMovePage",
    "SchoolMovesPage",
    "SessionsPage",
    "StartPage",
    "UnmatchedConsentResponsesPage",
    "VaccinesPage",
]
