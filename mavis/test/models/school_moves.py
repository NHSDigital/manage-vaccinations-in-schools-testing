from typing import Final

import pandas as pd

from libs.generic_constants import actions, escape_characters, properties
from libs.mavis_constants import Location, report_headers
from ..playwright_ops import PlaywrightOperations
from ..wrappers import get_current_datetime

from .dashboard import DashboardPage


class SchoolMovesPage:
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

    def __init__(
        self, playwright_operations: PlaywrightOperations, dashboard_page: DashboardPage
    ):
        self.po = playwright_operations
        self.dashboard_page = dashboard_page

    def verify_headers(self):
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value=self.LBL_HEADERS,
            exact=False,
        )

    def confirm_school_move(self):
        self.po.act(
            locator=self.LNK_REVIEW, action=actions.CLICK_LINK_INDEX_FOR_ROW, index=0
        )
        _child_full_name: str = (
            self.po.get_element_property(
                locator=self.LBL_CHILD_NAME, property=properties.TEXT
            )
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
        self.po.act(
            locator=self.LNK_REVIEW, action=actions.CLICK_LINK_INDEX_FOR_ROW, index=0
        )
        _child_full_name: str = (
            self.po.get_element_property(
                locator=self.LBL_CHILD_NAME, property=properties.TEXT
            )
            .replace(self.LBL_CHILD_NAME, "")
            .strip()
        )
        _success_message = f"{_child_full_name}’s school move ignored"
        self.po.act(
            locator=self.RDO_IGNORE_INFORMATION, action=actions.RADIO_BUTTON_SELECT
        )
        self.po.act(locator=self.BTN_UPDATE_SCHOOL, action=actions.CLICK_BUTTON)
        self.po.verify(
            locator=self.LBL_PARAGRAPH,
            property=properties.TEXT,
            expected_value=_success_message,
        )

    def confirm_and_ignore_moves(self):
        self.dashboard_page.click_mavis()
        self.dashboard_page.click_school_moves()
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value="Full name CLMOVES1, CFMoves1",
        )
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value=f"Move Class list updated {Location.SCHOOL_1} to {Location.SCHOOL_2}",
        )
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value="Full name CLMOVES2, CFMoves2",
        )
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value=f"Class list updated {Location.SCHOOL_1} to {Location.SCHOOL_2}",
        )
        self.confirm_school_move()
        self.ignore_school_move()

    def download_and_verify_report(self):
        self.po.act(locator=self.LNK_DOWNLOAD_RECORDS, action=actions.CLICK_BUTTON)
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self._download_and_verify_report_headers(
            expected_headers=report_headers.SCHOOL_MOVES
        )

    def _download_and_verify_report_headers(self, expected_headers: str):
        _file_path = f"working/export_{get_current_datetime()}.csv"
        self.po.act(
            locator=self.BTN_DOWNLOAD_CSV,
            action=actions.DOWNLOAD_FILE_USING_BUTTON,
            value=_file_path,
        )
        _actual_df = pd.read_csv(filepath_or_buffer=_file_path)
        actual_headers = ",".join(_actual_df.columns.tolist())
        _e_not_a = [
            h for h in expected_headers.split(",") if h not in actual_headers.split(",")
        ]
        _a_not_e = [
            h for h in actual_headers.split(",") if h not in expected_headers.split(",")
        ]
        if len(_e_not_a) > 0 or len(_a_not_e) > 0:
            assert False, (
                f"The following expected field(s) were not found in the report: {_e_not_a}.  Report contains extra field(s), which were not expected: {_a_not_e}."
            )
