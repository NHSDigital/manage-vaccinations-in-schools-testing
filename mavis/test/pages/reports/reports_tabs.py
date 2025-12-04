from playwright.sync_api import Page

from mavis.test.annotations import step


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
        self.vaccinations_tab.click()
        self.vaccinations_tab.get_by_role("strong").wait_for()

    @step("Click on Download Data tab")
    def click_download_data_tab(self) -> None:
        self.download_data_tab.click()
        self.download_data_tab.get_by_role("strong").wait_for()
