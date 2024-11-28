from libs import CurrentExecution, file_ops, playwright_ops, testdata_ops
from libs.constants import actions, object_properties, wait_time
from libs.wrappers import *
from pages import pg_dashboard, pg_parental_consent


class pg_sessions:
    po = playwright_ops.playwright_operations()
    ce = CurrentExecution()
    tdo = testdata_ops.testdata_operations()
    fo = file_ops.file_operations()
    dashboard_page = pg_dashboard.pg_dashboard()
    consent_page = pg_parental_consent.pg_parental_consent()

    LNK_SCHOOL_1 = "Bohunt School Wokingham"
    LNK_SCHOOL_2 = "Bothal Middle School"

    LNK_TAB_TODAY = "Today"
    LNK_TAB_SCHEDULED = "Scheduled"
    LNK_TAB_UNSCHEDULED = "Unscheduled"
    LNK_TAB_ACTIVITY_LOG = "Activity log"
    LNK_IMPORT_CLASS_LIST = "Import class list"
    LBL_CHOOSE_COHORT_FILE_1 = f"{LNK_SCHOOL_1}Import class"
    LBL_CHOOSE_COHORT_FILE_2 = f"{LNK_SCHOOL_2}Import class"
    BTN_CONTINUE = "Continue"
    LNK_ADD_SESSION_DATES = "Add session dates"
    LNK_RECORD_VACCINATIONS = "Record vaccinations"
    LNK_CHILD_FULL_NAME = "CF"
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
    LNK_CHANGE_SESSION_DATES = "Change session dates"
    BTN_DELETE = "Delete"
    LNK_BACK = "Back"
    LNK_CONTINUE = "Continue"
    LNK_CONSENT_FORM = "View parental consent form (opens in new tab)"
    BTN_CHECK_CONSENT_RESPONSES = "Check consent responses"
    LNK_ASSESS_GILLICK_COMPETENT = "Assess Gillick competence"
    RDO_YES_GILLICK_COMPETENT = "Yes, they are Gillick competent"
    RDO_NO_GILLICK_COMPETENT = "No"
    TXT_GILLICK_ASSESSMENT_DETAILS = "Assessment notes (optional)"
    BTN_SAVE_CHANGES = "Save changes"
    LBL_ACTIVITY_LOG_ENTRY_CONSENT_GIVEN = "Triaged decision: Safe to vaccinate"
    LBL_ACTIVITY_LOG_ENTRY_CONSENT_REFUSED = "Consent refused by Parent1 (Dad)"
    BTN_GET_CONSENT_RESPONSES = "Get consent response"
    BTN_COMPLETE_GILLICK_ASSESSMENT = "Complete your assessment"
    LBL_CHILD_COMPETENT = "Child assessed as Gillick competent"
    LBL_CHILD_NOT_COMPETENT = "Child assessed as not Gillick competent"
    LNK_EDIT_GILLICK_COMPETENCE = "Edit Gillick competence"
    BTN_UPDATE_GILLICK_ASSESSMENT = "Update your assessment"
    LNK_CONSENT_FORM = "View parental consent form ("
    LNK_COULD_NOT_VACCINATE = "Could not vaccinate"
    LNK_CONSENT_REFUSED = "Consent refused"

    def __get_display_formatted_date(self, date_to_format: str) -> str:
        _parsed_date = datetime.strptime(date_to_format, "%Y%m%d")
        _formatted_date = _parsed_date.strftime("%A %d %B %Y").replace(" 0", " ")
        return _formatted_date

    def __record_upload_time(self):
        self.upload_time = get_link_formatted_date_time()

    def click_uploaded_file_datetime(self):
        self.po.perform_action(locator=self.upload_time, action=actions.CLICK_LINK)

    def verify_upload_output(self, file_path: str):
        _expected_errors = self.tdo.get_expected_errors(file_path=file_path)
        if _expected_errors is not None:
            for _msg in _expected_errors:
                self.po.verify(locator=self.LBL_MAIN, property=object_properties.TEXT, value=_msg, exact=False)

    def click_today(self):
        self.po.perform_action(locator=self.LNK_TAB_TODAY, action=actions.CLICK_LINK, exact=True)

    def click_scheduled(self):
        self.po.perform_action(locator=self.LNK_TAB_SCHEDULED, action=actions.CLICK_LINK, exact=True)

    def click_unscheduled(self):
        self.po.perform_action(locator=self.LNK_TAB_UNSCHEDULED, action=actions.CLICK_LINK, exact=True)

    def click_activity_log(self):
        self.po.perform_action(locator=self.LNK_TAB_ACTIVITY_LOG, action=actions.CLICK_LINK, exact=True)

    def click_school1(self):
        self.po.perform_action(locator=self.LNK_SCHOOL_1, action=actions.CLICK_LINK)

    def click_school2(self):
        self.po.perform_action(locator=self.LNK_SCHOOL_2, action=actions.CLICK_LINK)

    def click_import_class_list(self):
        self.po.perform_action(locator=self.LNK_IMPORT_CLASS_LIST, action=actions.CLICK_LINK)

    def click_continue(self):
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def choose_file_child_records(self, file_path: str):
        self.po.perform_action(
            locator=self.LBL_CHOOSE_COHORT_FILE_1,
            action=actions.SELECT_FILE,
            value=file_path,
        )

    def click_record_vaccinations(self):
        self.po.perform_action(locator=self.LNK_RECORD_VACCINATIONS, action=actions.CLICK_LINK)

    def click_child_full_name(self):
        self.po.perform_action(locator=self.LNK_CHILD_FULL_NAME, action=actions.CLICK_WILDCARD)

    def click_update_triage_outcome(self):
        self.po.perform_action(locator=self.LNK_UPDATE_TRIAGE_OUTCOME, action=actions.CLICK_LINK)

    def select_yes_safe_to_vaccinate(self):
        self.po.perform_action(locator=self.RDO_YES_SAFE_TO_VACCINATE, action=actions.RADIO_BUTTON_SELECT)

    def click_save_triage(self):
        self.po.perform_action(locator=self.BTN_SAVE_TRIAGE, action=actions.CLICK_BUTTON)

    def click_check_consent_responses(self):
        self.po.perform_action(locator=self.BTN_CHECK_CONSENT_RESPONSES, action=actions.CLICK_LINK)

    def click_assess_gillick_competent(self):
        self.po.perform_action(locator=self.LNK_ASSESS_GILLICK_COMPETENT, action=actions.CLICK_LINK)

    def click_edit_gillick_competence(self):
        self.po.perform_action(locator=self.LNK_EDIT_GILLICK_COMPETENCE, action=actions.CLICK_LINK)

    def click_could_not_vaccinate(self):
        self.po.perform_action(locator=self.LNK_COULD_NOT_VACCINATE, action=actions.CLICK_LINK)

    def click_consent_refused(self):
        self.po.perform_action(locator=self.LNK_CONSENT_REFUSED, action=actions.CLICK_LINK)

    def add_gillick_competence(self, is_competent: bool, competence_details: str) -> None:
        self.__set_gillick_consent(is_add=True, is_competent=is_competent, competence_details=competence_details)

    def edit_gillick_competence(self, is_competent: bool, competence_details: str) -> None:
        self.__set_gillick_consent(is_add=False, is_competent=is_competent, competence_details=competence_details)

    def __set_gillick_consent(self, is_add: bool, is_competent: bool, competence_details: str) -> None:
        if is_competent:
            self.po.perform_action(
                locator="get_by_role('group', name='The child knows which vaccination they will have').get_by_label('Yes').check()",
                action=actions.CHAIN_LOCATOR_ACTION,
            )
            self.po.perform_action(
                locator="get_by_role('group', name='The child knows which disease').get_by_label('Yes').check()",
                action=actions.CHAIN_LOCATOR_ACTION,
            )
            self.po.perform_action(
                locator="get_by_role('group', name='The child knows what could').get_by_label('Yes').check()",
                action=actions.CHAIN_LOCATOR_ACTION,
            )
            self.po.perform_action(
                locator="get_by_role('group', name='The child knows how the').get_by_label('Yes').check()",
                action=actions.CHAIN_LOCATOR_ACTION,
            )
            self.po.perform_action(
                locator="get_by_role('group', name='The child knows which side').get_by_label('Yes').check()",
                action=actions.CHAIN_LOCATOR_ACTION,
            )
        else:
            self.po.perform_action(
                locator="get_by_role('group', name='The child knows which vaccination they will have').get_by_label('No').check()",
                action=actions.CHAIN_LOCATOR_ACTION,
            )
            self.po.perform_action(
                locator="get_by_role('group', name='The child knows which disease').get_by_label('No').check()",
                action=actions.CHAIN_LOCATOR_ACTION,
            )
            self.po.perform_action(
                locator="get_by_role('group', name='The child knows what could').get_by_label('No').check()",
                action=actions.CHAIN_LOCATOR_ACTION,
            )
            self.po.perform_action(
                locator="get_by_role('group', name='The child knows how the').get_by_label('No').check()",
                action=actions.CHAIN_LOCATOR_ACTION,
            )
            self.po.perform_action(
                locator="get_by_role('group', name='The child knows which side').get_by_label('No').check()",
                action=actions.CHAIN_LOCATOR_ACTION,
            )
        self.po.perform_action(
            locator=self.TXT_GILLICK_ASSESSMENT_DETAILS, action=actions.FILL, value=competence_details
        )
        if is_add:
            self.po.perform_action(locator=self.BTN_COMPLETE_GILLICK_ASSESSMENT, action=actions.CLICK_BUTTON)
        else:
            self.po.perform_action(locator=self.BTN_UPDATE_GILLICK_ASSESSMENT, action=actions.CLICK_BUTTON)
        if is_competent:
            self.po.verify(
                locator=self.LBL_MAIN, property=object_properties.TEXT, value=self.LBL_CHILD_COMPETENT, exact=False
            )
        else:
            self.po.verify(
                locator=self.LBL_MAIN, property=object_properties.TEXT, value=self.LBL_CHILD_NOT_COMPETENT, exact=False
            )
        self.po.verify(locator=self.LBL_MAIN, property=object_properties.TEXT, value=competence_details, exact=False)

    def schedule_session(self, future_date: str, expect_error: bool = False):
        _day = future_date[-2:]
        _month = future_date[4:6]
        _year = future_date[:4]
        self.po.perform_action(locator=self.LNK_SCHEDULE_SESSIONS, action=actions.CLICK_LINK)
        self.po.perform_action(locator=self.LNK_ADD_SESSION_DATES, action=actions.CLICK_LINK)
        self.po.perform_action(locator=self.TXT_DAY, action=actions.FILL, value=_day)
        self.po.perform_action(locator=self.TXT_MONTH, action=actions.FILL, value=_month)
        self.po.perform_action(locator=self.TXT_YEAR, action=actions.FILL, value=_year)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        if expect_error:
            _expected_message = "There is a problem Enter a date"
            self.po.verify(
                locator=self.LBL_MAIN, property=object_properties.TEXT, value=_expected_message, exact=False
            )

    def __delete_sessions(self):
        self.po.perform_action(locator=self.LNK_EDIT_SESSION, action=actions.CLICK_LINK)
        self.po.perform_action(locator=self.LNK_CHANGE_SESSION_DATES, action=actions.CLICK_LINK)
        self.po.perform_action(locator=self.BTN_DELETE, action=actions.CLICK_BUTTON)
        self.po.perform_action(locator=self.LNK_BACK, action=actions.CLICK_LINK)
        self.po.perform_action(locator=self.LNK_CONTINUE, action=actions.CLICK_LINK)
        self.po.verify(
            locator="locator('div').filter(has_text=re.compile(r'^Session datesNot provided$')).get_by_role('definition')",
            property=object_properties.VISIBILITY,
            value=True,
            exact=False,
            by_test_id=False,
            chain_locator=True,
        )

    def edit_session(self, to_date: str):
        _day = to_date[-2:]
        _month = to_date[4:6]
        _year = to_date[:4]
        self.po.perform_action(locator=self.LNK_EDIT_SESSION, action=actions.CLICK_LINK)
        self.po.perform_action(locator=self.LNK_CHANGE_SESSION_DATES, action=actions.CLICK_LINK)
        self.po.perform_action(locator=self.TXT_DAY, action=actions.FILL, value=_day)
        self.po.perform_action(locator=self.TXT_MONTH, action=actions.FILL, value=_month)
        self.po.perform_action(locator=self.TXT_YEAR, action=actions.FILL, value=_year)
        self.po.perform_action(locator=self.LNK_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.perform_action(locator=self.LNK_CONTINUE, action=actions.CLICK_LINK)
        self.po.verify(
            locator="locator('div').filter(has_text=re.compile(r'^Session datesNot provided$')).get_by_role('definition')",
            property=object_properties.VISIBILITY,
            value=False,
            exact=False,
            by_test_id=False,
            chain_locator=True,
        )

    def verify_triage_updated(self):
        self.po.verify(
            locator=self.LBL_PARAGRAPH,
            property=object_properties.TEXT,
            value=self.LBL_TRIAGE_UPDATED_MESSAGE,
            exact=False,
        )

    def verify_activity_log_entry(self, consent_given: bool):
        wait(wait_time.MIN)
        if consent_given:
            self.po.verify(
                locator=self.LBL_MAIN,
                property=object_properties.TEXT,
                value=self.LBL_ACTIVITY_LOG_ENTRY_CONSENT_GIVEN,
                exact=False,
            )
        else:
            self.po.verify(
                locator=self.LBL_MAIN,
                property=object_properties.TEXT,
                value=self.LBL_ACTIVITY_LOG_ENTRY_CONSENT_REFUSED,
                exact=False,
            )

    def verify_scheduled_date(self, message: str):
        self.po.verify(locator=self.LBL_MAIN, property=object_properties.TEXT, value=message, exact=False)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_LINK)

    def click_get_consent_responses(self):
        self.po.perform_action(locator=self.BTN_GET_CONSENT_RESPONSES, action=actions.CLICK_BUTTON)

    def upload_valid_class_list(self, file_paths: str):
        _input_file_path, _ = self.tdo.split_file_paths(file_paths=file_paths)
        self.click_scheduled()
        self.click_school1()
        self.click_import_class_list()
        self.choose_file_child_records(file_path=_input_file_path)
        self.click_continue()

    def update_triage_outcome_positive(self, file_paths):
        _input_file_path, _ = self.tdo.split_file_paths(file_paths=file_paths)
        self.click_scheduled()
        self.click_school1()
        self.click_import_class_list()
        self.choose_file_child_records(file_path=_input_file_path)
        self.click_continue()
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.click_scheduled()
        self.click_school1()
        self.click_check_consent_responses()
        self.click_child_full_name()
        self.click_get_consent_responses()
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
        _input_file_path, _ = self.tdo.split_file_paths(file_paths=file_paths)
        self.click_scheduled()
        self.click_school1()
        self.click_import_class_list()
        self.choose_file_child_records(file_path=_input_file_path)
        self.click_continue()
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.click_scheduled()
        self.click_school1()
        self.click_check_consent_responses()
        self.click_child_full_name()
        self.click_get_consent_responses()
        self.consent_page.service_refuse_consent()
        self.click_consent_refused()
        self.click_child_full_name()
        self.click_activity_log()
        self.verify_activity_log_entry(consent_given=False)

    def schedule_a_valid_session(self, for_today: bool = False):
        _future_date = get_offset_date(offset_days=0) if for_today else get_offset_date(offset_days=10)
        _expected_message = f"Session dates	{self.__get_display_formatted_date(date_to_format=_future_date)}"
        self.click_unscheduled()
        self.click_school1()
        self.schedule_session(future_date=_future_date)
        self.verify_scheduled_date(message=_expected_message)

    def edit_a_session_to_today(self):
        _future_date = get_offset_date(offset_days=0)
        _expected_message = f"Session dates	{self.__get_display_formatted_date(date_to_format=_future_date)}"
        self.click_scheduled()
        self.click_school1()
        self.edit_session(to_date=_future_date)
        # self.verify_scheduled_date(message=_expected_message)

    def delete_all_sessions(self):
        self.click_scheduled()
        self.click_school1()
        self.__delete_sessions()

    def create_invalid_session(self):
        _future_date = "20241332"
        self.click_unscheduled()
        self.click_school2()
        self.schedule_session(future_date=_future_date, expect_error=True)

    def upload_class_list(self, file_paths: str):
        _input_file_path, _output_file_path = self.tdo.split_file_paths(file_paths=file_paths)
        self.click_scheduled()
        self.click_school1()
        self.click_import_class_list()
        self.choose_file_child_records(file_path=_input_file_path)
        self.click_continue()
        self.__record_upload_time()
        wait(timeout=wait_time.MED)
        self.click_uploaded_file_datetime()
        self.verify_upload_output(file_path=_output_file_path)

    def upload_invalid_class_list_records(self, file_paths: str):
        _input_file_path, _output_file_path = self.tdo.split_file_paths(file_paths=file_paths)
        self.click_scheduled()
        self.click_school1()
        self.click_import_class_list()
        self.choose_file_child_records(file_path=_input_file_path)
        self.click_continue()
        self.verify_upload_output(file_path=_output_file_path)

    def set_gillick_competence_for_student(self):
        self.click_today()
        self.click_school1()
        self.click_check_consent_responses()
        self.click_child_full_name()
        self.click_assess_gillick_competent()
        self.add_gillick_competence(is_competent=True, competence_details="Gillick competent")
        self.click_edit_gillick_competence()
        self.edit_gillick_competence(is_competent=False, competence_details="Not Gillick competent")

    def get_consent_url(self) -> str:
        return self.po.get_object_property(locator=self.LNK_CONSENT_FORM, property=object_properties.HREF)
