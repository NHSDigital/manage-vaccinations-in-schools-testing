import os

import pytest
from playwright.sync_api import Page

from mavis.test.accessibility import AccessibilityHelper
from mavis.test.data import TestData
from mavis.test.models import Programme, School, Vaccine
from mavis.test.utils import get_offset_date


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
def add_vaccine_batch(add_batch_page, vaccines_page):
    def wrapper(vaccine: Vaccine, batch_name: str = "ABC123"):
        vaccines_page.navigate()
        vaccines_page.click_add_batch(vaccine)
        add_batch_page.fill_name(batch_name)
        add_batch_page.fill_expiry_date(get_offset_date(1))
        add_batch_page.confirm()
        return batch_name

    return wrapper


@pytest.fixture
def schedule_session_and_get_consent_url(
    set_feature_flags,
    nurse,
    team,
    dashboard_page,
    log_in_page,
    sessions_page,
):
    def wrapper(school: School, *programmes: Programme):
        try:
            log_in_page.navigate()
            log_in_page.log_in_and_choose_team_if_necessary(nurse, team)
            dashboard_page.click_sessions()
            sessions_page.click_session_for_programme_group(school, programmes[0].group)
            sessions_page.schedule_a_valid_session()
            url = sessions_page.get_online_consent_url(*programmes)
            log_in_page.log_out()
            yield url
        finally:
            log_in_page.navigate()
            log_in_page.log_in_and_choose_team_if_necessary(nurse, team)
            dashboard_page.click_sessions()
            sessions_page.delete_all_sessions(school)
            log_in_page.log_out()

    return wrapper


@pytest.fixture
def schedule_all_sessions_and_get_consent_url(
    set_feature_flags,
    nurse,
    team,
    dashboard_page,
    log_in_page,
    sessions_page,
):
    def wrapper(schools: list[School], *programmes: Programme):
        try:
            url = None

            log_in_page.navigate()
            log_in_page.log_in_and_choose_team_if_necessary(nurse, team)

            for idx, school in enumerate(schools):
                dashboard_page.navigate()
                dashboard_page.click_sessions()
                sessions_page.click_session_for_programme_group(
                    school, programmes[0].group
                )
                sessions_page.schedule_a_valid_session()
                if idx == 0:
                    url = sessions_page.get_online_consent_url(*programmes)

            log_in_page.log_out()

            if url is None:
                msg = "No schools provided"
                raise ValueError(msg)

            yield url
        finally:
            log_in_page.navigate()
            log_in_page.log_in_and_choose_team_if_necessary(nurse, team)
            for school in schools:
                dashboard_page.navigate()
                dashboard_page.click_sessions()
                sessions_page.delete_all_sessions(school)
            log_in_page.log_out()

    return wrapper


@pytest.fixture
def log_in_as_medical_secretary(
    set_feature_flags,
    medical_secretary,
    team,
    log_in_page,
):
    log_in_page.navigate()
    log_in_page.log_in_and_choose_team_if_necessary(medical_secretary, team)
    yield
    log_in_page.log_out()


@pytest.fixture
def log_in_as_nurse(set_feature_flags, nurse, team, log_in_page):
    log_in_page.navigate()
    log_in_page.log_in_and_choose_team_if_necessary(nurse, team)
    yield
    log_in_page.log_out()


@pytest.fixture
def log_in_as_prescriber(set_feature_flags, prescriber, team, log_in_page):
    log_in_page.navigate()
    log_in_page.log_in_and_choose_team_if_necessary(prescriber, team)
    yield
    log_in_page.log_out()


@pytest.fixture
def test_data(organisation, schools, nurse, children, clinics, year_groups):
    return TestData(organisation, schools, nurse, children, clinics, year_groups)


@pytest.fixture
def accessibility_helper(page: Page) -> AccessibilityHelper:
    return AccessibilityHelper(page)
