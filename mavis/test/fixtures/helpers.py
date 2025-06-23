from datetime import date, timedelta

import pytest

from ..data import TestData
from ..models import Vaccine
from ..wrappers import get_date_of_birth_for_year_group


@pytest.fixture
def add_vaccine_batch(add_batch_page, dashboard_page, vaccines_page):
    def wrapper(vaccine: Vaccine, batch_name: str = "ABC123"):
        vaccines_page.navigate()
        vaccines_page.click_add_batch(vaccine)
        add_batch_page.fill_name(batch_name)
        add_batch_page.fill_expiry_date(date.today() + timedelta(days=1))
        add_batch_page.confirm()
        return batch_name

    return wrapper


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


@pytest.fixture
def test_data(organisation, schools, nurse, children):
    return TestData(organisation, schools, nurse, children)


@pytest.fixture
def date_of_birth_for_year():
    def _get(year_group: int) -> date:
        return get_date_of_birth_for_year_group(year_group)

    return _get
