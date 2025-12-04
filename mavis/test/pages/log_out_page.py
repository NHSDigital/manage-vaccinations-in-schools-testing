from playwright.sync_api import Page, expect

from mavis.test.annotations import step
from mavis.test.pages.header_component import HeaderComponent


class LogOutPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.header = HeaderComponent(page)

        self.log_out_button = page.locator("#main-content").get_by_role(
            "button", name="Log out"
        )
        self.log_out_header = page.get_by_role("heading", name="Log out")
        self.start_page_link = page.get_by_role("link", name="Start now")

    @step("Navigate to the Log out page")
    def navigate(self) -> None:
        self.page.goto("/logout")

    @step("Verify the log out page")
    def verify_log_out_page(self) -> None:
        expect(self.log_out_header).to_be_visible()
        self.log_out_button.click()
        expect(self.start_page_link).to_be_visible()
