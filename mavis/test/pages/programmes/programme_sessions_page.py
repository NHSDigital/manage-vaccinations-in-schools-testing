from playwright.sync_api import Page

from mavis.test.pages.header import HeaderComponent
from mavis.test.pages.programmes.programme_tabs import ProgrammeTabs


class ProgrammeSessionsPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.tabs = ProgrammeTabs(page)
        self.header = HeaderComponent(page)
