from playwright.sync_api import Page

from mavis.test.annotations import step
from mavis.test.data_models import Child
from mavis.test.pages.header_component import HeaderComponent


class MatchConsentResponsePage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.header = HeaderComponent(page)

        self.search_textbox = page.get_by_role("searchbox", name="Search")
        self.search_button = page.get_by_role("button", name="Search")
        self.link_button = page.get_by_role("button", name="Link response with record")

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

    @step("Match consent response with {1}")
    def match(self, child: Child) -> None:
        self.search_for_child_with_all_filters(child)
        self.click_link_response_with_record()

    def search_for_child_with_all_filters(self, child: Child) -> None:
        filter_locators = [
            self.archived_records_checkbox,
            # self.children_aged_out_of_programmes_checkbox,
            self.children_missing_an_nhs_number_checkbox,
        ]
        child_locator = self.page.get_by_role("link", name=str(child))

        self.search_textbox.fill(str(child))
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

        self.page.get_by_role("link", name=str(child)).click()

    @step("Click Link response with record")
    def click_link_response_with_record(self) -> None:
        self.link_button.click()
