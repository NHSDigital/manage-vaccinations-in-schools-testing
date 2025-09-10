from playwright.sync_api import Page

from mavis.test.annotations import step


class StartPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.heading = page.get_by_role(
            "heading",
            name="Manage vaccinations in schools (Mavis)",
        )
        self.start_link = page.get_by_role("link", name="Start now")

    @step("Go to start page")
    def navigate(self) -> None:
        self.page.goto("/")

    @step("Click on start button")
    def start(self) -> None:
        self.start_link.click()

    def navigate_and_start(self) -> None:
        self.navigate()
        self.start()
