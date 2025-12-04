from playwright.sync_api import Locator, Page

from mavis.test.annotations import step
from mavis.test.models import Child
from mavis.test.pages.header import HeaderComponent
from mavis.test.utils import reload_until_element_is_visible


class SchoolMovesPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.header = HeaderComponent(page)

        self.rows = page.get_by_role("row")
        self.download_button = page.get_by_role("button", name="Download records")
        self.confirmed_alert = page.get_by_role("alert", name="Success").filter(
            has_text="updated",
        )
        self.ignored_alert = page.get_by_role("region", name="Information").filter(
            has_text="ignored",
        )

    @step("Click on school move for {1}")
    def click_child(self, child: Child) -> None:
        row = self.get_row_for_child(child)
        reload_until_element_is_visible(self.page, row)
        row.get_by_role("link", name="Review").click()

    @step("Click on Download records")
    def click_download(self) -> None:
        self.download_button.click()

    def get_row_for_child(self, child: Child) -> Locator:
        return self.rows.filter(has=self.page.get_by_text(str(child)))
