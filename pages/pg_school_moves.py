from typing import Final

import pandas as pd

from libs import CurrentExecution, playwright_ops
from libs.generic_constants import actions, escape_characters, properties
from libs.mavis_constants import report_headers, test_data_values
from libs.wrappers import get_current_datetime
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
    LNK_DOWNLOAD_RECORDS: Final[str] = "Download records"
    BTN_CONTINUE: Final[str] = "Continue"
    BTN_DOWNLOAD_CSV: Final[str] = "Download CSV"

    def verify_headers(self):
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value=self.LBL_HEADERS,
            exact=False,
        )

    def confirm_school_move(self):
        self.po.act(locator=self.LNK_REVIEW, action=actions.CLICK_LINK_INDEX_FOR_ROW, index=0)
        _child_full_name: str = (
            self.po.get_element_property(locator=self.LBL_CHILD_NAME, property=properties.TEXT)
            .replace(self.LBL_CHILD_NAME, "")
            .strip()
        )
        _success_message = f"{_child_full_name}’s school record updated"
        self.po.act(locator=self.RDO_UPDATE_SCHOOL, action=actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_UPDATE_SCHOOL, action=actions.CLICK_BUTTON)
        self.po.verify(
            locator=self.LBL_PARAGRAPH,
            property=properties.TEXT,
            expected_value=_success_message,
        )

    def ignore_school_move(self):
        self.po.act(locator=self.LNK_REVIEW, action=actions.CLICK_LINK_INDEX_FOR_ROW, index=0)
        _child_full_name: str = (
            self.po.get_element_property(locator=self.LBL_CHILD_NAME, property=properties.TEXT)
            .replace(self.LBL_CHILD_NAME, "")
            .strip()
        )
        _success_message = f"{_child_full_name}’s school move ignored"
        self.po.act(locator=self.RDO_IGNORE_INFORMATION, action=actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_UPDATE_SCHOOL, action=actions.CLICK_BUTTON)
        self.po.verify(
            locator=self.LBL_PARAGRAPH,
            property=properties.TEXT,
            expected_value=_success_message,
        )

    def confirm_and_ignore_moves(self):
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_school_moves()
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value="Full name CLMOVES1, CFMoves1",
        )
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value=f"Move Class list updated {test_data_values.SCHOOL_1_NAME} to {test_data_values.SCHOOL_2_NAME}",
        )
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value="Full name CLMOVES2, CFMoves2",
        )
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value=f"Class list updated {test_data_values.SCHOOL_1_NAME} to {test_data_values.SCHOOL_2_NAME}",
        )
        self.confirm_school_move()
        self.ignore_school_move()

    def download_and_verify_report(self):
        self.po.act(locator=self.LNK_DOWNLOAD_RECORDS, action=actions.CLICK_BUTTON)
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self._download_and_verify_report_headers(expected_headers=report_headers.SCHOOL_MOVES)

    def _download_and_verify_report_headers(self, expected_headers: str):
        _file_path = f"working/export_{get_current_datetime()}.csv"
        self.po.act(
            locator=self.BTN_DOWNLOAD_CSV,
            action=actions.DOWNLOAD_FILE_USING_BUTTON,
            value=_file_path,
        )
        _actual_df = pd.read_csv(filepath_or_buffer=_file_path)
        actual_headers = ",".join(_actual_df.columns.tolist())
        _e_not_a = [h for h in expected_headers.split(",") if h not in actual_headers.split(",")]
        _a_not_e = [h for h in actual_headers.split(",") if h not in expected_headers.split(",")]
        if len(_e_not_a) > 0 or len(_a_not_e) > 0:
            assert (
                False
            ), f"Expected field(s) not found in actual: {_e_not_a}.  Actual report contains extra field(s): {_a_not_e}."
