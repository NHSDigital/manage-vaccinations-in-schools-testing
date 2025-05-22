from typing import Final

from libs import CurrentExecution, playwright_ops, testdata_ops
from libs.generic_constants import actions, escape_characters, properties, wait_time
from libs.mavis_constants import (
    mavis_file_types,
    programmes,
    record_limit,
    test_data_values,
    vaccines,
)
from libs.wrappers import (
    datetime,
    get_current_datetime,
    get_link_formatted_date_time,
    get_offset_date,
)
from pages import pg_children, pg_consent_hpv, pg_dashboard


class pg_sessions:
    po = playwright_ops.playwright_operations()
    ce = CurrentExecution()
    tdo = testdata_ops.testdata_operations()
    dashboard_page = pg_dashboard.pg_dashboard()
    consent_page = pg_consent_hpv.pg_consent_hpv()
    children_page = pg_children.pg_children()

    LNK_SCHOOL_1: Final[str] = test_data_values.SCHOOL_1_NAME
    LNK_SCHOOL_2: Final[str] = test_data_values.SCHOOL_2_NAME
    LNK_COMMUNITY_CLINICS: Final[str] = "Community clinics"

    LNK_CHILD_FULL_NAME: Final[str] = "CLAST, CFirst"
    LNK_CHILD_NO_CONSENT: Final[str] = "NOCONSENT1, NoConsent1"
    LNK_CHILD_CONFLICTING_CONSENT: Final[str] = (
        "CONFLICTINGCONSENT1, ConflictingConsent1"
    )
    LNK_CHILD_E2E1: Final[str] = "CE2E1, CE2E1"
    LNK_CHILD_CONFLICTING_GILLICK: Final[str] = "GILLICK1, Conflicting1"
    LNK_CHILD_CONSENT_TWICE: Final[str] = "TWICE1, Consent1"
    LNK_MAV_854_CHILD: Final[str] = "MAV_854, MAV_854"

    LNK_TAB_TODAY: Final[str] = "Today"
    LNK_TAB_SCHEDULED: Final[str] = "Scheduled"
    LNK_TAB_UNSCHEDULED: Final[str] = "Unscheduled"
    RDO_NO_RESPONSE: Final[str] = "No response"
    RDO_CONSENT_GIVEN: Final[str] = "Consent given"
    RDO_CONFLICTING_CONSENT: Final[str] = "Conflicting consent"
    LNK_TAB_ACTIVITY_LOG: Final[str] = "Activity log"
    LNK_TAB_REGISTER: Final[str] = "Register"
    LNK_IMPORT_CLASS_LIST: Final[str] = "Import class lists"
    LBL_CHOOSE_COHORT_FILE_1: str = "Upload file"
    LBL_CHOOSE_COHORT_FILE_2: str = "Upload file"
    BTN_CONTINUE: Final[str] = "Continue"
    LNK_ADD_SESSION_DATES: Final[str] = "Add session dates"
    LNK_RECORD_VACCINATIONS: Final[str] = "Record vaccinations"
    LNK_UPDATE_TRIAGE_OUTCOME: Final[str] = "Update triage outcome"
    LNK_SCHEDULE_SESSIONS: Final[str] = "Schedule sessions"
    RDO_YES_SAFE_TO_VACCINATE: Final[str] = "Yes, it’s safe to vaccinate"
    BTN_SAVE_TRIAGE: Final[str] = "Save triage"
    LBL_PARAGRAPH: Final[str] = "paragraph"
    LBL_TRIAGE_UPDATED_MESSAGE: str = (
        f"Triage outcome updated for {LNK_CHILD_FULL_NAME}"
    )
    LBL_MAIN: Final[str] = "main"
    TXT_DAY: Final[str] = "Day"
    TXT_MONTH: Final[str] = "Month"
    TXT_YEAR: Final[str] = "Year"
    LNK_EDIT_SESSION: Final[str] = "Edit session"
    LNK_CLOSE_SESSION: Final[str] = "Close session"
    LNK_CHANGE_SESSION_DATES: Final[str] = "Change session dates"
    BTN_DELETE: Final[str] = "Delete"
    LNK_BACK: Final[str] = "Back"
    LNK_CONTINUE: Final[str] = "Continue"
    # LNK_HPV_CONSENT_FORM: Final[str] = "View parental consent form (opens in new tab)"
    LNK_ASSESS_GILLICK_COMPETENCE: Final[str] = "Assess Gillick competence"
    RDO_YES_GILLICK_COMPETENT: Final[str] = "Yes, they are Gillick competent"
    RDO_NO_GILLICK_COMPETENT: Final[str] = "No"
    TXT_GILLICK_ASSESSMENT_DETAILS: Final[str] = "Assessment notes (optional)"
    BTN_SAVE_CHANGES: Final[str] = "Save changes"
    LBL_ACTIVITY_LOG_ENTRY_CONSENT_GIVEN: Final[str] = (
        "Triaged decision: Safe to vaccinate"
    )
    LBL_ACTIVITY_LOG_ENTRY_CONSENT_REFUSED: Final[str] = (
        "Consent refused by Parent1 (Dad)"
    )
    BTN_GET_CONSENT_RESPONSE: Final[str] = "Get consent response"
    LNK_CONSENT_TAB: Final[str] = "Consent"
    BTN_COMPLETE_GILLICK_ASSESSMENT: Final[str] = "Complete your assessment"
    LBL_CHILD_COMPETENT: Final[str] = "Child assessed as Gillick competent"
    LBL_CHILD_NOT_COMPETENT: Final[str] = "Child assessed as not Gillick competent"
    LNK_EDIT_GILLICK_COMPETENCE: Final[str] = "Edit Gillick competence"
    BTN_UPDATE_GILLICK_ASSESSMENT: Final[str] = "Update your assessment"
    LNK_HPV_CONSENT_FORM: Final[str] = "View the HPV online consent form"
    LNK_DOUBLES_CONSENT_FORM: str = (
        f"View the {programmes.MENACWY} and {programmes.TDIPV} online consent form"
    )
    LNK_COULD_NOT_VACCINATE: Final[str] = "Could not vaccinate"
    RDO_CONSENT_REFUSED: Final[str] = "Consent refused"
    LNK_MARK_AS_INVALID: Final[str] = "Mark as invalid"
    LNK_PARENT2: Final[str] = "Parent2"
    TXT_NOTES: Final[str] = "Notes"
    LNK_REGISTER_ATTENDANCE: Final[str] = "Register"
    LBL_CAPTION: Final[str] = "caption"
    CHK_YEAR8: Final[str] = "Year 8"
    CHK_YEAR9: Final[str] = "Year 9"
    CHK_YEAR10: Final[str] = "Year 10"
    CHK_YEAR11: Final[str] = "Year 11"
    TXT_FILTER_NAME: Final[str] = "Name"
    LNK_DOWNLOAD_EXCEL: Final[str] = "Record offline"
    LBL_NO_SESSIONS_SCHEDULED: Final[str] = "No sessions scheduled"
    BTN_UPDATE_RESULTS: Final[str] = "Update results"
    BTN_ATTENDING: Final[str] = "Attending"
    CHK_KNOW_VACCINATION: Final[str] = "know what the vaccination"
    CHK_NOT_ALREADY_HAD: Final[str] = "have not already had the"
    CHK_ARE_FEELING_WELL: Final[str] = "are feeling well"
    CHK_HAVE_NO_ALLERGIES: Final[str] = "have no allergies which would"
    CHK_ARE_NOT_PREGNANT: Final[str] = "are not pregnant"
    CHK_NOT_TAKING_MEDICATION: Final[str] = (
        "are not taking any medication which prevents vaccination"
    )
    RDO_YES: Final[str] = "Yes"
    RDO_LEFT_ARM_UPPER: Final[str] = "Left arm (upper position)"
    RDO_CLINIC_WEIMANN: Final[str] = "The Weimann Institute Clinic"
    BTN_CONFIRM: Final[str] = "Confirm"
    BTN_SEARCH: Final[str] = "Search"
    TXT_SEARCH: Final[str] = "Search"

    def __init__(self):
        self.upload_time = ""

    def __get_display_formatted_date(self, date_to_format: str) -> str:
        _parsed_date = datetime.strptime(date_to_format, "%Y%m%d")
        _formatted_date = _parsed_date.strftime("%A %d %B %Y").replace(" 0", " ")
        return _formatted_date

    def _record_upload_time(self):
        self.upload_time = get_link_formatted_date_time()

    def click_uploaded_file_datetime(self):
        self.po.act(locator=self.upload_time, action=actions.CLICK_LINK)

    def verify_upload_output(self, file_path: str):
        _expected_errors = self.tdo.get_expected_errors(file_path=file_path)
        if _expected_errors is not None:
            # Verify messages individually
            for _msg in _expected_errors:
                self.po.verify(
                    locator=self.LBL_MAIN,
                    property=properties.TEXT,
                    expected_value=_msg,
                    exact=False,
                )
            # Verify all messages together
            _all_errors = "".join(
                [
                    x
                    for x in _expected_errors
                    if not x.startswith(escape_characters.COMMENT_OPERATOR)
                    and not x.startswith(escape_characters.NOT_OPERATOR)
                ]
            )
            self.po.verify(
                locator=self.LBL_MAIN,
                property=properties.TEXT,
                expected_value=_all_errors,
                exact=False,
            )

    def click_today(self):
        self.po.act(locator=self.LNK_TAB_TODAY, action=actions.CLICK_LINK, exact=True)

    def click_scheduled(self):
        self.po.act(
            locator=self.LNK_TAB_SCHEDULED, action=actions.CLICK_LINK, exact=True
        )

    def click_unscheduled(self):
        self.po.act(
            locator=self.LNK_TAB_UNSCHEDULED, action=actions.CLICK_LINK, exact=True
        )

    def select_no_response(self):
        self.po.act(locator=self.RDO_NO_RESPONSE, action=actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_UPDATE_RESULTS, action=actions.CLICK_BUTTON)
        self.po.act(locator=None, action=actions.WAIT, value=wait_time.MIN)

    def select_consent_given(self):
        self.po.act(locator=self.RDO_CONSENT_GIVEN, action=actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_UPDATE_RESULTS, action=actions.CLICK_BUTTON)
        self.po.act(locator=None, action=actions.WAIT, value=wait_time.MIN)

    def select_conflicting_consent(self):
        self.po.act(
            locator=self.RDO_CONFLICTING_CONSENT, action=actions.RADIO_BUTTON_SELECT
        )
        self.po.act(locator=self.BTN_UPDATE_RESULTS, action=actions.CLICK_BUTTON)
        self.po.act(locator=None, action=actions.WAIT, value=wait_time.MIN)

    def click_hpv_tab(self):
        self.po.act(locator=programmes.HPV, action=actions.CLICK_LINK)

    def click_menacwy_tab(self):
        self.po.act(locator=programmes.MENACWY, action=actions.CLICK_LINK)

    def click_tdipv_tab(self):
        self.po.act(locator=programmes.TDIPV, action=actions.CLICK_LINK)

    def click_register_tab(self):
        self.po.act(
            locator=self.LNK_TAB_REGISTER, action=actions.CLICK_LINK, exact=False
        )

    def click_activity_log(self):
        self.po.act(
            locator=self.LNK_TAB_ACTIVITY_LOG, action=actions.CLICK_LINK, exact=True
        )
        self.po.act(locator=None, action=actions.WAIT, value=wait_time.MIN)

    def click_school1(self):
        self.po.act(locator=self.LNK_SCHOOL_1, action=actions.CLICK_LINK)

    def click_school2(self):
        self.po.act(locator=self.LNK_SCHOOL_2, action=actions.CLICK_LINK)

    def click_community_clinics(self):
        self.po.act(locator=self.LNK_COMMUNITY_CLINICS, action=actions.CLICK_LINK)

    def click_import_class_list(self):
        self.po.act(locator=self.LNK_IMPORT_CLASS_LIST, action=actions.CLICK_LINK)

    def click_continue(self):
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def choose_file_child_records_for_school_1(self, file_path: str):
        self.po.act(
            locator=self.LBL_CHOOSE_COHORT_FILE_1,
            action=actions.SELECT_FILE,
            value=file_path,
        )

    def choose_file_child_records_for_school_2(self, file_path: str):
        self.po.act(
            locator=self.LBL_CHOOSE_COHORT_FILE_2,
            action=actions.SELECT_FILE,
            value=file_path,
        )

    def click_child_full_name(self):
        self.po.act(locator=self.LNK_CHILD_FULL_NAME, action=actions.CLICK_WILDCARD)

    def click_child_no_consent(self):
        self.po.act(
            locator=self.TXT_FILTER_NAME,
            action=actions.FILL,
            value=self.LNK_CHILD_NO_CONSENT,
        )
        self.po.act(locator=None, action=actions.WAIT, value=wait_time.MIN)
        self.po.act(locator=self.LNK_CHILD_NO_CONSENT, action=actions.CLICK_LINK)

    def click_child_consent_twice(self):
        self.po.act(locator=self.LNK_CHILD_CONSENT_TWICE, action=actions.CLICK_LINK)

    def click_child_conflicting_gillick(self):
        self.po.act(
            locator=self.LNK_CHILD_CONFLICTING_GILLICK, action=actions.CLICK_LINK
        )

    def click_child_conflicting_consent(self):
        self.po.act(
            locator=self.LNK_CHILD_CONFLICTING_CONSENT, action=actions.CLICK_LINK
        )

    def click_child_e2e1(self):
        self.po.act(locator=self.LNK_CHILD_E2E1, action=actions.CLICK_LINK)

    def click_update_triage_outcome(self):
        self.po.act(locator=self.LNK_UPDATE_TRIAGE_OUTCOME, action=actions.CLICK_LINK)

    def select_yes_safe_to_vaccinate(self):
        self.po.act(
            locator=self.RDO_YES_SAFE_TO_VACCINATE, action=actions.RADIO_BUTTON_SELECT
        )

    def click_save_triage(self):
        self.po.act(locator=self.BTN_SAVE_TRIAGE, action=actions.CLICK_BUTTON)

    def click_consent_tab(self):
        self.po.act(locator=self.LNK_CONSENT_TAB, action=actions.CLICK_LINK)

    def click_assess_gillick_competence(self):
        self.po.act(
            locator=self.LNK_ASSESS_GILLICK_COMPETENCE, action=actions.CLICK_LINK
        )

    def click_edit_gillick_competence(self):
        self.po.act(locator=self.LNK_EDIT_GILLICK_COMPETENCE, action=actions.CLICK_LINK)

    def click_could_not_vaccinate(self):
        self.po.act(locator=self.LNK_COULD_NOT_VACCINATE, action=actions.CLICK_LINK)

    def select_consent_refused(self):
        self.po.act(
            locator=self.RDO_CONSENT_REFUSED, action=actions.RADIO_BUTTON_SELECT
        )
        self.po.act(locator=self.BTN_UPDATE_RESULTS, action=actions.CLICK_BUTTON)
        self.po.act(locator=None, action=actions.WAIT, value=wait_time.MIN)

    def download_offline_recording_excel(self) -> str:
        _file_path = f"working/excel_{get_current_datetime()}.xlsx"
        self.po.act(
            locator=self.LNK_DOWNLOAD_EXCEL,
            action=actions.DOWNLOAD_FILE_USING_LINK,
            value=_file_path,
        )
        return _file_path

    def save_session_id_from_offline_excel(self):
        _file_path = self.download_offline_recording_excel()
        _session_id = self.tdo.get_session_id(excel_path=_file_path)
        self.ce.set_session_id(session_id=_session_id)

    def add_gillick_competence(
        self, is_competent: bool, competence_details: str
    ) -> None:
        self.__set_gillick_competence(
            is_add=True,
            is_competent=is_competent,
            competence_details=competence_details,
        )

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
        if is_competent:
            self.po.act(
                locator="get_by_role('group', name='The child knows which vaccination they will have').get_by_label('Yes').check()",
                action=actions.CHAIN_LOCATOR_ACTION,
            )
            self.po.act(
                locator="get_by_role('group', name='The child knows which disease').get_by_label('Yes').check()",
                action=actions.CHAIN_LOCATOR_ACTION,
            )
            self.po.act(
                locator="get_by_role('group', name='The child knows what could').get_by_label('Yes').check()",
                action=actions.CHAIN_LOCATOR_ACTION,
            )
            self.po.act(
                locator="get_by_role('group', name='The child knows how the').get_by_label('Yes').check()",
                action=actions.CHAIN_LOCATOR_ACTION,
            )
            self.po.act(
                locator="get_by_role('group', name='The child knows which side').get_by_label('Yes').check()",
                action=actions.CHAIN_LOCATOR_ACTION,
            )
        else:
            self.po.act(
                locator="get_by_role('group', name='The child knows which vaccination they will have').get_by_label('No').check()",
                action=actions.CHAIN_LOCATOR_ACTION,
            )
            self.po.act(
                locator="get_by_role('group', name='The child knows which disease').get_by_label('No').check()",
                action=actions.CHAIN_LOCATOR_ACTION,
            )
            self.po.act(
                locator="get_by_role('group', name='The child knows what could').get_by_label('No').check()",
                action=actions.CHAIN_LOCATOR_ACTION,
            )
            self.po.act(
                locator="get_by_role('group', name='The child knows how the').get_by_label('No').check()",
                action=actions.CHAIN_LOCATOR_ACTION,
            )
            self.po.act(
                locator="get_by_role('group', name='The child knows which side').get_by_label('No').check()",
                action=actions.CHAIN_LOCATOR_ACTION,
            )
        self.po.act(
            locator=self.TXT_GILLICK_ASSESSMENT_DETAILS,
            action=actions.FILL,
            value=competence_details,
        )
        if is_add:
            self.po.act(
                locator=self.BTN_COMPLETE_GILLICK_ASSESSMENT,
                action=actions.CLICK_BUTTON,
            )
        else:
            self.po.act(
                locator=self.BTN_UPDATE_GILLICK_ASSESSMENT, action=actions.CLICK_BUTTON
            )
        if is_competent:
            self.po.verify(
                locator=self.LBL_MAIN,
                property=properties.TEXT,
                expected_value=self.LBL_CHILD_COMPETENT,
                exact=False,
            )
        else:
            self.po.verify(
                locator=self.LBL_MAIN,
                property=properties.TEXT,
                expected_value=self.LBL_CHILD_NOT_COMPETENT,
                exact=False,
            )
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value=competence_details,
            exact=False,
        )

    def __schedule_session(self, on_date: str, expect_error: bool = False):
        _day = on_date[-2:]
        _month = on_date[4:6]
        _year = on_date[:4]
        self.po.act(locator=self.LNK_SCHEDULE_SESSIONS, action=actions.CLICK_LINK)
        self.po.act(locator=self.LNK_ADD_SESSION_DATES, action=actions.CLICK_LINK)
        self.po.act(locator=self.TXT_DAY, action=actions.FILL, value=_day)
        self.po.act(locator=self.TXT_MONTH, action=actions.FILL, value=_month)
        self.po.act(locator=self.TXT_YEAR, action=actions.FILL, value=_year)
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        if expect_error:
            _expected_message = "There is a problem Enter a date"
            self.po.verify(
                locator=self.LBL_MAIN,
                property=properties.TEXT,
                expected_value=_expected_message,
                exact=False,
            )

    def __delete_sessions(self):
        self.po.act(locator=self.LNK_EDIT_SESSION, action=actions.CLICK_LINK)
        self.po.act(locator=self.LNK_CHANGE_SESSION_DATES, action=actions.CLICK_LINK)
        self.po.act(locator=self.BTN_DELETE, action=actions.CLICK_BUTTON)
        self.po.act(locator=self.LNK_BACK, action=actions.CLICK_LINK)
        self.po.act(locator=self.LNK_CONTINUE, action=actions.CLICK_LINK)
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value=self.LBL_NO_SESSIONS_SCHEDULED,
        )

    def __edit_session(self, to_date: str):
        _day = to_date[-2:]
        _month = to_date[4:6]
        _year = to_date[:4]
        self.po.act(locator=self.LNK_EDIT_SESSION, action=actions.CLICK_LINK)
        self.po.act(locator=self.LNK_CHANGE_SESSION_DATES, action=actions.CLICK_LINK)
        self.po.act(locator=self.TXT_DAY, action=actions.FILL, value=_day)
        self.po.act(locator=self.TXT_MONTH, action=actions.FILL, value=_month)
        self.po.act(locator=self.TXT_YEAR, action=actions.FILL, value=_year)
        self.po.act(locator=self.LNK_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.act(locator=self.LNK_CONTINUE, action=actions.CLICK_LINK)
        self.po.verify(
            locator="locator('div').filter(has_text=re.compile(r'^Session datesNot provided$')).get_by_role('definition')",
            property=properties.VISIBILITY,
            expected_value=False,
            exact=False,
            by_test_id=False,
            chain_locator=True,
        )

    def __close_session(self):
        self.po.act(locator=self.LNK_CLOSE_SESSION, action=actions.CLICK_LINK)
        self.po.act(locator=self.LNK_CLOSE_SESSION, action=actions.CLICK_BUTTON)
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value="Session closed.",
        )

    def verify_triage_updated(self):
        self.po.verify(
            locator=self.LBL_PARAGRAPH,
            property=properties.TEXT,
            expected_value=self.LBL_TRIAGE_UPDATED_MESSAGE,
            exact=False,
        )

    def verify_activity_log_entry(self, consent_given: bool):
        self.po.act(locator=None, action=actions.WAIT, value=wait_time.MIN)
        if consent_given:
            self.po.verify(
                locator=self.LBL_MAIN,
                property=properties.TEXT,
                expected_value=self.LBL_ACTIVITY_LOG_ENTRY_CONSENT_GIVEN,
                exact=False,
            )
        else:
            self.po.verify(
                locator=self.LBL_MAIN,
                property=properties.TEXT,
                expected_value=self.LBL_ACTIVITY_LOG_ENTRY_CONSENT_REFUSED,
                exact=False,
            )

    def invalidate_parent2_refusal(self):
        self.po.act(locator=self.LNK_PARENT2, action=actions.CLICK_LINK)
        self.po.act(locator=self.LNK_MARK_AS_INVALID, action=actions.CLICK_LINK)
        self.po.act(
            locator=self.TXT_NOTES, action=actions.FILL, value="Invalidation notes."
        )
        self.po.act(locator=self.LNK_MARK_AS_INVALID, action=actions.CLICK_BUTTON)
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value="Consent refusedInvalid",
        )
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value="Invalidation notes.",
        )
        self.po.act(locator=self.LNK_BACK, action=actions.CLICK_LINK)
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value="Consent refusedInvalid",
        )
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value="No-one responded to our requests for consent.",
        )

    def verify_scheduled_date(self, message: str):
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value=message,
            exact=False,
        )
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_LINK)

    def click_get_consent_response(self):
        self.po.act(locator=self.BTN_GET_CONSENT_RESPONSE, action=actions.CLICK_BUTTON)

    def update_triage_outcome_positive(self, file_paths):
        _input_file_path, _ = self.tdo.get_file_paths(file_paths=file_paths)
        self.click_scheduled()
        self.click_school1()
        self.click_import_class_list()
        self.select_year_groups(8, 9, 10, 11)
        self.choose_file_child_records_for_school_1(file_path=_input_file_path)
        self.click_continue()
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.click_scheduled()
        self.click_school1()
        self.click_consent_tab()
        self.click_child_full_name()
        self.click_get_consent_response()
        self.consent_page.service_give_consent()
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.click_scheduled()
        self.click_school1()
        self.click_register_tab()
        self.click_child_full_name()
        self.click_update_triage_outcome()
        self.select_yes_safe_to_vaccinate()
        self.click_save_triage()
        self.verify_triage_updated()
        self.click_child_full_name()
        self.click_activity_log()
        self.verify_activity_log_entry(consent_given=True)

    def verify_mav_nnn(self):
        self.click_scheduled()
        self.click_school1()
        self.click_consent_tab()
        self.click_child_full_name()
        self.click_get_consent_response()
        self.consent_page.service_give_consent()
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.click_scheduled()
        self.click_school1()
        self.click_register_tab()
        self.click_child_full_name()
        self.click_update_triage_outcome()
        self.select_yes_safe_to_vaccinate()
        self.click_save_triage()
        self.verify_triage_updated()

    def update_triage_outcome_consent_refused(self, file_paths):
        _input_file_path, _ = self.tdo.get_file_paths(file_paths=file_paths)
        self.click_scheduled()
        self.click_school1()
        self.click_import_class_list()
        self.select_year_groups(8, 9, 10, 11)
        self.choose_file_child_records_for_school_1(file_path=_input_file_path)
        self.click_continue()
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.click_scheduled()
        self.click_school1()
        self.click_consent_tab()
        self.click_child_full_name()
        self.click_get_consent_response()
        self.consent_page.service_refuse_consent()
        self.select_consent_refused()
        self.click_child_full_name()
        self.click_activity_log()
        self.verify_activity_log_entry(consent_given=False)

    def schedule_a_valid_session_in_school_1(self, for_today: bool = False):
        _future_date = (
            get_offset_date(offset_days=0)
            if for_today
            else get_offset_date(offset_days=10)
        )
        _expected_message = f"Session dates	{self.__get_display_formatted_date(date_to_format=_future_date)}"
        self.click_unscheduled()
        self.click_school1()
        self.__schedule_session(on_date=_future_date)
        self.verify_scheduled_date(message=_expected_message)

    def schedule_a_valid_session_in_school_2(self, for_today: bool = False):
        _future_date = (
            get_offset_date(offset_days=0)
            if for_today
            else get_offset_date(offset_days=10)
        )
        _expected_message = f"Session dates	{self.__get_display_formatted_date(date_to_format=_future_date)}"
        self.click_unscheduled()
        self.click_school2()
        self.__schedule_session(on_date=_future_date)
        self.verify_scheduled_date(message=_expected_message)

    def schedule_a_valid_session_in_community_clinics(self, for_today: bool = False):
        _future_date = (
            get_offset_date(offset_days=0)
            if for_today
            else get_offset_date(offset_days=10)
        )
        _expected_message = f"Session dates	{self.__get_display_formatted_date(date_to_format=_future_date)}"
        self.click_unscheduled()
        self.click_community_clinics()
        self.__schedule_session(on_date=_future_date)
        self.verify_scheduled_date(message=_expected_message)

    def close_active_session_in_school_2(self):
        _past_date = get_offset_date(offset_days=-1)
        self.click_scheduled()
        self.click_school2()
        self.__edit_session(to_date=_past_date)
        self.__close_session()

    def close_active_session_in_school_1(self):
        self.click_scheduled()
        self.click_school1()
        self.__close_session()

    def close_active_session_in_community_clinics(self):
        self.click_scheduled()
        self.click_community_clinics()
        self.__close_session()

    def edit_a_session_to_today(self):
        _future_date = get_offset_date(offset_days=0)
        self.click_scheduled()
        self.click_school1()
        self.__edit_session(to_date=_future_date)

    def delete_all_sessions_for_school_1(self):
        self.click_scheduled()
        self.click_school1()
        self.__delete_sessions()

    def delete_all_sessions_for_school_2(self):
        self.click_scheduled()
        self.click_school2()
        self.__delete_sessions()

    def delete_all_sessions_for_community_clinics(self):
        self.click_scheduled()
        self.click_community_clinics()
        self.__delete_sessions()

    def create_invalid_session(self):
        _invalid_date = "20251332"
        self.click_unscheduled()
        self.click_school1()
        self.__schedule_session(on_date=_invalid_date, expect_error=True)

    def upload_class_list_to_school_1(
        self,
        file_paths: str,
        verify_on_children: bool = False,
    ):
        _input_file_path, _output_file_path = self.tdo.get_file_paths(
            file_paths=file_paths
        )
        if verify_on_children:
            _cl = self.tdo.create_child_list_from_file(
                file_path=_input_file_path, file_type=mavis_file_types.CLASS_LIST
            )
        self.click_import_class_list()
        self.select_year_groups(8, 9, 10, 11)
        self.choose_file_child_records_for_school_1(file_path=_input_file_path)
        self.click_continue()
        self._record_upload_time()
        if self.ce.get_file_record_count() > record_limit.FILE_RECORD_MIN_THRESHOLD:
            self.po.act(locator=None, action=actions.WAIT, value=wait_time.MED)
            self.click_uploaded_file_datetime()
        self.verify_upload_output(file_path=_output_file_path)
        if verify_on_children:
            self.children_page.verify_child_has_been_uploaded(child_list=_cl)

    def upload_class_list_to_school_2(
        self, file_paths: str, verify_on_children: bool = False
    ):
        _input_file_path, _output_file_path = self.tdo.get_file_paths(
            file_paths=file_paths
        )
        if verify_on_children:
            _cl = self.tdo.create_child_list_from_file(
                file_path=_input_file_path, file_type=mavis_file_types.CLASS_LIST
            )
        self.click_import_class_list()
        self.select_year_groups(8, 9, 10, 11)
        self.choose_file_child_records_for_school_2(file_path=_input_file_path)
        self.click_continue()
        self._record_upload_time()
        if self.ce.get_file_record_count() > record_limit.FILE_RECORD_MIN_THRESHOLD:
            self.po.act(locator=None, action=actions.WAIT, value=wait_time.MED)
            self.click_uploaded_file_datetime()
        self.verify_upload_output(file_path=_output_file_path)
        if verify_on_children:
            self.children_page.verify_child_has_been_uploaded(child_list=_cl)

    def set_gillick_competence_for_student(self):
        self.click_today()
        self.click_school1()
        self.click_consent_tab()
        self.click_child_full_name()
        self.click_assess_gillick_competence()
        self.add_gillick_competence(
            is_competent=True, competence_details="Gillick competent"
        )
        self.click_edit_gillick_competence()
        self.edit_gillick_competence(
            is_competent=False, competence_details="Not Gillick competent"
        )

    def get_hpv_consent_url(self) -> str:
        return self.po.get_element_property(
            locator=self.LNK_HPV_CONSENT_FORM, property=properties.HREF
        )

    def get_doubles_consent_url(self) -> str:
        return self.po.get_element_property(
            locator=self.LNK_DOUBLES_CONSENT_FORM, property=properties.HREF
        )

    def bug_mavis_1696(self):
        self.select_no_response()
        self.click_child_conflicting_consent()
        self.click_get_consent_response()
        self.consent_page.parent_1_verbal_no_response()
        self.select_no_response()
        self.click_child_conflicting_consent()
        self.click_get_consent_response()
        self.consent_page.parent_2_verbal_refuse_consent()
        self.click_child_conflicting_consent()
        self.invalidate_parent2_refusal()
        self.click_activity_log()
        self.po.act(locator=None, action=actions.WAIT, value=wait_time.MIN)
        # FIXME: Make the following generic
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value="Consent from Parent2 invalidated",
        )
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value="Consent refused by Parent2 (Mum)",
        )
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value="Consent not_provided by Parent1 (Dad)",
        )

    def bug_mavis_1864(self):
        self.select_no_response()
        self.click_child_consent_twice()
        self.click_get_consent_response()
        self.consent_page.parent_1_online_positive()
        self.select_consent_given()
        self.click_child_consent_twice()
        self.click_update_triage_outcome()
        self.consent_page.update_triage_outcome_positive()
        self.click_consent_tab()
        self.click_get_consent_response()
        self.consent_page.parent_1_verbal_refuse_consent()
        self.select_consent_refused()
        self.click_child_consent_twice()
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value="Dad refused to give consent.",
        )
        self.click_activity_log()
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value="Consent refused by Parent1 (Dad)",
        )
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value="Triaged decision: Safe to vaccinate",
        )
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value="Consent given by Parent1 (Dad)",
        )

    def verify_attendance_filters(self):
        # Check year filters
        self.po.act(locator=self.LNK_REGISTER_ATTENDANCE, action=actions.CLICK_LINK)
        self.po.verify(
            locator=self.LBL_MAIN, property=properties.TEXT, expected_value="6 children"
        )
        self.po.act(locator=self.CHK_YEAR8, action=actions.CHECKBOX_CHECK)
        self.po.act(locator=self.BTN_UPDATE_RESULTS, action=actions.CLICK_BUTTON)
        self.po.act(locator=None, action=actions.WAIT, value=wait_time.MIN)
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value="No children",
        )
        self.po.act(locator=self.CHK_YEAR8, action=actions.CHECKBOX_UNCHECK)
        self.po.act(locator=self.BTN_UPDATE_RESULTS, action=actions.CLICK_BUTTON)
        self.po.act(locator=None, action=actions.WAIT, value=wait_time.MIN)
        self.po.verify(
            locator=self.LBL_MAIN, property=properties.TEXT, expected_value="6 children"
        )
        # Check name filters
        if len(self.ce.child_list) >= 1:
            for child_name in self.ce.child_list:
                self.po.act(
                    locator=self.TXT_FILTER_NAME, action=actions.FILL, value=child_name
                )
                self.po.act(locator=None, action=actions.WAIT, value=wait_time.MIN)
                self.po.verify(
                    locator=self.LBL_MAIN,
                    property=properties.TEXT,
                    expected_value=child_name,
                )
                self.po.act(locator=self.TXT_FILTER_NAME, action=actions.FILL, value="")

    def bug_mavis_1818(self):
        self.select_no_response()
        self.click_child_conflicting_gillick()  # Click appropriate child name
        self.click_get_consent_response()
        self.consent_page.parent_1_verbal_positive(change_phone=False)
        self.select_consent_given()
        self.click_child_conflicting_gillick()  # Click appropriate child name
        self.click_get_consent_response()
        self.consent_page.parent_2_verbal_refuse_consent()
        self.select_conflicting_consent()
        self.click_child_conflicting_gillick()  # Click appropriate child name
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value="Conflicting consent",
        )
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value="You can only vaccinate if all respondents give consent.",
        )
        self.click_assess_gillick_competence()
        self.add_gillick_competence(
            is_competent=True, competence_details="Gillick competent"
        )
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value="Triaged decision: Safe to vaccinate",
        )
        self.click_get_consent_response()
        self.consent_page.child_consent_verbal_positive()
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value=f"Consent recorded for {self.LNK_CHILD_CONFLICTING_GILLICK}",
        )
        self.select_consent_given()
        self.click_child_conflicting_gillick()  # Click appropriate child name
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value="Ready for nurse",
        )
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value=f"JOY, Nurse decided that {self.LNK_CHILD_CONFLICTING_GILLICK} is ready for the nurse.",
        )
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value="Consent given",
        )
        self.click_activity_log()
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value=f"Consent given by {self.LNK_CHILD_CONFLICTING_GILLICK} (Child (Gillick competent))",
        )

    def give_consent_for_e2e1_child_by_parent_1(self):
        self.click_consent_tab()
        self.click_child_e2e1()
        self.click_get_consent_response()
        self.consent_page.parent_1_verbal_positive(change_phone=False)

    def select_year_groups(self, *year_groups: int) -> None:
        for year_group in year_groups:
            self.po.act(locator=f"Year {year_group}", action=actions.CHECKBOX_CHECK)
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def _answer_hpv_prescreening_questions(self):
        self.po.act(locator=None, action=actions.WAIT, value=wait_time.MED)
        self.po.act(locator=self.CHK_NOT_ALREADY_HAD, action=actions.CHECKBOX_CHECK)
        self.po.act(locator=None, action=actions.WAIT, value=wait_time.MIN)
        self.po.act(locator=self.CHK_KNOW_VACCINATION, action=actions.CHECKBOX_CHECK)
        self.po.act(locator=None, action=actions.WAIT, value=wait_time.MIN)
        self.po.act(locator=self.CHK_ARE_FEELING_WELL, action=actions.CHECKBOX_CHECK)
        self.po.act(locator=None, action=actions.WAIT, value=wait_time.MIN)
        self.po.act(locator=self.CHK_HAVE_NO_ALLERGIES, action=actions.CHECKBOX_CHECK)
        # self.po.act(locator=None, action=framework_actions.WAIT, value=wait_time.MIN)
        # self.po.act(locator=self.CHK_ARE_NOT_PREGNANT, action=framework_actions.CHECKBOX_CHECK) # Removed in R2.2.1 MAV-976

    def _answer_menacwy_prescreening_questions(self, check_prefilled: bool = False):
        self.po.act(locator=None, action=actions.WAIT, value=wait_time.MED)
        self.po.act(locator=self.CHK_NOT_ALREADY_HAD, action=actions.CHECKBOX_CHECK)
        self.po.act(locator=None, action=actions.WAIT, value=wait_time.MIN)
        self.po.act(locator=self.CHK_KNOW_VACCINATION, action=actions.CHECKBOX_CHECK)
        self.po.act(locator=None, action=actions.WAIT, value=wait_time.MIN)
        self.po.act(locator=self.CHK_HAVE_NO_ALLERGIES, action=actions.CHECKBOX_CHECK)
        self.po.act(locator=None, action=actions.WAIT, value=wait_time.MIN)
        self.po.act(
            locator=self.CHK_NOT_TAKING_MEDICATION, action=actions.CHECKBOX_CHECK
        )
        if check_prefilled:
            self.po.verify(
                locator=self.CHK_ARE_FEELING_WELL,
                property=properties.CHECKBOX_CHECKED,
                expected_value=True,
            )
        else:
            self.po.act(
                locator=self.CHK_ARE_FEELING_WELL, action=actions.CHECKBOX_CHECK
            )

    def _answer_tdipv_prescreening_questions(self, check_prefilled: bool = False):
        self.po.act(locator=None, action=actions.WAIT, value=wait_time.MED)
        self.po.act(locator=self.CHK_NOT_ALREADY_HAD, action=actions.CHECKBOX_CHECK)
        self.po.act(locator=None, action=actions.WAIT, value=wait_time.MIN)
        self.po.act(locator=self.CHK_KNOW_VACCINATION, action=actions.CHECKBOX_CHECK)
        self.po.act(locator=None, action=actions.WAIT, value=wait_time.MIN)
        self.po.act(locator=self.CHK_ARE_FEELING_WELL, action=actions.CHECKBOX_CHECK)
        self.po.act(locator=None, action=actions.WAIT, value=wait_time.MIN)
        self.po.act(locator=self.CHK_HAVE_NO_ALLERGIES, action=actions.CHECKBOX_CHECK)
        self.po.act(locator=None, action=actions.WAIT, value=wait_time.MIN)
        self.po.act(
            locator=self.CHK_NOT_TAKING_MEDICATION, action=actions.CHECKBOX_CHECK
        )
        self.po.act(locator=None, action=actions.WAIT, value=wait_time.MIN)
        self.po.act(locator=self.CHK_ARE_NOT_PREGNANT, action=actions.CHECKBOX_CHECK)
        if check_prefilled:
            self.po.verify(
                locator=self.CHK_ARE_FEELING_WELL,
                property=properties.CHECKBOX_CHECKED,
                expected_value=True,
            )
            # self.po.verify(
            #     locator=self.CHK_ARE_NOT_PREGNANT, property=element_properties.CHECKBOX_CHECKED, expected_value=True
            # )   # Removed in R2.2.1 MAV-976
        else:
            self.po.act(
                locator=self.CHK_ARE_FEELING_WELL, action=actions.CHECKBOX_CHECK
            )

    def _vaccinate_child_mav_854(self):
        self.click_get_consent_response()
        self.consent_page.parent_1_verbal_positive(change_phone=False)
        self.register_child_as_attending(child_name=self.LNK_MAV_854_CHILD)
        self.record_vaccs_for_child(
            child_name=self.LNK_MAV_854_CHILD,
            programme_name=programmes.HPV,
            at_school=False,
        )
        self.po.act(locator=self.RDO_CLINIC_WEIMANN, action=actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.act(locator=self.BTN_CONFIRM, action=actions.CLICK_BUTTON)
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value="Vaccination outcome recorded for HPV",
        )

    def register_child_as_attending(self, child_name: str):
        self.click_register_tab()
        self.po.act(locator=self.TXT_SEARCH, action=actions.FILL, value=child_name)
        self.po.act(locator=self.BTN_SEARCH, action=actions.CLICK_BUTTON)
        self.po.act(locator=None, action=actions.WAIT, value=wait_time.MIN)
        self.po.act(locator=self.BTN_ATTENDING, action=actions.CLICK_BUTTON)

    def verify_search(self):
        """
        1. Find a session with patients
        2. Go to any of the tabs at the top that allow users to search by name
        3. Enter a search query that will result in no matches (for example "a very long string that won't match any names")
        Expected: The user sees a page saying "No children matching search criteria found".
        Actual: The user sees a page saying "An error has occurred."
        """
        self.click_consent_tab()
        self.po.act(
            locator=self.TXT_SEARCH,
            action=actions.FILL,
            value="a very long string that won't match any names",
        )
        self.po.act(locator=self.BTN_SEARCH, action=actions.CLICK_BUTTON)
        self.po.act(locator=None, action=actions.WAIT, value=wait_time.MIN)
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value="No children matching search criteria found",
            exact=False,
        )

    def search_child(self, child_name: str) -> None:
        self.po.act(locator=self.TXT_SEARCH, action=actions.FILL, value=child_name)
        self.po.act(locator=self.BTN_SEARCH, action=actions.CLICK_BUTTON)
        self.po.act(locator=None, action=actions.WAIT, value=wait_time.MIN)
        self.po.act(locator=child_name, action=actions.CLICK_LINK)

    def record_vaccs_for_child(
        self, child_name: str, programme_name: str, at_school: bool = True
    ):
        _batch_name: str = ""
        self.po.act(locator=self.LNK_RECORD_VACCINATIONS, action=actions.CLICK_LINK)
        self.search_child(child_name=child_name)
        self.po.act(locator=programme_name, action=actions.CLICK_LINK)
        match programme_name:
            case programmes.HPV:
                self._answer_hpv_prescreening_questions()
                _batch_name = vaccines.GARDASIL9[0]
            case programmes.MENACWY:
                self._answer_menacwy_prescreening_questions(check_prefilled=True)
                _batch_name = vaccines.MENQUADFI[0]
            case programmes.TDIPV:
                self._answer_tdipv_prescreening_questions(check_prefilled=True)
                _batch_name = vaccines.REVAXIS[0]
        self.po.act(locator=self.RDO_YES, action=actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.RDO_LEFT_ARM_UPPER, action=actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.act(locator=_batch_name, action=actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        if at_school:  # only skips MAV-854
            self.po.act(locator=self.BTN_CONFIRM, action=actions.CLICK_BUTTON)
            self.po.verify(
                locator=self.LBL_MAIN,
                property=properties.TEXT,
                expected_value=f"Vaccination outcome recorded for {programme_name}",
            )
