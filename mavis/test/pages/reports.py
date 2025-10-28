from pathlib import Path

import pandas as pd
from playwright.sync_api import Page, expect

from mavis.test.annotations import step
from mavis.test.models import Programme
from mavis.test.utils import get_current_datetime_compact


class ReportsTabsMixin:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.vaccinations_tab = page.get_by_label("Secondary menu").get_by_role(
            "link", name="Vaccinations"
        )
        self.download_data_tab = page.get_by_label("Secondary menu").get_by_role(
            "link", name="Download Data"
        )

    @step("Click on Vaccinations tab")
    def click_vaccinations_tab(self) -> None:
        self.vaccinations_tab.click()
        self.vaccinations_tab.get_by_role("strong").wait_for()

    @step("Click on Download Data tab")
    def click_download_data_tab(self) -> None:
        self.download_data_tab.click()
        self.download_data_tab.get_by_role("strong").wait_for()


class ReportsVaccinationsPage(ReportsTabsMixin):
    def __init__(self, page: Page) -> None:
        super().__init__(page)

    @step("Go to Reports page")
    def navigate(self) -> None:
        self.page.goto("/reports")

    @step("Navigate to and refresh Reports")
    def navigate_and_refresh_reports(self) -> None:
        self.page.goto("/api/testing/refresh-reporting")

    @step("Click {1}")
    def check_filter_for_programme(self, programme: Programme) -> None:
        self.page.get_by_role("radio", name=programme).check()

    def check_cohort_has_n_children(self, expected_value: int) -> None:
        cohort_heading = self.page.get_by_role("heading", name="Cohort")
        cohort_value = cohort_heading.locator("xpath=following-sibling::div[1]")
        expect(cohort_value).to_have_text(f"{expected_value}children")

    def check_category_percentage(
        self, category: str, expected_percentage: float
    ) -> None:
        category_heading = self.page.get_by_role("heading", name=category)
        category_value = category_heading.locator("xpath=following-sibling::div[1]")
        expect(category_value).to_have_text(f"{expected_percentage}%")


class ReportsDownloadPage(ReportsTabsMixin):
    def __init__(self, page: Page) -> None:
        super().__init__(page)
        self.aggregate_data_radio = self.page.get_by_role(
            "radio", name="Aggregate vaccination data"
        )
        self.continue_button = self.page.get_by_role("button", name="Continue")
        self.download_button = self.page.get_by_role("button", name="Download report")

    @step("Check Aggregate vaccination data radio")
    def check_aggregate_data_radio(self) -> None:
        self.aggregate_data_radio.check()

    @step("Click Continue")
    def click_continue(self) -> None:
        self.continue_button.click()

    @step("Click Download button")
    def click_download_button(self) -> None:
        self.download_button.click()

    def download_and_get_dataframe(self) -> pd.DataFrame:
        _file_path = Path(f"working/excel_{get_current_datetime_compact()}.csv")

        with self.page.expect_download() as download_info:
            self.click_download_button()
            download = download_info.value
            download.save_as(_file_path)
        return pd.read_csv(_file_path)

    def check_vaccinated_values(
        self,
        df: pd.DataFrame,
        expected_cohort: int,
        expected_vaccinated: int,
        expected_not_vaccinated: int,
    ) -> None:
        assert df["Cohort"].iloc[0] == expected_cohort
        assert df["Vaccinated"].iloc[0] == expected_vaccinated
        assert df["Not Vaccinated"].iloc[0] == expected_not_vaccinated

    def check_report_headers(
        self, df: pd.DataFrame, expected_headers: list[str]
    ) -> None:
        actual_headers = df.columns.tolist()
        assert actual_headers == expected_headers, (
            f"Headers mismatch: {actual_headers} != {expected_headers}"
        )

    @step("Choose programme {1}")
    def choose_programme(self, programme: Programme) -> None:
        self.page.get_by_role("radio", name=programme).check()

    @step("Check variable {1}")
    def choose_variable(self, variable: str) -> None:
        self.page.get_by_role("checkbox", name=variable).check()
