from playwright.sync_api import Page, expect

from mavis.test.annotations import step
from mavis.test.models import Team, User


class LogInPage:
    def __init__(self, page: Page):
        self.page = page

        self.username_input = page.get_by_role("textbox", name="Email address")
        self.password_input = page.get_by_role("textbox", name="Password")
        self.log_in_button = page.get_by_role("button", name="Log in")

        self.error_message = page.get_by_text("Invalid Email or password")

        self.log_out_button = page.get_by_role("button", name="Log out")
        self.continue_button = page.get_by_role("button", name="Continue")
        self.select_a_team_heading = page.get_by_text("Select a team")
        self.start_page_link = page.get_by_role("link", name="Start now")

    @step("Go to log in page")
    def navigate(self):
        self.page.goto("/users/sign-in")

    @step("Log in as {1}")
    def log_in(self, user: User):
        self.username_input.fill(user.username)
        self.password_input.fill(user.password)
        self.log_in_button.click()

    @step("Log out")
    def log_out(self):
        self.log_out_button.click()
        expect(self.start_page_link).to_be_visible()

    @step("Log in as {1} and choose team {2}")
    def log_in_and_choose_team_if_necessary(self, user: User, team: Team):
        self.log_in(user)
        if self.select_a_team_heading.is_visible():
            self.page.get_by_role("radio", name=team.name).check()
            self.continue_button.click()
