from libs import CurrentExecution, playwright_ops
from libs.constants import actions, escape_characters, object_properties
from libs.wrappers import *


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
        self.po.verify(locator=self.LBL_MAIN, property=object_properties.TEXT, value=self.LBL_HEADERS, exact=False)

    def confirm_school_move(self):
        self.po.perform_action(locator=self.LNK_REVIEW, action=actions.CLICK_LINK_INDEX_FOR_ROW, value=0)
        _child_full_name: str = (
            self.po.get_object_property(locator=self.LBL_CHILD_NAME, property=object_properties.TEXT)
            .replace(self.LBL_CHILD_NAME, "")
            .strip()
        )
        _success_message = f"{_child_full_name}’s school record updated"
        self.po.perform_action(locator=self.RDO_UPDATE_SCHOOL, action=actions.RADIO_BUTTON_SELECT)
        self.po.perform_action(locator=self.BTN_UPDATE_SCHOOL, action=actions.CLICK_BUTTON)
        self.po.verify(locator=self.LBL_PARAGRAPH, property=object_properties.TEXT, value=_success_message)

    def ignore_school_move(self):
        self.po.perform_action(locator=self.LNK_REVIEW, action=actions.CLICK_LINK_INDEX_FOR_ROW, value=0)
        _child_full_name: str = (
            self.po.get_object_property(locator=self.LBL_CHILD_NAME, property=object_properties.TEXT)
            .replace(self.LBL_CHILD_NAME, "")
            .strip()
        )
        _success_message = f"{_child_full_name}’s school move ignored"
        self.po.perform_action(locator=self.RDO_IGNORE_INFORMATION, action=actions.RADIO_BUTTON_SELECT)
        self.po.perform_action(locator=self.BTN_UPDATE_SCHOOL, action=actions.CLICK_BUTTON)

        self.po.verify(locator=self.LBL_PARAGRAPH, property=object_properties.TEXT, value=_success_message)

    def upload_new_student_to_closed_session(self):
        pass
