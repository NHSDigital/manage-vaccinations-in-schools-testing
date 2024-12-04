from libs import CurrentExecution, playwright_ops
from libs.constants import actions, object_properties, wait_time
from libs.wrappers import *


class pg_school_moves:
    po = playwright_ops.playwright_operations()
    ce = CurrentExecution()

    LBL_HEADERS = "Updated	Full name	Move	Actions"
    LBL_MAIN = "main"
    LBL_COUNT = "5 school moves"

    def verify_headers(self):
        self.po.verify(locator=self.LBL_MAIN, property=object_properties.TEXT, value=self.LBL_HEADERS, exact=False)

    def verify_counts(self):
        self.po.verify(locator=self.LBL_MAIN, property=object_properties.TEXT, value=self.LBL_COUNT, exact=False)
