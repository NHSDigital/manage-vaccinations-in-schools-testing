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

    def verify_records_exist(self):
        self.po.verify(
            locator=self.LBL_MAIN, property=object_properties.TEXT, expected_value=self.LBL_NO_RECORDS, exact=False
        )
