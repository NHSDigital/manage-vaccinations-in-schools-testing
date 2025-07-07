from playwright.sync_api import Page

from ..step import step
from ..wrappers import reload_until_element_is_visible


def get_child_full_name(first_name: str, last_name: str) -> str:
    return f"{last_name.upper()}, {first_name}"


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

    @step("Click on consent response for {1} {2}")
    def click_child(self, first_name: str, last_name: str):
        row = self._get_row_for_child(first_name, last_name)
        reload_until_element_is_visible(self.page, row)
        row.get_by_role("link").first.click()

    def _get_row_for_child(self, first_name: str, last_name: str):
        full_name = get_child_full_name(first_name, last_name)
        return self.rows.filter(has=self.page.get_by_text(full_name))


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
    def archive(self, *, notes: str):
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

    @step("Match consent response with {1} {2}")
    def match(self, first_name: str, last_name: str):
        full_name = get_child_full_name(first_name, last_name)

        self.search_textbox.fill(full_name)
        self.search_button.click()

        self.page.get_by_role("link", name=full_name).click()
        self.link_button.click()
