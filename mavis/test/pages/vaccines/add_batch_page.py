from playwright.sync_api import Page

from mavis.test.annotations import step
from mavis.test.pages.header import HeaderComponent
from mavis.test.pages.vaccines.batch_expiry_date import BatchExpiryDate


class AddBatchPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.date = BatchExpiryDate(page)
        self.header = HeaderComponent(page)

        self.name_textbox = page.get_by_role("textbox", name="Batch")
        self.confirm_button = page.get_by_role("button", name="Add batch")
        self.success_alert = page.get_by_role("alert", name="Success").filter(
            has_text="added",
        )

        error_alert = page.get_by_role("alert").filter(has_text="There is a problem")
        self.error_listitem = error_alert.get_by_role("listitem")

    @step("Fill in name with {1}")
    def fill_name(self, value: str) -> None:
        self.name_textbox.fill(value)

    @step("Confirm add batch")
    def confirm(self) -> None:
        self.confirm_button.click()
