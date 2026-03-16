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
