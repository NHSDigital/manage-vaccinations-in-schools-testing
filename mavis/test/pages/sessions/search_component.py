from playwright.sync_api import Locator, Page, expect

from mavis.test.annotations import step
from mavis.test.data_models import (
    Child,
)
from mavis.test.utils import (
    reload_until_element_is_visible,
)


class SearchComponent:
    def __init__(
        self,
        page: Page,
    ) -> None:
        self.page = page
        self.search_textbox = self.page.get_by_role("searchbox", name="Search")
        self.search_button = self.page.get_by_role("button", name="Search")
        self.update_results_button = self.page.get_by_role(
            "button",
            name="Update results",
        )
        self.advanced_filters_link = page.get_by_text("Advanced filters")
        self.archived_records_checkbox = self.page.get_by_role(
            "checkbox",
            name="Archived records",
        )

    def get_patient_card_locator(self, child: Child) -> Locator:
        return self.page.locator(
            f'div.nhsuk-card.app-card.app-card--compact:has(h4:has-text("{child!s}"))'
        )

    @step("Search for {1}")
    def search_for(self, name: str) -> None:
        self.search_textbox.fill(name)
        self.search_button.click()

    @step("Click on Update results")
    def click_on_update_results(self) -> None:
        self.update_results_button.click()

    def verify_search(self) -> None:
        self.search_for("a very long string that won't match any names")
        expect(
            self.page.get_by_text("No children matching search criteria found"),
        ).to_be_visible()

    def search_and_click_child(self, child: Child) -> None:
        self.search_for(str(child))
        child_locator = self.get_patient_card_locator(child).get_by_role(
            "link", name=str(child)
        )
        reload_until_element_is_visible(self.page, child_locator)
        child_locator.click()

    def search_for_child_that_should_not_exist(self, child: Child) -> None:
        self.search_for(str(child))
        child_locator = self.get_patient_card_locator(child).get_by_role(
            "link", name=str(child)
        )
        expect(child_locator).not_to_be_visible()

    @step("Click Advanced filters")
    def click_advanced_filters(self) -> None:
        self.advanced_filters_link.click()

    @step("Check Archived records")
    def check_archived_records_checkbox(self) -> None:
        self.archived_records_checkbox.check()

    @step("Check box for year {1}")
    def check_year_checkbox(self, year: int) -> None:
        if year == 0:
            self.page.get_by_role("checkbox", name="Reception").check()
        else:
            self.page.get_by_role("checkbox", name=f"Year {year}").check()

    @step("Uncheck box for year {1}")
    def uncheck_year_checkbox(self, year: int) -> None:
        if year == 0:
            self.page.get_by_role("checkbox", name="Reception").uncheck()
        else:
            self.page.get_by_role("checkbox", name=f"Year {year}").uncheck()

    @step("Check note {2} appears in search for {1}")
    def check_note_appears_in_search(self, child: Child, note: str) -> None:
        heading = self.page.get_by_role("heading", name=str(child))
        next_element = heading.locator("xpath=following-sibling::*[1]")
        expect(next_element.get_by_role("blockquote")).to_have_text(note)
