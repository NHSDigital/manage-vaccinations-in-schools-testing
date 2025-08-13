from playwright.sync_api import Page

from mavis.test.annotations import step
from mavis.test.wrappers import reload_until_element_is_visible
from mavis.test.models import Child


class UnmatchedConsentResponsesPage:
    def __init__(self, page: Page):
        self.page = page
        self.rows = page.get_by_role("row")
        self.empty_paragraph = page.get_by_text(
            "There are currently no unmatched consent responses."
        )
        self.archived_alert = page.get_by_role("alert", name="Success").filter(
            has_text="archived"
        )
        self.created_alert = page.get_by_role("alert", name="Success").filter(
            has_text="created"
        )
        self.matched_alert = page.get_by_role("alert", name="Success").filter(
            has_text="matched"
        )

    @step("Click on consent response for {1}")
    def click_child(self, child: Child):
        row = self.rows.filter(has=self.page.get_by_text(str(child)))
        reload_until_element_is_visible(self.page, row)
        row.get_by_role("link").first.click()


class ConsentResponsePage:
    def __init__(self, page: Page):
        self.page = page
        self.archive_link = page.get_by_role("link", name="Archive", exact=True)
        self.create_new_record_link = page.get_by_role(
            "link", name="Create new record", exact=True
        )
        self.match_link = page.get_by_role("link", name="Match", exact=True)

    @step("Click on Archive")
    def click_archive(self):
        self.archive_link.click()

    @step("Click on Create new record")
    def click_create_new_record(self):
        self.create_new_record_link.click()

    @step("Click on Match")
    def click_match(self):
        self.match_link.click()


class ArchiveConsentResponsePage:
    def __init__(self, page: Page):
        self.page = page
        self.notes_textbox = page.get_by_role("textbox", name="Notes")
        self.archive_button = page.get_by_role("button", name="Archive")

    @step("Archive consent response")
    def archive(self, notes: str):
        self.notes_textbox.fill(notes)
        self.archive_button.click()


class CreateNewRecordConsentResponsePage:
    def __init__(self, page: Page):
        self.page = page
        self.create_new_record_button = page.get_by_role(
            "button", name="Create a new record from response"
        )

    @step("Create new record from consent response")
    def create_new_record(self):
        self.create_new_record_button.click()


class MatchConsentResponsePage:
    def __init__(self, page: Page):
        self.page = page
        self.search_textbox = page.get_by_role("textbox", name="Search")
        self.search_button = page.get_by_role("button", name="Search")
        self.link_button = page.get_by_role("button", name="Link response with record")

        self.advanced_filters_link = self.page.get_by_text("Advanced filters")
        self.archived_records_checkbox = self.page.get_by_role(
            "checkbox", name="Archived records"
        )
        self.children_aged_out_of_programmes_checkbox = self.page.get_by_role(
            "checkbox", name="Children aged out of programmes"
        )
        self.children_missing_an_nhs_number_checkbox = self.page.get_by_role(
            "checkbox", name="Children missing an NHS number"
        )

    @step("Match consent response with {1}")
    def match(self, child: Child):
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
            for filter in filter_locators:
                if not filter.is_visible():
                    self.advanced_filters_link.click()
                filter.check()
                self.search_button.click()
                self.page.wait_for_load_state()
                if child_locator.is_visible():
                    break
                filter.uncheck()

        self.page.get_by_role("link", name=str(child)).click()
        self.link_button.click()
