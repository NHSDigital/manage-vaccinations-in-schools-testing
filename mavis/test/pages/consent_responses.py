from playwright.sync_api import Page, expect

from mavis.test.annotations import step
from mavis.test.models import Child
from mavis.test.utils import reload_until_element_is_visible


class UnmatchedConsentResponsesPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.rows = page.get_by_role("row")
        self.empty_paragraph = page.get_by_text(
            "There are currently no unmatched consent responses.",
        )
        self.archived_alert = page.get_by_role("alert", name="Success").filter(
            has_text="archived",
        )
        self.created_alert = page.get_by_role("alert", name="Success").filter(
            has_text="created",
        )
        self.matched_alert = page.get_by_role("alert", name="Success").filter(
            has_text="matched",
        )

    @step("Click on consent response for {1}")
    def click_parent_on_consent_record_for_child(self, child: Child) -> None:
        parent_name = next(
            (p.full_name for p in child.parents if p.relationship == "Dad"),
            None,
        )
        reload_until_element_is_visible(
            self.page,
            self.page.get_by_role("link", name=str(parent_name)),
        )
        self.page.get_by_role("link", name=str(parent_name)).click()

    def check_response_for_child_not_visible(self, child: Child) -> None:
        row = self.rows.filter(has=self.page.get_by_text(str(child)))
        expect(row).not_to_be_visible()


class ConsentResponsePage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.archive_link = page.get_by_role("link", name="Archive", exact=True)
        self.create_new_record_link = page.get_by_role(
            "link",
            name="Create new record",
            exact=True,
        )
        self.match_link = page.get_by_role("link", name="Match", exact=True)

    @step("Click on Archive")
    def click_archive(self) -> None:
        self.archive_link.click()

    @step("Click on Create new record")
    def click_create_new_record(self) -> None:
        self.create_new_record_link.click()

    @step("Click on Match")
    def click_match(self) -> None:
        self.match_link.click()


class ArchiveConsentResponsePage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.notes_textbox = page.get_by_role("textbox", name="Notes")
        self.archive_button = page.get_by_role("button", name="Archive")

    @step("Archive consent response")
    def archive(self, notes: str) -> None:
        self.notes_textbox.fill(notes)
        self.archive_button.click()


class CreateNewRecordConsentResponsePage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.create_new_record_button = page.get_by_role(
            "button",
            name="Create a new record from response",
        )

    @step("Create new record from consent response")
    def create_new_record(self) -> None:
        self.create_new_record_button.click()


class MatchConsentResponsePage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.search_textbox = page.get_by_role("textbox", name="Search")
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
            self.children_aged_out_of_programmes_checkbox,
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
