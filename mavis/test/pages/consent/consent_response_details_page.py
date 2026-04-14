from playwright.sync_api import Page, expect

from mavis.test.annotations import step
from mavis.test.utils import expect_details


class ConsentResponseDetailsPage:
    def __init__(self, page: Page) -> None:
        self.page = page

        self.follow_up_link = page.get_by_role("link", name="Follow up", exact=True)

    @step("Click on Follow up")
    def click_follow_up(self) -> None:
        self.follow_up_link.click()

    @step("Verify Follow up link is available")
    def expect_follow_up_available(self) -> None:
        expect(self.follow_up_link).to_be_visible()

    @step("Verify Follow up link is not available")
    def expect_follow_up_not_available(self) -> None:
        expect(self.follow_up_link).not_to_be_visible()

    @step("Verify response is invalidated")
    def expect_response_invalidated(self, notes: str) -> None:
        expect_details(self.page, "Response", "Invalid")
        expect_details(self.page, "Notes", notes)
