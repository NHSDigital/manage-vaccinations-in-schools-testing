import re

from playwright.sync_api import Page

from mavis.test.annotations import step
from mavis.test.pages.header_component import HeaderComponent
from mavis.test.pages.reports.reports_dashboard_component import (
    ReportsDashboardComponent,
)
from mavis.test.pages.reports.reports_tabs import ReportsTabs


class ReportsConsentPage(ReportsDashboardComponent):
    def __init__(self, page: Page) -> None:
        super().__init__(page)
        self.tabs = ReportsTabs(page)
        self.header = HeaderComponent(page)

    @step("Go to Reports Consent page")
    def navigate(self) -> None:
        self.page.goto("/reports")
        self.tabs.click_consent_tab()

    def get_children_count(self, category: str) -> int:
        category_card = self.page.locator(
            f"//div[@class='nhsuk-card__content'][.//h3[normalize-space()='{category}']]"
        )
        caption_text = category_card.locator(".nhsuk-card__caption").inner_text()

        match = re.search(r"(\d+)", caption_text)
        if match:
            num_children = int(match.group(1))
        else:
            msg = "Number of children not found"
            raise AssertionError(msg)
        return num_children
