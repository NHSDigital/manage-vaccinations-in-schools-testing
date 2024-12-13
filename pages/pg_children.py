from libs import CurrentExecution, playwright_ops
from libs.constants import actions, object_properties, wait_time
from libs.wrappers import *


class pg_children:
    po = playwright_ops.playwright_operations()
    ce = CurrentExecution()

    CHILD1 = "CF"
    LBL_CHILD_RECORD = f"4 children matching “{CHILD1}”"

    LBL_CHILDREN = "Children"
    LBL_HEADING = "heading"
    LBL_MAIN = "main"
    LBL_TABLE_HEADERS = "Full name	NHS number	Date of birth	Postcode	School"
    TXT_FILTER_NAME = "Name"
    LNK_FILTER_CHILDREN = "Filter children"

    def verify_headers(self):
        self.po.verify(locator=self.LBL_HEADING, property=object_properties.TEXT, value=self.LBL_CHILDREN, exact=True)
        self.po.verify(locator=self.LBL_MAIN, property=object_properties.TEXT, value=self.LBL_TABLE_HEADERS)

    def verify_filter(self):
        self.po.perform_action(locator=self.LNK_FILTER_CHILDREN, action=actions.CLICK_TEXT)
        self.po.perform_action(locator=self.TXT_FILTER_NAME, action=actions.FILL, value=self.CHILD1)
        wait(timeout=wait_time.MIN)
        self.po.verify(locator=self.LBL_MAIN, property=object_properties.TEXT, value=self.LBL_CHILD_RECORD)
