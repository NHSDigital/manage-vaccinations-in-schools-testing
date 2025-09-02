import pytest
from playwright.sync_api import expect

from mavis.test.models import User

pytestmark = pytest.mark.log_in


@pytest.fixture(autouse=True)
def go_to_log_in_page(start_page):
    start_page.navigate_and_start()


@pytest.mark.parametrize("username", ("", "invalid"), ids=lambda v: f"username: {v}")
@pytest.mark.parametrize("password", ("", "invalid"), ids=lambda v: f"password: {v}")
def test_login_with_invalid_credentials(username, password, log_in_page):
    """
    Test: Attempt to log in with invalid or empty credentials and verify error message.
    Steps:
    1. Navigate to the log in page (autouse fixture).
    2. Attempt to log in with the given username and password.
    Verification:
    - Error message is displayed indicating invalid credentials.
    """
    log_in_page.log_in(User(username=username, password=password, role="unknown"))
    expect(log_in_page.error_message).to_be_visible()


@pytest.fixture(scope="session")
def users(medical_secretary, nurse, superuser) -> dict[str, User]:
    return {
        "medical_secretary": medical_secretary,
        "nurse": nurse,
        "superuser": superuser,
    }


@pytest.mark.parametrize(
    "role", ("medical_secretary", "nurse", "superuser"), ids=lambda v: f"role: {v}"
)
def test_login_with_valid_credentials(role, users, team, dashboard_page, log_in_page):
    """
    Test: Log in with valid credentials for each user role and verify dashboard links.
    Steps:
    1. Navigate to the log in page (autouse fixture).
    2. Log in as the specified user role and select team if necessary.
    3. Verify that all expected dashboard links are visible.
    4. Log out.
    Verification:
    - Log out button and all dashboard navigation links are visible after login.
    """
    log_in_page.log_in_and_choose_team_if_necessary(users[role], team)
    expect(log_in_page.log_out_button).to_be_visible()

    expect(dashboard_page.mavis_link).to_be_visible()
    expect(dashboard_page.programmes_link).to_be_visible()
    expect(dashboard_page.sessions_link).to_be_visible()
    expect(dashboard_page.children_link).to_be_visible()
    expect(dashboard_page.vaccines_link).to_be_visible()
    expect(dashboard_page.unmatched_consent_responses_link).to_be_visible()
    expect(dashboard_page.school_moves_link).to_be_visible()
    expect(dashboard_page.import_records_link).to_be_visible()
    expect(dashboard_page.your_team_link).to_be_visible()
    expect(dashboard_page.service_guidance_link).to_be_visible()

    log_in_page.log_out()
