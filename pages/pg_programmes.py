from libs import CurrentExecution, file_ops, playwright_ops, testdata_ops
from libs.constants import actions


class pg_programmes:
    po = playwright_ops.playwright_operations()
    ce = CurrentExecution()
    tdo = testdata_ops.testdata_operations()
    fo = file_ops.file_operations()

    LNK_HPV = "HPV"
    LNK_IMPORTS = "Imports"
    LNK_IMPORT_RECORDS = "Import records"
    RDO_CHILD_RECORDS = "Child records"
    RDO_VACCINATION_RECORDS = "Vaccination records"
    BTN_CONTINUE = "Continue"
    LBL_CHOOSE_FILE_CHILD_RECORDS = "HPVImport child records"
    LBL_CHOOSE_FILE_VACCINATION_RECORDS = "HPVUpload vaccination records"
    BTN_UPLOAD_RECORDS = "Upload records"

    def click_HPV(self):
        self.po.perform_action(locator=self.LNK_HPV, action=actions.CLICK_LINK)

    def click_Imports(self):
        self.po.perform_action(locator=self.LNK_IMPORTS, action=actions.CLICK_LINK)

    def click_ImportRecords(self):
        self.po.perform_action(locator=self.LNK_IMPORT_RECORDS, action=actions.CLICK_LINK)

    def select_ChildRecords(self):
        self.po.perform_action(locator=self.RDO_CHILD_RECORDS, action=actions.RADIO_BUTTON_SELECT)

    def select_VaccinationRecords(self):
        self.po.perform_action(locator=self.RDO_VACCINATION_RECORDS, action=actions.RADIO_BUTTON_SELECT)

    def click_Continue(self):
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def click_UploadRecords(self):
        self.po.perform_action(locator=self.BTN_UPLOAD_RECORDS, action=actions.CLICK_BUTTON)

    def click_ChooseFile_ChildRecords(self):
        self.po.perform_action(locator=self.LBL_CHOOSE_FILE_CHILD_RECORDS, action=actions.CLICK_LABEL)

    def choose_file_child_records(self, file_path: str):
        self.po.perform_action(
            locator=self.LBL_CHOOSE_FILE_CHILD_RECORDS,
            action=actions.SELECT_FILE,
            value=file_path,
        )

    def click_ChooseFile_VaccinationRecords(self):
        self.po.perform_action(locator=self.LBL_CHOOSE_FILE_VACCINATION_RECORDS, action=actions.CLICK_LABEL)

    def choose_file_vaccination_records(self, file_path: str):
        self.po.perform_action(
            locator=self.LBL_CHOOSE_FILE_VACCINATION_RECORDS,
            action=actions.SELECT_FILE,
            value=file_path,
        )

    def upload_hpv_vaccination_records(self, input_file_path: str):
        self.click_HPV()
        self.click_Imports()
        self.click_ImportRecords()
        self.select_VaccinationRecords()
        self.click_Continue()
        self.choose_file_vaccination_records(file_path=input_file_path)
        self.click_Continue()
        self.click_UploadRecords()

    def upload_hpv_child_records(self, input_file_path: str):
        self.click_HPV()
        self.click_Imports()
        self.click_ImportRecords()
        self.select_ChildRecords()
        self.click_Continue()
        self.choose_file_child_records(file_path=input_file_path)
        self.click_Continue()
        self.click_UploadRecords()
