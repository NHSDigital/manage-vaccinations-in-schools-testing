from typing import Final

from libs import CurrentExecution, playwright_ops
from libs.generic_constants import element_properties, framework_actions, wait_time
from libs.wrappers import *
from pages import pg_dashboard


class pg_children:
    po = playwright_ops.playwright_operations()
    ce = CurrentExecution()
    dashboard_page = pg_dashboard.pg_dashboard()

    CHILD1: Final[str] = "CFILTER1, CFilter1"
    LBL_CHILD_RECORD: Final[str] = "1 child"

    LBL_CHILDREN: Final[str] = "Children"
    LBL_HEADING: Final[str] = "heading"
    LBL_MAIN: Final[str] = "main"
    LBL_TABLE_HEADERS: Final[str] = "Name and NHS number	Postcode	School	Date of birth"
    TXT_SEARCH: Final[str] = "Search"
    BTN_SEARCH: Final[str] = "Search"
    LNK_CLEAR_FILTERS: Final[str] = "Clear filters"
    LNK_ACTIVITY_LOG: Final[str] = "Activity log"
    LNK_CHILD_RECORD: Final[str] = "Child record"
    LNK_CHILD_MAV_853: Final[str] = "MAV_853, Mav_853"
    LNK_VACCS_DETAILS_MAV_853: Final[str] = "Gardasil 9 (HPV)"

    def verify_headers(self):
        self.po.verify(
            locator=self.LBL_HEADING, property=element_properties.TEXT, expected_value=self.LBL_CHILDREN, exact=True
        )
        self.po.verify(locator=self.LBL_MAIN, property=element_properties.TEXT, expected_value=self.LBL_TABLE_HEADERS)

    def verify_filter(self):
        self.po.act(locator=self.TXT_SEARCH, action=framework_actions.FILL, value=self.CHILD1)
        self.po.act(locator=self.BTN_SEARCH, action=framework_actions.CLICK_BUTTON)
        self.po.act(locator=None, action=framework_actions.WAIT, value=wait_time.MIN)
        self.po.verify(locator=self.LBL_MAIN, property=element_properties.TEXT, expected_value=self.LBL_CHILD_RECORD)

    def search_children(self) -> None:
        if len(self.ce.child_list) >= 1:
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_children()
            for child_name in self.ce.child_list:
                self.po.act(locator=self.TXT_SEARCH, action=framework_actions.FILL, value=child_name)
                self.po.act(locator=self.BTN_SEARCH, action=framework_actions.CLICK_BUTTON)
                self.po.act(locator=None, action=framework_actions.WAIT, value=wait_time.MIN)
                self.po.verify(locator=self.LBL_MAIN, property=element_properties.TEXT, expected_value=child_name)
                self.po.act(locator=self.LNK_CLEAR_FILTERS, action=framework_actions.CLICK_LINK)

    def search_for_a_child(self, child_name: str) -> None:
        self.po.act(locator=self.TXT_SEARCH, action=framework_actions.FILL, value=child_name)
        self.po.act(locator=self.BTN_SEARCH, action=framework_actions.CLICK_BUTTON)
        self.po.act(locator=None, action=framework_actions.WAIT, value=wait_time.MIN)
        self.po.verify(locator=self.LBL_MAIN, property=element_properties.TEXT, expected_value=child_name)

    def verify_activity_log_for_created_or_matched_child(self, child_name: str, is_created: bool):
        _log_text: str = ""
        if is_created:
            _log_text = "Update this text when MAVIS-1896/MAV-253 is closed"  # FIXME: Update this text when MAVIS-1896/MAV-253 is closed
        else:
            _log_text = "Consent response manually matched with child record"
        self.po.act(locator=self.TXT_SEARCH, action=framework_actions.FILL, value=child_name)
        self.po.act(locator=self.BTN_SEARCH, action=framework_actions.CLICK_BUTTON)
        self.po.act(locator=None, action=framework_actions.WAIT, value=wait_time.MIN)
        self.po.act(locator=child_name, action=framework_actions.CLICK_LINK)
        self.po.act(locator=self.LNK_ACTIVITY_LOG, action=framework_actions.CLICK_TEXT)
        self.po.act(locator=None, action=framework_actions.WAIT, value=wait_time.MIN)
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

    def verify_mav_853(self):
        """
        1. Upload vaccination records for a patient that doesn't contain vaccine information (VACCINE_GIVEN column)
        2. Navigate to the patient, either in a session or from the global children view
        3. Expected: patient details can be seen
        Actual: crash
        """
        self.search_for_a_child(child_name=self.LNK_CHILD_MAV_853)
        self.po.act(locator=self.LNK_CHILD_MAV_853, action=framework_actions.CLICK_LINK)
        # Verify activity log
        self.po.act(locator=self.LNK_ACTIVITY_LOG, action=framework_actions.CLICK_LINK)
        self.po.act(locator=None, action=framework_actions.WAIT, value=wait_time.MIN)
        self.po.verify(
            locator=self.LBL_MAIN,
            property=element_properties.TEXT,
            expected_value="Vaccinated with Gardasil 9",
        )
        # Verify vaccination record
        self.po.act(locator=self.LNK_CHILD_RECORD, action=framework_actions.CLICK_LINK)
        self.po.act(locator=self.LNK_VACCS_DETAILS_MAV_853, action=framework_actions.CLICK_LINK)
        self.po.verify(
            locator=self.LBL_MAIN,
            property=element_properties.TEXT,
            expected_value="Outcome	Vaccinated",
        )
