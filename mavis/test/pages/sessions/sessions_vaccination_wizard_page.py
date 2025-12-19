from playwright.sync_api import Page, expect

from mavis.test.annotations import step
from mavis.test.constants import MAVIS_NOTE_LENGTH_LIMIT, Programme
from mavis.test.data_models import (
    Parent,
    VaccinationRecord,
)
from mavis.test.pages.header_component import HeaderComponent
from mavis.test.utils import (
    expect_alert_text,
    expect_details,
    reload_until_element_is_visible,
)


class SessionsVaccinationWizardPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.header = HeaderComponent(page)

        self.confirm_button = self.page.get_by_role("button", name="Confirm")
        self.vaccination_notes = self.page.get_by_role(
            "textbox",
            name="Notes (optional)",
        )
        self.notes_length_error = (
            page.locator("div").filter(has_text="There is a problemEnter").nth(3)
        )
        self.continue_button = self.page.get_by_role("button", name="Continue")

    @step("Click on Confirm")
    def click_confirm_button(self) -> None:
        self.confirm_button.click()

    @step("Click on location radio {1}")
    def check_location_radio(self, location: str) -> None:
        self.page.get_by_role("radio", name=str(location)).check()

    @step("Click on Continue")
    def click_continue_button(self) -> None:
        self.continue_button.click()

    def expect_consent_refused_text(self, parent: Parent) -> None:
        expect(
            self.page.get_by_text(f"{parent.relationship} refused to give consent."),
        ).to_be_visible()

    @step("Choose batch {1}")
    def choose_batch(self, batch_name: str) -> None:
        batch_radio = self.page.get_by_role("radio", name=batch_name)

        reload_until_element_is_visible(
            self.page,
            batch_radio,
        )
        batch_radio.check()
        self.click_continue_button()

    def record_vaccination(
        self,
        vaccination_record: VaccinationRecord,
        *,
        notes: str = "",
        at_school: bool = True,
        psd_option: bool = False,
    ) -> None:
        self.choose_batch(vaccination_record.batch_name)

        if at_school:  # only skips MAV-854
            if psd_option:
                expect_details(self.page, "Protocol", "Patient Specific Direction")
            else:
                expect_details(self.page, "Protocol", "Patient Group Direction (PGD)")

            self.vaccination_notes.fill(notes)
            self.click_confirm_button()

            if len(notes) > MAVIS_NOTE_LENGTH_LIMIT:
                expect(self.notes_length_error).to_be_visible()
                self.vaccination_notes.fill("Confirmation notes")
                self.click_confirm_button()

            expected_outcome = (
                "MMR"
                if vaccination_record.programme is Programme.MMR
                else str(vaccination_record.programme)
            )

            expect_alert_text(
                self.page,
                f"Vaccination outcome recorded for {expected_outcome}",
            )
