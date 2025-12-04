from playwright.sync_api import Page, expect

from mavis.test.pages.children.child_record_tabs import ChildRecordTabs
from mavis.test.pages.header_component import HeaderComponent
from mavis.test.utils import reload_until_element_is_visible


class ChildActivityLogPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.tabs = ChildRecordTabs(page)
        self.header = HeaderComponent(page)

        self.manually_matched_card = self.page.get_by_text(
            "Consent response manually matched with child record",
        )

    def check_log_updates_with_match(self) -> None:
        self.page.wait_for_load_state()
        reload_until_element_is_visible(
            self.page,
            self.manually_matched_card,
            seconds=30,
        )

    def verify_activity_log_for_created_or_matched_child(
        self,
    ) -> None:
        self.expect_activity_log_header("Consent given")

        self.check_log_updates_with_match()

    def expect_activity_log_header(self, header: str, *, unique: bool = False) -> None:
        if unique:
            expect(self.page.get_by_role("heading", name=header)).to_be_visible()
        else:
            expect(self.page.get_by_role("heading", name=header).first).to_be_visible()
