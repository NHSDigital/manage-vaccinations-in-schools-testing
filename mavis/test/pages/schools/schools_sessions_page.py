from playwright.sync_api import Page

from mavis.test.annotations import step
from mavis.test.pages.header_component import HeaderComponent
from mavis.test.pages.schools.schools_tabs import SchoolsTabs


class SchoolsSessionsPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.header = HeaderComponent(page)
        self.tabs = SchoolsTabs(page)
        self.add_a_new_session_link = page.get_by_role("link", name="Add a new session")

    @step("Click Add a new session")
    def click_add_a_new_session(self) -> None:
        self.add_a_new_session_link.click()
