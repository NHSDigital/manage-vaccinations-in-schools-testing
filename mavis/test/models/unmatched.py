from typing import Final

from ..generic_constants import actions, properties, wait_time
from ..playwright_ops import PlaywrightOperations

from .children import ChildrenPage
from .dashboard import DashboardPage


class UnmatchedPage:
    LBL_MAIN: Final[str] = "main"
    LBL_PARAGRAPH: Final[str] = "paragraph"
    LBL_ARCHIVE_SUCCESS_MESSAGE: Final[str] = (
        "Consent response from Parent Full archived"
    )
    LBL_CREATE_SUCCESS_MESSAGE: Final[str] = (
        "’s record created from a consent response from Parent Full"
    )
    LNK_MATCH: Final[str] = "Match"
    LNK_ARCHIVE_RECORD: Final[str] = "Archive"
    LNK_CREATE_RECORD: Final[str] = "Create new record"
    LNK_PARENT_NAME: Final[str] = "Parent Full (Dad)"
    TXT_NOTES: Final[str] = "Notes"
    BTN_CREATE_RECORD_FROM: Final[str] = "Create a new record from"
    BTN_ARCHIVE_RESPONSE: Final[str] = "Archive response"
    TBL_CHILDREN: Final[str] = "table"
    LBL_RESPONSE_COL: Final[str] = "Response"
    TXT_SEARCH: Final[str] = "Search"
    BTN_SEARCH: Final[str] = "Search"
    LNK_SELECT_FILTERED_CHILD: Final[str] = "Select"
    BTN_LINK_RESPONSE_WITH_RECORD: Final[str] = "Link response with record"

    def __init__(
        self, playwright_operations: PlaywrightOperations, dashboard_page: DashboardPage
    ):
        self.po = playwright_operations
        self.dashboard_page = dashboard_page
        self.children_page = ChildrenPage(playwright_operations, dashboard_page)

    def _get_child_full_name(self, first_name: str, last_name: str) -> str:
        return f"{last_name.upper()}, {first_name}"

    def match_with_record(self, location: str, first_name: str, last_name: str):
        full_name = self._get_child_full_name(first_name, last_name)

        _row_num, _ = self.po.get_table_cell_location_for_value(
            table_locator=self.TBL_CHILDREN,
            col_header=self.LBL_RESPONSE_COL,
            row_value=full_name,
        )
        self.po.act(locator=self.LNK_MATCH, action=actions.CLICK_LINK, index=_row_num)
        self.po.act(
            locator=self.TXT_SEARCH,
            action=actions.FILL,
            value=full_name,
        )
        self.po.act(locator=self.BTN_SEARCH, action=actions.CLICK_BUTTON)
        self.po.act(locator=None, action=actions.WAIT, value=wait_time.MIN)
        self.po.act(locator=full_name, action=actions.CLICK_LINK, index=0)
        self.po.act(
            locator=self.BTN_LINK_RESPONSE_WITH_RECORD, action=actions.CLICK_BUTTON
        )
        self.po.verify(
            locator=self.LBL_PARAGRAPH,
            property=properties.TEXT,
            expected_value=f"Consent matched for {full_name}",
        )
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value="There are currently no unmatched consent responses.",
        )
        self.dashboard_page.click_mavis()
        self.dashboard_page.click_children()
        self.children_page.verify_activity_log_for_created_or_matched_child(
            full_name, location, is_created=False
        )

    def archive_record(self, first_name: str, last_name: str):
        full_name = self._get_child_full_name(first_name, last_name)

        _row_num, _ = self.po.get_table_cell_location_for_value(
            table_locator=self.TBL_CHILDREN,
            col_header=self.LBL_RESPONSE_COL,
            row_value=full_name,
        )
        self.po.act(
            locator=self.LNK_ARCHIVE_RECORD,
            action=actions.CLICK_LINK,
            index=(_row_num - 1),
        )
        self.po.act(locator=self.TXT_NOTES, action=actions.FILL, value="Archiving")
        self.po.act(locator=self.BTN_ARCHIVE_RESPONSE, action=actions.CLICK_BUTTON)
        self.po.verify(
            locator=self.LBL_PARAGRAPH,
            property=properties.TEXT,
            expected_value=self.LBL_ARCHIVE_SUCCESS_MESSAGE,
        )
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value="There are currently no unmatched consent responses.",
            exact=False,
        )

    def create_record(self, location: str, first_name: str, last_name: str):
        full_name = self._get_child_full_name(first_name, last_name)

        _row_num, _ = self.po.get_table_cell_location_for_value(
            table_locator=self.TBL_CHILDREN,
            col_header=self.LBL_RESPONSE_COL,
            row_value=full_name,
        )
        self.po.act(
            locator=self.LNK_PARENT_NAME,
            action=actions.CLICK_LINK,
            index=(_row_num - 1),
        )
        self.po.act(locator=self.LNK_CREATE_RECORD, action=actions.CLICK_LINK)
        self.po.act(locator=self.BTN_CREATE_RECORD_FROM, action=actions.CLICK_BUTTON)
        self.po.verify(
            locator=self.LBL_PARAGRAPH,
            property=properties.TEXT,
            expected_value=self.LBL_CREATE_SUCCESS_MESSAGE,
        )
        self.dashboard_page.click_mavis()
        self.dashboard_page.click_children()
        self.children_page.verify_activity_log_for_created_or_matched_child(
            full_name, location, is_created=True
        )

    def create_record_with_no_nhs_number(
        self, location: str, first_name: str, last_name: str
    ):
        full_name = self._get_child_full_name(first_name, last_name)

        _row_num, _ = self.po.get_table_cell_location_for_value(
            table_locator=self.TBL_CHILDREN,
            col_header=self.LBL_RESPONSE_COL,
            row_value=full_name,
        )
        self.po.act(
            locator=self.LNK_PARENT_NAME,
            action=actions.CLICK_LINK,
            index=(_row_num - 1),
        )
        self.po.act(locator=self.LNK_CREATE_RECORD, action=actions.CLICK_LINK)
        self.po.act(locator=self.BTN_CREATE_RECORD_FROM, action=actions.CLICK_BUTTON)
        self.po.verify(
            locator=self.LBL_PARAGRAPH,
            property=properties.TEXT,
            expected_value=self.LBL_CREATE_SUCCESS_MESSAGE,
        )
        self.dashboard_page.click_mavis()
        self.dashboard_page.click_children()
        self.children_page.verify_activity_log_for_created_or_matched_child(
            full_name, location, is_created=True
        )
