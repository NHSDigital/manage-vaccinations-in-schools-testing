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
    get_day_month_year_from_compact_date,
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
        self.select_batch_heading = self.page.get_by_role(
            "heading", name="Which batch did you use?"
        )
        self.day_textbox = self.page.get_by_role("textbox", name="Day")
        self.month_textbox = self.page.get_by_role("textbox", name="Month")
        self.year_textbox = self.page.get_by_role("textbox", name="Year")
        self.hour_textbox = self.page.get_by_role("textbox", name="Hour")
        self.minute_textbox = self.page.get_by_role("textbox", name="Minute")

    @step("Click on Confirm")
    def click_confirm_button(self) -> None:
        self.confirm_button.click()

    @step("Click on Confirm in two tabs simultaneously")
    def click_confirm_button_in_two_tabs(self) -> None:
        current_url = self.page.url

        new_page = self.page.context.new_page()
        new_page.goto(current_url)

        new_confirm_button = new_page.get_by_role("button", name="Confirm")

        self.confirm_button.click(force=True, no_wait_after=True)
        new_confirm_button.click(force=True, no_wait_after=True)

    @step("Click on location radio {1}")
    def check_location_radio(self, location: str) -> None:
        self.page.get_by_role("radio", name=str(location)).check()

    @step("Click on Continue")
    def click_continue_button(self) -> None:
        self.continue_button.click()

    @step("Fill date of vaccination with {1}")
    def fill_date_of_vaccination(self, date: str) -> None:
        day, month, year = get_day_month_year_from_compact_date(date)

        self.day_textbox.fill(str(day))
        self.month_textbox.fill(str(month))
        self.year_textbox.fill(str(year))

    @step("Confirm MMRV given")
    def confirm_mmrv_given(self) -> None:
        expect(
            self.page.get_by_role("heading", name="vaccinated with the MMRV vaccine?")
        ).to_be_visible()
        self.click_continue_button()

    @step("Fill time of vaccination with {1}:{2}")
    def fill_time_of_vaccination(self, hour: str, minute: str) -> None:
        self.hour_textbox.fill(str(hour))
        self.minute_textbox.fill(str(minute))

    def expect_consent_refused_text(self, parent: Parent) -> None:
        expect(
            self.page.get_by_text(f"{parent.relationship} refused to give consent."),
        ).to_be_visible()

    @step("Fill vaccination notes with {1}")
    def fill_vaccination_notes(self, notes: str) -> None:
        self.vaccination_notes.fill(notes)

    @step("Choose batch {1}")
    def choose_batch(self, batch_name: str) -> None:
        batch_radio = self.page.get_by_role("radio", name=batch_name)

        self.page.wait_for_load_state()

        expect(
            self.page.get_by_role("heading", name="Which batch did you use?")
        ).to_be_visible()

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
        test_recording_twice: bool = False,
    ) -> None:
        self.choose_batch(vaccination_record.batch_name)

        if at_school:  # only skips MAV-854
            if psd_option:
                expect_details(self.page, "Protocol", "Patient Specific Direction")
            else:
                expect_details(self.page, "Protocol", "Patient Group Direction (PGD)")

            self.vaccination_notes.fill(notes)

            if test_recording_twice:
                self.click_confirm_button_in_two_tabs()
            else:
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
