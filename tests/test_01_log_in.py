from playwright.sync_api import expect
import pytest

from mavis.testing.mavis_constants import test_data_values


organisation = test_data_values.ORG_CODE


@pytest.fixture(autouse=True)
def go_to_log_in_page(start_page):
    start_page.navigate_and_start()


@pytest.mark.log_in
@pytest.mark.order(101)
@pytest.mark.parametrize("username", ("", "invalid"))
@pytest.mark.parametrize("password", ("", "invalid"))
def test_invalid(username, password, log_in_page):
    log_in_page.log_in(username, password)
    log_in_page.expect_failure()


@pytest.fixture(scope="session")
def users(admin, nurse, superuser) -> dict[str, dict[str, str]]:
    return {
        "admin": admin,
        "nurse": nurse,
        "superuser": superuser,
    }


@pytest.mark.log_in
@pytest.mark.order(102)
@pytest.mark.parametrize("role", ("admin", "nurse", "superuser"))
def test_valid(role, users, dashboard_page, log_in_page):
    log_in_page.log_in(**users[role])
    log_in_page.expect_success()
    log_in_page.select_role(organisation)

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
