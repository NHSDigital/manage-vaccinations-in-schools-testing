from typing import Final

from libs import CurrentExecution, playwright_ops
from libs.generic_constants import actions, properties, wait_time

from .children import ChildrenPage
from .dashboard import DashboardPage


class UnmatchedPage:
    po = playwright_ops.playwright_operations()
    ce = CurrentExecution()
    dashboard_page = DashboardPage()
    children_page = ChildrenPage()

    LBL_NO_RECORDS: Final[str] = "!There are currently no unmatched consent responses."
    LBL_MAIN: Final[str] = "main"
    LBL_PARAGRAPH: Final[str] = "paragraph"
    LBL_ARCHIVE_SUCCESS_MESSAGE: Final[str] = (
        "Consent response from Parent Full archived"
    )
    LBL_CREATE_SUCCESS_MESSAGE: Final[str] = (
        "’s record created from a consent response from Parent Full"
    )
    LNK_MATCH: Final[str] = "Match"
    LNK_ARCHIVE_RECORD: Final[str] = "Archive"
    LNK_CREATE_RECORD: Final[str] = "Create new record"
    LNK_PARENT_NAME: Final[str] = "Parent Full (Dad)"
    TXT_NOTES: Final[str] = "Notes"
    BTN_CREATE_RECORD_FROM: Final[str] = "Create a new record from"
    BTN_ARCHIVE_RESPONSE: Final[str] = "Archive response"
    # TBL_CHILDREN: Final[str] = "unmatched consent responses Response dateChildParent or guardianAction"
    TBL_CHILDREN: Final[str] = "table"
    LBL_RESPONSE_COL: Final[str] = "Response"
    LBL_CHILD_NAME_FOR_ARCHIVAL: Final[str] = "CONSENTRECORD, NonMatching"
    LBL_CHILD_NAME_FOR_CREATION: Final[str] = "HOYTE, HELENA"
    LBL_CHILD_NAME_FOR_MATCHING: Final[str] = "TWIST, BERYL"
    LBL_CHILD_NO_NHS_NUMBER: Final[str] = "NONUMBER, NoNHS"
    LBL_CHILD_NAME_TO_MATCH: Final[str] = "CMATCH1, CMatch1"
    TXT_SEARCH: Final[str] = "Search"
    BTN_SEARCH: Final[str] = "Search"
    LNK_SELECT_FILTERED_CHILD: Final[str] = "Select"
    BTN_LINK_RESPONSE_WITH_RECORD: Final[str] = "Link response with record"
    LBL_CONSENT_MATCHED: str = f"Consent matched for {LBL_CHILD_NAME_TO_MATCH}"

    def verify_records_exist(self):
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value=self.LBL_NO_RECORDS,
            exact=False,
        )

    def match_with_record(self):
        _row_num, _ = self.po.get_table_cell_location_for_value(
            table_locator=self.TBL_CHILDREN,
            col_header=self.LBL_RESPONSE_COL,
            row_value=self.LBL_CHILD_NAME_FOR_MATCHING,
        )
        self.po.act(locator=self.LNK_MATCH, action=actions.CLICK_LINK, index=_row_num)
        self.po.act(
            locator=self.TXT_SEARCH,
            action=actions.FILL,
            value=self.LBL_CHILD_NAME_TO_MATCH,
        )
        self.po.act(locator=self.BTN_SEARCH, action=actions.CLICK_BUTTON)
        self.po.act(locator=None, action=actions.WAIT, value=wait_time.MIN)
        self.po.act(
            locator=self.LBL_CHILD_NAME_TO_MATCH, action=actions.CLICK_LINK, index=0
        )
        self.po.act(
            locator=self.BTN_LINK_RESPONSE_WITH_RECORD, action=actions.CLICK_BUTTON
        )
        self.po.verify(
            locator=self.LBL_PARAGRAPH,
            property=properties.TEXT,
            expected_value=self.LBL_CONSENT_MATCHED,
        )
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value=f"!{self.LBL_CHILD_NAME_FOR_MATCHING}",
        )
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_children()
        self.children_page.verify_activity_log_for_created_or_matched_child(
            child_name=self.LBL_CHILD_NAME_TO_MATCH, is_created=False
        )  # MAVIS-1812

    def archive_record(self):
        _row_num, _ = self.po.get_table_cell_location_for_value(
            table_locator=self.TBL_CHILDREN,
            col_header=self.LBL_RESPONSE_COL,
            row_value=self.LBL_CHILD_NAME_FOR_ARCHIVAL,
        )
        self.po.act(
            locator=self.LNK_ARCHIVE_RECORD,
            action=actions.CLICK_LINK,
            index=(_row_num - 1),
        )
        self.po.act(locator=self.TXT_NOTES, action=actions.FILL, value="Archiving")
        self.po.act(locator=self.BTN_ARCHIVE_RESPONSE, action=actions.CLICK_BUTTON)
        self.po.verify(
            locator=self.LBL_PARAGRAPH,
            property=properties.TEXT,
            expected_value=self.LBL_ARCHIVE_SUCCESS_MESSAGE,
        )
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value=f"!{self.LBL_CHILD_NAME_FOR_ARCHIVAL}",
            exact=False,
        )  # MAVIS-1782

    def create_record(self):
        _row_num, _ = self.po.get_table_cell_location_for_value(
            table_locator=self.TBL_CHILDREN,
            col_header=self.LBL_RESPONSE_COL,
            row_value=self.LBL_CHILD_NAME_FOR_CREATION,
        )
        self.po.act(
            locator=self.LNK_PARENT_NAME,
            action=actions.CLICK_LINK,
            index=(_row_num - 1),
        )
        self.po.act(locator=self.LNK_CREATE_RECORD, action=actions.CLICK_LINK)
        self.po.act(locator=self.BTN_CREATE_RECORD_FROM, action=actions.CLICK_BUTTON)
        self.po.verify(
            locator=self.LBL_PARAGRAPH,
            property=properties.TEXT,
            expected_value=self.LBL_CREATE_SUCCESS_MESSAGE,
        )
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_children()
        self.children_page.verify_activity_log_for_created_or_matched_child(
            child_name=self.LBL_CHILD_NAME_FOR_CREATION, is_created=True
        )  # MAVIS-1896

    def create_record_with_no_nhs_number(self):
        _row_num, _ = self.po.get_table_cell_location_for_value(
            table_locator=self.TBL_CHILDREN,
            col_header=self.LBL_RESPONSE_COL,
            row_value=self.LBL_CHILD_NO_NHS_NUMBER,
        )
        self.po.act(
            locator=self.LNK_PARENT_NAME,
            action=actions.CLICK_LINK,
            index=(_row_num - 1),
        )
        self.po.act(locator=self.LNK_CREATE_RECORD, action=actions.CLICK_LINK)
        self.po.act(locator=self.BTN_CREATE_RECORD_FROM, action=actions.CLICK_BUTTON)
        self.po.verify(
            locator=self.LBL_PARAGRAPH,
            property=properties.TEXT,
            expected_value=self.LBL_CREATE_SUCCESS_MESSAGE,
        )
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_children()
        self.children_page.verify_activity_log_for_created_or_matched_child(
            child_name=self.LBL_CHILD_NO_NHS_NUMBER, is_created=True
        )  # MAVIS-1781
