from pathlib import Path

from playwright.sync_api import Page, expect

from mavis.test.annotations import step
from mavis.test.data import create_child_list_from_file
from mavis.test.models import Child
from mavis.test.pages.header_component import HeaderComponent
from mavis.test.utils import reload_until_element_is_visible


class ChildrenSearchPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.header = HeaderComponent(page)

        self.children_heading = self.page.get_by_role(
            "heading",
            name="Children",
            exact=True,
        )
        self.children_table_headers = [
            self.page.get_by_role("columnheader", name=header)
            for header in [
                "Name and NHS number",
                "Postcode",
                "School",
                "Date of birth",
            ]
        ]

        self.search_textbox = self.page.get_by_role("searchbox", name="Search")
        self.search_button = self.page.get_by_role("button", name="Search")
        self.advanced_filters_link = self.page.get_by_text("Advanced filters")
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
        self.child_record_link = self.page.get_by_role("link", name="Child record")

    def verify_headers(self) -> None:
        expect(self.children_heading).to_be_visible()
        for header in self.children_table_headers:
            expect(header).to_be_visible()

    def verify_list_has_been_uploaded(
        self,
        file_path: Path,
        *,
        is_vaccinations: bool,
    ) -> None:
        child_names = create_child_list_from_file(
            file_path,
            is_vaccinations=is_vaccinations,
        )
        for child_name in child_names:
            self.search_with_all_filters_for_child_name(child_name)

    @step("Search for child {1}")
    def search_for_a_child_name(self, child_name: str) -> None:
        self.search_textbox.fill(child_name)

        with self.page.expect_navigation():
            self.search_button.click()

        reload_until_element_is_visible(
            self.page,
            self.page.get_by_role("link", name=child_name),
        )

    def assert_n_children_found(self, n: int) -> None:
        expect(
            self.page.get_by_role("heading", name=f"{n} child{'ren' if n > 1 else ''}"),
        ).to_be_visible()

    @step("Click on record for child {1}")
    def click_record_for_child(self, child: Child) -> None:
        with self.page.expect_navigation():
            self.page.get_by_role("link", name=str(child)).click()

    def search_with_all_filters_for_child_name(self, child_name: str) -> None:
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
                    self.click_advanced_filters()
                filter_locator.check()
                self.search_button.click()
                self.page.wait_for_load_state()
                if child_locator.is_visible():
                    break
                filter_locator.uncheck()

    @step("Click on Advanced filters")
    def click_advanced_filters(self) -> None:
        self.advanced_filters_link.click()

    @step("Check Children aged out of programmes")
    def check_children_aged_out_of_programmes(self) -> None:
        self.children_aged_out_of_programmes_checkbox.check()
