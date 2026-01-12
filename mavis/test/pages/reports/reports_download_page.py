from pathlib import Path

import pandas as pd
from playwright.sync_api import Page

from mavis.test.annotations import step
from mavis.test.constants import Programme
from mavis.test.pages.header_component import HeaderComponent
from mavis.test.pages.reports.reports_tabs import ReportsTabs
from mavis.test.utils import (
    get_current_datetime_compact,
)


class ReportsDownloadPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.tabs = ReportsTabs(page)
        self.header = HeaderComponent(page)

        self.continue_button = self.page.get_by_role("button", name="Continue")
        self.download_button = self.page.get_by_role("button", name="Download")

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
