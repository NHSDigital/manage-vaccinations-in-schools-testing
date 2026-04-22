import re

from playwright.sync_api import Page, expect

from mavis.test.annotations import step
from mavis.test.pages.header_component import HeaderComponent
from mavis.test.utils import deliberate_sleep


class CareplusReportsPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.header = HeaderComponent(page)
        self.main_content = self.page.get_by_role("main")
        self.report_rows = self.main_content.locator("table tbody tr")
        self.report_links = self.main_content.locator(
            "a[href$='.csv'], a[href*='/careplus-reports/'], a[href*='careplus']"
        )
        self.empty_state = self.main_content.get_by_text(
            re.compile(
                r"no careplus reports|there are no reports|no reports", re.IGNORECASE
            )
        )

    @step("Go to CarePlus reports page")
    def navigate(self) -> None:
        self.page.goto("/careplus-reports")
        expect(self.page).to_have_url(re.compile(r".*/careplus-reports(?:\?.*)?$"))

    def _report_count(self) -> int:
        return max(self.report_rows.count(), self.report_links.count())

    @step("Check at least one CarePlus report is available")
    def expect_at_least_one_report(self, timeout_seconds: int = 60) -> None:
        for _ in range(timeout_seconds * 2):
            if self._report_count() > 0:
                return

            deliberate_sleep(0.5, "waiting for CarePlus reports to appear")
            self.page.reload()

        if self.empty_state.is_visible():
            expect(self.empty_state).not_to_be_visible()

        report_count = self._report_count()
        assert report_count > 0, "Expected at least one CarePlus report to be listed"
