from typing import Final

from libs import CurrentExecution, playwright_ops
from libs.generic_constants import (
    element_properties,
    escape_characters,
    framework_actions,
)
from pages import pg_dashboard


class pg_school_moves:
    po = playwright_ops.playwright_operations()
    ce = CurrentExecution()
    dashboard_page = pg_dashboard.pg_dashboard()

    LBL_HEADERS: Final[str] = "Updated	Full name	Move	Actions"
    LBL_MAIN: Final[str] = "main"
    LBL_PARAGRAPH: Final[str] = "paragraph"
    LNK_REVIEW: Final[str] = "Review"
    LBL_CHILD_NAME: str = f"heading{escape_characters.SEPARATOR_CHAR}Review school move"
    RDO_UPDATE_SCHOOL: Final[str] = "Update record with new school"
    RDO_IGNORE_INFORMATION: Final[str] = "Ignore new information"
    BTN_UPDATE_SCHOOL: Final[str] = "Update child record"

    def verify_headers(self):
        self.po.verify(
            locator=self.LBL_MAIN, property=element_properties.TEXT, expected_value=self.LBL_HEADERS, exact=False
        )

    def confirm_school_move(self):
        self.po.act(locator=self.LNK_REVIEW, action=framework_actions.CLICK_LINK_INDEX_FOR_ROW, value=0)
        _child_full_name: str = (
            self.po.get_element_property(locator=self.LBL_CHILD_NAME, property=element_properties.TEXT)
            .replace(self.LBL_CHILD_NAME, "")
            .strip()
        )
        _success_message = f"{_child_full_name}’s school record updated"
        self.po.act(locator=self.RDO_UPDATE_SCHOOL, action=framework_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_UPDATE_SCHOOL, action=framework_actions.CLICK_BUTTON)
        self.po.verify(locator=self.LBL_PARAGRAPH, property=element_properties.TEXT, expected_value=_success_message)

    def ignore_school_move(self):
        self.po.act(locator=self.LNK_REVIEW, action=framework_actions.CLICK_LINK_INDEX_FOR_ROW, value=0)
        _child_full_name: str = (
            self.po.get_element_property(locator=self.LBL_CHILD_NAME, property=element_properties.TEXT)
            .replace(self.LBL_CHILD_NAME, "")
            .strip()
        )
        _success_message = f"{_child_full_name}’s school move ignored"
        self.po.act(locator=self.RDO_IGNORE_INFORMATION, action=framework_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_UPDATE_SCHOOL, action=framework_actions.CLICK_BUTTON)
        self.po.verify(locator=self.LBL_PARAGRAPH, property=element_properties.TEXT, expected_value=_success_message)

    def confirm_and_ignore_moves(self):
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_school_moves()
        self.po.verify(
            locator=self.LBL_MAIN, property=element_properties.TEXT, expected_value="Full name CLMOVES1, CFMoves1"
        )
        self.po.verify(
            locator=self.LBL_MAIN,
            property=element_properties.TEXT,
            expected_value="Move Class list updated Bohunt School Wokingham to Ashlawn School",
        )
        self.po.verify(
            locator=self.LBL_MAIN, property=element_properties.TEXT, expected_value="Full name CLMOVES2, CFMoves2"
        )
        self.po.verify(
            locator=self.LBL_MAIN,
            property=element_properties.TEXT,
            expected_value="Class list updated Bohunt School Wokingham to Ashlawn School",
        )
        self.confirm_school_move()
        self.ignore_school_move()
