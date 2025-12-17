import re
from datetime import datetime, timedelta
from pathlib import Path

from playwright.sync_api import Page, expect

from mavis.test.annotations import step
from mavis.test.constants import Programme
from mavis.test.data import FileGenerator, FileMapping, read_scenario_list_from_file
from mavis.test.pages.header_component import HeaderComponent
from mavis.test.utils import (
    format_datetime_for_upload_link,
    get_current_datetime,
    reload_until_element_is_visible,
)


class ImportRecordsWizardPage:
    def __init__(
        self,
        page: Page,
        file_generator: FileGenerator,
    ) -> None:
        self.page = page
        self.file_generator = file_generator
        self.header = HeaderComponent(page)

        self.alert_success = self.page.get_by_text("Import processing started")
        self.completed_tag = self.page.get_by_role("strong").get_by_text("Completed")
        self.invalid_tag = self.page.get_by_role("strong").get_by_text("Invalid")
        self.child_records_radio_button = self.page.get_by_role(
            "radio",
            name="Child records",
        )
        self.class_list_records_radio_button = self.page.get_by_role(
            "radio",
            name="Class list records",
        )
        self.vaccination_records_radio_button = self.page.get_by_role(
            "radio",
            name="Vaccination records",
        )
        self.continue_button = self.page.get_by_role("button", name="Continue")
        self.file_input = self.page.locator('input[type="file"]')
        self.location_combobox = self.page.get_by_role("combobox")
        self.completed_imports_tab = self.page.get_by_role(
            "link",
            name="Completed imports",
        )

        # Pattern to match dynamic text (s is optional for records)
        self.records_pattern = re.compile(
            r"\d+ new records?"
            r"|\d+ school moves?"
            r"|\d+ records? already in Mavis"
        )
        self.approve_import_button = self.page.get_by_role(
            "button", name="Approve and import records"
        )
        self.invalid_file_problem = self.page.get_by_text("There is a problem")
        self.review_and_approve_tag = self.page.get_by_role("strong").get_by_text(
            "Review and approve"
        )

    @step("Select Child Records")
    def select_child_records(self) -> None:
        self.child_records_radio_button.click()

    @step("Select Class List Records")
    def select_class_list_records(self) -> None:
        self.class_list_records_radio_button.click()

    @step("Select Vaccination Records")
    def select_vaccination_records(self) -> None:
        self.vaccination_records_radio_button.click()

    @step("Click Continue")
    def click_continue(self, _coverage: str | None = None) -> None:
        # coverage is only used for reporting
        self.continue_button.click()

    @step("Set input file to {1}")
    def set_input_file(self, file_path: Path) -> None:
        self.file_input.set_input_files(file_path)
        self.page.wait_for_load_state()

    @step("Fill location combobox with {1}")
    def fill_location(self, location: str) -> None:
        self.location_combobox.fill(location)

    def is_processing_in_background(self) -> bool:
        self.page.wait_for_load_state()
        return self.alert_success.is_visible()

    def get_preview_page_link(self):  # noqa: ANN201
        """Get the preview page link using multiple selector strategies."""
        # Try different selector approaches
        selectors = [
            self.page.get_by_role("link").filter(has_text=self.records_pattern),
            self.page.locator("a").filter(has_text=self.records_pattern),
            self.page.locator("[href]").filter(has_text=self.records_pattern),
            self.page.get_by_text(self.records_pattern),
        ]

        for selector in selectors:
            if selector.count() > 0:
                return selector.first

        # Fallback: return the first selector even if not found
        return selectors[0]

    def is_preview_page_link_visible(self) -> bool:
        """Check if preview page link is visible using multiple strategies."""
        selectors = [
            self.page.get_by_role("link").filter(has_text=self.records_pattern),
            self.page.locator("a").filter(has_text=self.records_pattern),
            self.page.locator("[href]").filter(has_text=self.records_pattern),
            self.page.get_by_text(self.records_pattern),
        ]

        for selector in selectors:
            if selector.count() > 0 and selector.first.is_visible():
                return True
        return False

    def approve_preview_if_shown(self, date_time: datetime) -> None:
        self.get_preview_page_link().click()
        expect(self.review_and_approve_tag).to_be_visible()
        self.approve_import_button.click()
        expect(
            self.page.get_by_label("Information")
            .locator("div")
            .filter(has_text="Import started")
        ).to_be_visible()
        self.click_uploaded_file_datetime(date_time)
        self.wait_for_processed()

    def wait_for_processed(self) -> None:
        self.page.wait_for_load_state()

        tag = self.completed_tag.or_(self.invalid_tag).or_(self.review_and_approve_tag)

        reload_until_element_is_visible(self.page, tag, seconds=60)

    def navigate_to_child_record_import(self) -> None:
        self.select_child_records()
        self.click_continue()

    def navigate_to_class_list_record_import(
        self, location: str, *year_groups: int
    ) -> None:
        self.select_class_list_records()
        self.click_continue()

        self.page.wait_for_load_state()

        self.fill_location(location)
        self.page.get_by_role("option", name=str(location)).first.click()
        self.click_continue()

        self.select_year_groups(*year_groups)

    def navigate_to_vaccination_records_import(self) -> None:
        self.select_vaccination_records()
        self.click_continue()

    def upload_and_verify_output(
        self,
        file_mapping: FileMapping,
        session_id: str | None = None,
        programme_group: str = Programme.HPV.group,
    ) -> tuple[Path, Path]:
        _input_file_path, _output_file_path = self.file_generator.get_file_paths(
            file_mapping=file_mapping,
            session_id=session_id,
            programme_group=programme_group,
        )
        _scenario_list = read_scenario_list_from_file(_input_file_path)

        self.set_input_file(_input_file_path)
        upload_time = get_current_datetime()
        self.click_continue(_coverage=_scenario_list)

        if self.is_processing_in_background():
            self.click_uploaded_file_datetime(upload_time)

        self.page.wait_for_load_state()
        status_text = (
            self.review_and_approve_tag.or_(self.completed_tag)
            .or_(self.invalid_tag)
            .or_(self.invalid_file_problem)
        )
        reload_until_element_is_visible(self.page, status_text, seconds=60)
        if self.is_preview_page_link_visible():
            self.approve_preview_if_shown(upload_time)

        self.verify_upload_output(file_path=_output_file_path)
        return _input_file_path, _output_file_path

    @step("Click link with uploaded datetime")
    def click_uploaded_file_datetime(self, date_time: datetime) -> None:
        first_link = self.page.get_by_role(
            "link",
            name=format_datetime_for_upload_link(date_time),
        )
        second_link = self.page.get_by_role(
            "link",
            name=format_datetime_for_upload_link(
                date_time + timedelta(minutes=1),
            ),
        )

        self.page.wait_for_load_state()

        # This handles when an upload occurs across the minute tick over, for
        # example the file is uploaded at 10:00:59 but finishes at 10:01:01.
        if first_link.or_(second_link).first.is_visible():
            first_link.or_(second_link).first.click()
        else:
            self.completed_imports_tab.click()
            first_link.or_(second_link).first.click()

    @step("Verify upload output for {file_path}")
    def verify_upload_output(self, file_path: Path) -> None:
        _expected_errors = self.file_generator.get_expected_errors(file_path)
        if _expected_errors is not None:
            for _msg in _expected_errors:
                if _msg.startswith("!"):
                    expect(self.page.get_by_role("main")).not_to_contain_text(_msg[1:])
                else:
                    expect(self.page.get_by_role("main")).to_contain_text(_msg)

    @step("Select year groups {1}")
    def select_year_groups(self, *year_groups: int) -> None:
        for year_group in year_groups:
            self.page.locator(f'input[type="checkbox"][value="{year_group}"]').check()

        self.click_continue()

    def import_class_list(
        self,
        class_list_file: FileMapping,
        year_group: int | None = None,
        programme_group: str = Programme.HPV.group,
    ) -> None:
        if year_group is not None:
            self.select_year_groups(year_group)

        self.upload_and_verify_output(class_list_file, programme_group=programme_group)
