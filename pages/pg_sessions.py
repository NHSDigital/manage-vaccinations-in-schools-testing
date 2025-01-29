from libs import CurrentExecution, file_ops, playwright_ops, testdata_ops
from libs.constants import actions, element_properties, wait_time
from libs.wrappers import *
from pages import pg_children, pg_dashboard, pg_parental_consent


class pg_sessions:
    po = playwright_ops.playwright_operations()
    ce = CurrentExecution()
    tdo = testdata_ops.testdata_operations()
    fo = file_ops.file_operations()
    dashboard_page = pg_dashboard.pg_dashboard()
    consent_page = pg_parental_consent.pg_parental_consent()
    children_page = pg_children.pg_children()

    LNK_SCHOOL_1 = "Bohunt School Wokingham"
    LNK_SCHOOL_2 = "Barn End Centre"

    LNK_TAB_TODAY = "Today"
    LNK_TAB_SCHEDULED = "Scheduled"
    LNK_TAB_UNSCHEDULED = "Unscheduled"
    LNK_TAB_NO_RESPONSE = "No response"
    LNK_TAB_CONSENT_GIVEN = "Consent given"
    LNK_TAB_CONFLICTING_CONSENT = "Conflicting consent"
    LNK_TAB_ACTIVITY_LOG = "Activity log"
    LNK_IMPORT_CLASS_LIST = "Import class list"
    LBL_CHOOSE_COHORT_FILE_1 = f"{LNK_SCHOOL_1}Import class"
    LBL_CHOOSE_COHORT_FILE_2 = f"{LNK_SCHOOL_2}Import class"
    BTN_CONTINUE = "Continue"
    LNK_ADD_SESSION_DATES = "Add session dates"
    LNK_RECORD_VACCINATIONS = "Record vaccinations"
    LNK_CHILD_FULL_NAME = "CF"
    LNK_CHILD_NO_CONSENT = "NoConsent1 NoConsent1"
    LNK_CHILD_CONFLICTING_CONSENT = "ConflictingConsent1 ConflictingConsent1"
    LNK_UPDATE_TRIAGE_OUTCOME = "Update triage outcome"
    LNK_SCHEDULE_SESSIONS = "Schedule sessions"
    RDO_YES_SAFE_TO_VACCINATE = "Yes, it’s safe to vaccinate"
    BTN_SAVE_TRIAGE = "Save triage"
    LBL_PARAGRAPH = "paragraph"
    LBL_TRIAGE_UPDATED_MESSAGE = "Triage outcome updated for CF"
    LBL_MAIN = "main"
    TXT_DAY = "Day"
    TXT_MONTH = "Month"
    TXT_YEAR = "Year"
    LNK_EDIT_SESSION = "Edit session"
    LNK_CLOSE_SESSION = "Close session"
    LNK_CHANGE_SESSION_DATES = "Change session dates"
    BTN_DELETE = "Delete"
    LNK_BACK = "Back"
    LNK_CONTINUE = "Continue"
    LNK_CONSENT_FORM = "View parental consent form (opens in new tab)"
    LNK_ASSESS_GILLICK_COMPETENCE = "Assess Gillick competence"
    RDO_YES_GILLICK_COMPETENT = "Yes, they are Gillick competent"
    RDO_NO_GILLICK_COMPETENT = "No"
    TXT_GILLICK_ASSESSMENT_DETAILS = "Assessment notes (optional)"
    BTN_SAVE_CHANGES = "Save changes"
    LBL_ACTIVITY_LOG_ENTRY_CONSENT_GIVEN = "Triaged decision: Safe to vaccinate"
    LBL_ACTIVITY_LOG_ENTRY_CONSENT_REFUSED = "Consent refused by Parent1 (Dad)"
    BTN_GET_CONSENT_RESPONSE = "Get consent response"
    LNK_CHECK_CONSENT_RESPONSES = "Check consent responses"
    BTN_COMPLETE_GILLICK_ASSESSMENT = "Complete your assessment"
    LBL_CHILD_COMPETENT = "Child assessed as Gillick competent"
    LBL_CHILD_NOT_COMPETENT = "Child assessed as not Gillick competent"
    LNK_EDIT_GILLICK_COMPETENCE = "Edit Gillick competence"
    BTN_UPDATE_GILLICK_ASSESSMENT = "Update your assessment"
    LNK_CONSENT_FORM = "View parental consent form ("
    LNK_COULD_NOT_VACCINATE = "Could not vaccinate"
    LNK_CONSENT_REFUSED = "Consent refused"
    LNK_MARK_AS_INVALID = "Mark as invalid"
    LNK_PARENT2 = "Parent2"
    TXT_NOTES = "Notes"
    LNK_REGISTER_ATTENDANCE = "Register attendance"
    LBL_CAPTION = "caption"
    CHK_YEAR8 = "Year 8"
    TXT_FILTER_NAME = "Name"

    def __get_display_formatted_date(self, date_to_format: str) -> str:
        _parsed_date = datetime.strptime(date_to_format, "%Y%m%d")
        _formatted_date = _parsed_date.strftime("%A %d %B %Y").replace(" 0", " ")
        return _formatted_date

    def __record_upload_time(self):
        self.upload_time = get_link_formatted_date_time()

    def click_uploaded_file_datetime(self):
        self.po.act(locator=self.upload_time, action=actions.CLICK_LINK)

    def verify_upload_output(self, file_path: str):
        # Verify messages separately
        _expected_errors = self.tdo.get_expected_errors(file_path=file_path)
        if _expected_errors is not None:
            for _msg in _expected_errors:
                self.po.verify(
                    locator=self.LBL_MAIN, property=element_properties.TEXT, expected_value=_msg, exact=False
                )
        # Verify all messages together - NEEDS MORE THOUGHT
        # _all_errors = "".join(
        #     [
        #         x
        #         for x in _expected_errors
        #         if not x.startswith(escape_characters.COMMENT_OPERATOR)
        #         and not x.startswith(escape_characters.NOT_OPERATOR)
        #     ]
        # )
        # self.po.verify(locator=self.LBL_MAIN, property=object_properties.TEXT, expected_value=_all_errors, exact=False)

    def click_today(self):
        self.po.act(locator=self.LNK_TAB_TODAY, action=actions.CLICK_LINK, exact=True)

    def click_scheduled(self):
        self.po.act(locator=self.LNK_TAB_SCHEDULED, action=actions.CLICK_LINK, exact=True)

    def click_unscheduled(self):
        self.po.act(locator=self.LNK_TAB_UNSCHEDULED, action=actions.CLICK_LINK, exact=True)

    def click_no_response(self):
        self.po.act(locator=self.LNK_TAB_NO_RESPONSE, action=actions.CLICK_LINK, exact=False)

    def click_consent_given(self):
        self.po.act(locator=self.LNK_TAB_CONSENT_GIVEN, action=actions.CLICK_LINK, exact=False)

    def click_conflicting_consent(self):
        self.po.act(locator=self.LNK_TAB_CONFLICTING_CONSENT, action=actions.CLICK_LINK, exact=False)

    def click_activity_log(self):
        self.po.act(locator=self.LNK_TAB_ACTIVITY_LOG, action=actions.CLICK_LINK, exact=True)
        wait(timeout=wait_time.MIN)

    def click_school1(self):
        self.po.act(locator=self.LNK_SCHOOL_1, action=actions.CLICK_LINK)

    def click_school2(self):
        self.po.act(locator=self.LNK_SCHOOL_2, action=actions.CLICK_LINK)

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

    def click_record_vaccinations(self):
        self.po.act(locator=self.LNK_RECORD_VACCINATIONS, action=actions.CLICK_LINK)

    def click_child_full_name(self):
        self.po.act(locator=self.LNK_CHILD_FULL_NAME, action=actions.CLICK_WILDCARD)

    def click_child_no_consent(self):
        self.po.act(locator=self.LNK_CHILD_NO_CONSENT, action=actions.CLICK_LINK)

    def click_child_conflicting_consent(self):
        self.po.act(locator=self.LNK_CHILD_CONFLICTING_CONSENT, action=actions.CLICK_LINK)

    def click_update_triage_outcome(self):
        self.po.act(locator=self.LNK_UPDATE_TRIAGE_OUTCOME, action=actions.CLICK_LINK)

    def select_yes_safe_to_vaccinate(self):
        self.po.act(locator=self.RDO_YES_SAFE_TO_VACCINATE, action=actions.RADIO_BUTTON_SELECT)

    def click_save_triage(self):
        self.po.act(locator=self.BTN_SAVE_TRIAGE, action=actions.CLICK_BUTTON)

    def click_check_consent_responses(self):
        self.po.act(locator=self.LNK_CHECK_CONSENT_RESPONSES, action=actions.CLICK_LINK)

    def click_assess_gillick_competence(self):
        self.po.act(locator=self.LNK_ASSESS_GILLICK_COMPETENCE, action=actions.CLICK_LINK)

    def click_edit_gillick_competence(self):
        self.po.act(locator=self.LNK_EDIT_GILLICK_COMPETENCE, action=actions.CLICK_LINK)

    def click_could_not_vaccinate(self):
        self.po.act(locator=self.LNK_COULD_NOT_VACCINATE, action=actions.CLICK_LINK)

    def click_consent_refused(self):
        self.po.act(locator=self.LNK_CONSENT_REFUSED, action=actions.CLICK_LINK)

    def add_gillick_competence(self, is_competent: bool, competence_details: str) -> None:
        self.__set_gillick_consent(is_add=True, is_competent=is_competent, competence_details=competence_details)

    def edit_gillick_competence(self, is_competent: bool, competence_details: str) -> None:
        self.__set_gillick_consent(is_add=False, is_competent=is_competent, competence_details=competence_details)

    def __set_gillick_consent(self, is_add: bool, is_competent: bool, competence_details: str) -> None:
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
        self.po.act(locator=self.TXT_GILLICK_ASSESSMENT_DETAILS, action=actions.FILL, value=competence_details)
        if is_add:
            self.po.act(locator=self.BTN_COMPLETE_GILLICK_ASSESSMENT, action=actions.CLICK_BUTTON)
        else:
            self.po.act(locator=self.BTN_UPDATE_GILLICK_ASSESSMENT, action=actions.CLICK_BUTTON)
        if is_competent:
            self.po.verify(
                locator=self.LBL_MAIN,
                property=element_properties.TEXT,
                expected_value=self.LBL_CHILD_COMPETENT,
                exact=False,
            )
        else:
            self.po.verify(
                locator=self.LBL_MAIN,
                property=element_properties.TEXT,
                expected_value=self.LBL_CHILD_NOT_COMPETENT,
                exact=False,
            )
        self.po.verify(
            locator=self.LBL_MAIN, property=element_properties.TEXT, expected_value=competence_details, exact=False
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
                locator=self.LBL_MAIN, property=element_properties.TEXT, expected_value=_expected_message, exact=False
            )

    def __delete_sessions(self):
        self.po.act(locator=self.LNK_EDIT_SESSION, action=actions.CLICK_LINK)
        self.po.act(locator=self.LNK_CHANGE_SESSION_DATES, action=actions.CLICK_LINK)
        self.po.act(locator=self.BTN_DELETE, action=actions.CLICK_BUTTON)
        self.po.act(locator=self.LNK_BACK, action=actions.CLICK_LINK)
        self.po.act(locator=self.LNK_CONTINUE, action=actions.CLICK_LINK)
        self.po.verify(
            locator="locator('div').filter(has_text=re.compile(r'^Session datesNot provided$')).get_by_role('definition')",
            property=element_properties.VISIBILITY,
            expected_value=True,
            exact=False,
            by_test_id=False,
            chain_locator=True,
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
            property=element_properties.VISIBILITY,
            expected_value=False,
            exact=False,
            by_test_id=False,
            chain_locator=True,
        )

    def __close_session(self):
        self.po.act(locator=self.LNK_CLOSE_SESSION, action=actions.CLICK_LINK)
        self.po.act(locator=self.LNK_CLOSE_SESSION, action=actions.CLICK_BUTTON)
        self.po.verify(locator=self.LBL_MAIN, property=element_properties.TEXT, expected_value="Session closed.")

    def verify_triage_updated(self):
        self.po.verify(
            locator=self.LBL_PARAGRAPH,
            property=element_properties.TEXT,
            expected_value=self.LBL_TRIAGE_UPDATED_MESSAGE,
            exact=False,
        )

    def verify_activity_log_entry(self, consent_given: bool):
        wait(wait_time.MIN)
        if consent_given:
            self.po.verify(
                locator=self.LBL_MAIN,
                property=element_properties.TEXT,
                expected_value=self.LBL_ACTIVITY_LOG_ENTRY_CONSENT_GIVEN,
                exact=False,
            )
        else:
            self.po.verify(
                locator=self.LBL_MAIN,
                property=element_properties.TEXT,
                expected_value=self.LBL_ACTIVITY_LOG_ENTRY_CONSENT_REFUSED,
                exact=False,
            )

    def invalidate_parent2_refusal(self):
        self.po.act(locator=self.LNK_PARENT2, action=actions.CLICK_LINK)
        self.po.act(locator=self.LNK_MARK_AS_INVALID, action=actions.CLICK_LINK)
        self.po.act(locator=self.TXT_NOTES, action=actions.FILL, value="Invalidation notes.")
        self.po.act(locator=self.LNK_MARK_AS_INVALID, action=actions.CLICK_BUTTON)
        self.po.verify(
            locator=self.LBL_MAIN, property=element_properties.TEXT, expected_value="Consent refusedInvalid"
        )
        self.po.verify(locator=self.LBL_MAIN, property=element_properties.TEXT, expected_value="Invalidation notes.")
        self.po.act(locator=self.LNK_BACK, action=actions.CLICK_LINK)
        self.po.verify(
            locator=self.LBL_MAIN, property=element_properties.TEXT, expected_value="Consent refusedInvalid"
        )
        self.po.verify(
            locator=self.LBL_MAIN,
            property=element_properties.TEXT,
            expected_value="No-one responded to our requests for consent.",
        )

    def verify_scheduled_date(self, message: str):
        self.po.verify(locator=self.LBL_MAIN, property=element_properties.TEXT, expected_value=message, exact=False)
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_LINK)

    def click_get_consent_response(self):
        self.po.act(locator=self.BTN_GET_CONSENT_RESPONSE, action=actions.CLICK_BUTTON)

    def click_get_consent_responses(self):
        self.po.act(locator=self.LNK_CHECK_CONSENT_RESPONSES, action=actions.CLICK_BUTTON)

    def upload_valid_class_list(self, file_paths: str):
        _input_file_path, _ = self.tdo.get_file_paths(file_paths=file_paths)
        self.click_scheduled()
        self.click_school1()
        self.click_import_class_list()
        self.choose_file_child_records_for_school_1(file_path=_input_file_path)
        self.click_continue()

    def update_triage_outcome_positive(self, file_paths):
        _input_file_path, _ = self.tdo.get_file_paths(file_paths=file_paths)
        self.click_scheduled()
        self.click_school1()
        self.click_import_class_list()
        self.choose_file_child_records_for_school_1(file_path=_input_file_path)
        self.click_continue()
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.click_scheduled()
        self.click_school1()
        self.click_check_consent_responses()
        self.click_child_full_name()
        self.click_get_consent_response()
        self.consent_page.service_give_consent()
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.click_scheduled()
        self.click_school1()
        self.click_record_vaccinations()
        self.click_child_full_name()
        self.click_update_triage_outcome()
        self.select_yes_safe_to_vaccinate()
        self.click_save_triage()
        self.verify_triage_updated()
        self.click_child_full_name()
        self.click_activity_log()
        self.verify_activity_log_entry(consent_given=True)

    def update_triage_outcome_consent_refused(self, file_paths):
        _input_file_path, _ = self.tdo.get_file_paths(file_paths=file_paths)
        self.click_scheduled()
        self.click_school1()
        self.click_import_class_list()
        self.choose_file_child_records_for_school_1(file_path=_input_file_path)
        self.click_continue()
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.click_scheduled()
        self.click_school1()
        self.click_check_consent_responses()
        self.click_child_full_name()
        self.click_get_consent_response()
        self.consent_page.service_refuse_consent()
        self.click_consent_refused()
        self.click_child_full_name()
        self.click_activity_log()
        self.verify_activity_log_entry(consent_given=False)

    def schedule_a_valid_session_in_school_1(self, for_today: bool = False):
        _future_date = get_offset_date(offset_days=0) if for_today else get_offset_date(offset_days=10)
        _expected_message = f"Session dates	{self.__get_display_formatted_date(date_to_format=_future_date)}"
        self.click_unscheduled()
        self.click_school1()
        self.__schedule_session(on_date=_future_date)
        self.verify_scheduled_date(message=_expected_message)

    def schedule_a_valid_session_in_school_2(self, for_today: bool = False):
        _future_date = get_offset_date(offset_days=0) if for_today else get_offset_date(offset_days=10)
        _expected_message = f"Session dates	{self.__get_display_formatted_date(date_to_format=_future_date)}"
        self.click_unscheduled()
        self.click_school2()
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

    def edit_a_session_to_today(self):
        _future_date = get_offset_date(offset_days=0)
        self.click_scheduled()
        self.click_school1()
        self.__edit_session(to_date=_future_date)
        # _expected_message = f"Session dates	{self.__get_display_formatted_date(date_to_format=_future_date)}"
        # self.verify_scheduled_date(message=_expected_message)

    def delete_all_sessions_for_school_1(self):
        self.click_scheduled()
        self.click_school1()
        self.__delete_sessions()

    def delete_all_sessions_for_school_2(self):
        self.click_scheduled()
        self.click_school2()
        self.__delete_sessions()

    def create_invalid_session(self):
        _future_date = "20241332"
        self.click_unscheduled()
        self.click_school1()
        self.__schedule_session(on_date=_future_date, expect_error=True)

    def upload_class_list_to_school_1(self, file_paths: str):
        _input_file_path, _output_file_path = self.tdo.get_file_paths(file_paths=file_paths)
        self.ce.child_list = self.tdo.create_child_list_from_file(file_path=_input_file_path)
        self.click_scheduled()
        self.click_school1()
        self.click_import_class_list()
        self.choose_file_child_records_for_school_1(file_path=_input_file_path)
        self.click_continue()
        # self.__record_upload_time()
        wait(timeout=wait_time.MED)
        # self.click_uploaded_file_datetime()
        self.verify_upload_output(file_path=_output_file_path)
        self.children_page.search_child()

    def upload_class_list_to_school_2(self, file_paths: str):
        _input_file_path, _output_file_path = self.tdo.get_file_paths(file_paths=file_paths)
        self.click_scheduled()
        self.click_school2()
        self.click_import_class_list()
        self.choose_file_child_records_for_school_2(file_path=_input_file_path)
        self.click_continue()
        # self.__record_upload_time()
        wait(timeout=wait_time.MED)
        # self.click_uploaded_file_datetime()
        self.verify_upload_output(file_path=_output_file_path)

    def upload_invalid_class_list_records(self, file_paths: str):
        _input_file_path, _output_file_path = self.tdo.get_file_paths(file_paths=file_paths)
        self.click_scheduled()
        self.click_school1()
        self.click_import_class_list()
        self.choose_file_child_records_for_school_1(file_path=_input_file_path)
        self.click_continue()
        self.verify_upload_output(file_path=_output_file_path)

    def set_gillick_competence_for_student(self):
        self.click_today()
        self.click_school1()
        self.click_check_consent_responses()
        self.click_child_full_name()
        self.click_assess_gillick_competence()
        self.add_gillick_competence(is_competent=True, competence_details="Gillick competent")
        self.click_edit_gillick_competence()
        self.edit_gillick_competence(is_competent=False, competence_details="Not Gillick competent")

    def get_consent_url(self) -> str:
        return self.po.get_element_property(locator=self.LNK_CONSENT_FORM, property=element_properties.HREF)

    def bug_mavis_1696(self):
        self.click_no_response()
        self.click_child_no_consent()
        self.click_get_consent_response()
        self.consent_page.parent_1_verbal_no_response()
        self.click_no_response()
        self.click_child_no_consent()
        self.click_get_consent_response()
        self.consent_page.parent_2_verbal_refuse_consent()
        self.click_consent_refused()
        self.click_child_no_consent()
        self.invalidate_parent2_refusal()
        self.click_activity_log()
        wait(timeout=wait_time.MIN)
        # FIXME: Make the following generic
        self.po.verify(
            locator=self.LBL_MAIN, property=element_properties.TEXT, expected_value="Consent from Parent2 invalidated"
        )
        self.po.verify(
            locator=self.LBL_MAIN, property=element_properties.TEXT, expected_value="Consent refused by Parent2 (Mum)"
        )
        self.po.verify(
            locator=self.LBL_MAIN,
            property=element_properties.TEXT,
            expected_value="Consent not_provided by Parent1 (Dad)",
        )

    def bug_mavis_1801(self):
        self.click_no_response()
        self.click_child_no_consent()
        self.click_get_consent_response()
        self.consent_page.parent_1_verbal_positive()

    def bug_mavis_1864(self):
        self.click_no_response()
        self.click_child_no_consent()
        self.click_get_consent_response()
        self.consent_page.parent_1_online_positive()
        self.click_no_response()
        self.click_child_no_consent()
        self.click_get_consent_response()

    def verify_attendance_filters(self):
        # Check year filters
        self.po.act(locator=self.LNK_REGISTER_ATTENDANCE, action=actions.CLICK_LINK)
        self.po.verify(
            locator=self.LBL_CAPTION, property=element_properties.TEXT, expected_value="6 children still to register"
        )
        self.po.act(locator=self.CHK_YEAR8, action=actions.CHECKBOX_CHECK)
        wait(timeout=wait_time.MIN)
        self.po.verify(
            locator=self.LBL_CAPTION, property=element_properties.TEXT, expected_value="No children still to register"
        )
        self.po.act(locator=self.CHK_YEAR8, action=actions.CHECKBOX_UNCHECK)
        wait(timeout=wait_time.MED)
        self.po.verify(
            locator=self.LBL_CAPTION, property=element_properties.TEXT, expected_value="6 children still to register"
        )
        # Check name filters
        if len(self.ce.child_list) >= 1:
            for child_name in self.ce.child_list:
                self.po.act(locator=self.TXT_FILTER_NAME, action=actions.FILL, value=child_name)
                wait(timeout=wait_time.MIN)
                self.po.verify(locator=self.LBL_MAIN, property=element_properties.TEXT, expected_value=child_name)
                self.po.act(locator=self.TXT_FILTER_NAME, action=actions.FILL, value="")

    def bug_mavis_1818(self):
        self.click_no_response()
        self.click_child_conflicting_consent()  # Click appropriate child name
        self.click_get_consent_response()
        self.consent_page.parent_1_verbal_positive(change_phone=False)
        self.click_consent_given()
        self.click_child_conflicting_consent()  # Click appropriate child name
        self.click_get_consent_response()
        self.consent_page.parent_2_verbal_refuse_consent()
        self.click_conflicting_consent()  # Tab
        wait(timeout=wait_time.MIN)
        self.po.verify(
            locator=self.LBL_MAIN,
            property=element_properties.TEXT,
            expected_value="1 child with conflicting consent responses",
        )
        self.click_child_conflicting_consent()  # Click appropriate child name
        self.po.verify(
            locator=self.LBL_MAIN,
            property=element_properties.TEXT,
            expected_value="Conflicting consent",
        )
        self.po.verify(
            locator=self.LBL_MAIN,
            property=element_properties.TEXT,
            expected_value="You can only vaccinate if all respondents give consent.",
        )
        self.click_assess_gillick_competence()
        self.add_gillick_competence(is_competent=True, competence_details="Gillick competent")
        self.po.verify(
            locator=self.LBL_MAIN,
            property=element_properties.TEXT,
            expected_value="Triaged decision: Safe to vaccinate",
        )
        self.click_activity_log()
        self.po.verify(
            locator=self.LBL_MAIN,
            property=element_properties.TEXT,
            expected_value="Completed Gillick assessment as Gillick competent",
        )
        self.po.verify(
            locator=self.LBL_MAIN,
            property=element_properties.TEXT,
            expected_value="Consent refused by Parent2 (Mum)",
        )
        self.po.verify(
            locator=self.LBL_MAIN,
            property=element_properties.TEXT,
            expected_value="Consent given by Parent1 (Dad)",
        )
        self.po.verify(
            locator=self.LBL_MAIN,
            property=element_properties.TEXT,
            expected_value="Triaged decision: Safe to vaccinate",
        )
