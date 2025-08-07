import os
from datetime import date, timedelta

import pytest

from mavis.test.data import TestData
from mavis.test.models import Vaccine
from mavis.test.wrappers import get_date_of_birth_for_year_group


@pytest.fixture
def set_feature_flags(flipper_page):
    set_check_feature_flags = os.getenv("SET_FEATURE_FLAGS", "false").lower() == "true"

    if set_check_feature_flags:
        flipper_page.navigate()
        flipper_page.set_feature_flags()

    yield

    if set_check_feature_flags:
        flipper_page.navigate()
        flipper_page.set_feature_flags(check_only=True)


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
    set_feature_flags,
    nurse,
    team,
    dashboard_page,
    log_in_page,
    sessions_page,
):
    def wrapper(school, *programmes):
        try:
            log_in_page.navigate()
            log_in_page.log_in_and_select_team(nurse, team)
            dashboard_page.click_sessions()
            sessions_page.schedule_a_valid_session(school, programmes[0].group)
            url = sessions_page.get_online_consent_url(*programmes)
            log_in_page.log_out()
            yield url
        finally:
            log_in_page.navigate()
            log_in_page.log_in_and_select_team(nurse, team)
            dashboard_page.click_sessions()
            sessions_page.delete_all_sessions(school)
            log_in_page.log_out()

    return wrapper


@pytest.fixture
def get_online_consent_url_without_cleanup(
    set_feature_flags,
    nurse,
    team,
    dashboard_page,
    log_in_page,
    sessions_page,
):
    def wrapper(school, *programmes):
        log_in_page.navigate()
        log_in_page.log_in_and_select_team(nurse, team)
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session(school, programmes[0].group)
        url = sessions_page.get_online_consent_url(*programmes)
        log_in_page.log_out()
        yield url

    return wrapper


@pytest.fixture
def log_in_as_admin(set_feature_flags, admin, team, log_in_page):
    log_in_page.navigate()
    log_in_page.log_in_and_select_team(admin, team)
    yield
    log_in_page.log_out()


@pytest.fixture
def log_in_as_nurse(set_feature_flags, nurse, team, log_in_page):
    log_in_page.navigate()
    log_in_page.log_in_and_select_team(nurse, team)
    yield
    log_in_page.log_out()


@pytest.fixture
def test_data(team, organisation, schools, nurse, children, clinics, year_groups):
    return TestData(team, organisation, schools, nurse, children, clinics, year_groups)


@pytest.fixture
def date_of_birth_for_year():
    def _get(year_group: int) -> date:
        return get_date_of_birth_for_year_group(year_group)

    return _get
