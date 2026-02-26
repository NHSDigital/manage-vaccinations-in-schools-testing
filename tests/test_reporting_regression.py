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
from mavis.test.fixtures.onboarding import _create_onboarding_with_retry
from mavis.test.fixtures.team_reset import _delete_team
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


def _onboard_team(base_url):
    programmes_enabled = os.environ["PROGRAMMES_ENABLED"].lower().split(",")
    onboarding = PointOfCareOnboarding.get_onboarding_data_for_tests(
        base_url=base_url,
        year_groups=_year_groups,
        programmes=programmes_enabled,
    )
    return _create_onboarding_with_retry(base_url, onboarding)


def _refresh_reporting(base_url):
    url = urllib.parse.urljoin(base_url, "api/testing/refresh-reporting")
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    time.sleep(5)


@pytest.fixture(scope="module")
def team_a(base_url):
    onboarding = _onboard_team(base_url)
    yield onboarding
    _delete_team(base_url, onboarding.team)


@pytest.fixture(scope="module")
def team_b(base_url):
    onboarding = _onboard_team(base_url)
    yield onboarding
    _delete_team(base_url, onboarding.team)


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
    """
    Test: Verify reporting values for Team A after cross-team school moves.
    Steps:
    1. Setup two teams with 6 children across Flu programme.
       Team A gets children 1-4, Team B gets children 2, 4, 5, 6.
       Children 2 and 4 are school-moved from Team A to Team B.
       Team A vaccs: children 1, 2 vaccinated, children 3, 4 refused.
       Team B vaccs: child 5 vaccinated, child 6 refused.
    2. Log in as Team A nurse.
    3. Navigate to Reports > Vaccinations and filter by Flu.
    4. Check cohort size and vaccination percentages.
    Verification:
    - Team A cohort is 2 (children 1 and 3 remain after school moves).
    - 50% vaccinated (child 1), 50% not vaccinated (child 3).
    """
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
    """
    Test: Verify reporting values for Team B after cross-team school moves.
    Steps:
    1. Setup two teams with 6 children across Flu programme.
       Team A gets children 1-4, Team B gets children 2, 4, 5, 6.
       Children 2 and 4 are school-moved from Team A to Team B.
       Team A vaccs: children 1, 2 vaccinated, children 3, 4 refused.
       Team B vaccs: child 5 vaccinated, child 6 refused.
    2. Log in as Team B nurse.
    3. Navigate to Reports > Vaccinations and filter by Flu.
    4. Check cohort size and vaccination percentages.
    Verification:
    - Team B cohort is 4 (children 2, 4 moved in, plus children 5, 6).
    - 50% vaccinated (children 2 and 5), 50% not vaccinated (children 4 and 6).
    """
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
