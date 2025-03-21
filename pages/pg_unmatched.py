from libs import CurrentExecution, playwright_ops
from libs.generic_constants import element_properties, framework_actions, wait_time
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
    LNK_MATCH = "Match"
    LNK_ARCHIVE_RECORD = "Archive"
    LNK_CREATE_RECORD = "Create new record"
    LNK_PARENT_NAME = "Parent Full (Dad)"
    TXT_NOTES = "Notes"
    BTN_CREATE_RECORD_FROM = "Create a new record from"
    BTN_ARCHIVE_RESPONSE = "Archive response"
    # TBL_CHILDREN = "unmatched consent responses Response dateChildParent or guardianAction"
    TBL_CHILDREN = "table"
    LBL_RESPONSE_COL = "Response"
    LBL_CHILD_NAME_FOR_ARCHIVAL = "CONSENTRECORD, NonMatching"
    LBL_CHILD_NAME_FOR_CREATION = "HOYTE, HELENA"
    LBL_CHILD_NAME_FOR_MATCHING = "TWIST, BERYL"
    LBL_CHILD_NO_NHS_NUMBER = "NONUMBER, NoNHS"
    LBL_CHILD_NAME_TO_MATCH = "CMATCH1, CMatch1"
    TXT_SEARCH = "Search"
    BTN_SEARCH = "Search"
    LNK_SELECT_FILTERED_CHILD = "Select"
    BTN_LINK_RESPONSE_WITH_RECORD = "Link response with record"
    LBL_CONSENT_MATCHED = f"Consent matched for {LBL_CHILD_NAME_TO_MATCH}"

    def verify_records_exist(self):
        self.po.verify(
            locator=self.LBL_MAIN, property=element_properties.TEXT, expected_value=self.LBL_NO_RECORDS, exact=False
        )

    def match_with_record(self):
        _row_num, _ = self.po.get_table_cell_location_for_value(
            table_locator=self.TBL_CHILDREN,
            col_header=self.LBL_RESPONSE_COL,
            row_value=self.LBL_CHILD_NAME_FOR_MATCHING,
        )
        self.po.act(locator=self.LNK_MATCH, action=framework_actions.CLICK_LINK, index=_row_num)
        self.po.act(locator=self.TXT_SEARCH, action=framework_actions.FILL, value=self.LBL_CHILD_NAME_TO_MATCH)
        self.po.act(locator=self.BTN_SEARCH, action=framework_actions.CLICK_BUTTON)
        self.po.act(locator=None, action=framework_actions.WAIT, value=wait_time.MIN)
        self.po.act(locator=self.LBL_CHILD_NAME_TO_MATCH, action=framework_actions.CLICK_LINK, index=0)
        self.po.act(locator=self.BTN_LINK_RESPONSE_WITH_RECORD, action=framework_actions.CLICK_BUTTON)
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
            table_locator=self.TBL_CHILDREN,
            col_header=self.LBL_RESPONSE_COL,
            row_value=self.LBL_CHILD_NAME_FOR_ARCHIVAL,
        )
        self.po.act(locator=self.LNK_ARCHIVE_RECORD, action=framework_actions.CLICK_LINK, index=(_row_num - 1))
        self.po.act(locator=self.TXT_NOTES, action=framework_actions.FILL, value="Archiving")
        self.po.act(locator=self.BTN_ARCHIVE_RESPONSE, action=framework_actions.CLICK_BUTTON)
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
            table_locator=self.TBL_CHILDREN,
            col_header=self.LBL_RESPONSE_COL,
            row_value=self.LBL_CHILD_NAME_FOR_CREATION,
        )
        self.po.act(locator=self.LNK_PARENT_NAME, action=framework_actions.CLICK_LINK, index=(_row_num - 1))
        self.po.act(locator=self.LNK_CREATE_RECORD, action=framework_actions.CLICK_LINK)
        self.po.act(locator=self.BTN_CREATE_RECORD_FROM, action=framework_actions.CLICK_BUTTON)
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
            table_locator=self.TBL_CHILDREN, col_header=self.LBL_RESPONSE_COL, row_value=self.LBL_CHILD_NO_NHS_NUMBER
        )
        self.po.act(locator=self.LNK_PARENT_NAME, action=framework_actions.CLICK_LINK, index=(_row_num - 1))
        self.po.act(locator=self.LNK_CREATE_RECORD, action=framework_actions.CLICK_LINK)
        self.po.act(locator=self.BTN_CREATE_RECORD_FROM, action=framework_actions.CLICK_BUTTON)
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
