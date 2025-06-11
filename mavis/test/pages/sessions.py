import re
import time
from datetime import datetime
from typing import Final, List

from playwright.sync_api import Page, expect

from ..data import TestData
from ..models import Clinic, PrescreeningQuestion, Programme
from ..step import step
from ..wrappers import generate_random_string, get_current_datetime, get_offset_date
from .consent import ConsentPage
from .dashboard import DashboardPage


class SessionsPage:
    LNK_CHILD_FULL_NAME: Final[str] = "CLAST, CFirst"
    LNK_CHILD_GILLICK_NOTES_LENGTH: Final[str] = "GILLICK1, GILLICK1"
    LNK_CHILD_NO_CONSENT: Final[str] = "NOCONSENT1, NoConsent1"
    LNK_CHILD_CONFLICTING_CONSENT: Final[str] = (
        "CONFLICTINGCONSENT1, ConflictingConsent1"
    )
    LNK_CHILD_E2E1: Final[str] = "CE2E1, CE2E1"
    LNK_CHILD_CONFLICTING_GILLICK: Final[str] = "GILLICK1, Conflicting1"
    LNK_CHILD_CONSENT_TWICE: Final[str] = "TWICE1, Consent1"
    LNK_MAV_854_CHILD: Final[str] = "MAV_854, MAV_854"

    def __init__(
        self,
        test_data: TestData,
        page: Page,
        dashboard_page: DashboardPage,
        consent_page: ConsentPage,
    ):
        self.test_data = test_data
        self.page = page
        self.dashboard_page = dashboard_page
        self.consent_page = consent_page

        self.today_tab_link = self.page.get_by_role("link", name="Today")
        self.scheduled_tab_link = self.page.get_by_role(
            "link", name="Scheduled", exact=True
        )
        self.unscheduled_tab_link = self.page.get_by_role("link", name="Unscheduled")
        self.no_response_radio = self.page.get_by_role("radio", name="No response")
        self.update_results_button = self.page.get_by_role(
            "button", name="Update results"
        )
        self.consent_given_radio = self.page.get_by_role("radio", name="Consent given")
        self.conflicting_consent_radio = self.page.get_by_role(
            "radio", name="Conflicting consent"
        )

        self.programme_tab_link = self.page.get_by_role("link", name="Programme")
        self.import_class_list_link = self.page.get_by_role(
            "link", name="Import class list"
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
        self.consent_tab_link = self.page.get_by_role(
            "link", name="Consent", exact=True
        )
        self.assess_gillick_competence_link = self.page.get_by_role(
            "link", name="Assess Gillick competence"
        )
        self.edit_gillick_competence_link = self.page.get_by_role(
            "link", name="Edit Gillick competence"
        )
        self.could_not_vaccinate_link = self.page.get_by_role(
            "link", name="Could not vaccinate"
        )
        self.consent_refused_radio = self.page.get_by_role(
            "radio", name="Consent refused"
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
        self.get_consent_response_button = self.page.get_by_role(
            "button", name="Get consent response"
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
        self.yes_radio = self.page.get_by_role("radio", name="Yes")
        self.left_arm_upper_radio = self.page.get_by_role(
            "radio", name="Left arm (upper position)"
        )
        self.attending_button = self.page.get_by_role("button", name="Attending").first
        self.success_alert = self.page.get_by_role("alert", name="Success")
        self.notes_length_error = (
            page.locator("div").filter(has_text="There is a problemEnter").nth(3)
        )
        self.prescreening_notes = self.page.get_by_role(
            "textbox", name="Pre-screening notes (optional)"
        )
        self.vaccination_notes = self.page.get_by_role(
            "textbox", name="Notes (optional)"
        )

    def __get_display_formatted_date(self, date_to_format: str) -> str:
        _parsed_date = datetime.strptime(date_to_format, "%Y%m%d")
        _formatted_date = _parsed_date.strftime("%A %d %B %Y").replace(" 0", " ")
        return _formatted_date

    @step("Click on Today tab")
    def click_today(self):
        self.today_tab_link.click()

    @step("Click on Scheduled tab")
    def click_scheduled(self):
        self.scheduled_tab_link.click()

    @step("Click on Unscheduled tab")
    def click_unscheduled(self):
        self.unscheduled_tab_link.click()

    @step("Select No response")
    def select_no_response(self):
        self.no_response_radio.click()
        self.update_results_button.click()

    @step("Select Consent given")
    def select_consent_given(self):
        self.consent_given_radio.click()
        self.update_results_button.click()

    @step("Select Conflicting consent")
    def select_conflicting_consent(self):
        self.conflicting_consent_radio.click()
        self.update_results_button.click()

    @step("Select Consent refused")
    def select_consent_refused(self):
        self.consent_refused_radio.click()
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

    @step("Click on Activity log tab")
    def click_activity_log(self):
        self._click_tab("Activity log")

    @step("Click on location {1}")
    def click_location(self, location: str):
        self.page.get_by_role("link", name=str(location)).click()

    @step("Click on Import class list")
    def click_import_class_list(self):
        self.import_class_list_link.click()

    @step("Click on Continue")
    def click_continue_button(self):
        self.continue_button.click()

    @step("Upload file {1}")
    def choose_file_child_records(self, file_path: str):
        self.file_input.set_input_files(file_path)

    @step("Click on child {1}")
    def click_child(self, child_name: str):
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
        self.consent_tab_link.click()

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

    @step("Click on Get consent response")
    def click_get_consent_response(self):
        self.get_consent_response_button.click()

    @step("Click on Confirm")
    def click_confirm_button(self):
        self.confirm_button.click()

    @step("Click on Record vaccinations")
    def click_record_vaccinations(self):
        self.record_vaccinations_link.click()

    @step("Click on Yes")
    def select_yes(self):
        self.yes_radio.click()

    @step("Click on Left arm (upper position)")
    def select_left_arm_upper_position(self):
        self.left_arm_upper_radio.click()

    @step("Click on Attending")
    def click_on_attending(self):
        self.attending_button.click()

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
    def download_offline_recording_excel(self) -> str:
        _file_path = f"working/excel_{get_current_datetime()}.xlsx"

        with self.page.expect_download() as download_info:
            self.record_offline_link.click()
        download = download_info.value
        download.save_as(_file_path)

        return _file_path

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
        self.__answer_gillick_competence_questions(is_competent)

        self.assessment_notes_textbox.fill(competence_details)
        if is_add:
            self.complete_assessment_button.click()
        else:
            self.update_assessment_button.click()
        if is_competent:
            expect(self.page.get_by_role("main")).to_contain_text(
                "Child assessed as Gillick competent"
            )
        else:
            expect(self.page.get_by_role("main")).to_contain_text(
                "Child assessed as not Gillick competent"
            )
        expect(self.page.get_by_role("main")).to_contain_text(competence_details)

    def __answer_gillick_competence_questions(self, is_competent):
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
            _expected_message = "There is a problemEnter a date"
            expect(self.page.get_by_role("main")).to_contain_text(_expected_message)

    def __delete_sessions(self):
        self.click_edit_session()
        self.click_change_session_dates()
        self.click_delete()
        self.click_back()
        self.click_continue_link()
        expect(self.page.get_by_role("main")).to_contain_text("No sessions scheduled")

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

    def verify_triage_updated_for_child(self, child_name: str):
        expect(self.success_alert).to_contain_text(
            f"Triage outcome updated for {child_name}"
        )

    def verify_activity_log_entry(self, consent_given: bool):
        if consent_given:
            locator = self.page.get_by_role(
                "heading", name="Triaged decision: Safe to vaccinate"
            ).first
        else:
            locator = self.page.get_by_role(
                "heading", name="Consent refused by Parent1 (Dad)"
            ).first

        expect(locator).to_be_visible()

    def invalidate_parent2_refusal(self):
        self.page.get_by_role("link", name="Parent2").click()
        self.click_mark_as_invalid_link()
        self.fill_notes("Invalidation notes.")
        self.click_mark_as_invalid_button()
        expect(self.page.get_by_role("main")).to_contain_text("Consent refusedInvalid")
        expect(self.page.get_by_role("main")).to_contain_text("Invalidation notes.")

        self.click_back_to_child()
        expect(self.page.get_by_role("main")).to_contain_text("Consent refusedInvalid")
        expect(self.page.get_by_role("main")).to_contain_text(
            "No-one responded to our requests for consent."
        )

    def verify_scheduled_date(self, message: str):
        expect(self.page.get_by_role("main")).to_contain_text(message)
        self.click_continue_link()

    def update_triage_outcome(
        self, location: str, file_paths: str, consent_given: bool = True
    ):
        self.__import_class_list_and_select_year_groups(location, file_paths)
        self.__update_triage_consent(consent_given=consent_given, location=location)

    def verify_mav_nnn(self, location: str):
        self.click_scheduled()
        self.click_location(location)
        self.click_consent_tab()
        self.click_child(self.LNK_CHILD_FULL_NAME)
        self.click_get_consent_response()
        self.__handle_consent_approval(location=location)

    def __import_class_list_and_select_year_groups(
        self,
        location: str,
        file_paths: str,
    ):
        _input_file_path, _ = self.test_data.get_file_paths(file_paths=file_paths)
        self.click_scheduled()
        self.click_location(location)
        self.click_import_class_list()
        self.select_year_groups(8, 9, 10, 11)
        self.choose_file_child_records(_input_file_path)
        self.click_continue_button()
        self.dashboard_page.click_mavis()

    def __update_triage_consent(self, consent_given: bool, location: str):
        self.dashboard_page.click_sessions()
        self.click_scheduled()
        self.click_location(location)
        self.click_consent_tab()
        self.click_child(self.LNK_CHILD_FULL_NAME)
        self.click_programme_tab(Programme.HPV)
        self.click_get_consent_response()
        if consent_given:
            self.__handle_consent_approval(location)
        else:
            self.__handle_refused_consent()

    def __handle_refused_consent(self):
        self.consent_page.service_refuse_consent()
        self.select_consent_refused()
        self.click_child(self.LNK_CHILD_FULL_NAME)
        self.click_activity_log()
        self.verify_activity_log_entry(consent_given=False)

    def __handle_consent_approval(self, location: str):
        self.consent_page.service_give_consent()
        self.dashboard_page.click_mavis()
        self.dashboard_page.click_sessions()
        self.click_scheduled()
        self.click_location(location)
        self.click_register_tab()
        self.click_child(self.LNK_CHILD_FULL_NAME)
        self.click_programme_tab(Programme.HPV)
        self.click_update_triage_outcome()
        self.select_yes_safe_to_vaccinate()
        self.click_save_triage()
        self.verify_triage_updated_for_child(child_name=self.LNK_CHILD_FULL_NAME)

    def schedule_a_valid_session(self, location: str, for_today: bool = False):
        _future_date = (
            get_offset_date(offset_days=0)
            if for_today
            else get_offset_date(offset_days=10)
        )
        _expected_message = f"Session dates{self.__get_display_formatted_date(date_to_format=_future_date)}"
        self.click_unscheduled()
        self.click_location(location)
        self.__schedule_session(on_date=_future_date)
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

    def create_invalid_session(self, location: str):
        _invalid_date = "20251332"
        self.click_unscheduled()
        self.click_location(location)
        self.__schedule_session(on_date=_invalid_date, expect_error=True)

    def navigate_to_class_list_import(self):
        self.click_import_class_list()
        self.select_year_groups(8, 9, 10, 11)

    def set_gillick_competence_for_student(self, session: str):
        self.click_today()
        self.click_location(session)
        self.click_consent_tab()
        self.click_child(self.LNK_CHILD_FULL_NAME)
        self.click_assess_gillick_competence()
        self.add_gillick_competence(
            is_competent=True, competence_details="Gillick competent"
        )
        self.click_edit_gillick_competence()
        self.edit_gillick_competence(
            is_competent=False, competence_details="Not Gillick competent"
        )

    def set_gillick_competence_and_verify_notes_length(self, session: str):
        self.click_today()
        self.click_location(session)
        self.click_consent_tab()
        self.click_child(self.LNK_CHILD_GILLICK_NOTES_LENGTH)
        self.click_assess_gillick_competence()
        self.__answer_gillick_competence_questions(is_competent=True)
        self.assessment_notes_textbox.fill(
            generate_random_string(target_length=1001, spaces=True)
        )
        self.complete_assessment_button.click()
        expect(self.notes_length_error).to_be_visible()
        self.assessment_notes_textbox.fill("Gillick competent")
        self.complete_assessment_button.click()
        self.click_edit_gillick_competence()
        self.__answer_gillick_competence_questions(is_competent=True)
        self.assessment_notes_textbox.fill(
            generate_random_string(target_length=1001, spaces=True)
        )
        self.update_assessment_button.click()
        expect(self.notes_length_error).to_be_visible()

    def get_online_consent_url(self, *programmes: List[Programme]) -> str:
        link_text = f"View the {' and '.join(programmes)} online consent form"
        return str(self.page.get_by_role("link", name=link_text).get_attribute("href"))

    def bug_mavis_1696(self):
        self.select_no_response()
        self.click_child(self.LNK_CHILD_CONFLICTING_CONSENT)
        self.click_get_consent_response()
        self.consent_page.parent_1_verbal_no_response()
        self.select_no_response()
        self.click_child(self.LNK_CHILD_CONFLICTING_CONSENT)
        self.click_get_consent_response()
        self.consent_page.parent_2_verbal_refuse_consent()
        self.click_child(self.LNK_CHILD_CONFLICTING_CONSENT)
        self.invalidate_parent2_refusal()
        self.click_activity_log()
        # FIXME: Make the following generic
        expect(self.page.get_by_role("main")).to_contain_text(
            "Consent from Parent2 invalidated"
        )
        expect(self.page.get_by_role("main")).to_contain_text(
            "Consent refused by Parent2 (Mum)"
        )
        expect(self.page.get_by_role("main")).to_contain_text(
            "Consent not_provided by Parent1 (Dad)"
        )

    def bug_mavis_1864(self):
        self.select_no_response()
        self.click_child(self.LNK_CHILD_CONSENT_TWICE)
        self.click_programme_tab(Programme.HPV)
        self.click_get_consent_response()
        self.consent_page.parent_1_written_positive()
        self.select_consent_given()
        self.click_child(self.LNK_CHILD_CONSENT_TWICE)
        self.click_programme_tab(Programme.HPV)
        self.click_update_triage_outcome()
        self.consent_page.update_triage_outcome_positive()
        self.click_consent_tab()
        self.click_child(self.LNK_CHILD_CONSENT_TWICE)
        self.click_programme_tab(Programme.HPV)
        self.click_get_consent_response()
        self.consent_page.parent_1_verbal_refuse_consent()
        self.select_consent_refused()
        self.click_child(self.LNK_CHILD_CONSENT_TWICE)
        self.click_programme_tab(Programme.HPV)
        expect(self.page.get_by_role("main")).to_contain_text(
            "Dad refused to give consent."
        )
        self.click_activity_log()
        expect(self.page.get_by_role("main")).to_contain_text(
            "Consent refused by Parent1 (Dad)"
        )
        expect(self.page.get_by_role("main")).to_contain_text(
            "Triaged decision: Safe to vaccinate"
        )
        expect(self.page.get_by_role("main")).to_contain_text(
            "Consent given by Parent1 (Dad)"
        )

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

    def bug_mavis_1818(self):
        self.select_no_response()
        self.click_child(
            self.LNK_CHILD_CONFLICTING_GILLICK
        )  # Click appropriate child name
        self.click_programme_tab(Programme.HPV)
        self.click_get_consent_response()
        self.consent_page.parent_1_verbal_positive(change_phone=False)
        self.select_consent_given()
        self.click_child(
            self.LNK_CHILD_CONFLICTING_GILLICK
        )  # Click appropriate child name
        self.click_programme_tab(Programme.HPV)
        self.click_get_consent_response()
        self.consent_page.parent_2_verbal_refuse_consent()
        self.select_conflicting_consent()
        self.click_child(
            self.LNK_CHILD_CONFLICTING_GILLICK
        )  # Click appropriate child name
        self.click_programme_tab(Programme.HPV)
        expect(self.page.get_by_role("main")).to_contain_text("Conflicting consent")
        expect(self.page.get_by_role("main")).to_contain_text(
            "You can only vaccinate if all respondents give consent."
        )
        self.click_assess_gillick_competence()
        self.add_gillick_competence(
            is_competent=True, competence_details="Gillick competent"
        )
        expect(self.page.get_by_role("main")).to_contain_text(
            "Triaged decision: Safe to vaccinate"
        )
        self.click_get_consent_response()
        self.consent_page.child_consent_verbal_positive()
        expect(self.page.get_by_role("main")).to_contain_text(
            f"Consent recorded for {self.LNK_CHILD_CONFLICTING_GILLICK}"
        )
        self.select_consent_given()
        self.click_child(
            self.LNK_CHILD_CONFLICTING_GILLICK
        )  # Click appropriate child name
        self.click_programme_tab(Programme.HPV)
        expect(self.page.get_by_role("main")).to_contain_text("Ready for nurse")
        expect(self.page.get_by_role("main")).to_contain_text(
            f"NURSE, Nurse decided that {self.LNK_CHILD_CONFLICTING_GILLICK} is ready for the nurse."
        )
        expect(self.page.get_by_role("main")).to_contain_text("Consent given")
        self.click_activity_log()
        expect(self.page.get_by_role("main")).to_contain_text(
            f"Consent given by {self.LNK_CHILD_CONFLICTING_GILLICK} (Child (Gillick competent))"
        )

    def give_consent_for_e2e1_child_by_parent_1(self):
        self.click_consent_tab()
        self.click_child(self.LNK_CHILD_E2E1)
        self.click_programme_tab(Programme.HPV)
        self.click_get_consent_response()
        self.consent_page.parent_1_verbal_positive(change_phone=False)

    def select_year_groups(self, *year_groups: int) -> None:
        for year_group in year_groups:
            self.page.get_by_role("checkbox", name=f"Year {year_group}").check()
        self.click_continue_button()

    def _answer_prescreening_questions(self, programme: Programme):
        for question in programme.prescreening_questions:
            locator = self.page.get_by_role("checkbox", name=question)

            if question == PrescreeningQuestion.FEELING_WELL and programme in [
                Programme.MENACWY,
                Programme.TD_IPV,
            ]:
                expect(locator).to_be_checked()
            else:
                locator.check()

    def _vaccinate_child_mav_854(self, clinic: Clinic):
        self.click_get_consent_response()
        self.consent_page.parent_1_verbal_positive(change_phone=False)
        self.register_child_as_attending(child_name=self.LNK_MAV_854_CHILD)
        self.record_vaccs_for_child(
            child_name=self.LNK_MAV_854_CHILD,
            programme=Programme.HPV,
            at_school=False,
        )
        self.page.get_by_role("radio", name=str(clinic)).check()
        self.click_continue_button()
        self.click_confirm_button()
        expect(self.page.get_by_role("main")).to_contain_text(
            "Vaccination outcome recorded for HPV"
        )

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
        expect(self.page.get_by_role("main")).to_contain_text(
            "No children matching search criteria found"
        )

    def search_child(self, child_name: str) -> None:
        self.search_for(child_name)
        self.page.get_by_role("link", name=child_name).click()

    def record_vaccs_for_child(
        self,
        child_name: str,
        programme: Programme,
        at_school: bool = True,
        notes: str = "",
    ):
        self.click_record_vaccinations()
        self.search_child(child_name=child_name)
        self.click_programme_tab(programme)

        # FIXME: Figure out why we need this. Without this pause, the form
        #  elements seem to clear out when the continue button is pressed
        #  and the form fails to submit.
        time.sleep(0.25)

        self._answer_prescreening_questions(programme=programme)
        self.prescreening_notes.fill(notes)
        self.select_yes()
        self.select_left_arm_upper_position()
        self.click_continue_button()

        if len(notes) > 1000:
            expect(self.notes_length_error).to_be_visible()
            self.prescreening_notes.fill("Prescreening notes")
            self.click_continue_button()

        self.page.get_by_role("radio", name=programme.vaccines[0]).check()
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
