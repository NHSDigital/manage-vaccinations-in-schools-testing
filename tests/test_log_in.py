import pytest
from playwright.sync_api import expect

from mavis.test.models import User

pytestmark = pytest.mark.log_in


@pytest.fixture(autouse=True)
def go_to_log_in_page(start_page):
    start_page.navigate_and_start()


@pytest.mark.parametrize("username", ("", "invalid"), ids=lambda v: f"username: {v}")
@pytest.mark.parametrize("password", ("", "invalid"), ids=lambda v: f"password: {v}")
def test_invalid(username, password, log_in_page):
    log_in_page.log_in(User(username=username, password=password, role="unknown"))
    expect(log_in_page.error_message).to_be_visible()


@pytest.fixture(scope="session")
def users(admin, nurse, superuser) -> dict[str, User]:
    return {
        "admin": admin,
        "nurse": nurse,
        "superuser": superuser,
    }


@pytest.mark.parametrize(
    "role", ("admin", "nurse", "superuser"), ids=lambda v: f"role: {v}"
)
def test_valid(role, users, organisation, dashboard_page, log_in_page):
    log_in_page.log_in(users[role])
    expect(log_in_page.log_out_button).to_be_visible()

    log_in_page.select_organisation(organisation)
    expect(dashboard_page.mavis_link).to_be_visible()
    expect(dashboard_page.programmes_link).to_be_visible()
    expect(dashboard_page.sessions_link).to_be_visible()
    expect(dashboard_page.children_link).to_be_visible()
    expect(dashboard_page.vaccines_link).to_be_visible()
    expect(dashboard_page.unmatched_consent_responses_link).to_be_visible()
    expect(dashboard_page.school_moves_link).to_be_visible()
    expect(dashboard_page.import_records_link).to_be_visible()
    expect(dashboard_page.your_organisation_link).to_be_visible()
    expect(dashboard_page.service_guidance_link).to_be_visible()

    log_in_page.log_out()
