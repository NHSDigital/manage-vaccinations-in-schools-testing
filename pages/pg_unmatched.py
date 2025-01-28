from inspect import isclass
from math import exp

from libs import CurrentExecution, playwright_ops
from libs.constants import actions, element_properties, wait_time
from libs.wrappers import *
from pages import pg_children, pg_dashboard


class pg_unmatched:
    po = playwright_ops.playwright_operations()
    ce = CurrentExecution()
    dashboard_page = pg_dashboard.pg_dashboard()
    children_page = pg_children.pg_children()

    LBL_NO_RECORDS = "!There are currently no unmatched consent responses."
    LBL_MAIN = "main"
    LBL_PARAGRAPH = "paragraph"
    LBL_ARCHIVE_SUCCESS_MESSAGE = "Consent response from Parent Full archived"
    LBL_CREATE_SUCCESS_MESSAGE = "’s record created from a consent response from Parent Full"
    LNK_MATCH_WITH_RECORD = "Match with record"
    LNK_ARCHIVE_RECORD = "Archive"
    LNK_CREATE_RECORD = "Create record"
    TXT_NOTES = "Notes"
    BTN_CREATE_RECORD_FROM = "Create a new record from"
    BTN_ARCHIVE_RESPONSE = "Archive response"
    # TBL_CHILDREN = "unmatched consent responses Response dateChildParent or guardianAction"
    TBL_CHILDREN = "table"
    LBL_CHILD_COL = "Child"
    LBL_CHILD_NAME_FOR_ARCHIVAL = "NonMatching ConsentRecord"
    LBL_CHILD_NAME_FOR_CREATION = "HELENA HOYTE"
    LBL_CHILD_NAME_FOR_MATCHING = "BERYL TWIST"
    LBL_CHILD_NO_NHS_NUMBER = "NoNHS NoNumber"
    LBL_CHILD_NAME_TO_MATCH = "ChildFirst1"
    TXT_FILTER_NAME = "Name"
    LNK_SELECT_FILTERED_CHILD = "Select"
    BTN_LINK_RESPONSE_WITH_RECORD = "Link response with record"
    LBL_CONSENT_MATCHED = "Consent matched for ChildFirst1 ChildLast1"

    def verify_records_exist(self):
        self.po.verify(
            locator=self.LBL_MAIN, property=element_properties.TEXT, expected_value=self.LBL_NO_RECORDS, exact=False
        )

    def match_with_record(self):
        _row_num, _ = self.po.get_table_cell_location_for_value(
            table_locator=self.TBL_CHILDREN, col_header=self.LBL_CHILD_COL, row_value=self.LBL_CHILD_NAME_FOR_MATCHING
        )
        self.po.act(locator=self.LNK_MATCH_WITH_RECORD, action=actions.CLICK_LINK, index=(_row_num - 1))
        self.po.act(locator=self.TXT_FILTER_NAME, action=actions.FILL, value=self.LBL_CHILD_NAME_TO_MATCH)
        wait(timeout=wait_time.MIN)
        self.po.act(locator=self.LNK_SELECT_FILTERED_CHILD, action=actions.CLICK_LINK)
        self.po.act(locator=self.BTN_LINK_RESPONSE_WITH_RECORD, action=actions.CLICK_BUTTON)
        self.po.verify(
            locator=self.LBL_PARAGRAPH, property=element_properties.TEXT, expected_value=self.LBL_CONSENT_MATCHED
        )
        self.po.verify(
            locator=self.LBL_MAIN,
            property=element_properties.TEXT,
            expected_value=f"!{self.LBL_CHILD_NAME_FOR_MATCHING}",
        )
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_children()
        self.children_page.verify_activity_log_for_created_or_matched_child(
            child_name=self.LBL_CHILD_NAME_TO_MATCH, is_created=False
        )  # MAVIS-1812

    def archive_record(self):
        _row_num, _ = self.po.get_table_cell_location_for_value(
            table_locator=self.TBL_CHILDREN, col_header=self.LBL_CHILD_COL, row_value=self.LBL_CHILD_NAME_FOR_ARCHIVAL
        )
        self.po.act(locator=self.LNK_ARCHIVE_RECORD, action=actions.CLICK_LINK, index=(_row_num - 1))
        self.po.act(locator=self.TXT_NOTES, action=actions.FILL, value="Archiving")
        self.po.act(locator=self.BTN_ARCHIVE_RESPONSE, action=actions.CLICK_BUTTON)
        self.po.verify(
            locator=self.LBL_PARAGRAPH,
            property=element_properties.TEXT,
            expected_value=self.LBL_ARCHIVE_SUCCESS_MESSAGE,
        )
        self.po.verify(
            locator=self.LBL_MAIN,
            property=element_properties.TEXT,
            expected_value=f"!{self.LBL_CHILD_NAME_FOR_ARCHIVAL}",
            exact=False,
        )  # MAVIS-1782

    def create_record(self):
        _row_num, _ = self.po.get_table_cell_location_for_value(
            table_locator=self.TBL_CHILDREN, col_header=self.LBL_CHILD_COL, row_value=self.LBL_CHILD_NAME_FOR_CREATION
        )
        self.po.act(locator=self.LNK_CREATE_RECORD, action=actions.CLICK_LINK, index=(_row_num - 1))
        self.po.act(locator=self.BTN_CREATE_RECORD_FROM, action=actions.CLICK_BUTTON)
        self.po.verify(
            locator=self.LBL_PARAGRAPH,
            property=element_properties.TEXT,
            expected_value=self.LBL_CREATE_SUCCESS_MESSAGE,
        )
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_children()
        self.children_page.verify_activity_log_for_created_or_matched_child(
            child_name=self.LBL_CHILD_NAME_FOR_CREATION, is_created=True
        )  # MAVIS-1896

    def create_record_with_no_nhs_number(self):
        _row_num, _ = self.po.get_table_cell_location_for_value(
            table_locator=self.TBL_CHILDREN, col_header=self.LBL_CHILD_COL, row_value=self.LBL_CHILD_NO_NHS_NUMBER
        )
        self.po.act(locator=self.LNK_CREATE_RECORD, action=actions.CLICK_LINK, index=(_row_num - 1))
        self.po.act(locator=self.BTN_CREATE_RECORD_FROM, action=actions.CLICK_BUTTON)
        self.po.verify(
            locator=self.LBL_PARAGRAPH,
            property=element_properties.TEXT,
            expected_value=self.LBL_CREATE_SUCCESS_MESSAGE,
        )
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_children()
        self.children_page.verify_activity_log_for_created_or_matched_child(
            child_name=self.LBL_CHILD_NO_NHS_NUMBER, is_created=True
        )  # MAVIS-1781
