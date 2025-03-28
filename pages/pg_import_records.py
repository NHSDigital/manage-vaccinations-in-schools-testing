from typing import Final

from libs import CurrentExecution, file_ops, playwright_ops, testdata_ops
from libs.generic_constants import element_properties, framework_actions, wait_time
from libs.mavis_constants import child_year_group, record_limit
from libs.wrappers import *
from pages import pg_children, pg_dashboard, pg_sessions, pg_vaccines


class pg_import_records:
    po = playwright_ops.playwright_operations()
    ce = CurrentExecution()
    tdo = testdata_ops.testdata_operations()
    fo = file_ops.file_operations()
    sessions_page = pg_sessions.pg_sessions()
    dashboard_page = pg_dashboard.pg_dashboard()
    children_page = pg_children.pg_children()
    vaccines_page = pg_vaccines.pg_vaccines()

    LNK_CHILD_MAV_855: Final[str] = "MAV_855, MAV_855"

    LNK_IMPORT_RECORDS: Final[str] = "Import records"
    RDO_CHILD_RECORDS: Final[str] = "Child records"
    RDO_CLASS_LIST_RECORDS: Final[str] = "Class list records"
    RDO_VACCINATION_RECORDS: Final[str] = "Vaccination records"
    BTN_CONTINUE: Final[str] = "Continue"
    LBL_CHILD_RECORDS: Final[str] = "Child records"
    LBL_CLASS_LIST_RECORDS: Final[str] = f"{sessions_page.LNK_SCHOOL_1}Import"
    LBL_VACCINATION_RECORDS: Final[str] = "Vaccination records"
    LBL_CLASS_LIST_RECORDS_FOR_SCHOOL1: Final[str] = f"{sessions_page.LNK_SCHOOL_1}Import"
    LBL_SCHOOL_NAME: Final[str] = "Which school is this class"
    LBL_MAIN: Final[str] = "main"
    CHK_YEAR8: Final[str] = "Year 8"
    CHK_YEAR9: Final[str] = "Year 9"
    CHK_YEAR10: Final[str] = "Year 10"
    CHK_YEAR11: Final[str] = "Year 11"
    LNK_IMPORT_CLASS_LIST_RECORDS: Final[str] = "Import class lists"

    def click_import_records(self):
        self.po.act(locator=self.LNK_IMPORT_RECORDS, action=framework_actions.CLICK_LINK)

    def import_child_records(self, file_paths: str):
        _input_file_path, _output_file_path = self.tdo.get_file_paths(file_paths=file_paths)
        self.po.act(locator=self.RDO_CHILD_RECORDS, action=framework_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self.po.act(
            locator=self.LBL_CHILD_RECORDS,
            action=framework_actions.SELECT_FILE,
            value=_input_file_path,
        )
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self._record_upload_time()
        self.po.act(locator=None, action=framework_actions.WAIT, value=wait_time.MED)
        if self.ce.get_file_record_count() > record_limit.FILE_RECORD_MAX_THRESHOLD:
            self._click_uploaded_file_datetime(truncated=True)
        self._verify_upload_output(file_path=_output_file_path)

    def import_class_list_records(self, file_paths: str, year_group: str = child_year_group.ALL):
        _input_file_path, _output_file_path = self.tdo.get_file_paths(file_paths=file_paths)
        self.po.act(locator=self.RDO_CLASS_LIST_RECORDS, action=framework_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self.po.act(
            locator=self.LBL_SCHOOL_NAME,
            action=framework_actions.SELECT_FROM_LIST,
            value=self.sessions_page.LNK_SCHOOL_1,
        )
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self._select_year_group(year_group=year_group)
        self.po.act(
            locator=self.LBL_CLASS_LIST_RECORDS,
            action=framework_actions.SELECT_FILE,
            value=_input_file_path,
        )
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self._record_upload_time()
        self.po.act(locator=None, action=framework_actions.WAIT, value=wait_time.MED)
        if self.ce.get_file_record_count() > record_limit.FILE_RECORD_MAX_THRESHOLD:
            self._click_uploaded_file_datetime(truncated=True)
        self._verify_upload_output(file_path=_output_file_path)

    def import_class_list_records_from_school_session(self, file_paths: str):
        _input_file_path, _output_file_path = self.tdo.get_file_paths(file_paths=file_paths)
        self.po.act(locator=self.LNK_IMPORT_CLASS_LIST_RECORDS, action=framework_actions.CLICK_LINK)
        self._select_year_group(year_group=child_year_group.ALL)
        self.po.act(
            locator=self.LBL_CLASS_LIST_RECORDS_FOR_SCHOOL1,
            action=framework_actions.SELECT_FILE,
            value=_input_file_path,
        )
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self._record_upload_time()
        self.po.act(locator=None, action=framework_actions.WAIT, value=wait_time.MED)
        if self.ce.get_file_record_count() > record_limit.FILE_RECORD_MAX_THRESHOLD:
            self._click_uploaded_file_datetime(truncated=True)
        self._verify_upload_output(file_path=_output_file_path)

    def import_vaccination_records(self, file_paths: str):
        _input_file_path, _output_file_path = self.tdo.get_file_paths(file_paths=file_paths)
        self.po.act(locator=self.RDO_VACCINATION_RECORDS, action=framework_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self.po.act(
            locator=self.LBL_VACCINATION_RECORDS,
            action=framework_actions.SELECT_FILE,
            value=_input_file_path,
        )
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self._record_upload_time()
        self.po.act(locator=None, action=framework_actions.WAIT, value=wait_time.MAX)
        if self.ce.get_file_record_count() > record_limit.FILE_RECORD_MAX_THRESHOLD:
            self._click_uploaded_file_datetime(truncated=True)
        self._verify_upload_output(file_path=_output_file_path)

    def _record_upload_time(self):
        self.upload_time = get_link_formatted_date_time()

    def _click_uploaded_file_datetime(self, truncated: bool = False):
        _link_time = self.upload_time[3:] if truncated else self.upload_time
        self.po.act(locator=_link_time, action=framework_actions.CLICK_LINK)

    def _verify_upload_output(self, file_path: str):
        _expected_errors = self.tdo.get_expected_errors(file_path=file_path)
        if _expected_errors is not None:
            # Verify messages individually
            for _msg in _expected_errors:
                self.po.verify(
                    locator=self.LBL_MAIN, property=element_properties.TEXT, expected_value=_msg, exact=False
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
                locator=self.LBL_MAIN, property=element_properties.TEXT, expected_value=_all_errors, exact=False
            )

    def _select_year_group(self, year_group: str) -> None:
        match year_group:
            case child_year_group.YEAR_8:
                self.po.act(locator=self.CHK_YEAR8, action=framework_actions.CHECKBOX_CHECK)
            case child_year_group.YEAR_9:
                self.po.act(locator=self.CHK_YEAR9, action=framework_actions.CHECKBOX_CHECK)
            case child_year_group.YEAR_10:
                self.po.act(locator=self.CHK_YEAR10, action=framework_actions.CHECKBOX_CHECK)
            case child_year_group.YEAR_11:
                self.po.act(locator=self.CHK_YEAR11, action=framework_actions.CHECKBOX_CHECK)
            case _:
                self.po.act(locator=self.CHK_YEAR8, action=framework_actions.CHECKBOX_CHECK)
                self.po.act(locator=self.CHK_YEAR9, action=framework_actions.CHECKBOX_CHECK)
                self.po.act(locator=self.CHK_YEAR10, action=framework_actions.CHECKBOX_CHECK)
                self.po.act(locator=self.CHK_YEAR11, action=framework_actions.CHECKBOX_CHECK)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)

    def verify_mav_855(self):
        self.children_page.search_for_a_child(child_name=self.LNK_CHILD_MAV_855)
        self.po.act(locator=self.LNK_CHILD_MAV_855, action=framework_actions.CLICK_LINK)
        self.po.act(locator=self.vaccines_page.LBL_VACCINE_NAME, action=framework_actions.CLICK_LINK)
        self.po.verify(
            locator=self.LBL_MAIN, property=element_properties.TEXT, expected_value=self.sessions_page.LNK_SCHOOL_1
        )
