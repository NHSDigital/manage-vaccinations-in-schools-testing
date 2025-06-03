from datetime import datetime, timedelta
import time
from typing import Optional

from ..step import step
from playwright.sync_api import Page, expect

from ..data import TestData
from ..mavis_constants import mavis_file_types
from ..wrappers import format_datetime_for_upload_link

from .children import ChildrenPage


class ImportRecordsPage:
    def __init__(
        self,
        test_data: TestData,
        page: Page,
        children_page: ChildrenPage,
    ):
        self.test_data = test_data
        self.page = page
        self.children_page = children_page

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

    @step("Set input file to {0}")
    def set_input_file(self, file_path: str):
        self.file_input.set_input_files(file_path)

    @step("Fill location combobox with {0}")
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

    def import_child_records(
        self, file_paths: str, verify_on_children_page: bool = False
    ):
        _input_file_path, _output_file_path = self.test_data.get_file_paths(
            file_paths=file_paths
        )
        self.click_import_records()
        self.select_child_records()
        self.click_continue()
        self._upload_and_verify_output(_input_file_path, _output_file_path)
        if verify_on_children_page:
            _cl = self.test_data.create_child_list_from_file(
                file_path=_input_file_path, file_type=mavis_file_types.CHILD_LIST
            )
            self.children_page.verify_child_has_been_uploaded(child_list=_cl)

    def import_class_list_records(
        self,
        location: str,
        file_paths: str,
        year_groups: Optional[list[int]] = None,
        verify_on_children_page: bool = False,
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
        self._upload_and_verify_output(_input_file_path, _output_file_path)

        if verify_on_children_page:
            _cl = self.test_data.create_child_list_from_file(
                file_path=_input_file_path, file_type=mavis_file_types.CHILD_LIST
            )
            self.children_page.verify_child_has_been_uploaded(child_list=_cl)

    def import_class_list_records_from_school_session(self, file_paths: str):
        _input_file_path, _output_file_path = self.test_data.get_file_paths(
            file_paths=file_paths
        )
        self.click_import_class_lists()
        self._select_year_groups(8, 9, 10, 11)
        self._upload_and_verify_output(_input_file_path, _output_file_path)

    def import_vaccination_records(
        self,
        file_paths: str,
        file_type: mavis_file_types = mavis_file_types.VACCS_MAVIS,
        verify_on_children_page: bool = False,
        session_id: Optional[str] = None,
    ):
        _input_file_path, _output_file_path = self.test_data.get_file_paths(
            file_paths=file_paths, session_id=session_id
        )
        self.click_import_records()
        self.select_vaccination_records()
        self.click_continue()
        self._upload_and_verify_output(_input_file_path, _output_file_path)

        if verify_on_children_page:
            _cl = self.test_data.create_child_list_from_file(
                file_path=_input_file_path, file_type=file_type
            )
            self.children_page.verify_child_has_been_uploaded(child_list=_cl)

    def _upload_and_verify_output(self, _input_file_path, _output_file_path):
        self.set_input_file(file_path=_input_file_path)
        self._record_upload_time()
        self.click_continue()

        if self.is_processing_in_background():
            self._click_uploaded_file_datetime()
            self.wait_for_processed()

        self._verify_upload_output(file_path=_output_file_path)

    def _record_upload_time(self):
        self.upload_time = datetime.now()

    @step("Click link with uploaded datetime")
    def _click_uploaded_file_datetime(self):
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

    def _verify_upload_output(self, file_path: str):
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
