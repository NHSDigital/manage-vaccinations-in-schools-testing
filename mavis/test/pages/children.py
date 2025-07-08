from pathlib import Path
from playwright.sync_api import Page, expect

from mavis.test.data import TestData
from mavis.test.models import School, Child
from mavis.test.annotations import step
from mavis.test.wrappers import reload_until_element_is_visible


class ChildrenPage:
    def __init__(self, page: Page, test_data: TestData):
        self.page = page
        self.test_data = test_data

        self.children_heading = self.page.get_by_role(
            "heading", name="Children", exact=True
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
            "link", name="Edit child record"
        )
        self.change_nhs_no_link = self.page.get_by_role(
            "link", name="Change   NHS number"
        )
        self.remove_from_cohort_button = self.page.get_by_role(
            "button", name="Remove from cohort"
        )
        self.continue_button = self.page.get_by_role("button", name="Continue")

        vaccinations_card = page.locator("section").filter(
            has=page.get_by_role("heading", name="Vaccinations")
        )
        self.vaccinations_card_row = vaccinations_card.get_by_role("row")

        self.manually_matched_card = self.page.get_by_text(
            "Consent response manually matched with child record"
        )

    def verify_headers(self):
        expect(self.children_heading).to_be_visible()
        for header in self.children_table_headers:
            expect(header).to_be_visible()

    def verify_list_has_been_uploaded(
        self, file_path: Path, is_vaccinations: bool
    ) -> None:
        child_names = self.test_data.create_child_list_from_file(
            file_path, is_vaccinations
        )
        for child_name in child_names:
            self.search_for_a_child_name(child_name)

    @step("Search for child {1}")
    def search_for_a_child_name(self, child_name: str) -> None:
        self.search_textbox.fill(child_name)

        with self.page.expect_navigation():
            self.search_button.click()

        reload_until_element_is_visible(
            self.page, self.page.get_by_role("link", name=child_name)
        )

    def assert_n_children_found(self, n: int) -> None:
        expect(
            self.page.get_by_role("heading", name=f"{n} child{'ren' if n > 1 else ''}")
        ).to_be_visible()

    @step("Click on record for child {1}")
    def click_record_for_child(self, child: Child) -> None:
        with self.page.expect_navigation():
            self.page.get_by_role("link", name=str(child)).click()

    @step("Click on {1} vaccination details")
    def click_vaccination_details(self, school: School) -> None:
        with self.page.expect_navigation():
            self.vaccinations_card_row.filter(has_text=str(school)).get_by_role(
                "link"
            ).click()

    @step("Click on Child record")
    def click_child_record(self) -> None:
        self.child_record_link.click()
        self.child_record_link.get_by_role("strong").wait_for()

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

    @step("Click on Remove from cohort")
    def click_remove_from_cohort(self) -> None:
        self.remove_from_cohort_button.click()

    @step("Fill NHS number {2} for child {1}")
    def fill_nhs_no_for_child(self, child: Child, nhs_no: str) -> None:
        self.page.get_by_role("textbox", name=str(child)).fill(nhs_no)

    def expect_text_in_main(self, text: str) -> None:
        expect(self.page.get_by_role("main")).to_contain_text(text)

    def expect_text_in_heading(self, text: str) -> None:
        expect(self.page.get_by_role("heading")).to_contain_text(text)

    def check_log_updates_with_match(self):
        self.page.wait_for_load_state()
        reload_until_element_is_visible(
            self.page, self.manually_matched_card, seconds=30
        )

    def verify_activity_log_for_created_or_matched_child(
        self, child: Child, location: str
    ):
        self.search_for_a_child_name(str(child))

        reload_until_element_is_visible(
            self.page, self.page.get_by_role("link", name=str(child))
        )

        self.click_record_for_child(child)
        self.click_activity_log()
        self.expect_text_in_main("Consent given")
        self.expect_text_in_main(f"Invited to the session at {location}")

        # FIXME: Update this text when MAVIS-1896/MAV-253 is closed
        self.check_log_updates_with_match()

    def remove_child_from_cohort(self, child: Child):
        self.search_for_a_child_name(str(child))
        self.click_record_for_child(child)
        self.click_remove_from_cohort()
        self.expect_text_in_main(f"{str(child)} removed from cohort")
