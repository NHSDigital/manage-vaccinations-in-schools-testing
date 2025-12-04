from playwright.sync_api import Page, expect

from mavis.test.annotations import step
from mavis.test.mavis_constants import (
    Programme,
)
from mavis.test.pages.header_component import HeaderComponent
from mavis.test.pages.sessions.search_component import SearchComponent


class SessionsSearchPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.search = SearchComponent(page)
        self.header = HeaderComponent(page)

    @step("Click on {2} session at {1}")
    def click_session_for_programme_group(
        self, location: str, programme_group: str
    ) -> None:
        if programme_group != Programme.MMR:
            for programme in Programme:
                if programme.group == programme_group:
                    self.page.get_by_role("checkbox", name=str(programme)).check()
                else:
                    self.page.get_by_role("checkbox", name=str(programme)).uncheck()

        self.search.search_textbox.fill(str(location))
        self.search.search_button.click()

        self.page.get_by_role("link", name=str(location)).first.click()

        ten_seconds_ms = 10000

        expect(self.page.locator("h1", has_text=str(location))).to_be_visible(
            timeout=ten_seconds_ms,
        )
