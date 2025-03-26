from typing import Final

from libs import CurrentExecution, file_ops, playwright_ops, testdata_ops
from libs.generic_constants import element_properties, framework_actions, wait_time
from libs.mavis_constants import record_limit
from libs.wrappers import *
from pages import pg_dashboard, pg_sessions


class pg_programmes:
    po = playwright_ops.playwright_operations()
    ce = CurrentExecution()
    tdo = testdata_ops.testdata_operations()
    fo = file_ops.file_operations()
    sessions_page = pg_sessions.pg_sessions()
    dashboard_page = pg_dashboard.pg_dashboard()

    LNK_DOSE2_CHILD: Final[str] = "DOSE2, Dose2"
    LNK_MAV_854_CHILD: Final[str] = "MAV_854, MAV_854"

    LNK_HPV: Final[str] = "HPV"
    LNK_IMPORTS: Final[str] = "Imports"
    LNK_VACCINATIONS: Final[str] = "Vaccinations"
    LNK_COHORTS: Final[str] = "Cohorts"
    LNK_IMPORT_CHILD_RECORDS: Final[str] = "Import child records"
    LNK_IMPORT_RECORDS: Final[str] = "Import records"
    RDO_CHILD_RECORDS: Final[str] = "Child records"
    RDO_VACCINATION_RECORDS: Final[str] = "Vaccination records"
    BTN_CONTINUE: Final[str] = "Continue"
    LBL_CHOOSE_VACCS_FILE: Final[str] = "Import vaccination records"
    LBL_CHOOSE_COHORT_FILE: Final[str] = "Import child records"
    LBL_IMPORT_STARTED: Final[str] = "Import processing started"
    LBL_PARAGRAPH: Final[str] = "paragraph"
    LBL_MAIN: Final[str] = "main"
    LNK_CHANGE_OUTCOME: Final[str] = "Change   outcome"
    RDO_THEY_REFUSED_IT: Final[str] = "They refused it"
    BTN_EDIT_VACCINATION_RECORD: Final[str] = "Edit vaccination record"
    BTN_SAVE_CHANGES: Final[str] = "Save changes"
    LNK_COMMUNITY_CLINIC_HPV: Final[str] = "Community clinics"

    def click_hpv(self):
        self.po.act(locator=self.LNK_HPV, action=framework_actions.CLICK_LINK)

    def click_imports(self):
        self.po.act(locator=self.LNK_IMPORTS, action=framework_actions.CLICK_LINK)

    def click_vaccinations(self):
        self.po.act(locator=self.LNK_VACCINATIONS, action=framework_actions.CLICK_LINK, exact=True)

    def click_cohorts(self):
        self.po.act(locator=self.LNK_COHORTS, action=framework_actions.CLICK_LINK)

    def click_edit_vaccination_record(self):
        self.po.act(locator=self.BTN_EDIT_VACCINATION_RECORD, action=framework_actions.CLICK_BUTTON)

    def click_import_records(self):
        self.po.act(locator=self.LNK_IMPORT_RECORDS, action=framework_actions.CLICK_LINK)

    def click_import_cohort_records(self):
        self.po.act(locator=self.LNK_IMPORT_CHILD_RECORDS, action=framework_actions.CLICK_LINK)

    def select_child_records(self):
        self.po.act(locator=self.RDO_CHILD_RECORDS, action=framework_actions.RADIO_BUTTON_SELECT)

    def select_vaccination_records(self):
        self.po.act(locator=self.RDO_VACCINATION_RECORDS, action=framework_actions.RADIO_BUTTON_SELECT)

    def click_continue(self):
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)

    def click_choose_file_child_records(self):
        self.po.act(locator=self.LBL_CHOOSE_COHORT_FILE, action=framework_actions.CLICK_LABEL)

    def choose_file_child_records(self, file_path: str):
        self.po.act(
            locator=self.LBL_CHOOSE_COHORT_FILE,
            action=framework_actions.SELECT_FILE,
            value=file_path,
        )

    def click_choose_file_vaccination_records(self):
        self.po.act(locator=self.LBL_CHOOSE_COHORT_FILE, action=framework_actions.CLICK_LABEL)

    def choose_file_vaccination_records(self, file_path: str):
        self.po.act(
            locator=self.LBL_CHOOSE_VACCS_FILE,
            action=framework_actions.SELECT_FILE,
            value=file_path,
        )

    def verify_import_processing_started(self):
        self.po.verify(
            locator=self.LBL_PARAGRAPH, property=element_properties.TEXT, expected_value=self.LBL_IMPORT_STARTED
        )

    def click_uploaded_file_datetime(self, truncated: bool = False):
        _link_time = self.upload_time[3:] if truncated else self.upload_time
        self.po.act(locator=_link_time, action=framework_actions.CLICK_LINK)

    def record_upload_time(self):
        self.upload_time = get_link_formatted_date_time()

    def click_dose2_child(self):
        self.po.act(locator=self.LNK_DOSE2_CHILD, action=framework_actions.CLICK_LINK)

    def verify_upload_output(self, file_path: str):
        _expected_errors = self.tdo.get_expected_errors(file_path=file_path)
        if _expected_errors is not None:
            for _msg in _expected_errors:
                self.po.verify(
                    locator=self.LBL_MAIN, property=element_properties.TEXT, expected_value=_msg, exact=False
                )

    def upload_hpv_child_records(self, file_paths: str):
        _input_file_path, _output_file_path = self.tdo.get_file_paths(file_paths=file_paths)
        self.choose_file_child_records(file_path=_input_file_path)
        self.click_continue()
        self.record_upload_time()
        self.po.act(locator=None, action=framework_actions.WAIT, value=wait_time.MED)
        if self.ce.get_file_record_count() > record_limit.FILE_RECORD_MAX_THRESHOLD:
            self.click_uploaded_file_datetime(truncated=True)
        self.verify_upload_output(file_path=_output_file_path)

    def upload_cohorts(self, file_paths: str):
        _input_file_path, _output_file_path = self.tdo.get_file_paths(file_paths=file_paths)
        self.click_hpv()
        self.click_cohorts()
        self.click_import_cohort_records()
        self.choose_file_child_records(file_path=_input_file_path)
        self.click_continue()
        self.record_upload_time()
        self.po.act(locator=None, action=framework_actions.WAIT, value=wait_time.MED)
        if self.ce.get_file_record_count() > record_limit.FILE_RECORD_MAX_THRESHOLD:
            self.click_uploaded_file_datetime()
        self.verify_upload_output(file_path=_output_file_path)

    def upload_invalid_cohorts(self, file_paths: str):
        _input_file_path, _output_file_path = self.tdo.get_file_paths(file_paths=file_paths)
        self.click_hpv()
        self.click_cohorts()
        self.click_import_cohort_records()
        self.choose_file_child_records(file_path=_input_file_path)
        self.click_continue()
        self.verify_upload_output(file_path=_output_file_path)

    def edit_dose_to_not_given(self):
        self.click_hpv()
        self.click_vaccinations()
        self.click_dose2_child()
        self.click_edit_vaccination_record()
        self.po.act(locator=self.LNK_CHANGE_OUTCOME, action=framework_actions.CLICK_LINK)
        self.po.act(locator=self.RDO_THEY_REFUSED_IT, action=framework_actions.RADIO_BUTTON_SELECT)
        self.click_continue()
        self.po.act(locator=self.BTN_SAVE_CHANGES, action=framework_actions.CLICK_BUTTON)
        self.po.verify(
            locator=self.LBL_MAIN,
            property=element_properties.TEXT,
            expected_value="!Sorry, there’s a problem with the service",
            exact=False,
        )

    def verify_mav_854(self):
        self.po.act(locator=self.LNK_MAV_854_CHILD, action=framework_actions.CLICK_LINK)
        self.po.act(locator=self.LNK_COMMUNITY_CLINIC_HPV, action=framework_actions.CLICK_LINK)
        self.sessions_page._vaccinate_child_mav_854()
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.click_scheduled()
        self.sessions_page.click_school1()
        _file_path = self.sessions_page.download_offline_recording_excel()
        assert self.fo.check_if_path_exists(file_or_folder_path=_file_path), "Offline recording file not downloaded"
