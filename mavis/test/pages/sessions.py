import re
from datetime import datetime
from pathlib import Path
from typing import List

from playwright.sync_api import Page, expect

from mavis.test.data import TestData
from mavis.test.models import Programme, Parent, Child
from mavis.test.step import step
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
        self.get_verbal_consent_button = self.page.get_by_role(
            "button", name="Get verbal consent"
        )
        self.update_results_button = self.page.get_by_role(
            "button", name="Update results"
        )
        self.year_8_checkbox = self.page.get_by_role("checkbox", name="Year 8")
        self.confirm_button = self.page.get_by_role("button", name="Confirm")
        self.search_textbox = self.page.get_by_role("textbox", name="Search")
        self.search_button = self.page.get_by_role("button", name="Search")
        self.record_vaccinations_link = self.page.get_by_role(
            "link", name="Record vaccinations"
        )
        self.ready_for_vaccination_radio = self.page.locator(
            "#vaccinate-form-administered-true-field"
        )
        self.left_arm_upper_radio = self.page.get_by_role(
            "radio", name="Left arm (upper position)"
        )
        self.attending_button = self.page.get_by_role("button", name="Attending").first
        self.success_alert = self.page.get_by_role("alert", name="Success")
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
        self.pre_screening_notes = pre_screening.get_by_role("textbox")
        self.review_no_consent_response_link = self.page.get_by_role(
            "link", name="Review   no consent response"
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

    def __get_display_formatted_date(self, date_to_format: str) -> str:
        _parsed_date = datetime.strptime(date_to_format, "%Y%m%d")
        _formatted_date = _parsed_date.strftime("%A %d %B %Y").replace(" 0", " ")
        return _formatted_date

    @step("Click on Today tab")
    def click_today(self):
        self.today_tab_link.click()
        self.today_tab_link.get_by_role("strong").wait_for()

    @step("Click on Scheduled tab")
    def click_scheduled(self):
        self.scheduled_tab_link.click()
        self.scheduled_tab_link.get_by_role("strong").wait_for()

    @step("Click on Unscheduled tab")
    def click_unscheduled(self):
        self.unscheduled_tab_link.click()
        self.unscheduled_tab_link.get_by_role("strong").wait_for()

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

    def _click_tab(self, name: str):
        link = self.page.get_by_role("navigation").get_by_role("link", name=name)
        link.click()
        link.get_by_role("strong").wait_for()

    @step("Click on {1} tab")
    def click_programme_tab(self, programme: Programme):
        self._click_tab(str(programme))

    @step("Click on Register tab")
    def click_register_tab(self):
        self._click_tab("Register")

    @step("Click on Session activity and notes tab")
    def click_session_activity_and_notes(self):
        self._click_tab("Session activity and notes")

    @step("Click on location {1}")
    def click_location(self, location: str):
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
    def click_child(self, child_name: str):
        with self.page.expect_navigation():
            self.page.get_by_role("heading", name=child_name).get_by_role(
                "link"
            ).first.click()

    @step("Search and click on {1}")
    def search_and_click_child(self, child_name: str):
        self.filter_name_textbox.fill(child_name)
        self.click_child(child_name)

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
        self._click_tab("Consent")

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

    @step("Click on Get verbal consent")
    def click_get_verbal_consent(self):
        self.get_verbal_consent_button.click()

    @step("Click {1} radio button")
    def click_parent_radio_button(self, name: str) -> None:
        self.page.get_by_role("radio", name=name).check()

    def navigate_to_todays_sessions(self, location: str):
        self.click_today()
        self.click_location(location)

    def navigate_to_gillick_competence(self, child: str, programme: Programme):
        self.click_consent_tab()
        self.click_child(child)
        self.click_programme_tab(programme)
        self.click_assess_gillick_competence()

    def navigate_to_consent_response(self, child: str, programme: Programme):
        self.click_child(child)
        self.click_programme_tab(programme)
        self.click_get_verbal_consent()

    def navigate_to_verbal_consent_response(self):
        self.click_get_verbal_consent()

    def navigate_to_update_triage_outcome(self, child: str, programme: Programme):
        self.click_child(child)
        self.click_programme_tab(programme)
        self.click_update_triage_outcome()

    @step("Click on Confirm")
    def click_confirm_button(self):
        self.confirm_button.click()

    @step("Click on Record vaccinations")
    def click_record_vaccinations(self):
        self.record_vaccinations_link.click()

    @step("Confirm pre-screening checks are true")
    def confirm_pre_screening_checks(self, programme: Programme):
        for check in programme.pre_screening_checks:
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
    def select_ready_for_vaccination(self):
        self.ready_for_vaccination_radio.check()

    @step("Click on Left arm (upper position)")
    def select_left_arm_upper_position(self):
        self.left_arm_upper_radio.click()

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
    def check_note_appears_in_search(self, child: str, note: str):
        heading = self.page.get_by_role("heading", name=child)
        next_element = heading.locator("xpath=following-sibling::*[1]")
        expect(next_element.get_by_role("blockquote")).to_have_text(note)

    def add_note(self, note: str):
        self.click_add_a_note()
        self.fill_note_textbox(note)
        with self.page.expect_navigation():
            self.click_save_note()

        expect(self.success_alert).to_contain_text("Note added")
        reload_until_element_is_visible(self.page, self.page.get_by_text(note))

        self.check_notes_appear_in_order([note])

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

    @step("Expect text {1}")
    def expect_main_to_contain_text(self, text: str):
        expect(self.page.locator("main")).to_contain_text(text)

    def get_session_id_from_offline_excel(self):
        file_path = self.download_offline_recording_excel()
        return self.test_data.get_session_id(file_path)

    @step("Add Gillick competence details")
    def add_gillick_competence(
        self, is_competent: bool, competence_details: str
    ) -> None:
        self.__set_gillick_competence(
            is_add=True,
            is_competent=is_competent,
            competence_details=competence_details,
        )

    @step("Edit Gillick competence details")
    def edit_gillick_competence(
        self, is_competent: bool, competence_details: str
    ) -> None:
        self.__set_gillick_competence(
            is_add=False,
            is_competent=is_competent,
            competence_details=competence_details,
        )

    def __set_gillick_competence(
        self, is_add: bool, is_competent: bool, competence_details: str
    ) -> None:
        self.answer_gillick_competence_questions(is_competent)

        self.assessment_notes_textbox.fill(competence_details)
        if is_add:
            self.click_complete_assessment()
        else:
            self.click_update_assessment()
        if is_competent:
            self.expect_main_to_contain_text("Child assessed as Gillick competent")
        else:
            self.expect_main_to_contain_text("Child assessed as not Gillick competent")
        self.expect_main_to_contain_text(competence_details)

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

    def __schedule_session(
        self, on_date: str, programmes_list: list[str], expect_error: bool = False
    ):
        _day = on_date[-2:]
        _month = on_date[4:6]
        _year = on_date[:4]
        self.click_schedule_sessions()
        # TODO: Do we need to uncheck programmes if not listed in env?
        self.change_programmes_link.click()
        if Programme.FLU.lower() in programmes_list:
            self.flu_programme_checkbox.check()
        if Programme.HPV.lower() in programmes_list:
            self.hpv_programme_checkbox.check()
        if Programme.MENACWY.lower() in programmes_list:
            self.menacwy_programme_checkbox.check()
        if Programme.TD_IPV.lower() in programmes_list:
            self.td_ipv_programme_checkbox.check()
        self.continue_button.click()
        self.click_add_session_dates()
        self.fill_date_fields(_day, _month, _year)
        self.click_continue_button()
        if expect_error:
            self.expect_main_to_contain_text("There is a problemEnter a date")

    def __delete_sessions(self):
        self.click_edit_session()
        self.click_change_session_dates()
        self.click_delete()
        self.click_back()
        self.click_continue_link()
        self.expect_main_to_contain_text("No sessions scheduled")

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
        expect(self.success_alert).to_contain_text("Triage outcome updated")

    def invalidate_parent_refusal(self, parent: Parent):
        self.page.get_by_role("link", name=parent.full_name).click()
        self.click_mark_as_invalid_link()
        self.fill_notes("Invalidation notes.")
        self.click_mark_as_invalid_button()
        self.expect_main_to_contain_text("Consent refusedInvalid")
        self.expect_main_to_contain_text("Invalidation notes.")

        self.click_back_to_child()
        self.expect_main_to_contain_text("Consent refusedInvalid")
        self.expect_main_to_contain_text("No requests have been sent.")

    def verify_scheduled_date(self, message: str):
        self.expect_main_to_contain_text(message)
        self.click_continue_link()

    def navigate_to_scheduled_sessions(self, location: str):
        self.click_scheduled()
        self.click_location(location)

    def navigate_to_class_list_import(self):
        self.click_import_class_lists()
        self.select_year_groups(8, 9, 10, 11)

    def schedule_a_valid_session(
        self, location: str, programmes_list: list[str], for_today: bool = False
    ):
        _future_date = (
            get_offset_date(offset_days=0)
            if for_today
            else get_offset_date(offset_days=10)
        )
        _expected_message = f"Session dates{self.__get_display_formatted_date(date_to_format=_future_date)}"
        self.click_unscheduled()
        self.click_location(location)
        self.__schedule_session(on_date=_future_date, programmes_list=programmes_list)
        self.verify_scheduled_date(message=_expected_message)

    def edit_a_session_to_today(self, location: str):
        _future_date = get_offset_date(offset_days=0)
        self.click_scheduled()
        self.click_location(location)
        self.__edit_session(to_date=_future_date)

    def delete_all_sessions(self, location: str):
        self.click_scheduled()
        self.click_location(location)
        self.__delete_sessions()

    def create_invalid_session(self, location: str, programmes_list: list[str]):
        _invalid_date = "20251332"
        self.click_unscheduled()
        self.click_location(location)
        self.__schedule_session(
            on_date=_invalid_date, expect_error=True, programmes_list=programmes_list
        )

    def get_online_consent_url(self, *programmes: List[Programme]) -> str:
        link_text = f"View the {' and '.join(str(programme) for programme in programmes)} online consent form"
        return str(self.page.get_by_role("link", name=link_text).get_attribute("href"))

    def verify_attendance_filters(self):
        self.click_register_tab()

        search_summary = self.page.get_by_text("Showing 1 to")

        expect(search_summary).not_to_have_text("Showing 1 to 1 of 1 children")
        self.year_8_checkbox.check()
        self.click_on_update_results()

        expect(search_summary).to_have_text("Showing 1 to 1 of 1 children")

        self.year_8_checkbox.uncheck()
        self.click_on_update_results()

        expect(search_summary).not_to_have_text("Showing 1 to 1 of 1 children")

    def select_year_groups(self, *year_groups: int) -> None:
        for year_group in year_groups:
            self.page.get_by_role("checkbox", name=f"Year {year_group}").check()
        self.click_continue_button()

    def register_child_as_attending(self, child_name: str):
        self.click_register_tab()
        self.search_for(child_name)
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
        self.expect_main_to_contain_text("No children matching search criteria found")

    def search_child(self, child: Child) -> None:
        self.search_for(str(child))
        self.page.get_by_role("link", name=str(child)).click()

    def record_vaccs_for_child(
        self,
        child: Child,
        programme: Programme,
        batch_name: str,
        at_school: bool = True,
        notes: str = "",
    ):
        self.click_record_vaccinations()
        self.search_child(child)
        self.click_programme_tab(programme)

        self.confirm_pre_screening_checks(programme)
        self.pre_screening_notes.fill(notes)

        self.select_identity_confirmed_by_child(child)

        self.select_ready_for_vaccination()
        self.select_left_arm_upper_position()
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

            expect(self.success_alert).to_contain_text(
                f"Vaccination outcome recorded for {programme}"
            )

    def verify_consent_filters(self, children):
        child_name = str(children[0])
        self.review_no_consent_response_link.click()
        self.page.get_by_role("link", name=child_name).click()
        self.click_get_verbal_consent()
        self.click_parent_radio_button(children[0].parents[0].full_name)
        self.click_continue_button()
        self.click_continue_button()  # Parent details
        self.in_person_radio.click()
        self.click_continue_button()
        self.no_they_no_not_agree_radio.click()
        self.click_continue_button()
        self.consent_refusal_reason_other_radio.click()
        self.click_continue_button()
        self.consent_refusal_details_textbox.fill("MAV-1381")
        self.click_continue_button()
        self.click_confirm_button()
        self.overview_tab_link.click()
        self.review_consent_refused_link.click()
        expect(self.consent_refused_checkbox).to_be_checked()

    def verify_child_shows_correct_flu_consent_method(self, child: Child, method: str):
        patient_card = self.page.locator(
            f'div.nhsuk-card.app-card--patient:has(h2:has-text("{str(child)}"))'
        )
        flu_consent_section = patient_card.locator("p:has-text('Flu')")
        expect(flu_consent_section).to_contain_text("Consent given")
        expect(flu_consent_section).to_contain_text(method)
