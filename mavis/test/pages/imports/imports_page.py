from playwright.sync_api import Page

from mavis.test.annotations import step
from mavis.test.pages.header import HeaderComponent


class ImportsPage:
    def __init__(
        self,
        page: Page,
    ) -> None:
        self.page = page
        self.header = HeaderComponent(page)

        self.upload_button = self.page.get_by_role(
            "button",
            name="Upload records",
        )

    @step("Click on Upload records")
    def click_upload_records(self) -> None:
        self.upload_button.click()
