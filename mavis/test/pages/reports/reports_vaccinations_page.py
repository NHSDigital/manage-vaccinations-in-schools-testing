import os
import re
import time

import requests
from playwright.sync_api import Page, expect

from mavis.test.annotations import step
from mavis.test.mavis_constants import Programme
from mavis.test.pages.header_component import HeaderComponent
from mavis.test.pages.reports.reports_tabs import ReportsTabs


class ReportsVaccinationsPage:
    def __init__(self, page: Page) -> None:
        self.page = page
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

    @step("Click {1}")
    def check_filter_for_programme(self, programme: Programme) -> None:
        self.page.get_by_role("radio", name=programme).check()

    @step("Check cohort has {1} children")
    def check_cohort_has_n_children(self, expected_value_string: str) -> None:
        cohort_heading = self.page.get_by_role("heading", name="Cohort", exact=True)
        cohort_value = cohort_heading.locator("xpath=following-sibling::*[1]")
        if expected_value_string == "1":
            expect(cohort_value).to_contain_text(f"{expected_value_string}child")
        else:
            expect(cohort_value).to_contain_text(f"{expected_value_string}children")

    @step("Check category {1} percentage is {2}%")
    def check_category_percentage(
        self, category: str, expected_percentage_string: str
    ) -> None:
        category_heading = self.page.get_by_role("heading", name=category, exact=True)
        category_value = category_heading.locator("xpath=following-sibling::*[1]")
        expect(category_value).to_contain_text(f"{expected_percentage_string}%")

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
