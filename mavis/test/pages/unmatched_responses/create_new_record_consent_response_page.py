from playwright.sync_api import Page

from mavis.test.annotations import step
from mavis.test.pages.header_component import HeaderComponent


class CreateNewRecordConsentResponsePage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.header = HeaderComponent(page)

        self.create_new_record_button = page.get_by_role(
            "button",
            name="Create a new record from response",
        )

    @step("Create new record from consent response")
    def create_new_record(self) -> None:
        self.create_new_record_button.click()
