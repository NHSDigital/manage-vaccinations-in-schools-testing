from playwright.sync_api import Page

from libs.organisation import Organisation
from libs.step import step


class LogInPage:
    def __init__(self, page: Page):
        self.page = page

        self.username_input = page.get_by_role("textbox", name="Email address")
        self.password_input = page.get_by_role("textbox", name="Password")
        self.log_in_button = page.get_by_role("button", name="Log in")

        self.error_message = page.get_by_text("Invalid Email or password.")

        self.log_out_button = page.get_by_role("button", name="Log out")

    @step("Go to log in page")
    def navigate(self):
        self.page.goto("/users/sign-in")

    @step("Log in as {0}")
    def log_in(self, username: str, password: str):
        self.username_input.fill(username)
        self.password_input.fill(password)
        self.log_in_button.click()

    @step("Select organisation {0}")
    def select_organisation(self, organisation: Organisation):
        self.page.get_by_role("button", name=str(organisation)).click()

    @step("Log out")
    def log_out(self):
        self.log_out_button.click()

    def log_in_and_select_organisation(
        self, username: str, password: str, organisation: Organisation
    ):
        self.log_in(username, password)
        self.select_organisation(organisation)
