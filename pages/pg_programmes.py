from libs import CurrentExecution, file_ops, playwright_ops, testdata_ops
from libs.constants import actions, object_properties, wait_time
from libs.wrappers import *


class pg_programmes:
    po = playwright_ops.playwright_operations()
    ce = CurrentExecution()
    tdo = testdata_ops.testdata_operations()
    fo = file_ops.file_operations()

    LNK_HPV = "HPV"
    LNK_IMPORTS = "Imports"
    LNK_COHORTS = "Cohorts"
    LNK_IMPORT_CHILD_RECORDS = "Import child records"
    LNK_IMPORT_RECORDS = "Import records"
    RDO_CHILD_RECORDS = "Child records"
    RDO_VACCINATION_RECORDS = "Vaccination records"
    BTN_CONTINUE = "Continue"
    LBL_CHOOSE_VACCS_FILE = "HPVImport vaccination records"
    LBL_CHOOSE_COHORT_FILE = "HPVImport child records"
    LBL_IMPORT_STARTED = "Import processing started"
    LBL_PARAGRAPH = "paragraph"
    LBL_MAIN = "main"

    def click_HPV(self):
        self.po.perform_action(locator=self.LNK_HPV, action=actions.CLICK_LINK)

    def click_Imports(self):
        self.po.perform_action(locator=self.LNK_IMPORTS, action=actions.CLICK_LINK)

    def click_Cohorts(self):
        self.po.perform_action(locator=self.LNK_COHORTS, action=actions.CLICK_LINK)

    def click_ImportRecords(self):
        self.po.perform_action(locator=self.LNK_IMPORT_RECORDS, action=actions.CLICK_LINK)

    def click_ImportCohortRecords(self):
        self.po.perform_action(locator=self.LNK_IMPORT_CHILD_RECORDS, action=actions.CLICK_LINK)

    def select_ChildRecords(self):
        self.po.perform_action(locator=self.RDO_CHILD_RECORDS, action=actions.RADIO_BUTTON_SELECT)

    def select_VaccinationRecords(self):
        self.po.perform_action(locator=self.RDO_VACCINATION_RECORDS, action=actions.RADIO_BUTTON_SELECT)

    def click_Continue(self):
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def click_ChooseFile_ChildRecords(self):
        self.po.perform_action(locator=self.LBL_CHOOSE_COHORT_FILE, action=actions.CLICK_LABEL)

    def choose_file_child_records(self, file_path: str):
        self.po.perform_action(
            locator=self.LBL_CHOOSE_COHORT_FILE,
            action=actions.SELECT_FILE,
            value=file_path,
        )

    def click_ChooseFile_VaccinationRecords(self):
        self.po.perform_action(locator=self.LBL_CHOOSE_COHORT_FILE, action=actions.CLICK_LABEL)

    def choose_file_vaccination_records(self, file_path: str):
        self.po.perform_action(
            locator=self.LBL_CHOOSE_VACCS_FILE,
            action=actions.SELECT_FILE,
            value=file_path,
        )

    def verify_Import_Processing_Started(self):
        self.po.verify(locator=self.LBL_PARAGRAPH, property=object_properties.TEXT, value=self.LBL_IMPORT_STARTED)

    def click_uploaded_file_datetime(self):
        self.po.perform_action(locator=self.upload_time, action=actions.CLICK_LINK)

    def record_upload_time(self):
        self.upload_time = get_link_formatted_date_time()

    def verify_upload_output(self, file_path: str):
        _expected_errors = self.tdo.get_expected_errors(file_path=file_path)
        if _expected_errors is not None:
            for _msg in _expected_errors:
                self.po.verify(locator=self.LBL_MAIN, property=object_properties.TEXT, value=_msg, exact=False)

    def upload_hpv_vaccination_records(self, file_paths: str):
        _input_file_path, _output_file_path = self.tdo.split_file_paths(file_paths=file_paths)
        self.click_HPV()
        self.click_Imports()
        self.click_ImportRecords()
        self.select_VaccinationRecords()
        self.click_Continue()
        self.choose_file_vaccination_records(file_path=_input_file_path)
        self.click_Continue()
        self.record_upload_time()
        wait(timeout=wait_time.MED)  # Wait for processing to finish
        self.click_Imports()
        self.click_uploaded_file_datetime()
        self.verify_upload_output(file_path=_output_file_path)

    def upload_hpv_child_records(self, file_paths: str):
        _input_file_path, _output_file_path = self.tdo.split_file_paths(file_paths=file_paths)
        self.click_HPV()
        self.click_Imports()
        self.click_ImportRecords()
        self.select_ChildRecords()
        self.click_Continue()
        self.choose_file_child_records(file_path=_input_file_path)
        self.click_Continue()
        self.record_upload_time()
        wait(timeout=wait_time.MED)  # Wait for processing to finish
        self.click_Imports()
        self.click_uploaded_file_datetime()
        self.verify_upload_output(file_path=_output_file_path)

    def upload_cohorts(self, file_paths: str):
        _input_file_path, _output_file_path = self.tdo.split_file_paths(file_paths=file_paths)
        self.click_HPV()
        self.click_Cohorts()
        self.click_ImportCohortRecords()
        self.choose_file_child_records(file_path=_input_file_path)
        self.click_Continue()
        self.record_upload_time()
        wait(timeout=wait_time.MED)  # Wait for processing to finish
        self.click_Imports()
        self.click_uploaded_file_datetime()
        self.verify_upload_output(file_path=_output_file_path)
