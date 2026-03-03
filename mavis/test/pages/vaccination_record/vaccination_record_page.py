from playwright.sync_api import Page, expect

from mavis.test.annotations import step
from mavis.test.pages.header_component import HeaderComponent


class VaccinationRecordPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.header = HeaderComponent(page)

        self.edit_vaccination_record_button = page.get_by_role(
            "button", name="Edit vaccination record"
        )
        self.vaccination_details_heading = self.page.get_by_role(
            "heading",
            name="Vaccination details",
        )

    @step("Click on Edit vaccination record")
    def click_edit_vaccination_record(self) -> None:
        self.edit_vaccination_record_button.click()

    def expect_vaccination_details(self, key: str, value: str) -> None:
        detail_key = self.page.locator(".nhsuk-summary-list__key", has_text=key)
        detail_value = detail_key.locator("xpath=following-sibling::*[1]")

        self.check_vaccination_details_heading_appears()
        expect(detail_value).to_contain_text(value)

    @step("Check Vaccination details heading appears")
    def check_vaccination_details_heading_appears(self) -> None:
        expect(self.vaccination_details_heading).to_be_visible()
