import re
from pathlib import Path

from playwright.sync_api import Page, expect

from mavis.test.annotations import step
from mavis.test.data import TestData
from mavis.test.models import Child, Programme, School
from mavis.test.utils import get_current_datetime, reload_until_element_is_visible


class ChildrenPage:
    def __init__(self, page: Page, test_data: TestData) -> None:
        self.page = page
        self.test_data = test_data

        self.children_heading = self.page.get_by_role(
            "heading",
            name="Children",
            exact=True,
        )
        self.children_table_headers = [
            self.page.get_by_role("columnheader", name=header)
            for header in [
                "Name and NHS number",
                "Postcode",
                "School",
                "Date of birth",
            ]
        ]

        self.search_textbox = self.page.get_by_role("textbox", name="Search")
        self.search_button = self.page.get_by_role("button", name="Search")
        self.activity_log_link = self.page.get_by_role("link", name="Activity log")
        self.child_record_link = self.page.get_by_role("link", name="Child record")
        self.edit_child_record_button = self.page.get_by_role(
            "link",
            name="Edit child record",
        )
        self.change_nhs_no_link = self.page.get_by_role(
            "link",
            name="Change   NHS number",
        )
        self.archive_child_record_link = self.page.get_by_role(
            "link",
            name="Archive child record",
        )
        self.continue_button = self.page.get_by_role("button", name="Continue")

        vaccinations_card = page.locator("section").filter(
            has=page.get_by_role("heading", name="Vaccinations"),
        )
        self.vaccinations_card_row = vaccinations_card.get_by_role("row")

        self.manually_matched_card = self.page.get_by_text(
            "Consent response manually matched with child record",
        )
        self.imported_in_error_radio = self.page.get_by_role(
            "radio",
            name="It was imported in error",
        )
        self.its_a_duplicate_radio = self.page.get_by_role(
            "radio",
            name="It’s a duplicate",
        )
        self.duplicate_of_nhs_number_text = self.page.get_by_role(
            "textbox",
            name="Enter the NHS number for the",
        )
        self.archive_record_button = self.page.get_by_role(
            "button",
            name="Archive record",
        )
        self.advanced_filters_link = self.page.get_by_text("Advanced filters")
        self.archived_records_checkbox = self.page.get_by_role(
            "checkbox",
            name="Archived records",
        )
        self.children_aged_out_of_programmes_checkbox = self.page.get_by_role(
            "checkbox",
            name="Children aged out of programmes",
        )
        self.children_missing_an_nhs_number_checkbox = self.page.get_by_role(
            "checkbox",
            name="Children missing an NHS number",
        )
        self.invite_to_community_clinic_button = self.page.get_by_role(
            "button",
            name="Invite to community clinic",
        )
        self.vaccination_details_heading = self.page.get_by_role(
            "heading",
            name="Vaccination details",
        )

    def verify_headers(self) -> None:
        expect(self.children_heading).to_be_visible()
        for header in self.children_table_headers:
            expect(header).to_be_visible()

    def verify_list_has_been_uploaded(
        self,
        file_path: Path,
        *,
        is_vaccinations: bool,
    ) -> None:
        child_names = self.test_data.create_child_list_from_file(
            file_path,
            is_vaccinations=is_vaccinations,
        )
        for child_name in child_names:
            self.search_with_all_filters_for_child_name(child_name)

    @step("Search for child {1}")
    def search_for_a_child_name(self, child_name: str) -> None:
        self.search_textbox.fill(child_name)

        with self.page.expect_navigation():
            self.search_button.click()

        reload_until_element_is_visible(
            self.page,
            self.page.get_by_role("link", name=child_name),
        )

    def assert_n_children_found(self, n: int) -> None:
        expect(
            self.page.get_by_role("heading", name=f"{n} child{'ren' if n > 1 else ''}"),
        ).to_be_visible()

    @step("Click on record for child {1}")
    def click_record_for_child(self, child: Child) -> None:
        with self.page.expect_navigation():
            self.page.get_by_role("link", name=str(child)).click()

    @step("Click on {2} session for programme")
    def click_session_for_programme(
        self,
        location: str,
        programme: Programme,
        *,
        check_date: bool = False,
    ) -> None:
        locator = self.page.get_by_role("row", name=str(location)).filter(
            has_text=str(programme),
        )
        if check_date:
            today_str = get_current_datetime().strftime("%-d %B %Y")
            locator = locator.filter(has_text=today_str)
        locator.get_by_role("link").click()

        ten_seconds_ms = 10000
        expect(self.page.get_by_role("link", name=str(programme))).to_be_visible(
            timeout=ten_seconds_ms,
        )

    @step("Click on {1} vaccination details")
    def click_vaccination_details(self, school: School) -> None:
        vaccination_details_locator = self.vaccinations_card_row.filter(
            has_text=str(school)
        ).get_by_role(
            "link",
        )

        self.page.wait_for_load_state()
        expect(vaccination_details_locator).to_have_attribute(
            "href", re.compile(r"^/vaccination-records/")
        )
        self.page.wait_for_selector(
            'div.nhsuk-card__content:has(h3.nhsuk-card__heading.nhsuk-heading-m:has-text("Vaccinations"))'
        )

        with self.page.expect_navigation(url="**/vaccination-records/**"):
            vaccination_details_locator.click()

    @step("Click on Child record")
    def click_child_record(self) -> None:
        self.child_record_link.click()
        self.child_record_link.get_by_role("strong").wait_for()
        self.page.wait_for_load_state()

    @step("Click on Change NHS number")
    def click_change_nhs_no(self) -> None:
        self.change_nhs_no_link.click()

    @step("Click on Activity log")
    def click_activity_log(self) -> None:
        self.activity_log_link.click()
        self.activity_log_link.get_by_role("strong").wait_for()

    @step("Click on Edit child record")
    def click_edit_child_record(self) -> None:
        self.edit_child_record_button.click()

    @step("Click on Continue")
    def click_continue(self) -> None:
        self.continue_button.click()

    @step("Click on Archive child record")
    def click_archive_child_record(self) -> None:
        self.archive_child_record_link.click()

    @step("Fill NHS number {2} for child {1}")
    def fill_nhs_no_for_child(self, child: Child, nhs_no: str) -> None:
        self.page.get_by_role("textbox", name=str(child)).fill(nhs_no)

    @step("Click Invite to community clinic")
    def click_invite_to_community_clinic(self) -> None:
        self.invite_to_community_clinic_button.click()

    def expect_vaccination_details(self, key: str, value: str) -> None:
        detail_key = self.page.locator(".nhsuk-summary-list__key", has_text=key)
        detail_value = detail_key.locator("xpath=following-sibling::*[1]")

        self.check_vaccination_details_heading_appears()
        expect(detail_value).to_contain_text(value)

    @step("Check Vaccination details heading appears")
    def check_vaccination_details_heading_appears(self) -> None:
        expect(self.vaccination_details_heading).to_be_visible()

    def expect_text_in_alert(self, text: str) -> None:
        expect(self.page.get_by_role("alert")).to_contain_text(text)

    def check_log_updates_with_match(self) -> None:
        self.page.wait_for_load_state()
        reload_until_element_is_visible(
            self.page,
            self.manually_matched_card,
            seconds=30,
        )

    def search_with_all_filters_for_child_name(self, child_name: str) -> None:
        filter_locators = [
            self.archived_records_checkbox,
            self.children_aged_out_of_programmes_checkbox,
            self.children_missing_an_nhs_number_checkbox,
        ]
        child_locator = self.page.get_by_role("link", name=child_name)

        self.search_textbox.fill(child_name)
        self.search_button.click()
        self.page.wait_for_load_state()

        if not child_locator.is_visible():
            for filter_locator in filter_locators:
                if not filter_locator.is_visible():
                    self.click_advanced_filters()
                filter_locator.check()
                self.search_button.click()
                self.page.wait_for_load_state()
                if child_locator.is_visible():
                    break
                filter_locator.uncheck()

    def verify_activity_log_for_created_or_matched_child(
        self,
        child: Child,
    ) -> None:
        self.search_with_all_filters_for_child_name(str(child))

        self.click_record_for_child(child)
        self.click_activity_log()
        self.expect_activity_log_header("Consent given")

        self.check_log_updates_with_match()

    def expect_activity_log_header(self, header: str, *, unique: bool = False) -> None:
        if unique:
            expect(self.page.get_by_role("heading", name=header)).to_be_visible()
        else:
            expect(self.page.get_by_role("heading", name=header).first).to_be_visible()

    def archive_child_record(self) -> None:
        self.click_archive_child_record()
        self.click_imported_in_error()
        self.click_archive_record()
        expect(self.page.get_by_role("alert")).to_contain_text(
            "This record has been archived",
        )
        expect(self.page.get_by_text("Archive reason")).to_be_visible()

    @step("Click on Imported in error")
    def click_imported_in_error(self) -> None:
        self.imported_in_error_radio.check()

    @step("Select It's a duplicate")
    def click_its_a_duplicate(self, with_nhs_number: str) -> None:
        self.its_a_duplicate_radio.check()
        self.duplicate_of_nhs_number_text.fill(with_nhs_number)

    @step("Click on Archive record")
    def click_archive_record(self) -> None:
        self.archive_record_button.click()

    def check_child_is_unarchived(self) -> None:
        expect(self.archive_child_record_link).to_be_visible()

    @step("Click on Advanced filters")
    def click_advanced_filters(self) -> None:
        self.advanced_filters_link.click()

    @step("Check Children aged out of programmes")
    def check_children_aged_out_of_programmes(self) -> None:
        self.children_aged_out_of_programmes_checkbox.check()
