import re
import time
from datetime import datetime
from pathlib import Path
from typing import List

from playwright.sync_api import Page, expect

from mavis.test.data import TestData
from mavis.test.models import (
    Programme,
    Parent,
    Child,
    ConsentOption,
    DeliverySite,
    School,
)
from mavis.test.annotations import step
from mavis.test.wrappers import (
    generate_random_string,
    get_current_datetime,
    get_offset_date,
    reload_until_element_is_visible,
)


class SessionsPage:
    def __init__(
        self,
        test_data: TestData,
        page: Page,
    ):
        self.test_data = test_data
        self.page = page

        self.today_tab_link = self.page.get_by_role("link", name="Today")
        self.scheduled_tab_link = self.page.get_by_role(
            "link", name="Scheduled", exact=True
        )
        self.unscheduled_tab_link = self.page.get_by_role("link", name="Unscheduled")
        self.no_response_checkbox = self.page.get_by_role(
            "checkbox", name="No response"
        )
        self.update_results_button = self.page.get_by_role(
            "button", name="Update results"
        )
        self.consent_given_checkbox = self.page.get_by_role(
            "checkbox", name="Consent given"
        )
        self.conflicting_consent_checkbox = self.page.get_by_role(
            "checkbox", name="Conflicting consent"
        )

        self.programme_tab_link = self.page.get_by_role("link", name="Programme")
        self.import_class_lists_link = self.page.get_by_role(
            "link", name="Import class lists"
        )
        self.continue_button = self.page.get_by_role("button", name="Continue")
        self.file_input = self.page.locator('input[type="file"]')
        self.filter_name_textbox = self.page.get_by_role("textbox", name="Name")

        self.update_triage_outcome_link = self.page.get_by_role(
            "link", name="Update triage outcome"
        )
        self.safe_to_vaccinate_radio = self.page.get_by_role(
            "radio", name="Yes, it’s safe to vaccinate"
        )
        self.save_triage_button = self.page.get_by_role("button", name="Save triage")
        self.assess_gillick_competence_link = self.page.get_by_role(
            "link", name="Assess Gillick competence"
        )
        self.edit_gillick_competence_link = self.page.get_by_role(
            "link", name="Edit Gillick competence"
        )
        self.could_not_vaccinate_link = self.page.get_by_role(
            "link", name="Could not vaccinate"
        )
        self.consent_refused_checkbox = self.page.get_by_role(
            "checkbox", name="Consent refused"
        )
        self.record_offline_link = self.page.get_by_role("link", name="Record offline")
        self.assessment_notes_textbox = self.page.get_by_role(
            "textbox", name="Assessment notes (optional)"
        )
        self.complete_assessment_button = self.page.get_by_role(
            "button", name="Complete your assessment"
        )
        self.update_assessment_button = self.page.get_by_role(
            "button", name="Update your assessment"
        )
        self.schedule_sessions_link = self.page.get_by_role(
            "link", name="Schedule sessions"
        )
        self.add_session_dates_link = self.page.get_by_role(
            "link", name="Add session dates"
        )
        self.day_textbox = self.page.get_by_role("textbox", name="Day")
        self.month_textbox = self.page.get_by_role("textbox", name="Month")
        self.year_textbox = self.page.get_by_role("textbox", name="Year")
        self.edit_session_link = self.page.get_by_role("link", name="Edit session")
        self.close_session_link = self.page.get_by_role("link", name="Close session")
        self.change_session_dates_link = self.page.get_by_role(
            "link", name="Change session dates"
        )
        self.delete_button = self.page.get_by_role("button", name="Delete")
        self.back_link = self.page.get_by_role("link", name="Back", exact=True)
        self.back_to_child_link = self.page.get_by_role("link", name="Back  to ")
        self.continue_link = self.page.get_by_role("link", name="Continue")
        self.mark_as_invalid_link = self.page.get_by_role(
            "link", name="Mark as invalid"
        )
        self.mark_as_invalid_button = self.page.get_by_role(
            "button", name="Mark as invalid"
        )
        self.notes_textbox = self.page.get_by_role("textbox", name="Notes")
        self.record_a_new_consent_response_button = self.page.get_by_role(
            "button", name="Record a new consent response"
        )
        self.update_results_button = self.page.get_by_role(
            "button", name="Update results"
        )
        self.confirm_button = self.page.get_by_role("button", name="Confirm")
        self.search_textbox = self.page.get_by_role("textbox", name="Search")
        self.search_button = self.page.get_by_role("button", name="Search")
        self.record_vaccinations_link = self.page.get_by_role(
            "link", name="Record vaccinations"
        )
        self.ready_for_injection_radio = self.page.locator(
            "#vaccinate-form-vaccine-method-injection-field"
        )
        self.ready_for_nasal_spray_radio = self.page.locator(
            "#vaccinate-form-vaccine-method-nasal-field"
        )
        self.attending_button = self.page.get_by_role("button", name="Attending").first
        self.notes_length_error = (
            page.locator("div").filter(has_text="There is a problemEnter").nth(3)
        )
        self.vaccination_notes = self.page.get_by_role(
            "textbox", name="Notes (optional)"
        )

        pre_screening = self.page.locator("section").filter(
            has=page.get_by_role("heading", name="Pre-screening checks")
        )
        self.change_programmes_link = self.page.get_by_role(
            "link", name="Change   programmes"
        )
        self.flu_programme_checkbox = self.page.get_by_role("checkbox", name="Flu")
        self.hpv_programme_checkbox = self.page.get_by_role("checkbox", name="HPV")
        self.menacwy_programme_checkbox = self.page.get_by_role(
            "checkbox", name="MenACWY"
        )
        self.td_ipv_programme_checkbox = self.page.get_by_role(
            "checkbox", name="Td/IPV"
        )
        self.pre_screening_listitem = pre_screening.get_by_role("listitem")
        self.pre_screening_checkbox = pre_screening.get_by_role("checkbox")
        self.pre_screening_notes = pre_screening.get_by_role(
            "textbox", name="Pre-screening notes (optional)"
        )
        self.review_no_consent_response_link = self.page.get_by_role(
            "link", name="with no response"
        )
        self.in_person_radio = self.page.get_by_text("In person")
        self.no_they_no_not_agree_radio = self.page.get_by_text("No, they do not agree")
        self.consent_refusal_reason_other_radio = self.page.get_by_text("Other")
        self.consent_refusal_details_textbox = self.page.get_by_role(
            "textbox", name="Give details"
        )
        self.review_consent_refused_link = self.page.get_by_role(
            "link", name="Review   consent refused"
        )
        self.overview_tab_link = self.page.get_by_role("link", name="Overview")

        self.note_textbox = self.page.get_by_role("textbox", name="Note")
        self.add_a_note_span = self.page.get_by_text("Add a note")
        self.save_note_button = self.page.get_by_role("button", name="Save note")
        self.set_session_in_progress_button = self.page.get_by_role(
            "button", name="Set session in progress for today"
        )
        vaccinations_card = page.get_by_role("table", name="Vaccinations")
        self.vaccinations_card_row = vaccinations_card.get_by_role("row")
        self.sessions_link = page.get_by_role("link", name="Sessions", exact=True).first
        self.advanced_filters_link = page.get_by_text("Advanced filters")
        self.archived_records_checkbox = self.page.get_by_role(
            "checkbox", name="Archived records"
        )
        self.send_clinic_invitations_link = self.page.get_by_role(
            "link", name="Send clinic invitations"
        )
        self.send_clinic_invitations_button = self.page.get_by_role(
            "button", name="Send clinic invitations"
        )
        self.current_academic_year_radio = self.page.get_by_role(
            "radio", name="2024 to 2025"
        )

    def __get_display_formatted_date(self, date_to_format: str) -> str:
        _parsed_date = datetime.strptime(date_to_format, "%Y%m%d")
        _formatted_date = _parsed_date.strftime("%A, %d %B %Y").replace(" 0", " ")
        return _formatted_date

    @step("Click on Overview tab")
    def click_overview_tab(self):
        self._select_tab("Overview")

    @step("Click Review consent refused")
    def click_review_consent_refused(self):
        self.review_consent_refused_link.click()

    @step("Expect Consent refused checkbox to be checked")
    def expect_consent_refused_checkbox_to_be_checked(self):
        expect(self.consent_refused_checkbox).to_be_checked()

    @step("Select No response")
    def select_no_response(self):
        self.no_response_checkbox.check()
        self.update_results_button.click()

    @step("Select Consent given")
    def select_consent_given(self):
        self.consent_given_checkbox.check()
        self.update_results_button.click()

    @step("Select Conflicting consent")
    def select_conflicting_consent(self):
        self.conflicting_consent_checkbox.check()
        self.update_results_button.click()

    @step("Select Consent refused")
    def select_consent_refused(self):
        self.consent_refused_checkbox.check()
        self.update_results_button.click()

    def _select_tab(self, name: str):
        link = self.page.get_by_role("navigation").get_by_role("link", name=name)
        if link.get_by_role("strong").is_visible():
            return
        link.click()
        link.get_by_role("strong").wait_for()

    @step("Click on {1} tab")
    def click_programme_tab(self, programme: Programme):
        self._select_tab(str(programme))

    @step("Click on Register tab")
    def click_register_tab(self):
        self._select_tab("Register")

    @step("Click on Session activity and notes tab")
    def click_session_activity_and_notes(self):
        self._select_tab("Session activity and notes")

    @step("Click on {2} session at {1}")
    def click_session_for_programme_group(self, location: str, programme_group: str):
        for programme in Programme:
            if programme.group == programme_group:
                self.page.get_by_role("checkbox", name=str(programme)).check()
            else:
                self.page.get_by_role("checkbox", name=str(programme)).uncheck()

        self.current_academic_year_radio.check()
        self.search_textbox.fill(str(location))
        self.search_button.click()

        self.page.get_by_role("link", name=str(location)).click()

        expect(self.page.locator("h1", has_text=str(location))).to_be_visible(
            timeout=10000
        )

    @step("Click on location radio {1}")
    def check_location_radio(self, location: str):
        self.page.get_by_role("radio", name=str(location)).check()

    @step("Click on Import class lists")
    def click_import_class_lists(self):
        self.import_class_lists_link.click()

    @step("Click on Continue")
    def click_continue_button(self):
        self.continue_button.click()

    @step("Upload file {1}")
    def choose_file_child_records(self, file_path: str):
        self.file_input.set_input_files(file_path)

    @step("Click on child {1}")
    def click_child(self, child: Child):
        with self.page.expect_navigation():
            self.page.get_by_role("heading", name=str(child)).get_by_role(
                "link"
            ).first.click()

    @step("Search and click on {1}")
    def search_and_click_child(self, child: Child):
        self.filter_name_textbox.fill(str(child))
        self.click_child(child)

    @step("Click on Update triage outcome")
    def click_update_triage_outcome(self):
        self.update_triage_outcome_link.click()

    @step("Click on Yes, it’s safe to vaccinate")
    def select_yes_safe_to_vaccinate(self):
        self.safe_to_vaccinate_radio.click()

    @step("Click on Save triage")
    def click_save_triage(self):
        self.save_triage_button.click()

    @step("Click on Consent tab")
    def click_consent_tab(self):
        self._select_tab("Consent")

    @step("Click on Assess Gillick competence")
    def click_assess_gillick_competence(self):
        self.assess_gillick_competence_link.click()

    @step("Click on Edit Gillick competence")
    def click_edit_gillick_competence(self):
        self.edit_gillick_competence_link.click()

    @step("Click on Could not vaccinate")
    def click_could_not_vaccinate(self):
        self.could_not_vaccinate_link.click()

    @step("Click on Schedule sessions")
    def click_schedule_sessions(self):
        self.schedule_sessions_link.click()

    @step("Click on Add session dates")
    def click_add_session_dates(self):
        self.add_session_dates_link.click()

    @step("Click on Edit session")
    def click_edit_session(self):
        self.edit_session_link.click()

    @step("Click on Change session dates")
    def click_change_session_dates(self):
        self.change_session_dates_link.click()

    @step("Review child with no response")
    def review_child_with_no_response(self):
        self.review_no_consent_response_link.click()

    @step("Click on session")
    def click_session(self, location: str, programme: Programme):
        row = self.page.locator("tr").filter(
            has=self.page.locator("strong", has_text=str(programme))
        )
        row.locator("a", has_text=location).click()

    @step("Click Back")
    def click_back(self):
        self.back_link.click()

    @step("Click Back")
    def click_back_to_child(self):
        self.back_to_child_link.click()

    @step("Click Continue")
    def click_continue_link(self):
        self.continue_link.click()

    @step("Click on Delete")
    def click_delete(self):
        self.delete_button.click()

    @step("Click on Mark as invalid")
    def click_mark_as_invalid_link(self):
        self.mark_as_invalid_link.click()

    @step("Click on Mark as invalid")
    def click_mark_as_invalid_button(self):
        self.mark_as_invalid_button.click()

    @step("Click on Update results")
    def click_on_update_results(self):
        self.update_results_button.click()

    @step("Fill notes")
    def fill_notes(self, notes: str):
        self.notes_textbox.fill(notes)

    @step("Click Send clinic invitations")
    def click_send_clinic_invitations_link(self):
        self.send_clinic_invitations_link.click()

    @step("Click Send clinic invitations")
    def click_send_clinic_invitations_button(self):
        self.send_clinic_invitations_button.click()

    @step("Click on Record a new consent response")
    def click_record_a_new_consent_response(self):
        # temporary wait before clicking the button to prevent errors
        time.sleep(3)
        self.record_a_new_consent_response_button.click()

    @step("Click {1} radio button")
    def click_parent_radio_button(self, name: str) -> None:
        self.page.get_by_role("radio", name=name).check()

    def navigate_to_gillick_competence(self, child: Child, programme: Programme):
        self.click_consent_tab()
        self.click_child(child)
        self.click_programme_tab(programme)
        self.click_assess_gillick_competence()

    def navigate_to_consent_response(self, child: Child, programme: Programme):
        self.click_child(child)
        self.click_programme_tab(programme)
        self.click_record_a_new_consent_response()

    def navigate_to_update_triage_outcome(self, child: Child, programme: Programme):
        self.click_child(child)
        self.click_programme_tab(programme)
        self.click_update_triage_outcome()

    @step("Click on Confirm")
    def click_confirm_button(self):
        self.confirm_button.click()

    @step("Check box for year {1}")
    def check_year_checkbox(self, year: int):
        if year == 0:
            self.page.get_by_role("checkbox", name="Reception").check()
        else:
            self.page.get_by_role("checkbox", name=f"Year {year}").check()

    @step("Uncheck box for year {1}")
    def uncheck_year_checkbox(self, year: int):
        if year == 0:
            self.page.get_by_role("checkbox", name="Reception").uncheck()
        else:
            self.page.get_by_role("checkbox", name=f"Year {year}").uncheck()

    @step("Click Advanced filters")
    def click_advanced_filters(self):
        self.advanced_filters_link.click()

    @step("Check Archived records")
    def check_archived_records_checkbox(self):
        self.archived_records_checkbox.check()

    @step("Click on Record vaccinations")
    def click_record_vaccinations_tab(self):
        self._select_tab("Record vaccinations")

    @step("Confirm pre-screening checks are true")
    def confirm_pre_screening_checks(
        self,
        programme: Programme,
        consent_option: ConsentOption = ConsentOption.INJECTION,
    ):
        for check in programme.pre_screening_checks(consent_option):
            locator = self.pre_screening_listitem.get_by_text(check)
            # TODO: Can we highlight in the report that we're checking this?
            expect(locator).to_be_visible()
        self.pre_screening_checkbox.check()

    @step("Click on Yes")
    def select_identity_confirmed_by_child(self, child: Child):
        self.page.get_by_role(
            "group", name=f"Has {child.first_name} confirmed their identity?"
        ).get_by_label("Yes").check()

    @step("Click on Yes")
    def select_ready_for_vaccination(
        self, consent_option: ConsentOption = ConsentOption.INJECTION
    ):
        if consent_option is ConsentOption.INJECTION:
            self.ready_for_injection_radio.check()
        else:
            self.ready_for_nasal_spray_radio.check()

    @step("Select vaccination site {1}")
    def select_delivery_site(self, site: DeliverySite):
        self.page.get_by_role("radio", name=str(site)).check()

    @step("Click on Attending")
    def click_on_attending(self):
        self.attending_button.click()

    @step("Click on Complete your assessment")
    def click_complete_assessment(self):
        self.complete_assessment_button.click()

    @step("Click on Update your assessment")
    def click_update_assessment(self):
        self.update_assessment_button.click()

    @step("Check notes length error appears")
    def check_notes_length_error_appears(self):
        expect(self.notes_length_error).to_be_visible()

    @step("Fill assessment notes with {1}")
    def fill_assessment_notes(self, notes: str):
        self.assessment_notes_textbox.fill(notes)

    def fill_assessment_notes_with_string_of_length(self, length: int):
        notes = generate_random_string(target_length=length, spaces=True)
        self.fill_assessment_notes(notes)

    @step("Click on Add a note")
    def click_add_a_note(self):
        self.add_a_note_span.click()

    @step("Fill note textbox with {1}")
    def fill_note_textbox(self, note: str):
        self.note_textbox.fill(note)

    @step("Click on Save note")
    def click_save_note(self):
        self.save_note_button.click()

    @step("Check that notes appear in order")
    def check_notes_appear_in_order(self, notes: List[str]):
        for i, note in enumerate(notes):
            expect(self.page.get_by_role("blockquote").nth(i)).to_have_text(note)

    @step("Check note {2} appears in search for {1}")
    def check_note_appears_in_search(self, child: Child, note: str):
        heading = self.page.get_by_role("heading", name=str(child))
        next_element = heading.locator("xpath=following-sibling::*[1]")
        expect(next_element.get_by_role("blockquote")).to_have_text(note)

    def add_note(self, note: str):
        self.click_add_a_note()
        self.fill_note_textbox(note)
        with self.page.expect_navigation():
            self.click_save_note()

        self.expect_alert_text("Note added")
        reload_until_element_is_visible(self.page, self.page.get_by_text(note))

        self.check_notes_appear_in_order([note])

    @step("Click on Set session in progress for today")
    def click_set_session_in_progress_for_today(self):
        self.set_session_in_progress_button.click()

    @step("Search for {1}")
    def search_for(self, name: str):
        self.search_textbox.fill(name)
        self.search_button.click()

    @step("Fill date fields")
    def fill_date_fields(self, day: str, month: str, year: str):
        self.day_textbox.fill(day)
        self.month_textbox.fill(month)
        self.year_textbox.fill(year)

    @step("Click on Record offline")
    def download_offline_recording_excel(self) -> Path:
        _file_path = Path(f"working/excel_{get_current_datetime()}.xlsx")

        with self.page.expect_download() as download_info:
            self.record_offline_link.click()
        download = download_info.value
        download.save_as(_file_path)

        return _file_path

    def expect_consent_refused_text(self, parent: Parent):
        expect(
            self.page.get_by_text(f"{parent.relationship} refused to give consent.")
        ).to_be_visible()

    def check_session_activity_entry(self, text: str):
        expect(self.page.get_by_role("heading", name=text).first).to_be_visible()

    def expect_conflicting_consent_text(self):
        expect(
            self.page.get_by_text(
                "You can only vaccinate if all respondents give consent."
            )
        ).to_be_visible()

    def expect_consent_status(self, programme: Programme, status: str):
        expect(self.page.get_by_text(f"{programme}: {status}")).to_be_visible()

    def expect_child_safe_to_vaccinate(self, child: Child):
        expect(
            self.page.get_by_text(
                f"NURSE, Nurse decided that {str(child)} is safe to vaccinate."
            )
        ).to_be_visible()

    def get_session_id_from_offline_excel(self):
        file_path = self.download_offline_recording_excel()
        return self.test_data.get_session_id(file_path)

    @step("Add Gillick competence details")
    def add_gillick_competence(
        self,
        is_competent: bool,
    ) -> None:
        self.__set_gillick_competence(
            is_add=True,
            is_competent=is_competent,
        )

    @step("Click Sessions")
    def click_sessions(self) -> None:
        self.sessions_link.click()

    @step("Edit Gillick competence details")
    def edit_gillick_competence(
        self,
        is_competent: bool,
    ) -> None:
        self.__set_gillick_competence(
            is_add=False,
            is_competent=is_competent,
        )

    def __set_gillick_competence(
        self,
        is_add: bool,
        is_competent: bool,
    ) -> None:
        self.answer_gillick_competence_questions(is_competent)
        competence_assessment = (
            f"Child assessed as {'' if is_competent else 'not '}Gillick competent"
        )

        self.assessment_notes_textbox.fill(competence_assessment)
        if is_add:
            self.click_complete_assessment()
        else:
            self.click_update_assessment()

        competence_result_locator = self.page.get_by_role(
            "heading", name="Gillick assessment"
        ).locator("xpath=following-sibling::*[1]")

        expect(competence_result_locator).to_contain_text(competence_assessment)

    def answer_gillick_competence_questions(self, is_competent):
        questions = [
            "The child knows which vaccination they will have",
            "The child knows which disease the vaccination protects against",
            "The child knows what could happen if they got the disease",
            "The child knows how the injection will be given",
            "The child knows which side effects they might experience",
        ]
        response = "Yes" if is_competent else "No"

        for question in questions:
            self.page.get_by_role("group", name=question).get_by_label(response).check()

    def __schedule_session(self, on_date: str, expect_error: bool = False):
        _day = on_date[-2:]
        _month = on_date[4:6]
        _year = on_date[:4]
        self.click_schedule_sessions()
        self.click_add_session_dates()
        self.fill_date_fields(_day, _month, _year)
        self.click_continue_button()
        if expect_error:
            self.expect_alert_text("There is a problemEnter a date")

    def __edit_session(self, to_date: str):
        _day = to_date[-2:]
        _month = to_date[4:6]
        _year = to_date[:4]
        self.click_edit_session()
        self.click_change_session_dates()
        self.fill_date_fields(_day, _month, _year)
        self.click_continue_button()
        self.click_continue_link()
        expect(
            self.page.locator("div")
            .filter(has_text=re.compile(r"^Session datesNot provided$"))
            .get_by_role("definition")
        ).not_to_be_visible()

    def verify_triage_updated_for_child(self):
        self.expect_alert_text("Triage outcome updated")

    def invalidate_parent_refusal(self, parent: Parent):
        invalidation_notes = "Invalidation notes."
        self.page.get_by_role("link", name=parent.full_name).click()
        self.click_mark_as_invalid_link()
        self.fill_notes(invalidation_notes)
        self.click_mark_as_invalid_button()
        self.expect_details("Decision", "Consent refusedInvalid")
        self.expect_details("Notes", invalidation_notes)

        self.click_back_to_child()
        self.expect_details("Decision", "Consent refusedInvalid")
        expect(self.page.get_by_text("No requests have been sent.")).to_be_visible()

    def expect_details(self, key: str, value: str) -> None:
        detail_key = self.page.locator(
            ".nhsuk-summary-list__key", has_text=re.compile(f"^{key}$")
        ).first
        detail_value = detail_key.locator("xpath=following-sibling::*[1]")

        expect(detail_value).to_contain_text(value)

    def schedule_a_valid_session(
        self,
        location: str,
        programme_group: str,
        for_today: bool = False,
        past: bool = False,
    ):
        # scheduling a session in the past is a temporary measure for the rollover period
        # this will be disallowed in the future
        if past:
            offset_days = -7
            _future_date = get_offset_date(offset_days=offset_days)
        elif for_today:
            offset_days = 0
            _future_date = get_offset_date(offset_days=offset_days)
        else:
            # temporary rollover measure to prevent scheduling sessions in the next academic year
            _future_date = datetime(2025, 8, 31).strftime("%Y%m%d")
        self.click_session_for_programme_group(location, programme_group)
        self.__schedule_session(on_date=_future_date)
        self.expect_details(
            "Session dates",
            self.__get_display_formatted_date(date_to_format=_future_date),
        )
        self.click_continue_link()

    def edit_a_session_to_today(self, location: str, programme_group: str):
        _future_date = get_offset_date(offset_days=0)
        self.click_session_for_programme_group(location, programme_group)
        self.__edit_session(to_date=_future_date)

    def delete_all_sessions(self, school: School):
        sessions_with_dates = (
            self.page.locator("div.nhsuk-card__content.app-card__content")
            .filter(has_text=str(school))
            .filter(has_text="Sessions scheduled")
            .filter(has_not_text="No sessions scheduled")
        )
        for programme in Programme:
            self.page.get_by_role("checkbox", name=str(programme)).uncheck()

        self.current_academic_year_radio.check()
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
            self.click_continue_link()
            self.click_sessions()

    def create_invalid_session(self, location: str, programme_group: str):
        _invalid_date = "20251332"
        self.click_session_for_programme_group(location, programme_group)
        self.__schedule_session(on_date=_invalid_date, expect_error=True)

    def get_online_consent_url(self, *programmes: list[Programme]) -> str:
        link_text = f"View the {' and '.join(str(programme) for programme in programmes)} online consent form"
        return str(self.page.get_by_role("link", name=link_text).get_attribute("href"))

    def register_child_as_attending(self, child: Child):
        self.click_register_tab()
        self.search_for(str(child))
        self.click_on_attending()

    def verify_search(self):
        """
        1. Find a session with patients
        2. Go to any of the tabs at the top that allow users to search by name
        3. Enter a search query that will result in no matches (for example "a very long string that won't match any names")
        Expected: The user sees a page saying "No children matching search criteria found".
        Actual: The user sees a page saying "An error has occurred."
        """
        self.click_consent_tab()
        self.search_for("a very long string that won't match any names")
        expect(
            self.page.get_by_text("No children matching search criteria found")
        ).to_be_visible()

    def search_child(self, child: Child) -> None:
        self.search_for(str(child))
        child_locator = self.page.get_by_role("link", name=str(child))
        reload_until_element_is_visible(self.page, child_locator)
        child_locator.click()

    def record_vaccs_for_child(
        self,
        child: Child,
        programme: Programme,
        batch_name: str,
        consent_option: ConsentOption = ConsentOption.INJECTION,
        delivery_site: DeliverySite = DeliverySite.LEFT_ARM_UPPER,
        at_school: bool = True,
        notes: str = "",
    ) -> datetime:
        self.click_record_vaccinations_tab()
        self.search_child(child)
        self.click_programme_tab(programme)

        self.confirm_pre_screening_checks(programme, consent_option)
        self.pre_screening_notes.fill(notes)

        self.select_identity_confirmed_by_child(child)

        self.select_ready_for_vaccination(consent_option)
        if consent_option == ConsentOption.INJECTION:
            self.select_delivery_site(delivery_site)
        self.click_continue_button()

        if len(notes) > 1000:
            expect(self.notes_length_error).to_be_visible()
            self.pre_screening_notes.fill("Prescreening notes")
            self.click_continue_button()

        self.page.get_by_role("radio", name=batch_name).check()
        self.click_continue_button()

        if at_school:  # only skips MAV-854
            self.vaccination_notes.fill(notes)
            self.click_confirm_button()

            if len(notes) > 1000:
                expect(self.notes_length_error).to_be_visible()
                self.vaccination_notes.fill("Confirmation notes")
                self.click_confirm_button()

            self.expect_alert_text(f"Vaccination outcome recorded for {programme}")
        return datetime.now().astimezone()

    def expect_alert_text(self, text: str):
        expect(self.page.get_by_role("alert")).to_contain_text(text)

    def verify_child_shows_correct_flu_consent_method(self, child: Child, method: str):
        patient_card = self.page.locator(
            f'div.nhsuk-card.app-card.app-card--compact:has(h4:has-text("{str(child)}"))'
        )
        flu_consent_section = patient_card.locator("p:has-text('Flu')")
        expect(flu_consent_section).to_contain_text("Consent given")
        expect(flu_consent_section).to_contain_text(method)

    @step("Click on {1} vaccination details")
    def click_vaccination_details(self, school: School) -> None:
        with self.page.expect_navigation():
            self.vaccinations_card_row.filter(has_text=str(school)).get_by_role(
                "link"
            ).click()
