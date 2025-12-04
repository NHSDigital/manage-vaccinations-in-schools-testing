from playwright.sync_api import Page

from mavis.test.annotations import step
from mavis.test.pages.header import HeaderComponent


class ArchiveConsentResponsePage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.header = HeaderComponent(page)

        self.notes_textbox = page.get_by_role("textbox", name="Notes")
        self.archive_button = page.get_by_role("button", name="Archive")

    @step("Archive consent response")
    def archive(self, notes: str) -> None:
        self.notes_textbox.fill(notes)
        self.archive_button.click()
