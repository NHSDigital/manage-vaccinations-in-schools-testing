from io import StringIO

import pandas as pd
from playwright.sync_api import Page
from playwright.sync_api import TimeoutError as PlaywrightTimeoutError

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
        self._download_and_verify_report_headers(expected_headers=report_format.headers)

    def _download_and_verify_report_headers(self, expected_headers: str) -> None:
        _file_path = f"working/rpt_{get_current_datetime_compact()}.csv"

        browser = getattr(self.page.context, "browser", None)
        browser_type_name = getattr(
            getattr(browser, "browser_type", None), "name", None
        )

        # Playwright's webkit browser always opens CSVs in the browser
        # unlike Chromium and Firefox
        if browser_type_name == "webkit":
            # WebKit may open CSV in same page or new popup
            # Try to handle both cases
            with self.page.context.expect_page() as new_page_info:
                self.click_download_report()

            # Check if a new page was opened
            try:
                new_page = new_page_info.value
                # CSV opened in new page/tab
                new_page.wait_for_load_state("load", timeout=30000)
                pre_element = new_page.locator("pre")
                pre_element.wait_for(state="visible", timeout=10000)
                csv_content = pre_element.inner_text()
                new_page.close()
            except (PlaywrightTimeoutError, AttributeError):
                # CSV opened in current page (or new_page_info.value failed)
                self.page.wait_for_load_state("load", timeout=30000)
                pre_element = self.page.locator("pre")
                pre_element.wait_for(state="visible", timeout=10000)
                csv_content = pre_element.inner_text()
                self.page.go_back()

            _actual_df = pd.read_csv(StringIO(csv_content))
        else:
            with self.page.expect_download() as download_info:
                self.click_download_report()
            download = download_info.value
            download.save_as(_file_path)
            _actual_df = pd.read_csv(_file_path)

        expected_set = set(expected_headers.split(","))
        actual_set = set(_actual_df.columns)

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

    def choose_programme(self, programme: Programme) -> None:
        # temp to ensure MMR works as expected
        programme_radio_name = "MMR" if programme is Programme.MMR else str(programme)
        self.page.get_by_role("radio", name=programme_radio_name).check()
