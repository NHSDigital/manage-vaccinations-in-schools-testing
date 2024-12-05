from libs import CurrentExecution, playwright_ops
from libs.constants import actions, object_properties
from libs.wrappers import *


class pg_school_moves:
    po = playwright_ops.playwright_operations()
    ce = CurrentExecution()

    LBL_HEADERS = "Updated	Full name	Move	Actions"
    LBL_MAIN = "main"
    LBL_PARAGRAPH = "paragraph"
    LNK_REVIEW = "Review"
    RDO_UPDATE_SCHOOL = "Update record with new school"
    RDO_IGNORE_INFORMATION = "Ignore new information"
    BTN_UPDATE_SCHOOL = "Update child record"

    def verify_headers(self):
        self.po.verify(locator=self.LBL_MAIN, property=object_properties.TEXT, value=self.LBL_HEADERS, exact=False)

    def update_school_move(self):
        self.po.perform_action(locator=self.LNK_REVIEW, action=actions.CLICK_LINK_INDEX_FOR_ROW, value=0)
        self.po.perform_action(locator=self.RDO_UPDATE_SCHOOL, action=actions.RADIO_BUTTON_SELECT)
        self.po.perform_action(locator=self.BTN_UPDATE_SCHOOL, action=actions.CLICK_BUTTON)
        _success_message = "’s school record updated"
        self.po.verify(locator=self.LBL_PARAGRAPH, property=object_properties.TEXT, value=_success_message)

    def ignore_school_move(self):
        self.po.perform_action(locator=self.LNK_REVIEW, action=actions.CLICK_LINK_INDEX_FOR_ROW, value=0)
        self.po.perform_action(locator=self.RDO_IGNORE_INFORMATION, action=actions.RADIO_BUTTON_SELECT)
        self.po.perform_action(locator=self.BTN_UPDATE_SCHOOL, action=actions.CLICK_BUTTON)
        _success_message = "’s school move ignored"
        self.po.verify(locator=self.LBL_PARAGRAPH, property=object_properties.TEXT, value=_success_message)
