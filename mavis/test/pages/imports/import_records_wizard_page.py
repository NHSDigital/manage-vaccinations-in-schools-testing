import re
from pathlib import Path

from playwright.sync_api import Page, expect

from mavis.test.annotations import step
from mavis.test.constants import Programme
from mavis.test.data import FileGenerator, FileMapping, read_scenario_list_from_file
from mavis.test.data.file_mappings import ImportFormatDetails
from mavis.test.data_models import Child
from mavis.test.pages.header_component import HeaderComponent
from mavis.test.utils import (
    click_secondary_navigation_item,
    reload_until_element_is_visible,
)


class ImportRecordsWizardPage:
    # Regex patterns for navigation and verification
    IMPORTS_MENU_PATTERN = re.compile(r"Imports\s+\(\s*\d+\s*\)")
    ISSUES_MENU_PATTERN = re.compile(r"Issues\s+\(\s*\d+\s*\)")
    UPLOADED_RECORDS_REVIEW_PATTERN = re.compile(
        r"\d+\s+uploaded\s+records?\s+needs?\s+review"
    )
    RECORDS_PATTERN = re.compile(
        r"\d+ new record(?:s)?"
        r"|\d+ school move(?:s)?"
        r"|\d+ record(?:s)? already in Mavis"
        r"|\d+ close match(?:es)? to existing record(?:s)?",
    )

    def __init__(
        self,
        page: Page,
        file_generator: FileGenerator,
    ) -> None:
        self.page = page
        self.file_generator = file_generator
        self.header = HeaderComponent(page)

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
        self.upload_issues_group = self.page.get_by_role("group").filter(
            has_text="upload issue"
        )
        self.imported_records_group = self.page.get_by_role("group").filter(
            has_text="imported record"
        )
        self.success_alert = self.page.get_by_role("alert", name="Success")

        self.approve_import_button = self.page.get_by_role(
            "button", name="Approve and import records"
        )
        self.invalid_file_problem = self.page.get_by_text("There is a problem")
        self.review_and_approve_tag = self.page.get_by_role("strong").get_by_text(
            "Review and approve"
        )
        self.import_format_details_link = self.page.get_by_text(
            "What your CSV file must include"
        )
        self.keep_both_option_radio = self.page.get_by_role(
            "radio",
            name="Keep both child records",
        )
        self.upload_issue_link = self.page.get_by_text(
            re.compile(r"\d+ upload issues?")
        )
        self.record_updated = page.get_by_role("alert", name="Success").filter(
            has_text="Record updated",
        )
        self.review_link = self.page.get_by_role("link", name="Review")
        self.resolve_duplicate_button = self.page.get_by_role(
            "button", name="Resolve duplicate"
        )
        self.imported_record_link = self.page.get_by_text(
            re.compile(r"\d+ imported record")
        )
        self.preview_page_link = (
            self.page.locator(".nhsuk-details__summary-text")
            .filter(has_text=self.RECORDS_PATTERN)
            .first
        )

    @step("Navigate to Imports section")
    def _navigate_to_imports_section(self) -> None:
        """Navigate to the Imports section from the main menu."""
        expect(
            self.page.get_by_label("Menu").get_by_role("list"),
            "Expected Imports menu item to be present in main menu",
        ).to_contain_text(self.IMPORTS_MENU_PATTERN)
        imports_link = self.page.get_by_role("link", name=self.IMPORTS_MENU_PATTERN)
        imports_link.click()

    @step("Navigate to Issues tab")
    def _navigate_to_issues_tab(self) -> None:
        """Navigate to the Issues tab within the Imports section."""
        expect(
            self.page.get_by_label("Secondary menu").get_by_role("list"),
            "Expected Issues menu item to be present in secondary menu",
        ).to_contain_text(self.ISSUES_MENU_PATTERN)
        issues_link = self.page.get_by_role("link", name=self.ISSUES_MENU_PATTERN)
        expect(
            issues_link,
            "Expected Issues link to be visible in Imports section",
        ).to_be_visible()
        issues_link.click()

    @step("Verify and expand uploaded records for review")
    def _verify_and_expand_uploaded_records_review(self) -> None:
        """Verify uploaded records heading and expand it."""
        expect(
            self.page.locator("h3"),
            "Expected 'Uploaded records that need review' heading in Issues tab",
        ).to_contain_text(self.UPLOADED_RECORDS_REVIEW_PATTERN)
        uploaded_records_heading = self.page.get_by_role(
            "heading", name=self.UPLOADED_RECORDS_REVIEW_PATTERN
        )
        expect(
            uploaded_records_heading,
            "Expected uploaded records review heading to be visible",
        ).to_be_visible()
        uploaded_records_heading.click()

    def verify_close_match(self) -> None:
        """
        Verify close match imports workflow for child and class list imports.

        A "close match" occurs when importing a record with the same name and DOB
        but different identifying information (e.g., different NHS number or postcode).
        This triggers a manual review workflow in the Issues tab.

        Note: Vaccination imports handle close matches automatically and may not
        trigger the same review workflow.

        Verification steps:
        1. Verify "Close matches to existing" heading is visible
        2. Navigate through Imports -> Issues menu
        3. Verify and expand uploaded records that need review
        """
        expect(
            self.page.get_by_role("heading", name="Close matches to existing"),
            "Expected 'Close matches to existing' heading to be visible",
        ).to_be_visible()
        self._navigate_to_imports_section()
        self._navigate_to_issues_tab()
        self._verify_and_expand_uploaded_records_review()

    @step("Verify linking for child {1} with the import")
    def verify_linking(self, child: Child) -> None:
        self.imported_record_link.click()
        self.page.get_by_role(
            "link", name=f"{child.last_name.upper()}, {child.first_name}"
        ).click()
        expect(self.page.locator("h3").filter(has_text="Child record")).to_be_visible()
        expect(
            self.page.get_by_role(
                "heading", name=f"{child.last_name.upper()}, {child.first_name}"
            )
        ).to_be_visible()

    def click_review_link(self) -> None:
        self.review_link.click()

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

    def is_preview_page_link_visible(self) -> bool:
        return self.preview_page_link.is_visible()

    @step("Click Review to expand duplicate details")
    def click_review_duplicates(self) -> None:
        self.preview_page_link.click()
        expect(self.review_and_approve_tag).to_be_visible()

    @step("Select Keep both records")
    def select_keep_both_records(self) -> None:
        self.keep_both_option_radio.click()

    @step("Approve and import records")
    def click_approve_and_import(self) -> None:
        """Click the approve button to finalize the import."""
        self.approve_import_button.click()
        expect(
            self.page.get_by_label("Information")
            .locator("div")
            .filter(has_text="Import started")
        ).to_be_visible()

    def approve_preview_if_shown(self, file_path: Path) -> None:
        self.preview_page_link.click()
        expect(self.review_and_approve_tag).to_be_visible()
        self.approve_import_button.click()
        expect(
            self.page.get_by_label("Information")
            .locator("div")
            .filter(has_text="Import started")
        ).to_be_visible()
        self.click_import_link(file_path)
        self.wait_for_processed()

    def wait_for_processed(self) -> None:
        self.page.wait_for_load_state()

        tag = (
            self.completed_tag.or_(self.invalid_tag)
            .or_(self.review_and_approve_tag)
            .first
        )

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
        options = self.page.locator('[class*="app-autocomplete__option"]')
        count = options.count()

        for i in range(count):
            option = options.nth(i)
            text = option.inner_text().strip()
            first_line = text.split("\n", 1)[0].strip()
            location_name = first_line.split(" (URN:", 1)[0]
            if location_name == location:
                option.click()
                break
        else:
            msg = f"No autocomplete option found for location: {location}"
            raise AssertionError(msg)

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
        self.upload_and_verify_output_for_input_output_files(
            _input_file_path,
            _output_file_path,
        )
        return _input_file_path, _output_file_path

    def upload_and_verify_output_for_input_output_files(
        self,
        input_file_path: Path,
        output_file_path: Path,
    ) -> None:
        self.upload_input_file(input_file_path)
        self.verify_upload_output(file_path=output_file_path)

    def upload_input_file(self, input_file_path: Path) -> None:
        _scenario_list = read_scenario_list_from_file(input_file_path)

        self.set_input_file(input_file_path)
        self.click_continue(_coverage=_scenario_list)
        self.page.wait_for_load_state()

        if self.completed_imports_tab.is_visible():
            self.click_import_link(input_file_path)

        self.wait_for_completed_status()

        if self.is_preview_page_link_visible():
            self.approve_preview_if_shown(input_file_path)

    @step("Reload until completed status appears")
    def wait_for_completed_status(self) -> None:
        status_text = (
            self.review_and_approve_tag.or_(self.completed_tag)
            .or_(self.invalid_tag)
            .or_(self.invalid_file_problem)
        ).first
        reload_until_element_is_visible(self.page, status_text, seconds=60)

    @step("Click import link for {1}")
    def click_import_link(self, file_path: Path) -> None:
        import_link = (
            self.page.get_by_role("cell", name=file_path.name).get_by_role("link").first
        )

        self.page.wait_for_load_state()

        if not import_link.is_visible():
            click_secondary_navigation_item(self.completed_imports_tab)

        import_link.click()
        self.page.wait_for_load_state()

    @step("Verify upload output for {file_path}")
    def verify_upload_output(self, file_path: Path) -> None:
        _expected_errors = self.file_generator.get_expected_errors(file_path)
        if _expected_errors is not None:
            for _msg in _expected_errors:
                if _msg.startswith("!"):
                    expect(self.page.get_by_role("main")).not_to_contain_text(_msg[1:])
                else:
                    expect(self.page.get_by_role("main")).to_contain_text(_msg)

    @step("Verify close match issue and navigate to issues page")
    def navigate_to_close_match_issue(self) -> None:
        expect(self.page.get_by_role("main")).to_contain_text(
            "Close matches to existing records - needs review"
        )
        self.upload_issues_group.click()
        expect(self.upload_issues_group).to_contain_text("Review and confirm.")
        self.upload_issues_group.get_by_role("link", name="Review").first.click()

    @step("Navigate to import record")
    def navigate_to_imported_record(self) -> None:
        expect(self.page.get_by_role("main")).to_contain_text("Imported records")
        self.imported_records_group.click()
        self.imported_records_group.get_by_role("link").first.click()

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

    def read_and_verify_import_format_details(
        self, import_format_details_mapping: ImportFormatDetails
    ) -> None:
        # Use ImportFormatDetails to get file path
        data_dir = Path(__file__).resolve().parents[2] / "data"
        spec_file_path = (
            data_dir / import_format_details_mapping.import_format_details_path
        )
        with spec_file_path.open("r", encoding="utf-8") as file:
            lines = file.readlines()

        spec_lines = [
            line.strip().replace("\r\n", "\n").replace("\r", "\n").replace("\n\n", "\n")
            for line in lines
        ]

        self.page.wait_for_load_state()
        self.import_format_details_link.click()
        main_content = self.page.get_by_role("main").inner_text()
        for line in spec_lines:
            if line not in main_content:
                missing_line_msg = f"Inconsistent import format details: {line}"
                raise AssertionError(missing_line_msg)

        if import_format_details_mapping is ImportFormatDetails.VACCS:
            for vaccine in self.EXPECTED_VACCINES:
                if vaccine not in main_content:
                    missing_line_msg = f"VACCINE_GIVEN: missing {vaccine}"
                    raise AssertionError(missing_line_msg)

    EXPECTED_VACCINES: list[str] = [  # noqa: RUF012
        "Cervarix",
        "Gardasil",
        "Gardasil9",
        "Sequirus Cell-based Trivalent",
        "AstraZeneca Fluenz",
        "Viatris",
        "Sanofi Vaxigrip",
        "MenQuadfi",
        "Menveo",
        "Nimenrix",
        "Priorix",
        "VaxPro",
        "Revaxis",
        "ProQuad",
        "Priorix-Tetra",
    ]
