from playwright.sync_api import Page, expect

from mavis.test.annotations import step
from mavis.test.pages.header import HeaderComponent
from mavis.test.utils import (
    expect_alert_text,
    reload_until_element_is_visible,
)


class SessionsPatientSessionActivityPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.header = HeaderComponent(page)

        self.note_textbox = self.page.get_by_role("textbox", name="Note")
        self.add_a_note_span = self.page.get_by_text("Add a note")
        self.save_note_button = self.page.get_by_role("button", name="Save note")

    @step("Click on Add a note")
    def click_add_a_note(self) -> None:
        self.add_a_note_span.click()

    @step("Fill note textbox with {1}")
    def fill_note_textbox(self, note: str) -> None:
        self.note_textbox.fill(note)

    @step("Click on Save note")
    def click_save_note(self) -> None:
        self.save_note_button.click()

    @step("Check that notes appear in order")
    def check_notes_appear_in_order(self, notes: list[str]) -> None:
        for i, note in enumerate(notes):
            expect(self.page.get_by_role("blockquote").nth(i)).to_have_text(note)

    def add_note(self, note: str) -> None:
        self.click_add_a_note()
        self.fill_note_textbox(note)
        with self.page.expect_navigation():
            self.click_save_note()

        expect_alert_text(self.page, "Note added")
        reload_until_element_is_visible(self.page, self.page.get_by_text(note))

    def check_session_activity_entry(self, text: str) -> None:
        expect(self.page.get_by_role("heading", name=text).first).to_be_visible()
