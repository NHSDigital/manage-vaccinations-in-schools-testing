from datetime import datetime
from io import StringIO

import pandas as pd
from playwright.sync_api import Page, expect

from mavis.test.annotations import step
from mavis.test.data import TestData
from mavis.test.models import Child, DeliverySite, Programme, ReportFormat
from mavis.test.utils import get_current_datetime_compact


class ProgrammesListPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.current_year_programmes_card = (
            page.get_by_role("heading")
            .filter(has_text="2025 to 2026")
            .locator("xpath=following-sibling::table[1]")
        )

    @step("Click on {1}")
    def click_programme_for_current_year(self, programme: Programme) -> None:
        self.current_year_programmes_card.get_by_role("link", name=programme).click()


class ProgrammeTabsMixin:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.children_tab = page.get_by_label("Secondary menu").get_by_role(
            "link", name="Children"
        )
        self.sessions_tab = page.get_by_label("Secondary menu").get_by_role(
            "link", name="Sessions"
        )

    @step("Click on Children")
    def click_children_tab(self) -> None:
        self.children_tab.click()
        self.children_tab.get_by_role("strong").wait_for()

    @step("Click on Sessions")
    def click_sessions_tab(self) -> None:
        self.sessions_tab.click()
        self.sessions_tab.get_by_role("strong").wait_for()


class ProgrammeOverviewPage(ProgrammeTabsMixin):
    def __init__(self, page: Page, test_data: TestData) -> None:
        super().__init__(page)
        self.page = page
        self.test_data = test_data

        self.review_link = page.get_by_role("link", name="Review")
        self.edit_vaccination_record_button = page.get_by_role(
            "button", name="Edit vaccination record"
        )
        self.change_outcome_link = page.get_by_role("link", name="Change   outcome")
        self.change_site_link = page.get_by_role("link", name="Change   site")
        self.change_time_link = page.get_by_role("link", name="Change   time")
        self.hour_textbox = page.get_by_role("textbox", name="Hour")
        self.minute_textbox = page.get_by_role("textbox", name="Minute")
        self.save_changes_button = page.get_by_role("button", name="Save changes")
        self.they_refused_it_radio_button = page.get_by_role(
            "radio",
            name="They refused it",
        )
        self.download_report_button = page.get_by_role(
            "button",
            name="Download vaccination report",
        )
        self.report_format_radio_buttons = {
            report_format: page.get_by_role("radio", name=report_format)
            for report_format in ReportFormat
        }
        self.continue_button = page.get_by_role("button", name="Continue")

    @step("Click on Edit vaccination record")
    def click_edit_vaccination_record(self) -> None:
        self.edit_vaccination_record_button.click()

    @step("Click on Change site")
    def click_change_site(self) -> None:
        self.change_site_link.click()

    @step("Click on Change time")
    def click_change_time(self) -> None:
        self.change_time_link.click()

    @step("Change time of delivery")
    def change_time_of_delivery(self, new_vaccination_time: datetime) -> None:
        self.hour_textbox.fill(str(new_vaccination_time.hour))
        self.minute_textbox.fill(str(new_vaccination_time.minute))

    @step("Click delivery site {1}")
    def click_delivery_site(self, delivery_site: DeliverySite) -> None:
        self.page.get_by_role("radio", name=str(delivery_site)).click()

    @step("Click on Save changes")
    def click_save_changes(self) -> None:
        self.save_changes_button.click()

    @step("Click on They refused it")
    def click_they_refused_it(self) -> None:
        self.they_refused_it_radio_button.click()

    @step("Click on Change outcome")
    def click_change_outcome(self) -> None:
        self.change_outcome_link.click()

    @step("Click on Review")
    def click_review(self) -> None:
        self.review_link.click()

    @step("Click on Download vaccination report")
    def click_download_report(self) -> None:
        self.download_report_button.click()

    @step("Click on Continue")
    def click_continue(self) -> None:
        self.continue_button.click()

    @step("Click on {1}")
    def click_report_format(self, report_format: ReportFormat) -> None:
        self.report_format_radio_buttons[report_format].click()

    @step("Verify report format")
    def verify_report_format(
        self,
        report_format: ReportFormat,
    ) -> None:
        self.click_download_report()
        self.click_continue()
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
            self.click_continue()
            csv_content = self.page.locator("pre").inner_text()
            _actual_df = pd.read_csv(StringIO(csv_content))
            self.page.go_back()
        else:
            with self.page.expect_download() as download_info:
                self.click_continue()
            download = download_info.value
            download.save_as(_file_path)
            _actual_df = pd.read_csv(_file_path)

        actual_headers = ",".join(_actual_df.columns.tolist())
        _e_not_a = [
            h for h in expected_headers.split(",") if h not in actual_headers.split(",")
        ]
        _a_not_e = [
            h for h in actual_headers.split(",") if h not in expected_headers.split(",")
        ]
        if len(_e_not_a) > 0 or len(_a_not_e) > 0:
            error_message = (
                f"Report is missing expected field(s): {_e_not_a}. "
                f"Report contains unexpected field(s): {_a_not_e}."
            )
            raise AssertionError(error_message)


class ProgrammeSessionsPage(ProgrammeTabsMixin):
    def __init__(self, page: Page) -> None:
        super().__init__(page)


class ProgrammeChildrenPage(ProgrammeTabsMixin):
    def __init__(self, page: Page) -> None:
        super().__init__(page)
        self.import_child_records_link = page.get_by_text("Import child records")
        self.search_textbox = page.get_by_role("textbox", name="Search")
        self.search_button = page.get_by_role("button", name="Search")
        self.continue_button = page.get_by_role("button", name="Continue")
        self.use_duplicate_radio_button = page.get_by_role(
            "radio",
            name="Use duplicate record",
        )
        self.resolve_duplicate_button = page.get_by_role(
            "button",
            name="Resolve duplicate",
        )
        self.import_processing_started_alert = page.get_by_role(
            "alert",
            name="Import processing started",
        )

    @step("Click on Import child records")
    def click_import_child_records(self) -> None:
        self.page.wait_for_load_state()
        self.import_child_records_link.click()

    @step("Click on Continue")
    def click_continue(self) -> None:
        self.continue_button.click()

    @step("Click on {1}")
    def click_child(self, child: Child) -> None:
        self.page.get_by_role("link", name=str(child)).click()

    @step("Click on {1}")
    def search_for_child(self, child: Child) -> None:
        self.search_textbox.fill(str(child))
        self.search_button.click()

    @step("Click on Use duplicate record")
    def click_use_duplicate(self) -> None:
        self.use_duplicate_radio_button.click()

    @step("Click on Resolve duplicate")
    def click_resolve_duplicate(self) -> None:
        self.resolve_duplicate_button.click()

    def expect_alert_text(self, text: str) -> None:
        expect(self.page.get_by_role("alert")).to_contain_text(text)
