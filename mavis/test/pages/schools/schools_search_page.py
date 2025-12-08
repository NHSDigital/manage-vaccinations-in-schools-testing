from playwright.sync_api import Page, expect

from mavis.test.annotations import step
from mavis.test.data_models import School
from mavis.test.pages.header_component import HeaderComponent


class SchoolsSearchPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.header = HeaderComponent(page)
        self.search_textbox = page.get_by_role("searchbox", name="Search")
        self.search_button = page.get_by_role("button", name="Search")

    @step("Click on {1}")
    def click_school(self, school: School) -> None:
        self.search_textbox.fill(str(school))
        self.search_button.click()

        self.page.get_by_role("link", name=str(school)).first.click()

        ten_seconds_ms = 10000

        expect(self.page.locator("h1", has_text=str(school))).to_be_visible(
            timeout=ten_seconds_ms,
        )
