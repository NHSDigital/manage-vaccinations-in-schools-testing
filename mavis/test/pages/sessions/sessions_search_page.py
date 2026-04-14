from playwright.sync_api import Page, expect

from mavis.test.annotations import step
from mavis.test.constants import (
    Programme,
)
from mavis.test.data_models import Location
from mavis.test.pages.header_component import HeaderComponent
from mavis.test.pages.search_components import BaseSearchComponent
from mavis.test.utils import get_formatted_date_without_year, get_offset_date


class SessionsSearchPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.search = BaseSearchComponent(page)
        self.header = HeaderComponent(page)
        self.add_a_new_session_link = page.get_by_role("link", name="Add a new session")

    @step("Click Add a new session")
    def click_add_a_new_session(self) -> None:
        self.add_a_new_session_link.click()

    def _check_programmes(self, checked_programmes: list[Programme]) -> None:
        for programme in Programme:
            if programme in checked_programmes:
                self.page.get_by_role("checkbox", name=str(programme)).check()
            else:
                self.page.get_by_role("checkbox", name=str(programme)).uncheck()

    def _search_for_location(self, location: Location) -> None:
        self.search.search_for(str(location))

    def _click_location(self, location: Location) -> None:
        self.page.get_by_role("link", name=str(location)).first.click()

    @step("Click on {2} session at {1}")
    def click_session_for_programme_group(
        self, location: Location, programme_group: str
    ) -> None:
        if programme_group != Programme.MMR_MMRV:
            programmes = [
                programme
                for programme in Programme
                if programme.group == programme_group
            ]
            self._check_programmes(programmes)

        self._search_for_location(location)
        self._click_location(location)

        expect(self.page.locator("h1", has_text=str(location))).to_be_visible(
            timeout=10_000,
        )

    @step("Check if session exists")
    def click_session_if_exists(
        self,
        location: Location,
        programmes: list[Programme],
        year_groups: list[int],
        date_offset: int,
    ) -> bool:
        self.search.search_for(str(location))
        self.page.wait_for_load_state()
        session_locators = self.page.locator(
            "div.nhsuk-card--clickable.app-card.app-card--compact"
        )
        session_date = get_formatted_date_without_year(get_offset_date(date_offset))

        for i in range(session_locators.count()):
            card_text = session_locators.nth(i).inner_text()
            if (
                all(str(programme) in card_text for programme in programmes)
                and session_date in card_text
                and all(str(year_group) in card_text for year_group in year_groups)
            ):
                session_locators.nth(i).get_by_role("link").click()
                return True
        return False
