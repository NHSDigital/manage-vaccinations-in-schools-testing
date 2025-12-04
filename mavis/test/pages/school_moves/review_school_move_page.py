from playwright.sync_api import Page

from mavis.test.annotations import step
from mavis.test.pages.header_component import HeaderComponent


class ReviewSchoolMovePage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.header = HeaderComponent(page)

        self.confirm_radio = page.get_by_role(
            "radio",
            name="Update record with new school",
        )
        self.ignore_radio = page.get_by_role("radio", name="Ignore new information")
        self.update_button = page.get_by_role("button", name="Update")

    @step("Confirm school move")
    def confirm(self) -> None:
        self.confirm_radio.check()
        self.update_button.click()

    @step("Ignore school move")
    def ignore(self) -> None:
        self.ignore_radio.check()
        self.update_button.click()
