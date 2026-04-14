from io import StringIO

import pandas as pd
from playwright.sync_api import Page

from mavis.test.annotations import step
from mavis.test.constants import Programme, ReportFormat
from mavis.test.pages.header_component import HeaderComponent
from mavis.test.utils import get_current_datetime_compact


class VaccinationReportPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.header = HeaderComponent(page)
        self.download_report_button = page.get_by_role(
            "button",
            name="Download vaccination data",
        )
        self.report_format_radio_buttons = {
            report_format: page.get_by_role("radio", name=report_format, exact=True)
            for report_format in ReportFormat
        }

    @step("Verify report format")
    def verify_report_format(
        self,
        report_format: ReportFormat,
    ) -> None:
        self.click_report_format(report_format)
        df = self.download_report_as_dataframe()
        expected_set = set(report_format.headers.split(","))
        actual_set = set(df.columns)

        if missing := expected_set - actual_set:
            msg = f"Report is missing expected field(s): {missing}"
            raise AssertionError(msg)
        if unexpected := actual_set - expected_set:
            msg = f"Report contains unexpected field(s): {unexpected}"
            raise AssertionError(msg)

    @step("Click on {1}")
    def click_report_format(self, report_format: ReportFormat) -> None:
        self.report_format_radio_buttons[report_format].click()

    def click_download_report(self) -> None:
        self.download_report_button.click()

    def download_report_as_dataframe(self) -> pd.DataFrame:
        """Download the report and return it as a pandas DataFrame."""
        _file_path = f"working/rpt_{get_current_datetime_compact()}.csv"
        browser_type_name = getattr(
            getattr(self.page.context, "browser", None), "browser_type", None
        )

        # Playwright's webkit browser always opens CSVs in the browser
        if getattr(browser_type_name, "name", None) == "webkit":
            self.click_download_report()
            csv_content = self.page.locator("pre").inner_text()
            df = pd.read_csv(StringIO(csv_content))
            self.page.go_back()
        else:
            with self.page.expect_download() as download_info:
                self.click_download_report()
            download = download_info.value
            download.save_as(_file_path)
            df = pd.read_csv(_file_path)

        return df

    def choose_programme(self, programme: Programme) -> None:
        # temp to ensure MMR works as expected
        programme_radio_name = (
            "MMR" if programme is Programme.MMR_MMRV else str(programme)
        )
        self.page.get_by_role("radio", name=programme_radio_name).check()
