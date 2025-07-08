import pandas as pd
from playwright.sync_api import Page, expect
from io import StringIO

from mavis.test.data import TestData
from mavis.test.models import ReportFormat, Programme, Child
from mavis.test.annotations import step
from mavis.test.wrappers import get_current_datetime


class ProgrammesPage:
    def __init__(self, page: Page, test_data: TestData):
        self.test_data = test_data

        self.page = page

        self.programme_links = {
            programme: page.get_by_role("link", name=programme)
            for programme in Programme
        }

        programme_page_links = (
            page.get_by_role("main").get_by_role("listitem").get_by_role("link")
        )
        self.vaccination_link = programme_page_links.get_by_text("Vaccinations")
        self.cohorts_link = programme_page_links.get_by_text("Cohorts")

        self.import_child_records_link = page.get_by_text("Import child records")

        self.continue_button = page.get_by_role("button", name="Continue")
        self.edit_vaccination_record_button = page.get_by_role(
            "button", name="Edit vaccination record"
        )
        self.download_report_button = page.get_by_role(
            "button", name="Download vaccination report"
        )
        self.report_format_radio_buttons = {
            format: page.get_by_role("radio", name=format) for format in ReportFormat
        }
        self.change_outcome_link = page.get_by_role("link", name="Change   outcome")
        self.they_refused_it_radio_button = page.get_by_role(
            "radio", name="They refused it"
        )
        self.save_changes_button = page.get_by_role("button", name="Save changes")
        self.review_link = page.get_by_role("link", name="Review")
        self.use_duplicate_radio_button = page.get_by_role(
            "radio", name="Use duplicate record"
        )
        self.resolve_duplicate_button = page.get_by_role(
            "button", name="Resolve duplicate"
        )
        self.import_processing_started_alert = page.get_by_role(
            "alert", name="Import processing started"
        )

    @step("Click on {1}")
    def click_programme(self, programme: Programme):
        step(f"Click on {programme.value}")
        self.programme_links[programme].click()

    @step("Click on Vaccinations")
    def click_vaccinations(self):
        self.vaccination_link.click()

    @step("Click on Cohorts")
    def click_cohorts(self):
        self.cohorts_link.click()

    @step("Click on Edit vaccination record")
    def click_edit_vaccination_record(self):
        self.edit_vaccination_record_button.click()

    @step("Click on Import child records")
    def click_import_child_records(self):
        self.import_child_records_link.click()

    @step("Click on Continue")
    def click_continue(self):
        self.continue_button.click()

    @step("Click on {1}")
    def click_child(self, child: Child):
        self.page.get_by_role("link", name=str(child)).click()

    def navigate_to_cohort_import(self, programme: Programme):
        self.click_programme(programme)
        self.click_cohorts()
        self.click_import_child_records()

    @step("Click on Save changes")
    def click_save_changes(self):
        self.save_changes_button.click()

    @step("Click on They refused it")
    def click_they_refused_it(self):
        self.they_refused_it_radio_button.click()

    @step("Click on Change outcome")
    def click_change_outcome(self):
        self.change_outcome_link.click()

    @step("Click on Review")
    def click_review(self):
        self.review_link.click()

    @step("Click on Use duplicate record")
    def click_use_duplicate(self):
        self.use_duplicate_radio_button.click()

    @step("Click on Resolve duplicate")
    def click_resolve_duplicate(self):
        self.resolve_duplicate_button.click()

    @step("Click on Download vaccination report")
    def click_download_report(self):
        self.download_report_button.click()

    @step("Click on {1}")
    def click_report_format(self, report_format: ReportFormat):
        self.report_format_radio_buttons[report_format].click()

    @step("Verify report format")
    def verify_report_format(self, programme: Programme, report_format: ReportFormat):
        self.click_programme(programme)
        self.click_download_report()
        self.click_continue()
        self.click_report_format(report_format)
        self._download_and_verify_report_headers(expected_headers=report_format.headers)

    def _download_and_verify_report_headers(self, expected_headers: str):
        _file_path = f"working/rpt_{get_current_datetime()}.csv"

        browser = getattr(self.page.context, "browser", None)
        browser_type_name = getattr(
            getattr(browser, "browser_type", None), "name", None
        )

        # Playwrights webkit browser always opens CSVs in the browser, unlike Chromium and Firefox
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
            assert False, (
                f"The following expected field(s) were not found in the report: {_e_not_a}.  Report contains extra field(s), which were not expected: {_a_not_e}."
            )

    def expect_text(self, text: str):
        expect(self.page.get_by_role("main")).to_contain_text(text)

    def expect_to_not_see_text(self, text: str):
        expect(self.page.get_by_role("main")).not_to_contain_text(text)
