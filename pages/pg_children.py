from libs import CurrentExecution, playwright_ops
from libs.constants import actions, object_properties, wait_time
from libs.wrappers import *


class pg_children:
    po = playwright_ops.playwright_operations()
    ce = CurrentExecution()

    LBL_CHILDREN = "Children"
    LBL_HEADING = "heading"
    LBL_MAIN = "main"
    LBL_TABLE_HEADERS = "Full name	NHS number	Date of birth	Postcode	School"

    def verify_headers(self):
        self.po.verify(locator=self.LBL_HEADING, property=object_properties.TEXT, value=self.LBL_CHILDREN, exact=True)
        self.po.verify(locator=self.LBL_MAIN, property=object_properties.TEXT, value=self.LBL_TABLE_HEADERS)
