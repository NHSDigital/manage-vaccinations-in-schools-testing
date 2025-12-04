from playwright.sync_api import Page

from mavis.test.annotations import step
from mavis.test.pages.header_component import HeaderComponent


class ProgrammeTabs:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.header = HeaderComponent(page)

        self.children_tab = page.get_by_label("Secondary menu").get_by_role(
            "link", name="Children"
        )
        self.sessions_tab = page.get_by_label("Secondary menu").get_by_role(
            "link", name="Sessions"
        )

    @step("Click on Children")
    def click_children_tab(self) -> None:
        self.children_tab.click()
        self.children_tab.get_by_role("strong").wait_for()

    @step("Click on Sessions")
    def click_sessions_tab(self) -> None:
        self.sessions_tab.click()
        self.sessions_tab.get_by_role("strong").wait_for()
