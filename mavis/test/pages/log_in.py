from pathlib import Path

from playwright.sync_api import Page, expect

from mavis.test.annotations import step
from mavis.test.models import Team, User
from mavis.test.utils import get_current_datetime


class LogInPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.current_user = None  # Track current logged in user

        self.username_input = page.get_by_role("textbox", name="Email address")
        self.password_input = page.get_by_role("textbox", name="Password")
        self.log_in_button = page.get_by_role("button", name="Log in")

        self.error_message = page.get_by_text("Invalid Email or password")

        self.log_out_button = page.get_by_role("button", name="Log out")
        self.log_out_link = page.get_by_role("link", name="Log out")
        self.continue_button = page.get_by_role("button", name="Continue")
        self.select_a_team_heading = page.get_by_text("Select a team")
        self.start_page_link = page.get_by_role("link", name="Start now")

    def _write_audit_log(self, event_type: str, user: User) -> None:
        """Helper method to write audit log entries."""
        audit_log_path = Path("logs") / "login.log"
        audit_log_path.parent.mkdir(parents=True, exist_ok=True)

        timestamp = get_current_datetime().strftime("%Y-%m-%d %H:%M:%S")
        user_role = getattr(user, "role", "unknown")

        with audit_log_path.open("a") as file:
            log_message = (
                f"{timestamp} | {event_type} | {user.username} | {user_role}\n"
            )
            file.write(log_message)

    @step("Go to log in page")
    def navigate(self) -> None:
        self.page.goto("/users/sign-in")

    @step("Log in as {1}")
    def log_in(self, user: User) -> None:
        # Store current user for logout logging
        self.current_user = user

        # Write to login audit log
        self._write_audit_log("LOGIN_ATTEMPT", user)

        self.username_input.fill(user.username)
        self.password_input.fill(user.password)
        self.log_in_button.click()

    @step("Log out")
    def log_out(self) -> None:
        if self.log_out_button.is_visible():
            # Write logout to audit log
            if self.current_user:
                self._write_audit_log("LOGOUT", self.current_user)
                self.current_user = None  # Clear current user

            self.log_out_button.click()
            expect(self.start_page_link).to_be_visible()

    @step("Log out")
    def log_out_via_reporting_component(self) -> None:
        # Write logout to audit log
        if self.current_user:
            self._write_audit_log("LOGOUT", self.current_user)
            self.current_user = None  # Clear current user

        self.log_out_link.click()

    @step("Log in as {1} and choose team {2}")
    def log_in_and_choose_team_if_necessary(self, user: User, team: Team) -> None:
        self.log_in(user)
        if self.select_a_team_heading.is_visible():
            self.page.get_by_role("radio", name=team.name).check()
            self.continue_button.click()


class LogOutPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.log_out_button = page.locator("#main-content").get_by_role(
            "button", name="Log out"
        )
        self.log_out_header = page.get_by_role("heading", name="Log out")
        self.start_page_link = page.get_by_role("link", name="Start now")

    @step("Navigate to the Log out page")
    def navigate(self) -> None:
        self.page.goto("/logout")

    @step("Verify the log out page")
    def verify_log_out_page(self) -> None:
        expect(self.log_out_header).to_be_visible()
        self.log_out_button.click()
        expect(self.start_page_link).to_be_visible()
