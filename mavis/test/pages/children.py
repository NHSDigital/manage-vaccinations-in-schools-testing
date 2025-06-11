from playwright.sync_api import Page, expect

from ..data import TestData
from ..models import School, Vaccine
from ..step import step


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

        self.one_child_found_heading = self.page.get_by_role("heading", name="1 child")
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

    def verify_headers(self):
        expect(self.children_heading).to_be_visible()
        for header in self.children_table_headers:
            expect(header).to_be_visible()

    def verify_filter(self):
        self.search_textbox.fill("CFILTER1, CFilter1")
        self.search_button.click()
        self.page.wait_for_timeout(1000)
        expect(self.one_child_found_heading).to_be_visible()

    def verify_list_has_been_uploaded(
        self, file_path: str, is_vaccinations: bool
    ) -> None:
        child_names = self.test_data.create_child_list_from_file(
            file_path, is_vaccinations
        )
        for child_name in child_names:
            self.search_for_a_child(child_name)

    @step("Search for child {1}")
    def search_for_a_child(self, child_name: str) -> None:
        self.search_textbox.fill(child_name)
        self.search_button.click()
        self.page.wait_for_timeout(1000)
        self.expect_text_in_main(child_name)

    @step("Click on record for child {1}")
    def click_record_for_child(self, child_name: str) -> None:
        self.page.get_by_role("link", name=child_name).click()

    @step("Click on {1} vaccination details for school {2}")
    def click_vaccination_details_for_school(
        self, vaccine: Vaccine, school: School
    ) -> None:
        self.page.get_by_role("row").filter(has_text=str(school)).get_by_role(
            "link", name=str(vaccine), exact=False
        ).click()

    @step("Click on {1} vaccination details")
    def click_vaccination_details(self, vaccine: Vaccine) -> None:
        self.page.get_by_role("link", name=str(vaccine), exact=False).click()

    @step("Click on Child record")
    def click_child_record(self) -> None:
        self.child_record_link.click()

    @step("Click on Change NHS number")
    def click_change_nhs_no(self) -> None:
        self.change_nhs_no_link.click()

    @step("Click on Activity log")
    def click_activity_log_and_wait(self) -> None:
        self.activity_log_link.click()
        self.page.wait_for_timeout(1000)

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
    def fill_nhs_no_for_child(self, child_name: str, nhs_no: str) -> None:
        self.page.get_by_role("textbox", name=child_name).fill(nhs_no)

    def expect_text_in_main(self, text: str) -> None:
        expect(self.page.get_by_role("main")).to_contain_text(text)

    def expect_text_in_heading(self, text: str) -> None:
        expect(self.page.get_by_role("heading").first).to_contain_text(text)

    def verify_activity_log_for_created_or_matched_child(
        self, child_name: str, location: str, *, is_created: bool
    ):
        self.search_textbox.fill(child_name)
        self.search_button.click()
        self.page.wait_for_timeout(1000)
        self.page.get_by_text(child_name).click()
        self.activity_log_link.click()
        self.page.wait_for_timeout(1000)
        self.expect_text_in_main("Consent given")
        self.expect_text_in_main(f"Invited to the session at {location}")

        # FIXME: Update this text when MAVIS-1896/MAV-253 is closed
        self.expect_text_in_main("Consent response manually matched with child record")

    def remove_child_from_cohort(self, child_name: str):
        self.search_for_a_child(child_name)
        self.click_record_for_child(child_name)
        self.click_remove_from_cohort()
        self.expect_text_in_main(f"{child_name} removed from cohort")
