from libs import CurrentExecution, playwright_ops
from libs.constants import actions, object_properties, wait_time
from libs.wrappers import *
from pages import pg_dashboard


class pg_children:
    po = playwright_ops.playwright_operations()
    ce = CurrentExecution()
    dashboard_page = pg_dashboard.pg_dashboard()

    CHILD1 = "CF"
    LBL_CHILD_RECORD = f"5 children matching “{CHILD1}”"

    LBL_CHILDREN = "Children"
    LBL_HEADING = "heading"
    LBL_MAIN = "main"
    LBL_TABLE_HEADERS = "Full name	NHS number	Date of birth	Postcode	School"
    TXT_FILTER_NAME = "Name"
    LNK_FILTER_CHILDREN = "Filter children"
    LNK_CLEAR_FILTERS = "Clear filters"

    def verify_headers(self):
        self.po.verify(locator=self.LBL_HEADING, property=object_properties.TEXT, value=self.LBL_CHILDREN, exact=True)
        self.po.verify(locator=self.LBL_MAIN, property=object_properties.TEXT, value=self.LBL_TABLE_HEADERS)

    def verify_filter(self):
        self.po.perform_action(locator=self.LNK_FILTER_CHILDREN, action=actions.CLICK_TEXT)
        self.po.perform_action(locator=self.TXT_FILTER_NAME, action=actions.FILL, value=self.CHILD1)
        wait(timeout=wait_time.MIN)
        self.po.verify(locator=self.LBL_MAIN, property=object_properties.TEXT, value=self.LBL_CHILD_RECORD)

    def search_child(self) -> None:
        if len(self.ce.child_list) < 1:
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_children()
            for child_name in self.ce.child_list:
                self.po.perform_action(locator=self.LNK_FILTER_CHILDREN, action=actions.CLICK_TEXT)
                self.po.perform_action(locator=self.TXT_FILTER_NAME, action=actions.FILL, value=child_name)
                wait(timeout=wait_time.MIN)
                self.po.verify(locator=self.LBL_MAIN, property=object_properties.TEXT, value=child_name)
                self.po.perform_action(locator=self.LNK_CLEAR_FILTERS, action=actions.CLICK_LINK)
