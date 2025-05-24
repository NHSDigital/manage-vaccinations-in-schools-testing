from playwright.sync_api import Page

from ..step import step


class StartPage:
    def __init__(self, page: Page):
        self.page = page

        self.start_button = page.get_by_text("Start now")

    @step("Go to start page")
    def navigate(self):
        self.page.goto("/")

    @step("Click on start button")
    def start(self):
        self.start_button.click()

    def navigate_and_start(self):
        self.navigate()
        self.start()
