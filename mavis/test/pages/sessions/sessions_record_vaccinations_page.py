from playwright.sync_api import Page

from mavis.test.pages.header_component import HeaderComponent
from mavis.test.pages.search_components import PatientSearchComponent
from mavis.test.pages.sessions.sessions_tabs import SessionsTabs


class SessionsRecordVaccinationsPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.tabs = SessionsTabs(page)
        self.search = PatientSearchComponent(page)
        self.header = HeaderComponent(page)
