from playwright.sync_api import Page

from mavis.test.annotations import step
from mavis.test.pages.header_component import HeaderComponent


class ArchiveBatchPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.header = HeaderComponent(page)

        self.confirm_button = page.get_by_role("button", name="Yes, archive this batch")
        self.success_alert = page.get_by_role("alert", name="Success").filter(
            has_text="archived",
        )

    @step("Click on Archive this batch")
    def confirm(self) -> None:
        self.confirm_button.click()
