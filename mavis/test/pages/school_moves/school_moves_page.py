from playwright.sync_api import Locator, Page, expect

from mavis.test.annotations import step
from mavis.test.data_models import Child
from mavis.test.pages.header_component import HeaderComponent
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
        self.review_link = page.get_by_role("link", name="Review")
        self.update_school_move_radio = page.get_by_text(
            "Update record with new school"
        )
        self.update_child_record_button = page.get_by_role(
            "button", name="Update child record"
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

    @step("Accept all school moves")
    def accept_all_school_moves(self) -> None:
        # Loop through all rows and accept each school move individually
        while True:
            review_links = self.review_link.all()
            if not review_links:
                break

            review_links[0].click()

            # Accept the school move
            self.update_school_move_radio.click()
            self.update_child_record_button.click()

            # Wait to return to the school moves page
            expect(
                self.page.get_by_text("There are currently no school")
            ).to_be_visible()
