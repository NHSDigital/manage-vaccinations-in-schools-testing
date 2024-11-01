import re

from playwright.sync_api import expect

from libs import CurrentExecution, file_ops, playwright_ops, testdata_ops
from libs.constants import actions, object_properties, wait_time
from libs.wrappers import *
from pages import pg_dashboard


class pg_sessions:
    po = playwright_ops.playwright_operations()
    ce = CurrentExecution()
    tdo = testdata_ops.testdata_operations()
    fo = file_ops.file_operations()
    dashboard_page = pg_dashboard.pg_dashboard()

    LNK_SCHEDULED = "Scheduled"
    LNK_UNSCHEDULED = "Unscheduled"
    # LNK_SCHOOL = "The Ruiz Centre"
    LNK_SCHOOL = "Grange School"
    LNK_IMPORT_CLASS_LIST = "Import class list"
    # LBL_CHOOSE_COHORT_FILE = "The Ruiz CentreImport class"
    LBL_CHOOSE_COHORT_FILE = "Grange SchoolImport class"
    BTN_CONTINUE = "Continue"
    LNK_ADD_SESSION_DATES = "Add session dates"
    LNK_RECORD_VACCINATIONS = "Record vaccinations"
    LNK_CHILD_FULL_NAME = "ChildFirst28 ChildLast28"
    LNK_UPDATE_TRIAGE_OUTCOME = "Update triage outcome"
    LNK_SCHEDULE_SESSIONS = "Schedule sessions"
    RDO_YES_SAFE_TO_VACCINATE = "Yes, it’s safe to vaccinate"
    BTN_SAVE_TRIAGE = "Save triage"
    LBL_PARAGRAPH = "paragraph"
    LBL_TRIAGE_UPDATED_MESSAGE = "Triage outcome updated for ChildFirst28 ChildLast28"
    LBL_MAIN = "main"
    TXT_DAY = "Day"
    TXT_MONTH = "Month"
    TXT_YEAR = "Year"
    LNK_EDIT_SESSION = "Edit session"
    LNK_CHANGE_SESSION_DATES = "Change session dates"
    BTN_DELETE = "Delete"
    LNK_CANCEL = "Cancel"
    LNK_CONTINUE = "Continue"

    def get_display_formatted_date(self, date_to_format: str) -> str:
        _parsed_date = datetime.strptime(date_to_format, "%Y%m%d")
        _formatted_date = _parsed_date.strftime("%A %d %B %Y").replace(" 0", " ")
        return _formatted_date

    def record_upload_time(self):
        self.upload_time = get_link_formatted_date_time()

    def click_uploaded_file_datetime(self):
        self.po.perform_action(locator=self.upload_time, action=actions.CLICK_LINK)

    def verify_upload_output(self, file_path: str):
        _expected_errors = self.tdo.get_expected_errors(file_path=file_path)
        if _expected_errors is not None:
            for _msg in _expected_errors:
                self.po.verify(locator=self.LBL_MAIN, property=object_properties.TEXT, value=_msg, exact=False)

    def click_Scheduled(self):
        self.po.perform_action(locator=self.LNK_SCHEDULED, action=actions.CLICK_LINK, exact=True)

    def click_Unscheduled(self):
        self.po.perform_action(locator=self.LNK_UNSCHEDULED, action=actions.CLICK_LINK, exact=True)

    def click_School(self):
        self.po.perform_action(locator=self.LNK_SCHOOL, action=actions.CLICK_LINK)

    def click_Import_Class_List(self):
        self.po.perform_action(locator=self.LNK_IMPORT_CLASS_LIST, action=actions.CLICK_LINK)

    def click_Continue(self):
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def choose_file_child_records(self, file_path: str):
        self.po.perform_action(
            locator=self.LBL_CHOOSE_COHORT_FILE,
            action=actions.SELECT_FILE,
            value=file_path,
        )

    def click_Record_Vaccinations(self):
        self.po.perform_action(locator=self.LNK_RECORD_VACCINATIONS, action=actions.CLICK_LINK)

    def click_child_full_name(self):
        self.po.perform_action(locator=self.LNK_CHILD_FULL_NAME, action=actions.CLICK_LINK)

    def click_Update_Triage_Outcome(self):
        self.po.perform_action(locator=self.LNK_UPDATE_TRIAGE_OUTCOME, action=actions.CLICK_LINK)

    def select_Yes_Safe_To_Vaccinate(self):
        self.po.perform_action(locator=self.RDO_YES_SAFE_TO_VACCINATE, action=actions.RADIO_BUTTON_SELECT)

    def click_Save_Triage(self):
        self.po.perform_action(locator=self.BTN_SAVE_TRIAGE, action=actions.CLICK_BUTTON)

    def __schedule_session(self, future_date: str, expect_error: bool = False):
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

    def __delete_all_sessions(self):
        self.po.perform_action(locator=self.LNK_EDIT_SESSION, action=actions.CLICK_LINK)
        self.po.perform_action(locator=self.LNK_CHANGE_SESSION_DATES, action=actions.CLICK_LINK)
        self.po.perform_action(locator=self.BTN_DELETE, action=actions.CLICK_BUTTON)
        self.po.perform_action(locator=self.LNK_CANCEL, action=actions.CLICK_LINK)
        self.po.perform_action(locator=self.LNK_CONTINUE, action=actions.CLICK_LINK)
        # TODO: Use the common verify function
        expect(
            self.ce.page.locator("div")
            .filter(has_text=re.compile(r"^Session datesNot provided$"))
            .get_by_role("definition")
        ).to_be_visible()

    def verify_Triage_Updated(self):
        self.po.verify(
            locator=self.LBL_PARAGRAPH,
            property=object_properties.TEXT,
            value=self.LBL_TRIAGE_UPDATED_MESSAGE,
            exact=True,
        )

    def verify_scheduled_date(self, message: str):
        self.po.verify(locator=self.LBL_MAIN, property=object_properties.TEXT, value=message, exact=False)

    def update_triage_outcome_positive(self, file_paths):
        _input_file_path, _ = self.tdo.split_file_paths(file_paths=file_paths)
        self.click_Scheduled()
        self.click_School()
        self.click_Import_Class_List()
        self.choose_file_child_records(file_path=_input_file_path)
        self.click_Continue()
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.click_Scheduled()
        self.click_School()
        self.click_Record_Vaccinations()
        self.click_child_full_name()
        self.click_Update_Triage_Outcome()
        self.select_Yes_Safe_To_Vaccinate()
        self.click_Save_Triage()
        self.verify_Triage_Updated()

    def schedule_a_valid_session(self):
        _future_date = get_future_date(offset_days=10)
        _expected_message = f"Session dates	{self.get_display_formatted_date(date_to_format=_future_date)}"
        self.click_Unscheduled()
        self.click_School()
        self.__schedule_session(future_date=_future_date, expect_error=False)
        self.verify_scheduled_date(message=_expected_message)

    def delete_all_sessions(self):
        self.click_Scheduled()
        self.click_School()
        self.__delete_all_sessions()

    def create_invalid_session(self):
        _future_date = "20241332"
        self.click_Unscheduled()
        self.click_School()
        self.__schedule_session(future_date=_future_date, expect_error=True)

    def upload_class_list(self, file_paths: str):
        _input_file_path, _output_file_path = self.tdo.split_file_paths(file_paths=file_paths)
        self.click_Unscheduled()
        self.click_School()
        self.click_Import_Class_List()
        self.choose_file_child_records(file_path=_input_file_path)
        self.click_Continue()
        self.record_upload_time()
        wait(timeout=wait_time.MED)
        self.click_uploaded_file_datetime()
        self.verify_upload_output(file_path=_output_file_path)

    def upload_invalid_class_list_records(self, file_paths: str):
        _input_file_path, _output_file_path = self.tdo.split_file_paths(file_paths=file_paths)
        self.click_Unscheduled()
        self.click_School()
        self.click_Import_Class_List()
        self.choose_file_child_records(file_path=_input_file_path)
        self.click_Continue()
        self.verify_upload_output(file_path=_output_file_path)
