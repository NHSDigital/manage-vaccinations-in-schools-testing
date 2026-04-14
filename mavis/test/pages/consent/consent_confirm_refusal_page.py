from playwright.sync_api import Page

from mavis.test.annotations import step
from mavis.test.utils import expect_alert_text


class ConsentConfirmRefusalPage:
    def __init__(self, page: Page) -> None:
        self.page = page

        self.page_heading = self.page.get_by_role(
            "heading", name="Update consent response"
        )
        self.notes_textarea = self.page.get_by_label("Notes")
        self.confirm_yes_radio = self.page.get_by_role(
            "radio", name="Yes", exact=True
        ).first
        self.confirm_no_radio = self.page.get_by_role(
            "radio", name="No", exact=True
        ).first
        self.save_button = self.page.get_by_role("button", name="Save changes")

    @step("Update notes")
    def fill_notes(self, notes: str) -> None:
        self.notes_textarea.fill(notes)

    @step("Confirm refusal")
    def confirm_refusal(self, *, confirm: bool = True) -> None:
        if confirm:
            self.confirm_yes_radio.check()
        else:
            self.confirm_no_radio.check()

    @step("Click save changes")
    def click_save(self) -> None:
        self.save_button.click()

    @step("Complete refusal confirmation")
    def complete_refusal_confirmation(
        self,
        notes: str = "Discussed with parent, decision confirmed",
        *,
        confirm: bool = True,
    ) -> None:
        self.fill_notes(notes)
        self.confirm_refusal(confirm=confirm)
        self.click_save()

    @step("Verify consent update success")
    def expect_refusal_confirmation_success(self) -> None:
        expect_alert_text(self.page, "Consent from")
        expect_alert_text(self.page, "updated")
