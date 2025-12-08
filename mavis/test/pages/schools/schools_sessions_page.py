from playwright.sync_api import Page

from mavis.test.pages.header_component import HeaderComponent
from mavis.test.pages.schools.schools_tabs import SchoolsTabs


class SchoolsSessionsPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.header = HeaderComponent(page)
        self.tabs = SchoolsTabs(page)
