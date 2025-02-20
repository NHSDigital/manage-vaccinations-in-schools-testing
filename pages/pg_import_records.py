from libs import CurrentExecution, file_ops, playwright_ops, testdata_ops
from libs.generic_constants import element_actions
from libs.wrappers import *


class pg_import_records:
    po = playwright_ops.playwright_operations()
    ce = CurrentExecution()
    tdo = testdata_ops.testdata_operations()
    fo = file_ops.file_operations()

    LNK_IMPORT_RECORDS = "Import records"
    RDO_CHILD_RECORDS = "Child records"
    RDO_CLASS_LIST_RECORDS = "Class list records"
    RDO_VACCINATION_RECORDS = "Vaccination records"
    BTN_CONTINUE = "Continue"

    def click_import_records(self):
        self.po.act(locator=self.LNK_IMPORT_RECORDS, action=element_actions.CLICK_LINK)

    def click_child_records(self):
        self.po.act(locator=self.RDO_CHILD_RECORDS, action=element_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=element_actions.CLICK_BUTTON)

    def click_class_list_records(self):
        self.po.act(locator=self.RDO_CLASS_LIST_RECORDS, action=element_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=element_actions.CLICK_BUTTON)

    def click_vaccination_records(self):
        self.po.act(locator=self.RDO_VACCINATION_RECORDS, action=element_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=element_actions.CLICK_BUTTON)
