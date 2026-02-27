from playwright.sync_api import Locator, Page, expect

from mavis.test.annotations import step
from mavis.test.data_models import (
    Child,
)
from mavis.test.pages.search_components.base_search_component import BaseSearchComponent
from mavis.test.utils import (
    reload_until_element_is_visible,
)


class PatientSearchComponent(BaseSearchComponent):
    def __init__(
        self,
        page: Page,
    ) -> None:
        super().__init__(page)
        self.advanced_filters_link = page.get_by_text("Advanced filters")
        self.archived_records_checkbox = self.page.get_by_role(
            "checkbox",
            name="Archived records",
        )
        self.children_aged_out_of_programmes_checkbox = self.page.get_by_role(
            "checkbox",
            name="Children aged out of programmes",
        )
        self.children_missing_an_nhs_number_checkbox = self.page.get_by_role(
            "checkbox",
            name="Children missing an NHS number",
        )

    def get_patient_card_locator(self, child: Child) -> Locator:
        return self.page.locator(
            f'div.nhsuk-card.app-card.app-card--compact:has(h4:has-text("{child!s}"))'
        )

    def check_no_patients_found_when_expected(self) -> None:
        self.search_for("a very long string that won't match any names")
        expect(
            self.page.get_by_text("No children matching search criteria found"),
        ).to_be_visible()

    def search_and_click_child(self, child: Child) -> None:
        self.search_for(str(child))
        self.click_child(child)

    def search_for_child_that_should_not_exist(self, child: Child) -> None:
        self.search_for(str(child))
        child_locator = self.get_patient_card_locator(child).get_by_role(
            "link", name=str(child)
        )
        expect(child_locator).not_to_be_visible()

    @step("Click on child {1}")
    def click_child(self, child: Child) -> None:
        child_locator = self.get_patient_card_locator(child).get_by_role(
            "link", name=str(child)
        )
        reload_until_element_is_visible(self.page, child_locator)
        child_locator.click()

    @step("Search for child {1}")
    def search_for_a_child_name(self, child_name: str) -> None:
        self.search_textbox.fill(child_name)

        with self.page.expect_navigation():
            self.search_button.click()

        reload_until_element_is_visible(
            self.page,
            self.page.get_by_role("link", name=child_name),
        )

    @step("Search for child {1}")
    def search_for_a_child_by_nhs_number(self, child: Child) -> None:
        self.search_textbox.fill(child.nhs_number)

        with self.page.expect_navigation():
            self.search_button.click()

        reload_until_element_is_visible(
            self.page,
            self.page.get_by_role("link", name=str(child)),
        )

    @step("Click Advanced filters")
    def click_advanced_filters(self) -> None:
        self.advanced_filters_link.click()

    @step("Check Archived records")
    def check_archived_records_checkbox(self) -> None:
        self.archived_records_checkbox.check()

    @step("Check Children aged out of programmes")
    def check_children_aged_out_of_programmes(self) -> None:
        self.children_aged_out_of_programmes_checkbox.check()

    def search_for_child_name_with_all_filters(self, child_name: str) -> None:
        filter_locators = [
            self.archived_records_checkbox,
            self.children_aged_out_of_programmes_checkbox,
            self.children_missing_an_nhs_number_checkbox,
        ]
        child_locator = self.page.get_by_role("link", name=child_name)

        self.search_textbox.fill(child_name)
        self.search_button.click()
        self.page.wait_for_load_state()

        if not child_locator.is_visible():
            for filter_locator in filter_locators:
                if not filter_locator.is_visible():
                    self.advanced_filters_link.click()
                filter_locator.check()
                self.search_button.click()
                self.page.wait_for_load_state()
                if child_locator.is_visible():
                    break
                filter_locator.uncheck()

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
