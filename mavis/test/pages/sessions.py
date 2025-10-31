import re
import time
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import pandas as pd
from playwright.sync_api import Locator, Page, expect

from mavis.test.annotations import step
from mavis.test.data import get_session_id
from mavis.test.models import (
    Child,
    ConsentOption,
    DeliverySite,
    Parent,
    Programme,
    School,
    VaccinationRecord,
)
from mavis.test.utils import (
    MAVIS_NOTE_LENGTH_LIMIT,
    get_current_datetime,
    get_current_datetime_compact,
    get_day_month_year_from_compact_date,
    get_offset_date_compact_format,
    get_todays_date,
    reload_until_element_is_visible,
)


class SessionsPage:
    def __init__(
        self,
        page: Page,
    ) -> None:
        self.page = page

        self.no_response_checkbox = self.page.get_by_role(
            "checkbox",
            name="No response",
        )
        self.update_results_button = self.page.get_by_role(
            "button",
            name="Update results",
        )
        self.consent_given_checkbox = self.page.get_by_role(
            "checkbox",
            name="Consent given",
            exact=True,
        )
        self.consent_given_for_injected_vaccine_checkbox = self.page.get_by_role(
            "checkbox",
            name="Consent given for gelatine-free injection",
        )
        self.consent_given_for_nasal_spray_checkbox = self.page.get_by_role(
            "checkbox",
            name="Consent given for nasal spray",
        )
        self.conflicting_consent_checkbox = self.page.get_by_role(
            "checkbox",
            name="Conflicting consent",
        )

        self.import_class_lists_link = self.page.get_by_role(
            "link",
            name="Import class lists",
        )
        self.continue_button = self.page.get_by_role("button", name="Continue")
        self.file_input = self.page.locator('input[type="file"]')
        self.filter_name_textbox = self.page.get_by_role("textbox", name="Name")

        self.update_triage_outcome_link = self.page.get_by_role(
            "link",
            name="Update triage outcome",
        )
        self.safe_to_vaccinate_radio = self.page.get_by_role(
            "radio",
            name="Yes, it’s safe to vaccinate",
        )
        self.save_triage_button = self.page.get_by_role("button", name="Save triage")
        self.assess_gillick_competence_link = self.page.get_by_role(
            "link",
            name="Assess Gillick competence",
        )
        self.edit_gillick_competence_link = self.page.get_by_role(
            "link",
            name="Edit Gillick competence",
        )
        self.could_not_vaccinate_link = self.page.get_by_role(
            "link",
            name="Could not vaccinate",
        )
        self.consent_refused_checkbox = self.page.get_by_role(
            "checkbox",
            name="Consent refused",
        )
        self.record_offline_link = self.page.get_by_role("link", name="Record offline")
        self.schedule_sessions_link = self.page.get_by_role(
            "link",
            name="Schedule sessions",
        )
        self.add_session_dates_link = self.page.get_by_role(
            "link",
            name="Add session dates",
        )
        self.day_textbox = self.page.get_by_role("textbox", name="Day")
        self.month_textbox = self.page.get_by_role("textbox", name="Month")
        self.year_textbox = self.page.get_by_role("textbox", name="Year")
        self.edit_session_link = self.page.get_by_role("link", name="Edit session")
        self.close_session_link = self.page.get_by_role("link", name="Close session")
        self.change_session_dates_link = self.page.get_by_role(
            "link",
            name="Change   session dates",
        )
        self.delete_button = self.page.get_by_role("button", name="Delete")
        self.back_link = self.page.get_by_role("link", name="Back", exact=True).first
        self.save_changes_link = self.page.get_by_role("button", name="Save changes")
        self.mark_as_invalid_link = self.page.get_by_role(
            "link",
            name="Mark as invalid",
        )
        self.mark_as_invalid_button = self.page.get_by_role(
            "button",
            name="Mark as invalid",
        )
        self.notes_textbox = self.page.get_by_role("textbox", name="Notes")
        self.record_a_new_consent_response_button = self.page.get_by_role(
            "button",
            name="Record a new consent response",
        )
        self.confirm_button = self.page.get_by_role("button", name="Confirm")
        self.search_textbox = self.page.get_by_role("textbox", name="Search")
        self.search_button = self.page.get_by_role("button", name="Search")
        self.record_vaccinations_link = self.page.get_by_role(
            "link",
            name="Record vaccinations",
        )
        self.ready_for_injection_radio = self.page.locator(
            "#vaccinate-form-vaccine-method-injection-field",
        )
        self.ready_for_nasal_spray_radio = self.page.locator(
            "#vaccinate-form-vaccine-method-nasal-field",
        )
        self.attending_button = self.page.get_by_role("button", name="Attending").first
        self.vaccination_notes = self.page.get_by_role(
            "textbox",
            name="Notes (optional)",
        )

        pre_screening = self.page.locator("section").filter(
            has=page.get_by_role("heading", name="Pre-screening checks"),
        )

        self.pre_screening_listitem = pre_screening.get_by_role("listitem")
        self.pre_screening_checkbox = pre_screening.get_by_role("checkbox")
        self.pre_screening_notes = pre_screening.get_by_role(
            "textbox",
            name="Pre-screening notes (optional)",
        )
        self.review_no_consent_response_link = self.page.get_by_role(
            "link",
            name="with no response",
        )
        self.consent_refusal_reason_other_radio = self.page.get_by_text("Other")
        self.consent_refusal_details_textbox = self.page.get_by_role(
            "textbox",
            name="Give details",
        )
        self.review_consent_refused_link = self.page.get_by_role(
            "link",
            name="Review   consent refused",
        )

        self.note_textbox = self.page.get_by_role("textbox", name="Note")
        self.add_a_note_span = self.page.get_by_text("Add a note")
        self.save_note_button = self.page.get_by_role("button", name="Save note")
        self.set_session_in_progress_button = self.page.get_by_role(
            "button",
            name="Set session in progress for today",
        )
        vaccinations_card = page.get_by_role("table", name="Vaccination records")
        self.vaccinations_card_row = vaccinations_card.get_by_role("row")
        self.sessions_link = page.get_by_role("link", name="Sessions", exact=True).first
        self.advanced_filters_link = page.get_by_text("Advanced filters")
        self.archived_records_checkbox = self.page.get_by_role(
            "checkbox",
            name="Archived records",
        )
        self.add_another_date_button = self.page.get_by_role(
            "button",
            name="Add another date",
        )
        self.change_psd_link = self.page.get_by_role(
            "link", name="Change   use patient specific direction"
        )
        self.change_programmes_link = self.page.get_by_role(
            "link", name="Change   programmes"
        )
        self.notes_length_error = (
            page.locator("div").filter(has_text="There is a problemEnter").nth(3)
        )
        self.send_reminders_link = self.page.get_by_role(
            "link",
            name="Send reminders",
        )
        self.add_new_psds_link = self.page.get_by_role(
            "link",
            name="Add new PSDs",
        )
        self.yes_add_psds_button = self.page.get_by_role(
            "button",
            name="Yes, add PSDs",
        )
        self.record_vaccinations_breadcrumb = self.page.get_by_role(
            "link",
            name="Record vaccinations",
        )
        self.keep_session_dates_button = self.page.get_by_role(
            "button", name="Keep session dates"
        )
        self.did_not_consent_link = self.page.get_by_role(
            "link", name="Did not consent"
        )
        self.withdraw_consent_link = self.page.get_by_role(
            "link", name="Withdraw consent"
        )

    def __get_display_formatted_date(self, date_to_format: str) -> str:
        _parsed_date = datetime.strptime(date_to_format, "%Y%m%d").replace(
            tzinfo=ZoneInfo("Europe/London")
        )
        return _parsed_date.strftime("%A, %d %B %Y").replace(" 0", " ")

    @step("Click on Overview tab")
    def click_overview_tab(self) -> None:
        self._select_tab("Overview")

    @step("Click on PSDs tab")
    def click_psds_tab(self) -> None:
        self._select_tab("PSDs")

    @step("Click Review consent refused")
    def click_review_consent_refused(self) -> None:
        self.review_consent_refused_link.click()

    @step("Expect Consent refused checkbox to be checked")
    def expect_consent_refused_checkbox_to_be_checked(self) -> None:
        expect(self.consent_refused_checkbox).to_be_checked()

    @step("Select No response")
    def select_no_response(self) -> None:
        self.no_response_checkbox.check()
        self.update_results_button.click()

    @step("Select Consent given")
    def select_consent_given(self) -> None:
        self.consent_given_checkbox.check()
        self.update_results_button.click()

    @step("Select Consent given for injected vaccine")
    def select_consent_given_for_injected_vaccine(self) -> None:
        self.consent_given_for_injected_vaccine_checkbox.check()
        self.update_results_button.click()

    @step("Select Consent given for nasal spray")
    def select_consent_given_for_nasal_spray(self) -> None:
        self.consent_given_for_nasal_spray_checkbox.check()
        self.update_results_button.click()

    def select_consent_given_filters_for_programme(
        self,
        programme: Programme,
    ) -> None:
        if programme is not Programme.FLU:
            for locator in [
                self.consent_given_for_injected_vaccine_checkbox,
                self.consent_given_checkbox,
            ]:
                if locator.is_visible():
                    locator.check()
        else:
            self.consent_given_for_injected_vaccine_checkbox.check()
            self.consent_given_for_nasal_spray_checkbox.check()
        self.update_results_button.click()

    @step("Select Conflicting consent")
    def select_conflicting_consent(self) -> None:
        self.conflicting_consent_checkbox.check()
        self.update_results_button.click()

    @step("Select Consent refused")
    def select_consent_refused(self) -> None:
        self.consent_refused_checkbox.check()
        self.update_results_button.click()

    def _select_tab(self, name: str) -> None:
        link = self.page.get_by_label("Secondary menu").get_by_role("link", name=name)
        if link.get_by_role("strong").is_visible():
            return
        link.click()
        link.get_by_role("strong").wait_for()

    @step("Click on {1} tab")
    def click_programme_tab(self, programme: Programme) -> None:
        self._select_tab(str(programme))

    @step("Click on Register tab")
    def click_register_tab(self) -> None:
        self._select_tab("Register")

    @step("Click on Session activity and notes tab")
    def click_session_activity_and_notes(self) -> None:
        self._select_tab("Session activity and notes")

    @step("Click on {2} session at {1}")
    def click_session_for_programme_group(
        self, location: str, programme_group: str
    ) -> None:
        if programme_group != Programme.MMR:
            for programme in Programme:
                if programme.group == programme_group:
                    self.page.get_by_role("checkbox", name=str(programme)).check()
                else:
                    self.page.get_by_role("checkbox", name=str(programme)).uncheck()

        self.search_textbox.fill(str(location))
        self.search_button.click()

        self.page.get_by_role("link", name=str(location)).first.click()

        ten_seconds_ms = 10000

        expect(self.page.locator("h1", has_text=str(location))).to_be_visible(
            timeout=ten_seconds_ms,
        )

    @step("Click on location radio {1}")
    def check_location_radio(self, location: str) -> None:
        self.page.get_by_role("radio", name=str(location)).check()

    @step("Click on Import class lists")
    def click_import_class_lists(self) -> None:
        self.import_class_lists_link.click()

    @step("Click on Continue")
    def click_continue_button(self) -> None:
        self.continue_button.click()

    @step("Upload file {1}")
    def choose_file_child_records(self, file_path: str) -> None:
        self.file_input.set_input_files(file_path)

    @step("Click on child {1}")
    def click_child(self, child: Child) -> None:
        with self.page.expect_navigation():
            self.page.get_by_role("heading", name=str(child)).get_by_role(
                "link",
            ).first.click()

    @step("Search and click on {1}")
    def search_and_click_child(self, child: Child) -> None:
        self.filter_name_textbox.fill(str(child))
        self.click_child(child)

    @step("Click on Update triage outcome")
    def click_update_triage_outcome(self) -> None:
        self.update_triage_outcome_link.click()

    @step("Click on Yes, it’s safe to vaccinate")
    def select_yes_safe_to_vaccinate(self) -> None:
        self.safe_to_vaccinate_radio.click()

    @step("Click on Save triage")
    def click_save_triage(self) -> None:
        self.save_triage_button.click()

    @step("Click on Consent tab")
    def click_consent_tab(self) -> None:
        self._select_tab("Consent")

    @step("Click on Children tab")
    def click_children_tab(self) -> None:
        self._select_tab("Children")

    @step("Click on Triage tab")
    def click_triage_tab(self) -> None:
        self._select_tab("Triage")

    @step("Click on Assess Gillick competence")
    def click_assess_gillick_competence(self) -> None:
        self.assess_gillick_competence_link.click()

    @step("Click on Edit Gillick competence")
    def click_edit_gillick_competence(self) -> None:
        self.edit_gillick_competence_link.click()

    @step("Click on Could not vaccinate")
    def click_could_not_vaccinate(self) -> None:
        self.could_not_vaccinate_link.click()

    @step("Click on Schedule sessions")
    def click_schedule_sessions(self) -> None:
        self.schedule_sessions_link.click()

    @step("Click on Add session dates")
    def click_add_session_dates(self) -> None:
        self.add_session_dates_link.click()

    @step("Click on Edit session")
    def click_edit_session(self) -> None:
        self.edit_session_link.click()

    @step("Click on Change programmes")
    def click_change_programmes(self) -> None:
        self.change_programmes_link.click()

    def add_programme(self, programme: Programme) -> None:
        self.page.get_by_role("checkbox", name=programme).check()

    def expect_session_to_have_programmes(self, programmes: list[Programme]) -> None:
        for programme in programmes:
            expect(self.page.get_by_text(programme).first).to_be_visible()

    @step("Click on Change session dates")
    def click_change_session_dates(self) -> None:
        self.change_session_dates_link.click()

    @step("Review child with no response")
    def review_child_with_no_response(self) -> None:
        self.review_no_consent_response_link.click()

    @step("Click on session")
    def click_session(self, location: str, programme: Programme) -> None:
        row = self.page.locator("tr").filter(
            has=self.page.locator("strong", has_text=str(programme)),
        )
        row.locator("a", has_text=location).click()

    @step("Click Back")
    def click_back(self) -> None:
        self.back_link.click()

    @step("Click Save changes")
    def click_save_changes(self) -> None:
        self.save_changes_link.click()

    @step("Click on Delete")
    def click_delete(self) -> None:
        self.delete_button.click()

    @step("Click on Mark as invalid")
    def click_mark_as_invalid_link(self) -> None:
        self.mark_as_invalid_link.click()

    @step("Click on Mark as invalid")
    def click_mark_as_invalid_button(self) -> None:
        self.mark_as_invalid_button.click()

    @step("Click on Update results")
    def click_on_update_results(self) -> None:
        self.update_results_button.click()

    @step("Fill notes")
    def fill_notes(self, notes: str) -> None:
        self.notes_textbox.fill(notes)

    @step("Click on Record a new consent response")
    def click_record_a_new_consent_response(self) -> None:
        # temporary wait before clicking the button to prevent errors
        time.sleep(1)
        self.record_a_new_consent_response_button.click()

    @step("Click {1} radio button")
    def click_parent_radio_button(self, name: str) -> None:
        self.page.get_by_role("radio", name=name).check()

    def navigate_to_gillick_competence(
        self, child: Child, programme: Programme
    ) -> None:
        self.click_consent_tab()
        self.click_child(child)
        self.click_programme_tab(programme)
        self.click_assess_gillick_competence()

    def navigate_to_consent_response(self, child: Child, programme: Programme) -> None:
        self.click_child(child)
        self.click_programme_tab(programme)
        self.click_record_a_new_consent_response()

    def navigate_to_update_triage_outcome(
        self, child: Child, programme: Programme
    ) -> None:
        self.click_child(child)
        self.click_programme_tab(programme)
        self.click_update_triage_outcome()

    @step("Click on Confirm")
    def click_confirm_button(self) -> None:
        self.confirm_button.click()

    @step("Check box for year {1}")
    def check_year_checkbox(self, year: int) -> None:
        if year == 0:
            self.page.get_by_role("checkbox", name="Reception").check()
        else:
            self.page.get_by_role("checkbox", name=f"Year {year}").check()

    @step("Uncheck box for year {1}")
    def uncheck_year_checkbox(self, year: int) -> None:
        if year == 0:
            self.page.get_by_role("checkbox", name="Reception").uncheck()
        else:
            self.page.get_by_role("checkbox", name=f"Year {year}").uncheck()

    @step("Click Advanced filters")
    def click_advanced_filters(self) -> None:
        self.advanced_filters_link.click()

    @step("Check Archived records")
    def check_archived_records_checkbox(self) -> None:
        self.archived_records_checkbox.check()

    @step("Click on Record vaccinations")
    def click_record_vaccinations_tab(self) -> None:
        self._select_tab("Record vaccinations")

    @step("Confirm pre-screening checks are true")
    def confirm_pre_screening_checks(
        self,
        programme: Programme,
        consent_option: ConsentOption = ConsentOption.INJECTION,
    ) -> None:
        for check in programme.pre_screening_checks(consent_option):
            locator = self.pre_screening_listitem.get_by_text(check)
            expect(locator).to_be_visible()
        self.page.wait_for_load_state()
        self.pre_screening_checkbox.check()

    @step("Click on Yes")
    def select_identity_confirmed_by_child(self, child: Child) -> None:
        self.page.get_by_role(
            "group",
            name=f"Has {child.first_name} confirmed their identity?",
        ).get_by_label("Yes").check()

    @step("Click on Yes")
    def select_ready_for_vaccination(
        self,
        consent_option: ConsentOption = ConsentOption.INJECTION,
    ) -> None:
        if consent_option is ConsentOption.INJECTION:
            self.ready_for_injection_radio.check()
        else:
            self.ready_for_nasal_spray_radio.check()

    @step("Select vaccination site {1}")
    def select_delivery_site(self, site: DeliverySite) -> None:
        self.page.get_by_role("radio", name=str(site)).check()

    @step("Click on Attending")
    def click_on_attending(self) -> None:
        self.attending_button.click()

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

    @step("Check note {2} appears in search for {1}")
    def check_note_appears_in_search(self, child: Child, note: str) -> None:
        heading = self.page.get_by_role("heading", name=str(child))
        next_element = heading.locator("xpath=following-sibling::*[1]")
        expect(next_element.get_by_role("blockquote")).to_have_text(note)

    def add_note(self, note: str) -> None:
        self.click_add_a_note()
        self.fill_note_textbox(note)
        with self.page.expect_navigation():
            self.click_save_note()

        self.expect_alert_text("Note added")
        reload_until_element_is_visible(self.page, self.page.get_by_text(note))

    @step("Click on Set session in progress for today")
    def click_set_session_in_progress_for_today(self) -> None:
        self.set_session_in_progress_button.click()

    @step("Search for {1}")
    def search_for(self, name: str) -> None:
        self.search_textbox.fill(name)
        self.search_button.click()

    @step("Fill date fields with {1}")
    def fill_date_fields(self, date: str, *, edit_existing_date: bool = False) -> None:
        day, month, year = get_day_month_year_from_compact_date(date)

        if (
            not self.day_textbox.first.is_visible()
            or self.day_textbox.first.input_value() != ""
        ):
            self.click_add_another_date()

        if edit_existing_date:
            self.day_textbox.first.fill(str(day))
            self.month_textbox.first.fill(str(month))
            self.year_textbox.first.fill(str(year))
        else:
            self.day_textbox.last.fill(str(day))
            self.month_textbox.last.fill(str(month))
            self.year_textbox.last.fill(str(year))

    def session_date_already_scheduled(self, date: str) -> bool:
        day, month, year = get_day_month_year_from_compact_date(date)

        for i in range(len(self.day_textbox.all())):
            if (
                self.day_textbox.nth(i).input_value() == str(day)
                and self.month_textbox.nth(i).input_value() == str(month)
                and self.year_textbox.nth(i).input_value() == str(year)
            ):
                return True

        return False

    @step("Add another date")
    def click_add_another_date(self) -> None:
        self.add_another_date_button.click()

    @step("Click on Record offline")
    def download_offline_recording_excel(self) -> Path:
        _file_path = Path(f"working/excel_{get_current_datetime_compact()}.xlsx")

        with self.page.expect_download() as download_info:
            self.record_offline_link.click()
        download = download_info.value
        download.save_as(_file_path)

        return _file_path

    @step("Download the offline recording excel and verify consent message pattern")
    def verify_consent_message_in_excel(self) -> None:
        _file_path = self.download_offline_recording_excel()
        _data_frame = pd.read_excel(_file_path, sheet_name="Vaccinations", dtype=str)
        _consent_details_pattern = (
            r"On \d{4}-\d{2}-\d{2} at \d{2}:\d{2} (GIVEN|REFUSED) by "
            r"[A-Z][a-z]+(?: [A-Z][a-z]+)*"
        )
        invalid_found = _data_frame["CONSENT_DETAILS"].apply(
            lambda x: pd.notna(x) and len(re.findall(_consent_details_pattern, x)) == 0
        )
        # Raise error if any invalid entry is found
        if invalid_found.any():
            msg = "CONSENT_DETAILS has entries in an invalid format."
            raise ValueError(msg)

    @step("Click on Download the {1} consent form (PDF)")
    def download_consent_form(self, programme: Programme) -> Path:
        _file_path = Path(f"working/consent_{get_current_datetime_compact()}.pdf")

        with self.page.expect_download() as download_info:
            self.page.get_by_role(
                "link", name=f"Download the {programme} consent form (PDF)"
            ).click()
        download = download_info.value
        download.save_as(_file_path)

        return _file_path

    def expect_consent_refused_text(self, parent: Parent) -> None:
        expect(
            self.page.get_by_text(f"{parent.relationship} refused to give consent."),
        ).to_be_visible()

    def check_session_activity_entry(self, text: str) -> None:
        expect(self.page.get_by_role("heading", name=text).first).to_be_visible()

    def expect_conflicting_consent_text(self) -> None:
        expect(
            self.page.get_by_text(
                "You can only vaccinate if all respondents give consent.",
            ),
        ).to_be_visible()

    def expect_consent_status(self, programme: Programme, status: str) -> None:
        expect(self.page.get_by_text(f"{programme}: {status}")).to_be_visible()

    def expect_child_safe_to_vaccinate(self, child: Child) -> None:
        expect(
            self.page.get_by_text(
                f"NURSE, Nurse decided that {child!s} is safe to vaccinate.",
            ),
        ).to_be_visible()

    def get_session_id_from_offline_excel(self) -> str:
        file_path = self.download_offline_recording_excel()
        return get_session_id(file_path)

    @step("Click Sessions")
    def click_sessions(self) -> None:
        self.sessions_link.click()

    def __schedule_session(self, date: str) -> None:
        self.schedule_or_edit_session()
        self.add_or_change_session_dates()
        if not self.session_date_already_scheduled(date):
            self.fill_date_fields(date)
        self.click_continue_button()

    @step("Go to Edit session page")
    def schedule_or_edit_session(self) -> None:
        locator = self.schedule_sessions_link.or_(self.edit_session_link).first
        # temporary wait to prevent page not found error
        time.sleep(1)
        locator.click()

    @step("Go to Change session dates page")
    def add_or_change_session_dates(self) -> None:
        locator = self.add_session_dates_link.or_(self.change_session_dates_link).first
        locator.click()

    def __edit_session(self, date: str) -> None:
        self.click_edit_session()
        self.click_change_session_dates()
        if not self.session_date_already_scheduled(date):
            self.fill_date_fields(date, edit_existing_date=True)
        self.click_continue_button()
        self.click_save_changes()
        expect(
            self.page.locator("div")
            .filter(has_text=re.compile(r"^Session datesNot provided$"))
            .get_by_role("definition"),
        ).not_to_be_visible()

    def verify_triage_updated_for_child(self) -> None:
        self.expect_alert_text("Triage outcome updated")

    def invalidate_parent_refusal(self, parent: Parent) -> None:
        invalidation_notes = "Invalidation notes."
        self.click_response_from_parent(parent)
        self.click_mark_as_invalid_link()
        self.fill_notes(invalidation_notes)
        self.click_mark_as_invalid_button()
        self.expect_details("Response", "Invalid")
        self.expect_details("Notes", invalidation_notes)

        self.click_back()
        self.expect_details("Response", "Invalid")
        expect(self.page.get_by_text("No requests have been sent.")).to_be_visible()

    def expect_details(self, key: str, value: str) -> None:
        detail_key = self.page.locator(
            ".nhsuk-summary-list__key",
            has_text=re.compile(f"^{key}$"),
        ).first
        detail_value = detail_key.locator("xpath=following-sibling::*[1]")

        expect(detail_value).to_contain_text(value)

    def ensure_session_scheduled_for_today(
        self,
        location: str,
        programme_group: str,
    ) -> None:
        self.click_session_for_programme_group(location, programme_group)
        todays_date = get_todays_date().strftime("%Y%m%d")
        if not self.page.get_by_text(
            self.__get_display_formatted_date(date_to_format=todays_date),
        ).is_visible():
            self.schedule_a_valid_session(offset_days=0, skip_weekends=False)

    def ensure_session_scheduled_for_next_week(
        self, location: str, programme_group: str
    ) -> None:
        self.click_session_for_programme_group(location, programme_group)
        future_date = get_offset_date_compact_format(offset_days=7)
        if not self.page.get_by_text(
            self.__get_display_formatted_date(date_to_format=future_date),
        ).is_visible():
            self.schedule_a_valid_session(offset_days=7)

    def schedule_a_valid_session(
        self,
        offset_days: int = 7,
        *,
        skip_weekends: bool = True,
    ) -> None:
        _future_date = get_offset_date_compact_format(
            offset_days=offset_days, skip_weekends=skip_weekends
        )
        self.__schedule_session(date=_future_date)

        if self.keep_session_dates_button.is_visible():
            self.click_keep_session_dates()  # MAV-2066

        self.expect_details(
            "Session dates",
            self.__get_display_formatted_date(date_to_format=_future_date),
        )
        self.click_save_changes()

    def schedule_a_valid_mmr_session(
        self,
        offset_days: int = 7,
        *,
        skip_weekends: bool = True,
    ) -> None:
        _future_date = get_offset_date_compact_format(
            offset_days=offset_days, skip_weekends=skip_weekends
        )
        self.schedule_or_edit_session()
        self.click_change_programmes()
        self.add_programme(Programme.MMR)
        self.click_continue_button()
        self.add_or_change_session_dates()
        if not self.session_date_already_scheduled(_future_date):
            self.fill_date_fields(_future_date)
        self.click_continue_button()

        if self.keep_session_dates_button.is_visible():
            self.click_keep_session_dates()  # MAV-2066

        self.expect_details(
            "Session dates",
            self.__get_display_formatted_date(date_to_format=_future_date),
        )
        self.click_save_changes()

    @step("Click Keep session dates")
    def click_keep_session_dates(self) -> None:
        self.keep_session_dates_button.click()

    def is_catch_up(self, programme: Programme, year_group: int) -> bool:
        if programme is Programme.MMR:
            return True
        if programme is Programme.FLU:
            return False

        return year_group != programme.year_groups[0]

    def edit_a_session_to_today(self, location: str, programme_group: str) -> None:
        _future_date = get_offset_date_compact_format(offset_days=0)
        self.click_session_for_programme_group(location, programme_group)
        self.__edit_session(date=_future_date)

    def delete_all_sessions(self, school: School) -> None:
        sessions_with_dates = (
            self.page.locator("div.nhsuk-card__content.app-card__content")
            .filter(has_text=str(school))
            .filter(has_text="Sessions scheduled")
            .filter(has_not_text="No sessions scheduled")
        )
        for programme in Programme:
            self.page.get_by_role("checkbox", name=str(programme)).uncheck()

        self.search_textbox.clear()
        self.search_button.click()

        for session in sessions_with_dates.all():
            session.click()
            self.click_edit_session()
            self.click_change_session_dates()

            for button in self.delete_button.all():
                button.click()
                self.page.wait_for_load_state()

            self.click_back()
            self.click_save_changes()
            self.click_sessions()

    def create_invalid_session(self, location: str, programme_group: str) -> None:
        _invalid_date = "20251332"
        self.click_session_for_programme_group(location, programme_group)
        self.__schedule_session(_invalid_date)
        self.expect_alert_text("Enter a date")
        self.click_back()

    def create_session_in_previous_academic_year(self) -> None:
        _previous_year_date = get_offset_date_compact_format(offset_days=-365)
        self.add_or_change_session_dates()
        if not self.session_date_already_scheduled(_previous_year_date):
            self.fill_date_fields(_previous_year_date)
        self.click_continue_button()
        self.expect_alert_text("Enter a date on or after the start of the school year")
        self.click_back()

    def create_session_in_next_academic_year(self) -> None:
        _next_year_date = get_offset_date_compact_format(offset_days=365)
        self.add_or_change_session_dates()
        if not self.session_date_already_scheduled(_next_year_date):
            self.fill_date_fields(_next_year_date)
        self.click_continue_button()
        self.expect_alert_text(
            "Enter a date on or before the end of the current school year"
        )
        self.click_back()

    def get_online_consent_url(self, *programmes: list[Programme]) -> str:
        programme_names = [str(programme) for programme in programmes]
        link_text = f"View the {' and '.join(programme_names)} online consent form"
        return str(self.page.get_by_role("link", name=link_text).get_attribute("href"))

    def register_child_as_attending(self, child: Child) -> None:
        self.click_register_tab()
        self.search_for(str(child))
        self.click_on_attending()

    def verify_search(self) -> None:
        self.click_consent_tab()
        self.search_for("a very long string that won't match any names")
        expect(
            self.page.get_by_text("No children matching search criteria found"),
        ).to_be_visible()

    def search_child(self, child: Child) -> None:
        self.search_for(str(child))
        child_locator = self.page.get_by_role("link", name=str(child))
        reload_until_element_is_visible(self.page, child_locator)
        child_locator.click()

    def record_vaccination_for_child(
        self,
        vaccination_record: VaccinationRecord,
        notes: str = "",
        *,
        at_school: bool = True,
        psd_option: bool = False,
    ) -> datetime:
        self.click_record_vaccinations_tab()
        self.search_child(vaccination_record.child)
        self.click_programme_tab(vaccination_record.programme)

        self.confirm_pre_screening_checks(
            vaccination_record.programme, vaccination_record.consent_option
        )
        self.pre_screening_notes.fill(notes)

        self.select_identity_confirmed_by_child(vaccination_record.child)

        self.select_ready_for_vaccination(vaccination_record.consent_option)
        if vaccination_record.consent_option is ConsentOption.INJECTION:
            self.select_delivery_site(vaccination_record.delivery_site)
        self.click_continue_button()

        if len(notes) > MAVIS_NOTE_LENGTH_LIMIT:
            expect(self.notes_length_error).to_be_visible()
            self.pre_screening_notes.fill("Prescreening notes")
            self.click_continue_button()

        self.choose_batch(vaccination_record.batch_name)

        if at_school:  # only skips MAV-854
            if psd_option:
                self.expect_details("Protocol", "Patient Specific Direction")
            else:
                self.expect_details("Protocol", "Patient Group Direction (PGD)")

            self.vaccination_notes.fill(notes)
            self.click_confirm_button()

            if len(notes) > MAVIS_NOTE_LENGTH_LIMIT:
                expect(self.notes_length_error).to_be_visible()
                self.vaccination_notes.fill("Confirmation notes")
                self.click_confirm_button()

            self.expect_alert_text(
                f"Vaccination outcome recorded for {vaccination_record.programme}"
            )
        return get_current_datetime()

    @step("Choose batch {1}")
    def choose_batch(self, batch_name: str) -> None:
        self.page.get_by_role("radio", name=batch_name).check()
        self.click_continue_button()

    def expect_alert_text(self, text: str) -> None:
        expect(self.page.get_by_role("alert")).to_contain_text(text)

    def verify_child_shows_correct_flu_consent_method(
        self,
        child: Child,
        option: ConsentOption,
    ) -> None:
        flu_consent_section = self.get_flu_consent_status_locator_from_search(child)

        expect(flu_consent_section).to_contain_text("Consent given")
        if option is ConsentOption.INJECTION:
            method_locator = flu_consent_section.get_by_text("injection")
        else:
            method_locator = flu_consent_section.get_by_text("nasal spray")

        reload_until_element_is_visible(self.page, method_locator)

    def get_flu_consent_status_locator_from_search(self, child: Child) -> Locator:
        patient_card = self.page.locator(
            f'div.nhsuk-card.app-card.app-card--compact:has(h4:has-text("{child!s}"))',
        )
        flu_consent_section = patient_card.locator("p:has-text('Flu')")
        reload_until_element_is_visible(self.page, flu_consent_section)

        return flu_consent_section

    @step("Click on {1} vaccination details")
    def click_vaccination_details(self, school: School) -> None:
        with self.page.expect_navigation():
            self.vaccinations_card_row.filter(has_text=str(school)).get_by_role(
                "link",
            ).click()

    def expect_text_to_not_be_visible(self, text: str) -> None:
        expect(self.page.get_by_text(text)).not_to_be_visible()

    @step("Click on Change patient specific direction")
    def click_change_psd(self) -> None:
        self.change_psd_link.click()

    @step("Answer whether PSD should be enabled with {1}")
    def answer_whether_psd_should_be_enabled(self, answer: str) -> None:
        self.page.get_by_role(
            "group",
            name=(
                "Can healthcare assistants administer the flu nasal spray vaccine"
                " using a patient specific direction (PSD)?"
            ),
        ).get_by_label(answer).check()

    @step("Check {1} has PSD")
    def check_child_has_psd(self, child: Child) -> None:
        patient_card = self.page.locator(
            f'div.nhsuk-card.app-card.app-card--compact:has(h4:has-text("{child!s}"))'
        )
        reload_until_element_is_visible(
            self.page, patient_card.get_by_text("PSD added")
        )

    @step("Check {1} does not have PSD")
    def check_child_does_not_have_psd(self, child: Child) -> None:
        patient_card = self.page.locator(
            f'div.nhsuk-card.app-card.app-card--compact:has(h4:has-text("{child!s}"))'
        )
        reload_until_element_is_visible(
            self.page, patient_card.get_by_text("PSD not added")
        )

    @step("Click on Send reminders")
    def click_send_reminders(self, school: School) -> None:
        self.send_reminders_link.click()
        expect(
            self.page.get_by_role("heading", name="Manage consent reminders")
        ).to_be_visible()
        self.page.get_by_role(
            "link", name=school.name
        ).click()  # Update when MAV-2048 is done

    @step("Click Add new PSDs")
    def click_add_new_psds(self) -> None:
        self.add_new_psds_link.click()

    @step("Click Yes, add PSDs")
    def click_yes_add_psds(self) -> None:
        self.yes_add_psds_button.click()

    @step("Check PSD banner")
    def verify_psd_banner_has_patients(self, number_of_patients: int) -> None:
        psd_banner = self.page.get_by_text(
            f"There are {number_of_patients} children with consent"
        )
        reload_until_element_is_visible(self.page, psd_banner)

    @step("Go back to Record Vaccinations")
    def click_back_to_record_vaccinations(self) -> None:
        self.record_vaccinations_breadcrumb.click()

    def check_tally_for_category(self, programme: Programme, category: str) -> None:
        self.click_overview_tab()
        for programme_category in programme.tally_categories:
            if programme_category == category:
                assert self.get_total_for_category(programme_category) == 1
            else:
                assert self.get_total_for_category(programme_category) == 0

    def get_total_for_category(self, category: str) -> int:
        category_locator = self.page.locator(
            ".nhsuk-card__heading.nhsuk-heading-xs", has_text=category
        )
        total_locator = category_locator.locator("xpath=following-sibling::*[1]")
        return int(total_locator.inner_text())

    @step("Click response from {1}")
    def click_response_from_parent(self, parent: Parent) -> None:
        self.page.get_by_role("link", name=parent.full_name).click()

    def click_withdraw_consent(self) -> None:
        self.withdraw_consent_link.click()

    def go_back_to_session_for_school(self, school: School) -> None:
        self.page.get_by_role("link", name=school.name).click()
        expect(self.page.get_by_role("heading", name=school.name).first).to_be_visible()
