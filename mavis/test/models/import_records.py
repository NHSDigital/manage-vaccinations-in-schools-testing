from datetime import datetime, timedelta
import time
from typing import Optional

from ..step import step
from playwright.sync_api import Page, expect

from ..data import TestData
from ..mavis_constants import mavis_file_types
from ..wrappers import format_datetime_for_upload_link


class ImportRecordsPage:
    def __init__(
        self,
        test_data: TestData,
        page: Page,
    ):
        self.test_data = test_data
        self.page = page

        self.alert_success = self.page.get_by_text("Import processing started")
        self.completed_tag = self.page.get_by_role("strong").get_by_text("Completed")
        self.invalid_tag = self.page.get_by_role("strong").get_by_text("Invalid")
        self.import_records_link = self.page.get_by_role("link", name="Import records")
        self.import_class_lists_link = self.page.get_by_role(
            "link", name="Import class lists"
        )
        self.child_records_radio_button = self.page.get_by_role(
            "radio", name="Child records"
        )
        self.class_list_records_radio_button = self.page.get_by_role(
            "radio", name="Class list records"
        )
        self.vaccination_records_radio_button = self.page.get_by_role(
            "radio", name="Vaccination records"
        )
        self.continue_button = self.page.get_by_role("button", name="Continue")
        self.file_input = self.page.locator('input[type="file"]')
        self.location_combobox = self.page.get_by_role("combobox")

    @step("Click on Import Records")
    def click_import_records(self):
        self.import_records_link.click()

    @step("Click on Import class lists")
    def click_import_class_lists(self):
        self.import_class_lists_link.click()

    @step("Select Child Records")
    def select_child_records(self):
        self.child_records_radio_button.click()

    @step("Select Class List Records")
    def select_class_list_records(self):
        self.class_list_records_radio_button.click()

    @step("Select Vaccination Records")
    def select_vaccination_records(self):
        self.vaccination_records_radio_button.click()

    @step("Click Continue")
    def click_continue(self):
        self.continue_button.click()

    @step("Set input file to {1}")
    def set_input_file(self, file_path: str):
        self.file_input.set_input_files(file_path)

    @step("Fill location combobox with {1}")
    def fill_location(self, location: str):
        self.location_combobox.fill(location)

    def is_processing_in_background(self):
        self.page.wait_for_load_state()
        return self.alert_success.is_visible()

    def wait_for_processed(self):
        self.page.wait_for_load_state()

        # Wait up to 10 seconds for file to be processed.

        tag = self.completed_tag.or_(self.invalid_tag)

        for i in range(20):
            if tag.is_visible():
                break

            time.sleep(0.5)

            self.page.reload()
        else:
            expect(tag).to_be_visible()

    def import_child_records(self, file_paths: str):
        _input_file_path, _output_file_path = self.test_data.get_file_paths(
            file_paths=file_paths
        )
        self.click_import_records()
        self.select_child_records()
        self.click_continue()
        self.upload_and_verify_output(_input_file_path, _output_file_path)
        return _input_file_path, _output_file_path

    def import_class_list_records(
        self,
        location: str,
        file_paths: str,
        year_groups: Optional[list[int]] = None,
    ):
        if year_groups is None:
            year_groups = [8, 9, 10, 11]

        _input_file_path, _output_file_path = self.test_data.get_file_paths(
            file_paths=file_paths
        )
        self.click_import_records()
        self.select_class_list_records()
        self.click_continue()

        self.page.wait_for_load_state()

        self.fill_location(location)
        self.page.get_by_role("option", name=str(location)).click()

        self.click_continue()
        self._select_year_groups(*year_groups)
        self.upload_and_verify_output(_input_file_path, _output_file_path)
        return _input_file_path, _output_file_path

    def import_class_list_records_from_school_session(self, file_paths: str):
        _input_file_path, _output_file_path = self.test_data.get_file_paths(
            file_paths=file_paths
        )
        self.click_import_class_lists()
        self._select_year_groups(8, 9, 10, 11)
        self.upload_and_verify_output(_input_file_path, _output_file_path)
        return _input_file_path, _output_file_path

    def navigate_to_vaccination_records_import(self):
        self.click_import_records()
        self.select_vaccination_records()
        self.click_continue()

    def upload_and_verify_output(
        self, file_paths: str, session_id: Optional[str] = None
    ):
        _input_file_path, _output_file_path = self.test_data.get_file_paths(
            file_paths=file_paths, session_id=session_id
        )
        self.set_input_file(_input_file_path)
        self.record_upload_time()
        self.click_continue()

        if self.is_processing_in_background():
            self.click_uploaded_file_datetime()
            self.wait_for_processed()

        self.verify_upload_output(file_path=_output_file_path)
        return _input_file_path, _output_file_path

    def record_upload_time(self):
        self.upload_time = datetime.now()

    @step("Click link with uploaded datetime")
    def click_uploaded_file_datetime(self):
        # FIXME: This logic is duplicated in three places, we should extract it somewhere else.
        first_link = self.page.get_by_role(
            "link", name=format_datetime_for_upload_link(self.upload_time)
        )
        second_link = self.page.get_by_role(
            "link",
            name=format_datetime_for_upload_link(
                self.upload_time + timedelta(minutes=1)
            ),
        )

        # This handles when an upload occurs across the minute tick over, for
        # example the file is uploaded at 10:00:59 but finishes at 10:01:01.
        first_link.or_(second_link).first.click()

    def verify_upload_output(self, file_path: str):
        _expected_errors = self.test_data.get_expected_errors(file_path=file_path)
        if _expected_errors is not None:
            for _msg in _expected_errors:
                if _msg.startswith("!"):
                    expect(self.page.get_by_role("main")).not_to_contain_text(_msg[1:])
                else:
                    expect(self.page.get_by_role("main")).to_contain_text(_msg)

    def _select_year_groups(self, *year_groups: int) -> None:
        for year_group in year_groups:
            self.page.get_by_label(f"Year {year_group}").check()
        self.click_continue()
