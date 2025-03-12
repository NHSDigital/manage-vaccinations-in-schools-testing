from libs import CurrentExecution, playwright_ops
from libs.generic_constants import (
    element_actions,
    element_properties,
    escape_characters,
)

# from libs.wrappers import *


class pg_school_moves:
    po = playwright_ops.playwright_operations()
    ce = CurrentExecution()

    LBL_HEADERS = "Updated	Full name	Move	Actions"
    LBL_MAIN = "main"
    LBL_PARAGRAPH = "paragraph"
    LNK_REVIEW = "Review"
    LBL_CHILD_NAME = f"heading{escape_characters.SEPARATOR_CHAR}Review school move"
    RDO_UPDATE_SCHOOL = "Update record with new school"
    RDO_IGNORE_INFORMATION = "Ignore new information"
    BTN_UPDATE_SCHOOL = "Update child record"

    def verify_headers(self):
        self.po.verify(
            locator=self.LBL_MAIN, property=element_properties.TEXT, expected_value=self.LBL_HEADERS, exact=False
        )

    def confirm_school_move(self):
        self.po.act(locator=self.LNK_REVIEW, action=element_actions.CLICK_LINK_INDEX_FOR_ROW, value=0)
        _child_full_name: str = (
            self.po.get_element_property(locator=self.LBL_CHILD_NAME, property=element_properties.TEXT)
            .replace(self.LBL_CHILD_NAME, "")
            .strip()
        )
        _success_message = f"{_child_full_name}’s school record updated"
        self.po.act(locator=self.RDO_UPDATE_SCHOOL, action=element_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_UPDATE_SCHOOL, action=element_actions.CLICK_BUTTON)
        self.po.verify(locator=self.LBL_PARAGRAPH, property=element_properties.TEXT, expected_value=_success_message)

    def ignore_school_move(self):
        self.po.act(locator=self.LNK_REVIEW, action=element_actions.CLICK_LINK_INDEX_FOR_ROW, value=0)
        _child_full_name: str = (
            self.po.get_element_property(locator=self.LBL_CHILD_NAME, property=element_properties.TEXT)
            .replace(self.LBL_CHILD_NAME, "")
            .strip()
        )
        _success_message = f"{_child_full_name}’s school move ignored"
        self.po.act(locator=self.RDO_IGNORE_INFORMATION, action=element_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_UPDATE_SCHOOL, action=element_actions.CLICK_BUTTON)
        self.po.verify(locator=self.LBL_PARAGRAPH, property=element_properties.TEXT, expected_value=_success_message)
