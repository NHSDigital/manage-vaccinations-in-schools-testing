from playwright.sync_api import Page

from mavis.test.annotations import step
from mavis.test.models import Child
from mavis.test.pages.header import HeaderComponent


class ChildEditPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.header = HeaderComponent(page)

        self.change_nhs_no_link = self.page.get_by_role(
            "link",
            name="Change   NHS number",
        )
        self.continue_button = self.page.get_by_role("button", name="Continue")

    @step("Click on Change NHS number")
    def click_change_nhs_no(self) -> None:
        self.change_nhs_no_link.click()

    @step("Click on Continue")
    def click_continue(self) -> None:
        self.continue_button.click()

    @step("Fill NHS number {2} for child {1}")
    def fill_nhs_no_for_child(self, child: Child, nhs_no: str) -> None:
        self.page.get_by_role("textbox", name=str(child)).fill(nhs_no)
