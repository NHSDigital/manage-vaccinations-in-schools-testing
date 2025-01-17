from libs import CurrentExecution, playwright_ops
from libs.constants import actions, object_properties, wait_time
from libs.wrappers import *
from pages import pg_dashboard


class pg_unmatched:
    po = playwright_ops.playwright_operations()
    ce = CurrentExecution()
    dashboard_page = pg_dashboard.pg_dashboard()

    LBL_NO_RECORDS = "!There are currently no unmatched consent responses."
    LBL_MAIN = "main"
    LBL_PARAGRAPH = "paragraph"
    LBL_ARCHIVE_SUCCESS_MESSAGE = "Consent response from Parent Full archived"
    LNK_MATCH_WITH_RECORD = "Match with record"
    LNK_ARCHIVE_RECORD = "Archive"
    TXT_NOTES = "Notes"
    BTN_ARCHIVE_RESPONSE = "Archive response"

    def verify_records_exist(self):
        self.po.verify(
            locator=self.LBL_MAIN, property=object_properties.TEXT, expected_value=self.LBL_NO_RECORDS, exact=False
        )

    def match_with_record(self):
        self.po.perform_action(locator=self.LNK_MATCH_WITH_RECORD, action=actions.CLICK_LINK)

    def archive_record(self):
        self.po.perform_action(locator=self.LNK_ARCHIVE_RECORD, action=actions.CLICK_LINK)
        self.po.perform_action(locator=self.TXT_NOTES, action=actions.FILL, value="Archiving")
        self.po.perform_action(locator=self.BTN_ARCHIVE_RESPONSE, action=actions.CLICK_BUTTON)
        self.po.verify(
            locator=self.LBL_PARAGRAPH,
            property=object_properties.TEXT,
            expected_value=self.LBL_ARCHIVE_SUCCESS_MESSAGE,
        )