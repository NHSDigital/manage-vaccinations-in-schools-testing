import pytest

from ..data import TestData


@pytest.fixture
def get_online_consent_url(
    nurse, organisation, schools, dashboard_page, log_in_page, sessions_page
):
    def wrapper(*programmes):
        try:
            log_in_page.navigate()
            log_in_page.log_in_and_select_organisation(nurse, organisation)
            dashboard_page.click_sessions()
            sessions_page.schedule_a_valid_session(schools[0])
            url = sessions_page.get_online_consent_url(*programmes)
            log_in_page.log_out()
            yield url
        finally:
            log_in_page.navigate()
            log_in_page.log_in_and_select_organisation(nurse, organisation)
            dashboard_page.click_sessions()
            sessions_page.delete_all_sessions(schools[0])
            log_in_page.log_out()

    return wrapper


@pytest.fixture
def log_in_as_admin(admin, organisation, log_in_page):
    log_in_page.navigate()
    log_in_page.log_in_and_select_organisation(admin, organisation)
    yield
    log_in_page.log_out()


@pytest.fixture
def log_in_as_nurse(nurse, organisation, log_in_page):
    log_in_page.navigate()
    log_in_page.log_in_and_select_organisation(nurse, organisation)
    yield
    log_in_page.log_out()


@pytest.fixture(scope="session")
def test_data(organisation, schools, nurse):
    return TestData(organisation, schools, nurse)
