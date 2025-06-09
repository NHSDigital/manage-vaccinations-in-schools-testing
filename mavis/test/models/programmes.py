import pandas as pd

from mavis.test.models.import_records import ImportRecordsPage

from ..data import TestData
from ..wrappers import get_current_datetime

from ..mavis_constants import (
    ReportFormat,
    Programme,
)
from ..step import step
from playwright.sync_api import Page, expect


class ProgrammesPage:
    def __init__(
        self, page: Page, test_data: TestData, import_records_page: ImportRecordsPage
    ):
        self.test_data = test_data

        self.page = page
        self.import_records_page = import_records_page

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

        self.file_input = page.locator('input[type="file"]')
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
        self.dose2_child_link = page.get_by_role("link", name="DOSE2, Dose2")
        self.mav_854_child_link = page.get_by_role("link", name="MAV_854, MAV_854")
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

    @step("Set input file to {1}")
    def choose_file_child_records(self, file_path: str):
        self.file_input.set_input_files(file_path)

    @step("Click on DOSE2, Dose2")
    def click_dose2_child(self):
        self.dose2_child_link.click()

    @step("Upload cohort {1}")
    def upload_cohorts(self, file_paths: str, wait_long: bool = False):
        _input_file_path, _output_file_path = self.test_data.get_file_paths(
            file_paths=file_paths
        )
        self.click_programme(Programme.HPV)
        self.click_cohorts()
        self.click_import_child_records()
        self.choose_file_child_records(_input_file_path)
        self.import_records_page.record_upload_time()
        self.import_records_page.click_continue()

        if self.import_records_page.is_processing_in_background():
            self.import_records_page.click_uploaded_file_datetime()
            self.import_records_page.wait_for_processed()

        self.import_records_page.verify_upload_output(file_path=_output_file_path)

    @step("Navigate to cohort import for programme {1}")
    def navigate_to_cohort_import(self, programme: Programme):
        self.click_programme(programme)
        self.click_cohorts()
        self.click_import_child_records()

    @step("Edit dose to not given")
    def edit_dose_to_not_given(self):
        self.click_programme(Programme.HPV)
        self.click_vaccinations()
        self.click_dose2_child()
        self.click_edit_vaccination_record()
        self.click_change_outcome()
        self.click_they_refused_it()
        self.click_continue()
        self.click_save_changes()
        expect(self.page.get_by_role("main")).not_to_contain_text(
            "Sorry, there’s a problem with the service"
        )

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

    @step("Click on MAV_854, MAV_854")
    def click_mav_854_child(self):
        self.mav_854_child_link.click()

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

        with self.page.expect_download() as download_info:
            self.continue_button.click()
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
