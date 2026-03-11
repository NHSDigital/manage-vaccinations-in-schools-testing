from playwright.sync_api import Page

from mavis.test.annotations import step
from mavis.test.utils import click_secondary_navigation_item


class SchoolsTabs:
    def __init__(self, page: Page) -> None:
        self.page = page

        secondary_menu = page.get_by_label("Secondary menu")

        self.sessions_link = secondary_menu.get_by_role("link", name="Sessions")
        self.children_link = secondary_menu.get_by_role("link", name="Children")

    @step("Click on Sessions tab")
    def click_sessions_tab(self) -> None:
        click_secondary_navigation_item(self.sessions_link)

    @step("Click on Children tab")
    def click_children_tab(self) -> None:
        click_secondary_navigation_item(self.children_link)
