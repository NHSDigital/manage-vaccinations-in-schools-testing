from .children import ChildrenPage
from .consent import ConsentPage
from .dashboard import DashboardPage
from .import_records import ImportRecordsPage
from .log_in import LogInPage
from .programmes import ProgrammesPage
from .school_moves import SchoolMovesPage
from .sessions import SessionsPage
from .start import StartPage
from .consent_responses import (
    ArchiveConsentResponsePage,
    ConsentResponsePage,
    CreateNewRecordConsentResponsePage,
    MatchConsentResponsePage,
    UnmatchedConsentResponsesPage,
)
from .vaccines import VaccinesPage


__all__ = [
    "ArchiveConsentResponsePage",
    "ChildrenPage",
    "ConsentPage",
    "ConsentResponsePage",
    "CreateNewRecordConsentResponsePage",
    "DashboardPage",
    "ImportRecordsPage",
    "LogInPage",
    "MatchConsentResponsePage",
    "ProgrammesPage",
    "SchoolMovesPage",
    "SessionsPage",
    "StartPage",
    "UnmatchedConsentResponsesPage",
    "VaccinesPage",
]
