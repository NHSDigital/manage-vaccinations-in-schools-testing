from playwright.sync_api import Page, expect

from mavis.test.annotations import step
from mavis.test.pages.header_component import HeaderComponent


class ChildArchivePage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.header = HeaderComponent(page)

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

    def archive_child_record(self) -> None:
        self.click_imported_in_error()
        self.click_archive_record()
        expect(self.page.get_by_role("alert")).to_contain_text(
            "This record has been archived",
        )
        expect(self.page.get_by_text("Archive reason")).to_be_visible()
