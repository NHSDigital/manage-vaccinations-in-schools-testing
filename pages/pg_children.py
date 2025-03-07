from libs import CurrentExecution, playwright_ops
from libs.generic_constants import element_actions, element_properties, wait_time
from libs.wrappers import *
from pages import pg_dashboard


class pg_children:
    po = playwright_ops.playwright_operations()
    ce = CurrentExecution()
    dashboard_page = pg_dashboard.pg_dashboard()

    CHILD1 = "CFILTER1, CFilter1"
    LBL_CHILD_RECORD = "1 child"

    LBL_CHILDREN = "Children"
    LBL_HEADING = "heading"
    LBL_MAIN = "main"
    LBL_TABLE_HEADERS = "Name and NHS number	Postcode	School	Date of birth"
    TXT_SEARCH = "Search"
    BTN_SEARCH = "Search"
    LNK_CLEAR_FILTERS = "Clear filters"
    LNK_ACTIVITY_LOG = "Activity log"

    def verify_headers(self):
        self.po.verify(
            locator=self.LBL_HEADING, property=element_properties.TEXT, expected_value=self.LBL_CHILDREN, exact=True
        )
        self.po.verify(locator=self.LBL_MAIN, property=element_properties.TEXT, expected_value=self.LBL_TABLE_HEADERS)

    def verify_filter(self):
        self.po.act(locator=self.TXT_SEARCH, action=element_actions.FILL, value=self.CHILD1)
        self.po.act(locator=self.BTN_SEARCH, action=element_actions.CLICK_BUTTON)
        wait(timeout=wait_time.MIN)
        self.po.verify(locator=self.LBL_MAIN, property=element_properties.TEXT, expected_value=self.LBL_CHILD_RECORD)

    def search_child(self) -> None:
        if len(self.ce.child_list) >= 1:
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_children()
            for child_name in self.ce.child_list:
                self.po.act(locator=self.TXT_SEARCH, action=element_actions.FILL, value=child_name)
                self.po.act(locator=self.BTN_SEARCH, action=element_actions.CLICK_BUTTON)
                wait(timeout=wait_time.MIN)
                self.po.verify(locator=self.LBL_MAIN, property=element_properties.TEXT, expected_value=child_name)
                self.po.act(locator=self.LNK_CLEAR_FILTERS, action=element_actions.CLICK_LINK)

    def verify_activity_log_for_created_or_matched_child(self, child_name: str, is_created: bool):
        _log_text: str = ""
        if is_created:
            _log_text = "Update this text when MAVIS-1896/MAV-253 is closed"  # FIXME: Update this text when MAVIS-1896/MAV-253 is closed
        else:
            _log_text = "Consent response manually matched with child record"
        self.po.act(locator=self.TXT_SEARCH, action=element_actions.FILL, value=child_name)
        self.po.act(locator=self.BTN_SEARCH, action=element_actions.CLICK_BUTTON)
        wait(timeout=wait_time.MIN)
        self.po.act(locator=child_name, action=element_actions.CLICK_LINK)
        self.po.act(locator=self.LNK_ACTIVITY_LOG, action=element_actions.CLICK_TEXT)
        wait(timeout=wait_time.MIN)
        self.po.verify(locator=self.LBL_MAIN, property=element_properties.TEXT, expected_value="Consent given")
        self.po.verify(
            locator=self.LBL_MAIN,
            property=element_properties.TEXT,
            expected_value="Added to session at Bohunt School Wokingham",
        )
        self.po.verify(
            locator=self.LBL_MAIN,
            property=element_properties.TEXT,
            expected_value=_log_text,
        )
