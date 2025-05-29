from typing import Final

import pandas as pd

from mavis.test import school

from ..mavis_constants import (
    ReportFormat,
    test_data_file_paths,
    Programme,
)
from ..playwright_ops import PlaywrightOperations
from ..step import step
from playwright.sync_api import Page, expect

from ..data  import TestData
from ..wrappers import get_current_datetime, get_link_formatted_date_time

from .children import ChildrenPage
from .consent import ConsentPage
from .dashboard import DashboardPage
from .import_records import ImportRecordsPage
from .sessions import SessionsPage


class ProgrammesPage:

    LNK_MAV_965_CHILD: Final[str] = "MAV_965, MAV_965"
    LNK_MAV_909_CHILD: Final[str] = "MAV_909, MAV_909"

    def __init__(
        self,
        page: Page,
        playwright_operations: PlaywrightOperations,
        test_data: TestData,
        dashboard_page: DashboardPage,
    ):
        self.test_data = test_data

        self.page = page
        self.dashboard_page = dashboard_page
        self.sessions_page = SessionsPage(
            test_data, playwright_operations, dashboard_page
        )
        self.children_page = ChildrenPage(playwright_operations, dashboard_page)
        self.consent_page = ConsentPage(playwright_operations)
        self.import_records_page = ImportRecordsPage(
            test_data, playwright_operations, dashboard_page
        )

        self.programme_links = {
            programme: page.get_by_role("link", name=programme) for programme in Programme
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

    @step("Click on {0}")
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

    @step("Set input file to {0}")
    def choose_file_child_records(self, file_path: str):
        self.file_input.set_input_files(file_path)

    @step("Click on {0}")
    def click_uploaded_file_datetime(self, datetime: str, truncated: bool = False):
        _link_time = datetime[3:] if truncated else datetime

        uploaded_file_link = self.page.get_by_role("link", name=_link_time)
        uploaded_file_link.click()

    @step("Click on DOSE2, Dose2")
    def click_dose2_child(self):
        self.dose2_child_link.click()

    @step("Verify that all expected errors are shown for file {0}")
    def verify_upload_output(self, file_path: str):
        _expected_errors = self.test_data.get_expected_errors(file_path=file_path)
        if _expected_errors is not None:
            for _msg in _expected_errors:
                expect(self.page.get_by_role("main")).to_contain_text(_msg)

    @step("Upload cohort {0}")
    def upload_cohorts(self, file_paths: str, wait_long: bool = False):
        _input_file_path, _output_file_path = self.test_data.get_file_paths(
            file_paths=file_paths
        )
        self.click_programme(Programme.HPV)
        self.click_cohorts()
        self.click_import_child_records()
        self.choose_file_child_records(file_path=_input_file_path)
        self.click_continue()
        recorded_file_upload_time = get_link_formatted_date_time()

        if self.import_records_page.is_processing_in_background():
            self.page.wait_for_timeout(10 * 1000)  # 10 seconds in milliseconds
            self.click_uploaded_file_datetime(recorded_file_upload_time)

        self.verify_upload_output(file_path=_output_file_path)

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

    @step("Click on {0}")
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

    def verify_mav_854(self, schools, clinics):
        """
        1. Find a child who is in an HPV school session
        2. Ensure there is a clinic session date for today
        3. Navigate to the clinic, find the child, record a vaccination against that child
        4. Navigate to that child's school
        5. Download offline spreadsheet
        6. Expected: offline spreadsheet downloaded
        Actual: crash
        """
        self.children_page.search_for_a_child(child_name="MAV_854, MAV_854")
        self.click_mav_854_child()
        self.sessions_page.click_location(clinics)
        self.sessions_page._vaccinate_child_mav_854(clinics[0])
        self.dashboard_page.click_mavis()
        self.dashboard_page.click_sessions()
        self.sessions_page.click_scheduled()
        self.sessions_page.click_location(schools[0])
        assert self.sessions_page.get_session_id_from_offline_excel()

    def verify_mav_965(self, location: str):
        """
        Steps to reproduce:
        Patient setup: in a school session today, marked as attending, session has HPV and doubles, patients is eligible for all vaccines (has consent, correct year group, no history)
        Complete pre-screening questions and vaccinate the patient for any one vaccine (eg. HPV)
        Testing has confirmed the following:
        Two vaccinations in same session
        - If HPV is followed by MenACWY then "feeling well" is pre-filled
        - If HPV is followed by Td/IPV  then both "feeling well" and "not pregnant" are pre-populated
        - If MenACWY followed by Td/IPV then "feeling well" is pre-filled
        - If MenCAWY followed by HPV then "feeling well" is pre-filled
        - If Td/IPV followed by MenACWY  then "feeling well" is pre-filled
        - If Td/IPV is followed by HPV  then both "feeling well" and "not pregnant" are pre-populated
        """
        self.dashboard_page.click_mavis()
        self.dashboard_page.click_sessions()
        self.sessions_page.click_location(location)
        self.sessions_page.click_consent_tab()
        self.sessions_page.search_child(child_name=self.LNK_MAV_965_CHILD)
        self.sessions_page.click_programme_tab(Programme.HPV)
        self.sessions_page.click_get_consent_response()
        self.consent_page.parent_1_verbal_positive(change_phone=False)
        self.sessions_page.search_child(child_name=self.LNK_MAV_965_CHILD)
        self.sessions_page.click_programme_tab(Programme.MENACWY)
        self.sessions_page.click_get_consent_response()
        self.consent_page.parent_1_verbal_positive(
            change_phone=False, programme=Programme.MENACWY
        )
        self.sessions_page.search_child(child_name=self.LNK_MAV_965_CHILD)
        self.sessions_page.click_programme_tab(Programme.TD_IPV)
        self.sessions_page.click_get_consent_response()
        self.consent_page.parent_1_verbal_positive(
            change_phone=False, programme=Programme.TD_IPV
        )
        self.sessions_page.register_child_as_attending(
            child_name=self.LNK_MAV_965_CHILD
        )
        self.sessions_page.record_vaccs_for_child(
            child_name=self.LNK_MAV_965_CHILD, programme=Programme.HPV
        )
        self.sessions_page.record_vaccs_for_child(
            child_name=self.LNK_MAV_965_CHILD, programme=Programme.MENACWY
        )
        self.sessions_page.record_vaccs_for_child(
            child_name=self.LNK_MAV_965_CHILD, programme=Programme.TD_IPV
        )

    def verify_mav_909(self):
        """
        Steps to reproduce:
        Find a patient in Year 8 and remove them from cohort using the button
        Upload a cohort list with their first name, surname, URN, date of birth and postcode

        Scenario 1
            Duplicate review is not flagged

            Expected result:
            The child is added back into the cohort, and in all the relevant sessions
            Actual Result:
            Server error page and user cannot bring the child back into the cohort

        Scenario 2
            The import screen flags for duplicate review, and user clicks "Review" next to the child's name

            Expected result:
            System allows you to review the new details against the previous record (before removing from cohort) and lets you choose which record to keep. Once review confirmed, the child is added back into the cohort, and in all the relevant sessions.
            Actual Result:
            Server error page and user cannot bring the child back into the cohort
        """
        self.dashboard_page.click_mavis()
        self.dashboard_page.click_children()
        self.children_page.remove_child_from_cohort(child_name=self.LNK_MAV_909_CHILD)
        self.dashboard_page.click_mavis()
        self.dashboard_page.click_programmes()
        self.upload_cohorts(file_paths=test_data_file_paths.COHORTS_MAV_909)
        expect(self.page.get_by_role("main")).to_contain_text(
            "1 duplicate record needs review"
        )
        self.click_review()
        self.click_use_duplicate()
        self.click_resolve_duplicate()
        expect(self.page.get_by_role("main")).to_contain_text("Record updated")