from datetime import datetime, timedelta
import time
from typing import Final, Optional

from playwright.sync_api import expect

from ..data import TestData
from ..generic_constants import actions, escape_characters, properties
from ..mavis_constants import mavis_file_types
from ..playwright_ops import PlaywrightOperations
from ..wrappers import format_datetime_for_upload_link

from .children import ChildrenPage
from .dashboard import DashboardPage


class ImportRecordsPage:
    LNK_CHILD_MAV_855: Final[str] = "MAV_855, MAV_855"
    LNK_IMPORT_RECORDS: Final[str] = "Import records"
    RDO_CHILD_RECORDS: Final[str] = "Child records"
    RDO_CLASS_LIST_RECORDS: Final[str] = "Class list records"
    RDO_VACCINATION_RECORDS: Final[str] = "Vaccination records"
    BTN_CONTINUE: Final[str] = "Continue"
    LBL_CHILD_RECORDS: Final[str] = "Upload file"
    LBL_CLASS_LIST_RECORDS: Final[str] = "Upload file"
    LBL_VACCINATION_RECORDS: Final[str] = "Upload file"
    LBL_CLASS_LIST_RECORDS_FOR_SCHOOL1: Final[str] = "Upload file"
    LBL_SCHOOL_NAME: Final[str] = "Which school is this class"
    LBL_HPV_VACCINE_NAME: Final[str] = "Gardasil 9 (HPV)"
    LBL_MAIN: Final[str] = "main"
    LNK_IMPORT_CLASS_LIST_RECORDS: Final[str] = "Import class lists"

    def __init__(
        self,
        test_data: TestData,
        playwright_operations: PlaywrightOperations,
        dashboard_page: DashboardPage,
        children_page: ChildrenPage,
    ):
        self.test_data = test_data
        self.po = playwright_operations
        self.dashboard_page = dashboard_page
        self.children_page = children_page

    @property
    def alert_success(self):
        return self.po.page.get_by_text("Import processing started")

    @property
    def completed_tag(self):
        return self.po.page.get_by_role("strong").get_by_text("Completed")

    @property
    def invalid_tag(self):
        return self.po.page.get_by_role("strong").get_by_text("Invalid")

    def is_processing_in_background(self):
        self.po.page.wait_for_load_state()
        return self.alert_success.is_visible()

    def wait_for_processed(self):
        self.po.page.wait_for_load_state()

        # Wait up to 10 seconds for file to be processed.

        tag = self.completed_tag.or_(self.invalid_tag)

        for i in range(20):
            if tag.is_visible():
                break

            time.sleep(0.5)

            self.po.page.reload()
        else:
            expect(tag).to_be_visible()

    def import_child_records(
        self, file_paths: str, verify_on_children_page: bool = False
    ):
        _input_file_path, _output_file_path = self.test_data.get_file_paths(
            file_paths=file_paths
        )

        _cl = []
        if verify_on_children_page:
            _cl = self.test_data.create_child_list_from_file(
                file_path=_input_file_path, file_type=mavis_file_types.CHILD_LIST
            )

        self.po.act(locator=self.LNK_IMPORT_RECORDS, action=actions.CLICK_LINK)
        self.po.act(locator=self.RDO_CHILD_RECORDS, action=actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.act(
            locator=self.LBL_CHILD_RECORDS,
            action=actions.SELECT_FILE,
            value=_input_file_path,
        )
        self._record_upload_time()
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

        if self.is_processing_in_background():
            self._click_uploaded_file_datetime()
            self.wait_for_processed()

        self._verify_upload_output(file_path=_output_file_path)
        if verify_on_children_page:
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
        _cl = []
        if verify_on_children_page:
            _cl = self.test_data.create_child_list_from_file(
                file_path=_input_file_path, file_type=mavis_file_types.CHILD_LIST
            )
        self.po.act(locator=self.LNK_IMPORT_RECORDS, action=actions.CLICK_LINK)
        self.po.act(
            locator=self.RDO_CLASS_LIST_RECORDS, action=actions.RADIO_BUTTON_SELECT
        )
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

        self.po.page.wait_for_load_state()

        self.po.page.get_by_role("combobox").fill(str(location))
        self.po.page.get_by_role("option", name=str(location)).click()

        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self._select_year_groups(*year_groups)
        self.po.act(
            locator=self.LBL_CLASS_LIST_RECORDS,
            action=actions.SELECT_FILE,
            value=_input_file_path,
        )
        self._record_upload_time()
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

        if self.is_processing_in_background():
            self._click_uploaded_file_datetime()
            self.wait_for_processed()

        self._verify_upload_output(file_path=_output_file_path)
        if verify_on_children_page:
            self.children_page.verify_child_has_been_uploaded(child_list=_cl)

    def import_class_list_records_from_school_session(self, file_paths: str):
        _input_file_path, _output_file_path = self.test_data.get_file_paths(
            file_paths=file_paths
        )
        self.po.act(
            locator=self.LNK_IMPORT_CLASS_LIST_RECORDS, action=actions.CLICK_LINK
        )
        self._select_year_groups(8, 9, 10, 11)
        self.po.act(
            locator=self.LBL_CLASS_LIST_RECORDS_FOR_SCHOOL1,
            action=actions.SELECT_FILE,
            value=_input_file_path,
        )
        self._record_upload_time()
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

        if self.is_processing_in_background():
            self._click_uploaded_file_datetime()
            self.wait_for_processed()

        self._verify_upload_output(file_path=_output_file_path)

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
        if verify_on_children_page:
            _cl = self.test_data.create_child_list_from_file(
                file_path=_input_file_path, file_type=file_type
            )
        self.po.act(locator=self.LNK_IMPORT_RECORDS, action=actions.CLICK_LINK)
        self.po.act(
            locator=self.RDO_VACCINATION_RECORDS, action=actions.RADIO_BUTTON_SELECT
        )
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.act(
            locator=self.LBL_VACCINATION_RECORDS,
            action=actions.SELECT_FILE,
            value=_input_file_path,
        )
        self._record_upload_time()
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

        if self.is_processing_in_background():
            self._click_uploaded_file_datetime()
            self.wait_for_processed()

        self._verify_upload_output(file_path=_output_file_path)
        if verify_on_children_page:
            self.children_page.verify_child_has_been_uploaded(child_list=_cl)

    def _record_upload_time(self):
        self.upload_time = datetime.now()

    def _click_uploaded_file_datetime(self):
        # FIXME: This logic is duplicated in three places, we should extract it somewhere else.
        first_link = self.po.page.get_by_role(
            "link", name=format_datetime_for_upload_link(self.upload_time)
        )
        second_link = self.po.page.get_by_role(
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
            # Verify messages individually
            for _msg in _expected_errors:
                self.po.verify(
                    locator=self.LBL_MAIN,
                    property=properties.TEXT,
                    expected_value=_msg,
                    exact=False,
                )
            # Verify all messages together
            _all_errors = "".join(
                [
                    x
                    for x in _expected_errors
                    if not x.startswith(escape_characters.COMMENT_OPERATOR)
                    and not x.startswith(escape_characters.NOT_OPERATOR)
                ]
            )
            self.po.verify(
                locator=self.LBL_MAIN,
                property=properties.TEXT,
                expected_value=_all_errors,
                exact=False,
            )

    def _select_year_groups(self, *year_groups: int) -> None:
        for year_group in year_groups:
            self.po.act(locator=f"Year {year_group}", action=actions.CHECKBOX_CHECK)
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def verify_mav_855(self, location: str):
        self.children_page.search_for_a_child(child_name=self.LNK_CHILD_MAV_855)
        self.po.act(locator=self.LNK_CHILD_MAV_855, action=actions.CLICK_LINK)
        self.po.act(locator=self.LBL_HPV_VACCINE_NAME, action=actions.CLICK_LINK)
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value=str(location),
        )
