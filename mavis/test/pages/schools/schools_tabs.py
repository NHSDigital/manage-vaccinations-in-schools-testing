from playwright.sync_api import Page

from mavis.test.annotations import step


class SchoolsTabs:
    def __init__(
        self,
        page: Page,
    ) -> None:
        self.page = page

    def _select_tab(self, name: str) -> None:
        link = self.page.get_by_label("Secondary menu").get_by_role("link", name=name)
        if link.get_by_role("strong").is_visible():
            return
        link.click()
        link.get_by_role("strong").wait_for()

    @step("Click on Sessions tab")
    def click_sessions_tab(self) -> None:
        self._select_tab("Sessions")

    @step("Click on Children tab")
    def click_children_tab(self) -> None:
        self._select_tab("Children")
