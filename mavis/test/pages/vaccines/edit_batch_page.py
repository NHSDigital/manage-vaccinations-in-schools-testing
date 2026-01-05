from playwright.sync_api import Page

from mavis.test.annotations import step
from mavis.test.pages.header_component import HeaderComponent
from mavis.test.pages.vaccines.batch_expiry_date import BatchExpiryDate


class EditBatchPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.date = BatchExpiryDate(page)
        self.header = HeaderComponent(page)

        self.confirm_button = page.get_by_role("button", name="Save changes")

    @step("Confirm edit batch")
    def confirm(self) -> None:
        self.confirm_button.click()

    @step("Verify success alert shows for batch {1}")
    def verify_batch_updated(self, batch_name: str) -> None:
        assert self.page.get_by_role("alert", name="Success").filter(
            has_text=f"Batch {batch_name} updated",
        )
