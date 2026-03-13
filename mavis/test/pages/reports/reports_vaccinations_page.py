import os
import re
import time

import requests
from playwright.sync_api import Page

from mavis.test.annotations import step
from mavis.test.pages.header_component import HeaderComponent
from mavis.test.pages.reports.reports_dashboard_component import (
    ReportsDashboardComponent,
)
from mavis.test.pages.reports.reports_tabs import ReportsTabs


class ReportsVaccinationsPage(ReportsDashboardComponent):
    def __init__(self, page: Page) -> None:
        super().__init__(page)
        self.tabs = ReportsTabs(page)
        self.header = HeaderComponent(page)

        self.cohort_heading = self.page.get_by_role(
            "heading", name="Cohort", exact=True
        )
        self.cohort_value = self.cohort_heading.locator("xpath=following-sibling::*[1]")

    @step("Go to Reports page")
    def navigate(self) -> None:
        self.page.goto("/reports")

    @step("Navigate to and refresh Reports")
    def navigate_and_refresh_reports(self) -> None:
        self.navigate()
        base_url = os.getenv("BASE_URL", "PROVIDEURL")
        refresh_reports_url = f"{base_url}/api/testing/refresh-reporting"
        response = requests.get(refresh_reports_url, timeout=30)
        response.raise_for_status()

        time.sleep(5)
        self.page.reload()

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

    def get_expected_cohort_and_percentage_strings(
        self, unvaccinated_count: int, vaccinated_count: int
    ) -> tuple[str, str, str]:
        one_hundred_percent = 100.0
        total = unvaccinated_count + vaccinated_count
        if total == 0:
            return "0", "0", "0"
        unvaccinated_pct = round(100 * unvaccinated_count / total, 1)
        vaccinated_pct = round(100 * vaccinated_count / total, 1)
        if unvaccinated_pct == one_hundred_percent:
            unvaccinated_pct = int(unvaccinated_pct)
        if vaccinated_pct == one_hundred_percent:
            vaccinated_pct = int(vaccinated_pct)
        return str(total), str(unvaccinated_pct), str(vaccinated_pct)

    @step("Get monthly vaccination counts")
    def get_monthly_vaccinations(self) -> dict[str, int]:
        table = self.page.locator("table").filter(
            has=self.page.get_by_role("columnheader", name="Month")
        )
        rows = table.locator("tbody tr")
        result = {}
        for row in rows.all():
            cells = row.locator("td")
            month = cells.nth(0).inner_text()
            count = int(cells.nth(1).inner_text().replace(",", ""))
            result[month] = count
        return result
