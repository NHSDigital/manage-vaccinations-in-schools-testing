from playwright.sync_api import Page

from mavis.test.annotations import step


class BaseSearchComponent:
    def __init__(
        self,
        page: Page,
    ) -> None:
        self.page = page
        self.search_textbox = self.page.get_by_role("searchbox", name="Search")
        self.search_button = self.page.get_by_role("button", name="Search")
        self.update_results_button = self.page.get_by_role(
            "button",
            name="Update results",
        )

    @step("Search for {1}")
    def search_for(self, name: str) -> None:
        self.search_textbox.fill(name)
        self.search_button.click()

    @step("Click on Update results")
    def click_on_update_results(self) -> None:
        self.update_results_button.click()
