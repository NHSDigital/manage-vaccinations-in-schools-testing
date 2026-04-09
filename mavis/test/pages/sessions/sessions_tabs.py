from playwright.sync_api import Page

from mavis.test.annotations import step
from mavis.test.utils import click_secondary_navigation_item


class SessionsTabs:
    def __init__(self, page: Page) -> None:
        self.page = page

        secondary_menu = page.get_by_label("Secondary menu")

        self.overview_link = secondary_menu.get_by_role("link", name="Overview")
        self.psds_link = secondary_menu.get_by_role("link", name="PSDs")
        self.record_vaccinations_link = secondary_menu.get_by_role(
            "link", name="Record vaccinations"
        )
        self.children_link = secondary_menu.get_by_role(
            "link", name="Children in session"
        )

    @step("Click on Overview tab")
    def click_overview_tab(self) -> None:
        click_secondary_navigation_item(self.overview_link)

    @step("Click on PSDs tab")
    def click_psds_tab(self) -> None:
        click_secondary_navigation_item(self.psds_link)

    @step("Click on Record vaccinations")
    def click_record_vaccinations_tab(self) -> None:
        click_secondary_navigation_item(self.record_vaccinations_link)

    @step("Click on Children in session tab")
    def click_children_tab(self) -> None:
        click_secondary_navigation_item(self.children_link)
