from playwright.sync_api import Page, expect

from mavis.test.annotations import step
from mavis.test.data_models import School
from mavis.test.pages.header_component import HeaderComponent
from mavis.test.pages.search_components import BaseSearchComponent


class SchoolsSearchPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.search = BaseSearchComponent(page)
        self.header = HeaderComponent(page)

    @step("Click on {1}")
    def click_school(self, school: School) -> None:
        self.search.search_for(str(school))

        self.page.get_by_role("link", name=str(school)).first.click()

        ten_seconds_ms = 10000

        expect(self.page.locator("h1", has_text=str(school))).to_be_visible(
            timeout=ten_seconds_ms,
        )
