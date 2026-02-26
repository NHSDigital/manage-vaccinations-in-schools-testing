import os
import random
import time
import urllib.parse

import pytest
import requests

from mavis.test.constants import Programme
from mavis.test.data import ClassFileMapping, VaccsFileMapping
from mavis.test.data.file_generator import FileGenerator
from mavis.test.data_models import Child
from mavis.test.onboarding import PointOfCareOnboarding
from mavis.test.pages import (
    DashboardPage,
    ImportRecordsWizardPage,
    ImportsPage,
    LogInPage,
    ReportsVaccinationsPage,
    ReviewSchoolMovePage,
    SchoolMovesPage,
    SchoolsChildrenPage,
    SchoolsSearchPage,
    SessionsOverviewPage,
)
from mavis.test.pages.utils import schedule_school_session_if_needed

pytestmark = pytest.mark.reporting

_year_groups = {Programme.FLU.group: random.choice(Programme.FLU.year_groups)}

_setup_complete = False


_MAX_ONBOARDING_ATTEMPTS = 3


def _onboard_team(base_url, year_groups, programmes_enabled):
    onboarding = PointOfCareOnboarding.get_onboarding_data_for_tests(
        base_url=base_url,
        year_groups=year_groups,
        programmes=programmes_enabled,
    )
    onboarding_url = urllib.parse.urljoin(base_url, "api/testing/onboard")
    for attempt in range(1, _MAX_ONBOARDING_ATTEMPTS + 1):
        response = requests.post(onboarding_url, json=onboarding.to_dict(), timeout=30)
        if response.ok:
            return onboarding
        if attempt < _MAX_ONBOARDING_ATTEMPTS:
            time.sleep(1)
        else:
            response.raise_for_status()
    msg = "Failed to onboard team"
    raise RuntimeError(msg)


def _delete_team(base_url, workgroup):
    url = urllib.parse.urljoin(base_url, f"api/testing/teams/{workgroup}")
    requests.delete(url, timeout=30)


def _refresh_reporting(base_url):
    url = urllib.parse.urljoin(base_url, "api/testing/refresh-reporting")
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    time.sleep(5)


@pytest.fixture(scope="module")
def base_url():
    return os.environ["BASE_URL"]


@pytest.fixture(scope="module")
def programmes_enabled():
    return os.environ["PROGRAMMES_ENABLED"].lower().split(",")


@pytest.fixture(scope="module")
def year_groups():
    return _year_groups


@pytest.fixture(scope="module")
def team_a(base_url, programmes_enabled):
    onboarding = _onboard_team(base_url, _year_groups, programmes_enabled)
    yield onboarding
    _delete_team(base_url, onboarding.team.workgroup)


@pytest.fixture(scope="module")
def team_b(base_url, programmes_enabled):
    onboarding = _onboard_team(base_url, _year_groups, programmes_enabled)
    yield onboarding
    _delete_team(base_url, onboarding.team.workgroup)


@pytest.fixture(scope="module")
def all_children():
    flu_year_group = _year_groups[Programme.FLU.group]
    return Child.generate_children_for_year_group(6, flu_year_group)


@pytest.fixture(scope="module")
def school_a(team_a):
    return team_a.schools[Programme.FLU.group][0]


@pytest.fixture(scope="module")
def school_b(team_b):
    return team_b.schools[Programme.FLU.group][0]


def _make_file_generator(onboarding, children_list, year_groups):
    return FileGenerator(
        organisation=onboarding.organisation,
        schools=onboarding.schools,
        nurse=onboarding.users["nurse"],
        children={Programme.FLU.group: children_list},
        clinics=onboarding.clinics,
        year_groups=year_groups,
    )


def _do_setup(page, base_url, team_a, team_b, all_children, school_a, school_b):
    global _setup_complete  # noqa: PLW0603
    if _setup_complete:
        return
    _setup_complete = True

    c1, c2, c3, c4, c5, c6 = all_children
    flu_year_group = _year_groups[Programme.FLU.group]

    team_a_class_fg = _make_file_generator(team_a, [c1, c2, c3, c4], _year_groups)

    LogInPage(page).navigate()
    LogInPage(page).log_in_and_choose_team_if_necessary(
        team_a.users["nurse"], team_a.team
    )

    DashboardPage(page).navigate()
    DashboardPage(page).click_schools()
    SchoolsSearchPage(page).click_school(school_a)
    SchoolsChildrenPage(page).click_import_class_lists()
    ImportRecordsWizardPage(page, team_a_class_fg).import_class_list(
        ClassFileMapping.REPORTING_REGRESSION_FOUR,
        flu_year_group,
        Programme.FLU.group,
    )

    schedule_school_session_if_needed(page, school_a, [Programme.FLU], [flu_year_group])
    session_id_a = SessionsOverviewPage(page).get_session_id_from_offline_excel()

    team_a_vaccs_fg = _make_file_generator(team_a, [c1, c2, c3, c4], _year_groups)

    SessionsOverviewPage(page).header.click_mavis_header()
    DashboardPage(page).click_imports()
    ImportsPage(page).click_upload_records()
    ImportRecordsWizardPage(
        page, team_a_vaccs_fg
    ).navigate_to_vaccination_records_import()
    ImportRecordsWizardPage(page, team_a_vaccs_fg).upload_and_verify_output(
        file_mapping=VaccsFileMapping.REPORTING_REGRESSION_TEAM_A,
        session_id=session_id_a,
        programme_group=Programme.FLU.group,
    )

    LogInPage(page).navigate()
    LogInPage(page).log_in_and_choose_team_if_necessary(
        team_b.users["nurse"], team_b.team
    )

    team_b_class_fg = _make_file_generator(team_b, [c2, c4, c5, c6], _year_groups)

    DashboardPage(page).navigate()
    DashboardPage(page).click_schools()
    SchoolsSearchPage(page).click_school(school_b)
    SchoolsChildrenPage(page).click_import_class_lists()
    ImportRecordsWizardPage(page, team_b_class_fg).import_class_list(
        ClassFileMapping.REPORTING_REGRESSION_FOUR,
        flu_year_group,
        Programme.FLU.group,
    )

    schedule_school_session_if_needed(page, school_b, [Programme.FLU], [flu_year_group])
    session_id_b = SessionsOverviewPage(page).get_session_id_from_offline_excel()

    team_b_vaccs_fg = _make_file_generator(team_b, [c5, c6], _year_groups)

    SessionsOverviewPage(page).header.click_mavis_header()
    DashboardPage(page).click_imports()
    ImportsPage(page).click_upload_records()
    ImportRecordsWizardPage(
        page, team_b_vaccs_fg
    ).navigate_to_vaccination_records_import()
    ImportRecordsWizardPage(page, team_b_vaccs_fg).upload_and_verify_output(
        file_mapping=VaccsFileMapping.REPORTING_REGRESSION_TEAM_B,
        session_id=session_id_b,
        programme_group=Programme.FLU.group,
    )

    ImportsPage(page).header.click_mavis_header()
    DashboardPage(page).click_school_moves()

    SchoolMovesPage(page).click_child(c2)
    ReviewSchoolMovePage(page).confirm()

    SchoolMovesPage(page).click_child(c4)
    ReviewSchoolMovePage(page).confirm()

    _refresh_reporting(base_url)


def test_team_a_reporting(
    page,
    base_url,
    team_a,
    team_b,
    all_children,
    school_a,
    school_b,
):
    _do_setup(page, base_url, team_a, team_b, all_children, school_a, school_b)

    LogInPage(page).navigate()
    LogInPage(page).log_in_and_choose_team_if_necessary(
        team_a.users["nurse"], team_a.team
    )

    ReportsVaccinationsPage(page).navigate()
    ReportsVaccinationsPage(page).check_filter_for_programme(Programme.FLU)
    ReportsVaccinationsPage(page).check_cohort_has_n_children("2")
    ReportsVaccinationsPage(page).check_category_percentage("Vaccinated", "50")
    ReportsVaccinationsPage(page).check_category_percentage("Not vaccinated", "50")


def test_team_b_reporting(
    page,
    base_url,
    team_a,
    team_b,
    all_children,
    school_a,
    school_b,
):
    _do_setup(page, base_url, team_a, team_b, all_children, school_a, school_b)

    LogInPage(page).navigate()
    LogInPage(page).log_in_and_choose_team_if_necessary(
        team_b.users["nurse"], team_b.team
    )

    ReportsVaccinationsPage(page).navigate()
    ReportsVaccinationsPage(page).check_filter_for_programme(Programme.FLU)
    ReportsVaccinationsPage(page).check_cohort_has_n_children("4")
    ReportsVaccinationsPage(page).check_category_percentage("Vaccinated", "50")
    ReportsVaccinationsPage(page).check_category_percentage("Not vaccinated", "50")
