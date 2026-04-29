import os

import httpx
from playwright.sync_api import Page

from mavis.test.annotations import step
from mavis.test.constants import Programme
from mavis.test.pages.dashboard_page import DashboardPage
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

    @step("Verify consent reporting for {1}")
    def verify_consent_reporting(
        self,
        programme: Programme,
        expected_percentages: dict[str, str],
        *,
        navigate_from_dashboard: bool = True,
    ) -> None:
        """Verify consent reporting percentages for a programme.

        Args:
            programme: The programme to verify reporting for
            expected_percentages: Dict mapping category names to
                expected percentage strings
            navigate_from_dashboard: Whether to navigate from dashboard
                (default: True)
        """
        if navigate_from_dashboard:
            DashboardPage(self.page).navigate()
            self.navigate()

        # Refresh reporting data
        base_url = os.getenv("BASE_URL", "PROVIDEURL")
        refresh_reports_url = f"{base_url}/api/testing/refresh-reporting?wait=true"
        response = httpx.get(refresh_reports_url, timeout=60)
        response.raise_for_status()

        self.check_filter_for_programme(programme)

        # Check the percentages
        for category, percentage in expected_percentages.items():
            self.check_category_percentage(category, percentage)
