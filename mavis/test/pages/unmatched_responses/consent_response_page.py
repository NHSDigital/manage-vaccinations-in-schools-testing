from playwright.sync_api import Page

from mavis.test.annotations import step
from mavis.test.pages.header import HeaderComponent


class ConsentResponsePage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.header = HeaderComponent(page)

        self.archive_link = page.get_by_role("link", name="Archive", exact=True)
        self.create_new_record_link = page.get_by_role(
            "link",
            name="Create new record",
            exact=True,
        )
        self.match_link = page.get_by_role("link", name="Match", exact=True)

    @step("Click on Archive")
    def click_archive(self) -> None:
        self.archive_link.click()

    @step("Click on Create new record")
    def click_create_new_record(self) -> None:
        self.create_new_record_link.click()

    @step("Click on Match")
    def click_match(self) -> None:
        self.match_link.click()
