import pytest
from playwright.sync_api import expect

from mavis.test.helpers.accessibility_helper import AccessibilityHelper
from mavis.test.models import User
from mavis.test.pages import (
    DashboardPage,
    LogInPage,
    LogOutPage,
    StartPage,
    TeamPage,
)

pytestmark = pytest.mark.log_in


@pytest.fixture(autouse=True)
def go_to_log_in_page(page):
    StartPage(page).navigate_and_start()


@pytest.mark.parametrize("username", ["", "invalid"], ids=lambda v: f"username: {v}")
@pytest.mark.parametrize("password", ["", "invalid"], ids=lambda v: f"password: {v}")
def test_login_with_invalid_credentials(username, password, page):
    """
    Test: Attempt to log in with invalid or empty credentials and verify error message.
    Steps:
    1. Navigate to the log in page (autouse fixture).
    2. Attempt to log in with the given username and password.
    Verification:
    - Error message is displayed indicating invalid credentials.
    """
    LogInPage(page).log_in(User(username=username, password=password, role="unknown"))
    expect(LogInPage(page).error_message).to_be_visible()


@pytest.fixture(scope="session")
def users(
    medical_secretary, nurse, superuser, healthcare_assistant, prescriber
) -> dict[str, User]:
    return {
        "medical_secretary": medical_secretary,
        "nurse": nurse,
        "superuser": superuser,
        "healthcare_assistant": healthcare_assistant,
        "prescriber": prescriber,
    }


@pytest.mark.parametrize(
    "role",
    ["medical_secretary", "nurse", "superuser", "healthcare_assistant", "prescriber"],
    ids=lambda v: f"role: {v}",
)
def test_login_with_valid_credentials(
    role,
    users,
    team,
    page,
):
    """
    Test: Log in with valid credentials for each user role and verify dashboard links
       and team information.
    Steps:
    1. Navigate to the log in page (autouse fixture).
    2. Log in as the specified user role and select team if necessary.
    3. Verify that all expected dashboard links are visible.
    4. Verify that team information is visible in Team page.
    5. Log out.
    Verification:
    - Log out button and all dashboard navigation links are visible after login.
    - Team name and email are visible in the Team page.
    """
    LogInPage(page).log_in_and_choose_team_if_necessary(users[role], team)
    expect(LogInPage(page).log_out_button).to_be_visible()

    expect(DashboardPage(page).header.mavis_link).to_be_visible()
    expect(DashboardPage(page).programmes_link).to_be_visible()
    expect(DashboardPage(page).sessions_link).to_be_visible()
    expect(DashboardPage(page).children_link).to_be_visible()
    expect(DashboardPage(page).vaccines_link).to_be_visible()
    expect(DashboardPage(page).unmatched_consent_responses_link).to_be_visible()
    expect(DashboardPage(page).school_moves_link).to_be_visible()
    expect(DashboardPage(page).imports_link).to_be_visible()
    expect(DashboardPage(page).your_team_link).to_be_visible()
    expect(DashboardPage(page).service_guidance_link).to_be_visible()

    DashboardPage(page).click_your_team()
    TeamPage(page).check_team_name_is_visible(team)
    TeamPage(page).check_team_email_is_visible(team)

    LogInPage(page).log_out()


def test_logout_page(page, users, team):
    """
    Test: Verify the log out page functionality.
    Steps:
    1. Navigate to the log in page (autouse fixture).
    2. Log in as a nurse and choose team if necessary.
    3. Navigate to the log out page.
    4. Verify the log out page is displayed correctly.
    5. Click the log out button and verify redirection to the start page.
    Verification:
    - Log out page is displayed with the correct heading.
    - After logging out, the start page link is visible.
    """
    LogInPage(page).log_in_and_choose_team_if_necessary(users["nurse"], team)
    LogOutPage(page).navigate()
    LogOutPage(page).verify_log_out_page()


@pytest.mark.accessibility
def test_accessibility(page, users, team):
    """
    Test: Verify that the log in, team and dashboard page pass accessibility checks.
    Steps:
    1. Navigate to the log in page.
    2. Run accessibility checks.
    3. Log in as a nurse and choose team if necessary.
    4. Run accessibility checks on the dashboard page.
    5. Navigate to the team page and run accessibility checks.
    Verification:
    - No accessibility issues are found on these pages.
    """
    AccessibilityHelper(page).check_accessibility()

    LogInPage(page).log_in_and_choose_team_if_necessary(users["nurse"], team)
    AccessibilityHelper(page).check_accessibility()

    DashboardPage(page).click_your_team()
    AccessibilityHelper(page).check_accessibility()
