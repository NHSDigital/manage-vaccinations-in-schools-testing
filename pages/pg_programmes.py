from libs import CurrentExecution, file_ops, playwright_ops, testdata_ops
from libs.generic_constants import element_actions, element_properties, wait_time
from libs.mavis_constants import record_limit
from libs.wrappers import *
from pages import pg_sessions


class pg_programmes:
    po = playwright_ops.playwright_operations()
    ce = CurrentExecution()
    tdo = testdata_ops.testdata_operations()
    fo = file_ops.file_operations()
    sessions_page = pg_sessions.pg_sessions()

    LNK_HPV = "HPV"
    LNK_IMPORTS = "Imports"
    LNK_VACCINATIONS = "Vaccinations"
    LNK_COHORTS = "Cohorts"
    LNK_IMPORT_CHILD_RECORDS = "Import child records"
    LNK_IMPORT_RECORDS = "Import records"
    RDO_CHILD_RECORDS = "Child records"
    RDO_VACCINATION_RECORDS = "Vaccination records"
    BTN_CONTINUE = "Continue"
    LBL_CHOOSE_VACCS_FILE = "Import vaccination records"
    LBL_CHOOSE_COHORT_FILE = "Import child records"
    LBL_IMPORT_STARTED = "Import processing started"
    LBL_PARAGRAPH = "paragraph"
    LBL_MAIN = "main"
    LNK_DOSE2_CHILD = "Dose2 Dose2"
    LNK_CHANGE_OUTCOME = "Change   outcome"
    RDO_THEY_REFUSED_IT = "They refused it"
    BTN_EDIT_VACCINATION_RECORD = "Edit vaccination record"
    BTN_SAVE_CHANGES = "Save changes"

    def click_hpv(self):
        self.po.act(locator=self.LNK_HPV, action=element_actions.CLICK_LINK)

    def click_imports(self):
        self.po.act(locator=self.LNK_IMPORTS, action=element_actions.CLICK_LINK)

    def click_vaccinations(self):
        self.po.act(locator=self.LNK_VACCINATIONS, action=element_actions.CLICK_LINK, exact=True)

    def click_cohorts(self):
        self.po.act(locator=self.LNK_COHORTS, action=element_actions.CLICK_LINK)

    def click_edit_vaccination_record(self):
        self.po.act(locator=self.BTN_EDIT_VACCINATION_RECORD, action=element_actions.CLICK_BUTTON)

    def click_import_records(self):
        self.po.act(locator=self.LNK_IMPORT_RECORDS, action=element_actions.CLICK_LINK)

    def click_import_cohort_records(self):
        self.po.act(locator=self.LNK_IMPORT_CHILD_RECORDS, action=element_actions.CLICK_LINK)

    def select_child_records(self):
        self.po.act(locator=self.RDO_CHILD_RECORDS, action=element_actions.RADIO_BUTTON_SELECT)

    def select_vaccination_records(self):
        self.po.act(locator=self.RDO_VACCINATION_RECORDS, action=element_actions.RADIO_BUTTON_SELECT)

    def click_continue(self):
        self.po.act(locator=self.BTN_CONTINUE, action=element_actions.CLICK_BUTTON)

    def click_choose_file_child_records(self):
        self.po.act(locator=self.LBL_CHOOSE_COHORT_FILE, action=element_actions.CLICK_LABEL)

    def choose_file_child_records(self, file_path: str):
        self.po.act(
            locator=self.LBL_CHOOSE_COHORT_FILE,
            action=element_actions.SELECT_FILE,
            value=file_path,
        )

    def click_choose_file_vaccination_records(self):
        self.po.act(locator=self.LBL_CHOOSE_COHORT_FILE, action=element_actions.CLICK_LABEL)

    def choose_file_vaccination_records(self, file_path: str):
        self.po.act(
            locator=self.LBL_CHOOSE_VACCS_FILE,
            action=element_actions.SELECT_FILE,
            value=file_path,
        )

    def verify_import_processing_started(self):
        self.po.verify(
            locator=self.LBL_PARAGRAPH, property=element_properties.TEXT, expected_value=self.LBL_IMPORT_STARTED
        )

    def click_uploaded_file_datetime(self, truncated: bool = False):
        _link_time = self.upload_time[3:] if truncated else self.upload_time
        self.po.act(locator=_link_time, action=element_actions.CLICK_LINK)

    def record_upload_time(self):
        self.upload_time = get_link_formatted_date_time()

    def click_dose2_child(self):
        self.po.act(locator=self.LNK_DOSE2_CHILD, action=element_actions.CLICK_LINK)

    def verify_upload_output(self, file_path: str):
        _expected_errors = self.tdo.get_expected_errors(file_path=file_path)
        if _expected_errors is not None:
            for _msg in _expected_errors:
                self.po.verify(
                    locator=self.LBL_MAIN, property=element_properties.TEXT, expected_value=_msg, exact=False
                )

    def upload_hpv_vaccination_records(self, file_paths: str):
        _input_file_path, _output_file_path = self.tdo.get_file_paths(file_paths=file_paths)
        self.choose_file_vaccination_records(file_path=_input_file_path)
        self.click_continue()
        self.record_upload_time()
        wait(timeout=wait_time.MED)
        if self.ce.get_file_record_count() > record_limit.FILE_RECORD_MAX_THRESHOLD:
            self.click_uploaded_file_datetime()
        self.verify_upload_output(file_path=_output_file_path)

    def upload_hpv_child_records(self, file_paths: str):
        _input_file_path, _output_file_path = self.tdo.get_file_paths(file_paths=file_paths)
        self.choose_file_child_records(file_path=_input_file_path)
        self.click_continue()
        self.record_upload_time()
        wait(timeout=wait_time.MED)
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
        wait(timeout=wait_time.MED)
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
        self.po.act(locator=self.LNK_CHANGE_OUTCOME, action=element_actions.CLICK_LINK)
        self.po.act(locator=self.RDO_THEY_REFUSED_IT, action=element_actions.RADIO_BUTTON_SELECT)
        self.click_continue()
        self.po.act(locator=self.BTN_SAVE_CHANGES, action=element_actions.CLICK_BUTTON)
        self.po.verify(
            locator=self.LBL_MAIN,
            property=element_properties.TEXT,
            expected_value="!Sorry, there’s a problem with the service",
            exact=False,
        )
