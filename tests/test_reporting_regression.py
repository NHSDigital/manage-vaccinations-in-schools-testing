import random
import time
import urllib.parse
from datetime import UTC, datetime

import httpx
import pytest

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
    LogOutPage,
    ReportsConsentPage,
    ReportsDownloadPage,
    ReportsVaccinationsPage,
    ReviewSchoolMovePage,
    SchoolChildrenPage,
    SchoolMovesPage,
    SchoolsSearchPage,
    SessionsOverviewPage,
)
from mavis.test.pages.utils import schedule_school_session_if_needed

pytestmark = pytest.mark.reporting

_yg1, _yg2, _yg3 = random.sample(list(range(7, 12)), 3)
_year_groups = {p.group: _yg1 for p in Programme}

_setup_complete = False


def _onboard_team(base_url):
    onboarding = PointOfCareOnboarding.get_onboarding_data_for_tests(
        base_url=base_url,
        year_groups=_year_groups,
        programmes=["flu"],
    )
    return _create_onboarding_with_retry(base_url, onboarding)


def _refresh_reporting(base_url):
    url = urllib.parse.urljoin(base_url, "api/testing/refresh-reporting")
    response = httpx.get(url, timeout=30)
    response.raise_for_status()
    time.sleep(5)


def _make_file_generator(onboarding, children_list):
    return FileGenerator(
        organisation=onboarding.organisation,
        schools=onboarding.schools,
        nurse=onboarding.users["nurse"],
        children={Programme.FLU.group: children_list},
        clinics=onboarding.clinics,
        year_groups=_year_groups,
    )


def _upload_class_list(page, school, onboarding, children, mapping, year_group):
    fg = _make_file_generator(onboarding, children)
    DashboardPage(page).navigate()
    DashboardPage(page).click_schools()
    SchoolsSearchPage(page).click_school(school)
    SchoolChildrenPage(page).click_import_class_lists()
    ImportRecordsWizardPage(page, fg).import_class_list(
        mapping,
        year_group,
        Programme.FLU.group,
    )


def _download_aggregate_csv(page, programme):
    ReportsVaccinationsPage(page).navigate()
    ReportsVaccinationsPage(page).tabs.click_download_data_tab()
    page.get_by_role("radio", name="Aggregate vaccination and consent data").check()
    ReportsDownloadPage(page).click_continue()
    ReportsDownloadPage(page).choose_programme(programme)
    ReportsDownloadPage(page).choose_variable("Year group")
    ReportsDownloadPage(page).choose_variable("Gender")
    return ReportsDownloadPage(page).download_and_get_dataframe()


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
    return [
        Child.generate(_yg1),
        Child.generate(_yg1),
        Child.generate(_yg2),
        Child.generate(_yg2),
        Child.generate(_yg3),
        Child.generate(_yg3),
    ]


@pytest.fixture(scope="module")
def school_a(team_a):
    return team_a.schools[Programme.FLU.group][0]


@pytest.fixture(scope="module")
def school_b(team_b):
    return team_b.schools[Programme.FLU.group][0]


def _do_setup(page, base_url, team_a, team_b, all_children, school_a, school_b):
    global _setup_complete  # noqa: PLW0603
    if _setup_complete:
        return

    c1, c2, c3, c4, c5, c6 = all_children
    two_mf = ClassFileMapping.REPORTING_REGRESSION_TWO_MF
    one_f = ClassFileMapping.REPORTING_REGRESSION_ONE_F

    LogInPage(page).navigate()
    LogInPage(page).log_in_and_choose_team_if_necessary(
        team_a.users["nurse"], team_a.team
    )

    _upload_class_list(page, school_a, team_a, [c1, c2], two_mf, _yg1)
    _upload_class_list(page, school_a, team_a, [c3, c4], two_mf, _yg2)

    schedule_school_session_if_needed(
        page,
        school_a,
        [Programme.FLU],
        [_yg1, _yg2],
    )
    session_id_a = SessionsOverviewPage(page).get_session_id_from_offline_excel()

    team_a_vaccs_fg = _make_file_generator(team_a, [c1, c2, c3, c4])

    SessionsOverviewPage(page).header.click_mavis()
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

    LogOutPage(page).navigate()
    LogOutPage(page).verify_log_out_page()
    LogInPage(page).navigate()
    LogInPage(page).log_in_and_choose_team_if_necessary(
        team_b.users["nurse"], team_b.team
    )

    _upload_class_list(page, school_b, team_b, [c2], one_f, _yg1)
    _upload_class_list(page, school_b, team_b, [c4], one_f, _yg2)
    _upload_class_list(page, school_b, team_b, [c5, c6], two_mf, _yg3)

    schedule_school_session_if_needed(
        page,
        school_b,
        [Programme.FLU],
        [_yg1, _yg2, _yg3],
    )
    session_id_b = SessionsOverviewPage(page).get_session_id_from_offline_excel()

    team_b_vaccs_fg = _make_file_generator(team_b, [c5, c6])

    SessionsOverviewPage(page).header.click_mavis()
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

    ImportsPage(page).header.click_mavis()
    DashboardPage(page).click_school_moves()

    SchoolMovesPage(page).click_child(c2)
    ReviewSchoolMovePage(page).confirm()

    SchoolMovesPage(page).click_child(c4)
    ReviewSchoolMovePage(page).confirm()

    _refresh_reporting(base_url)

    LogOutPage(page).navigate()
    LogOutPage(page).verify_log_out_page()

    _setup_complete = True


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
    1. Setup two teams with 6 children across Flu programme, spread across
       3 year groups (2 per group) with alternating Male/Female genders.
       Team A gets children 1-4, Team B gets children 2, 4, 5, 6.
       Children 2 and 4 are school-moved from Team A to Team B.
       Team A vaccs: children 1, 2 vaccinated, children 3, 4 refused.
       Team B vaccs: child 5 vaccinated, child 6 refused.
    2. Log in as Team A nurse.
    3. Navigate to Reports > Vaccinations and filter by Flu.
    4. Check cohort size, vaccination percentages, and monthly counts.
    Verification:
    - Team A cohort is 2 (children 1 and 3 remain after school moves).
    - 50% vaccinated (child 1), 50% not vaccinated (child 3).
    - Monthly vaccinations given: 2 (children 1 and 2, vaccinated by Team A).
    """
    _do_setup(page, base_url, team_a, team_b, all_children, school_a, school_b)

    page.context.clear_cookies()
    LogInPage(page).navigate()
    LogInPage(page).log_in_and_choose_team_if_necessary(
        team_a.users["nurse"], team_a.team
    )

    ReportsVaccinationsPage(page).navigate()
    ReportsVaccinationsPage(page).check_filter_for_programme(Programme.FLU)
    ReportsVaccinationsPage(page).check_cohort_has_n_children("2")
    ReportsVaccinationsPage(page).check_category_percentage("Vaccinated", "50.0")
    ReportsVaccinationsPage(page).check_category_percentage("Not vaccinated", "50.0")

    monthly = ReportsVaccinationsPage(page).get_monthly_vaccinations()
    current_month = datetime.now(tz=UTC).strftime("%B %Y")
    expected_vaccinations = 2
    assert monthly[current_month] == expected_vaccinations
    assert monthly["Total"] == expected_vaccinations


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
    1. Setup two teams with 6 children across Flu programme, spread across
       3 year groups (2 per group) with alternating Male/Female genders.
       Team A gets children 1-4, Team B gets children 2, 4, 5, 6.
       Children 2 and 4 are school-moved from Team A to Team B.
       Team A vaccs: children 1, 2 vaccinated, children 3, 4 refused.
       Team B vaccs: child 5 vaccinated, child 6 refused.
    2. Log in as Team B nurse.
    3. Navigate to Reports > Vaccinations and filter by Flu.
    4. Check cohort size, vaccination percentages, and monthly counts.
    Verification:
    - Team B cohort is 4 (children 2, 4 moved in, plus children 5, 6).
    - 50% vaccinated (children 2 and 5), 50% not vaccinated (children 4 and 6).
    - Monthly vaccinations given: 1 (child 5, vaccinated by Team B).
    """
    _do_setup(page, base_url, team_a, team_b, all_children, school_a, school_b)

    page.context.clear_cookies()
    LogInPage(page).navigate()
    LogInPage(page).log_in_and_choose_team_if_necessary(
        team_b.users["nurse"], team_b.team
    )

    ReportsVaccinationsPage(page).navigate()
    ReportsVaccinationsPage(page).check_filter_for_programme(Programme.FLU)
    ReportsVaccinationsPage(page).check_cohort_has_n_children("4")
    ReportsVaccinationsPage(page).check_category_percentage("Vaccinated", "50.0")
    ReportsVaccinationsPage(page).check_category_percentage("Not vaccinated", "50.0")

    monthly = ReportsVaccinationsPage(page).get_monthly_vaccinations()
    current_month = datetime.now(tz=UTC).strftime("%B %Y")
    assert monthly[current_month] == 1
    assert monthly["Total"] == 1


def test_team_a_consent(
    page,
    base_url,
    team_a,
    team_b,
    all_children,
    school_a,
    school_b,
):
    """
    Test: Verify consent reporting values for Team A.
    Steps:
    1. Setup (shared with other tests).
    2. Log in as Team A nurse.
    3. Navigate to Reports > Consent tab and filter by Flu.
    4. Check cohort size and consent percentages.
    Verification:
    - Team A cohort is 2 (children 1 and 3).
    - 50% consent given (child 1, vaccinated → consent not required).
    - 50% no consent recorded (child 3, refused with no consent form).
    """
    _do_setup(page, base_url, team_a, team_b, all_children, school_a, school_b)

    page.context.clear_cookies()
    LogInPage(page).navigate()
    LogInPage(page).log_in_and_choose_team_if_necessary(
        team_a.users["nurse"], team_a.team
    )

    ReportsConsentPage(page).navigate()
    ReportsConsentPage(page).check_filter_for_programme(Programme.FLU)
    ReportsConsentPage(page).check_cohort_has_n_children("2")
    ReportsConsentPage(page).check_category_percentage("Consent given", "50.0")
    ReportsConsentPage(page).check_category_percentage("No consent recorded", "50.0")


def test_team_b_consent(
    page,
    base_url,
    team_a,
    team_b,
    all_children,
    school_a,
    school_b,
):
    """
    Test: Verify consent reporting values for Team B.
    Steps:
    1. Setup (shared with other tests).
    2. Log in as Team B nurse.
    3. Navigate to Reports > Consent tab and filter by Flu.
    4. Check cohort size and consent percentages.
    Verification:
    - Team B cohort is 4 (children 2, 4, 5, 6).
    - 50% consent given (children 2 and 5, vaccinated → consent not required).
    - 50% no consent recorded (children 4 and 6, refused with no consent form).
    """
    _do_setup(page, base_url, team_a, team_b, all_children, school_a, school_b)

    page.context.clear_cookies()
    LogInPage(page).navigate()
    LogInPage(page).log_in_and_choose_team_if_necessary(
        team_b.users["nurse"], team_b.team
    )

    ReportsConsentPage(page).navigate()
    ReportsConsentPage(page).check_filter_for_programme(Programme.FLU)
    ReportsConsentPage(page).check_cohort_has_n_children("4")
    ReportsConsentPage(page).check_category_percentage("Consent given", "50.0")
    ReportsConsentPage(page).check_category_percentage("No consent recorded", "50.0")


def test_team_a_aggregate_csv(
    page,
    base_url,
    team_a,
    team_b,
    all_children,
    school_a,
    school_b,
):
    """
    Test: Verify aggregate CSV download for Team A broken down by year group
       and gender.
    Steps:
    1. Setup (shared with other tests).
    2. Log in as Team A nurse.
    3. Download aggregate CSV with Year group and Gender breakdowns.
    4. Assert row values match expected counts.
    Verification:
    - Row (YG1, Male): Cohort=1, Vaccinated=1, Not Vaccinated=0
    - Row (YG2, Male): Cohort=1, Vaccinated=0, Not Vaccinated=1
    - Only 2 rows (children 2 and 4 moved to Team B).
    """
    _do_setup(page, base_url, team_a, team_b, all_children, school_a, school_b)

    page.context.clear_cookies()
    LogInPage(page).navigate()
    LogInPage(page).log_in_and_choose_team_if_necessary(
        team_a.users["nurse"], team_a.team
    )

    df = _download_aggregate_csv(page, Programme.FLU)

    expected_rows = 2
    assert len(df) == expected_rows

    yg1_row = df[(df["Year Group"] == _yg1) & (df["Gender"] == "male")].iloc[0]
    assert yg1_row["Cohort"] == 1
    assert yg1_row["Vaccinated"] == 1
    assert yg1_row["Not Vaccinated"] == 0

    yg2_row = df[(df["Year Group"] == _yg2) & (df["Gender"] == "male")].iloc[0]
    assert yg2_row["Cohort"] == 1
    assert yg2_row["Vaccinated"] == 0
    assert yg2_row["Not Vaccinated"] == 1


def test_team_b_aggregate_csv(
    page,
    base_url,
    team_a,
    team_b,
    all_children,
    school_a,
    school_b,
):
    """
    Test: Verify aggregate CSV download for Team B broken down by year group
       and gender.
    Steps:
    1. Setup (shared with other tests).
    2. Log in as Team B nurse.
    3. Download aggregate CSV with Year group and Gender breakdowns.
    4. Assert row values match expected counts.
    Verification:
    - Row (YG1, Female): Cohort=1, Vaccinated=1, Not Vaccinated=0
    - Row (YG2, Female): Cohort=1, Vaccinated=0, Not Vaccinated=1
    - Row (YG3, Male): Cohort=1, Vaccinated=1, Not Vaccinated=0
    - Row (YG3, Female): Cohort=1, Vaccinated=0, Not Vaccinated=1
    - 4 rows total.
    """
    _do_setup(page, base_url, team_a, team_b, all_children, school_a, school_b)

    page.context.clear_cookies()
    LogInPage(page).navigate()
    LogInPage(page).log_in_and_choose_team_if_necessary(
        team_b.users["nurse"], team_b.team
    )

    df = _download_aggregate_csv(page, Programme.FLU)

    expected_rows = 4
    assert len(df) == expected_rows

    yg1_f = df[(df["Year Group"] == _yg1) & (df["Gender"] == "female")].iloc[0]
    assert yg1_f["Cohort"] == 1
    assert yg1_f["Vaccinated"] == 1
    assert yg1_f["Not Vaccinated"] == 0

    yg2_f = df[(df["Year Group"] == _yg2) & (df["Gender"] == "female")].iloc[0]
    assert yg2_f["Cohort"] == 1
    assert yg2_f["Vaccinated"] == 0
    assert yg2_f["Not Vaccinated"] == 1

    yg3_m = df[(df["Year Group"] == _yg3) & (df["Gender"] == "male")].iloc[0]
    assert yg3_m["Cohort"] == 1
    assert yg3_m["Vaccinated"] == 1
    assert yg3_m["Not Vaccinated"] == 0

    yg3_f = df[(df["Year Group"] == _yg3) & (df["Gender"] == "female")].iloc[0]
    assert yg3_f["Cohort"] == 1
    assert yg3_f["Vaccinated"] == 0
    assert yg3_f["Not Vaccinated"] == 1
