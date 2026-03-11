from playwright.sync_api import Page

from mavis.test.annotations import step
from mavis.test.utils import click_secondary_navigation_item


class ReportsTabs:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.vaccinations_tab = page.get_by_label("Secondary menu").get_by_role(
            "link", name="Vaccinations"
        )
        self.download_data_tab = page.get_by_label("Secondary menu").get_by_role(
            "link", name="Download Data"
        )

    @step("Click on Vaccinations tab")
    def click_vaccinations_tab(self) -> None:
        click_secondary_navigation_item(self.vaccinations_tab)

    @step("Click on Download Data tab")
    def click_download_data_tab(self) -> None:
        click_secondary_navigation_item(self.download_data_tab)
