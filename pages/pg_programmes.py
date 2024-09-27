from libs import playwright_ops
from libs.constants import object_properties, actions


class pg_programmes:
    po = playwright_ops.playwright_operations()

    LNK_HPV = "HPV"
    LNK_IMPORTS = "Imports"
    LNK_IMPORT_RECORDS = "Import records"
    RDO_CHILD_RECORDS = "Child records"
    RDO_VACCINATION_RECORDS = "Vaccination records"
    BTN_CONTINUE = "Continue"
    LBL_CHOOSE_FILE_CHILD_RECORDS = "HPVImport child records"
    LBL_CHOOSE_FILE_VACCINATION_RECORDS = "HPVUpload vaccination records"

    def click_HPV(self, browser_page):
        self.po.perform_action(page=browser_page, locator=self.LNK_HPV, action=actions.CLICK_LINK)

    def click_Imports(self, browser_page):
        self.po.perform_action(page=browser_page, locator=self.LNK_IMPORTS, action=actions.CLICK_LINK)

    def click_ImportRecords(self, browser_page):
        self.po.perform_action(page=browser_page, locator=self.LNK_IMPORT_RECORDS, action=actions.CLICK_LINK)

    def select_ChildRecords(self, browser_page):
        self.po.perform_action(page=browser_page, locator=self.RDO_CHILD_RECORDS, action=actions.RADIO_BUTTON_SELECT)

    def select_VaccinationRecords(self, browser_page):
        self.po.perform_action(
            page=browser_page, locator=self.RDO_VACCINATION_RECORDS, action=actions.RADIO_BUTTON_SELECT
        )

    def click_Continue(self, browser_page):
        self.po.perform_action(page=browser_page, locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def click_ChooseFile_ChildRecords(self, browser_page):
        self.po.perform_action(
            page=browser_page, locator=self.LBL_CHOOSE_FILE_CHILD_RECORDS, action=actions.CLICK_LABEL
        )

    def choose_file_child_records(self, browser_page, file_path: str):
        self.po.perform_action(
            page=browser_page,
            locator=self.LBL_CHOOSE_FILE_CHILD_RECORDS,
            action=actions.SELECT_FILE,
            value=file_path,
        )

    def click_ChooseFile_VaccinationRecords(self, browser_page):
        self.po.perform_action(
            page=browser_page, locator=self.LBL_CHOOSE_FILE_VACCINATION_RECORDS, action=actions.CLICK_LABEL
        )

    def choose_file_vaccination_records(self, browser_page, file_path: str):
        self.po.perform_action(
            page=browser_page,
            locator=self.LBL_CHOOSE_FILE_VACCINATION_RECORDS,
            action=actions.SELECT_FILE,
            value=file_path,
        )
