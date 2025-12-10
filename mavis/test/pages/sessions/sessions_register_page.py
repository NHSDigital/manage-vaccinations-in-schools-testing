from playwright.sync_api import Page

from mavis.test.annotations import step
from mavis.test.data_models import Child
from mavis.test.pages.header_component import HeaderComponent
from mavis.test.pages.sessions.search_component import SearchComponent
from mavis.test.pages.sessions.sessions_tabs import SessionsTabs
from mavis.test.utils import (
    reload_until_element_is_visible,
)


class SessionsRegisterPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.tabs = SessionsTabs(page)
        self.search = SearchComponent(page)
        self.header = HeaderComponent(page)

        self.attending_button = self.page.get_by_role("button", name="Attending").first

    def register_child_as_attending(self, child: Child) -> None:
        self.tabs.click_register_tab()
        self.search.search_for(str(child))
        reload_until_element_is_visible(
            self.page, self.page.get_by_role("link", name=str(child)).first
        )
        self.click_on_attending()

    @step("Click on Attending")
    def click_on_attending(self) -> None:
        self.attending_button.click()
