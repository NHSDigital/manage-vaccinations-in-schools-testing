import pytest

from mavis.test.mavis_constants import (
    Programme,
)
from mavis.test.pages import (
    ChildRecordPage,
    ChildrenSearchPage,
    DashboardPage,
    EditVaccinationRecordPage,
    LogInPage,
    LogOutPage,
    ReportsVaccinationsPage,
    VaccinationRecordPage,
)

pytestmark = pytest.mark.reporting


@pytest.fixture
def upload_offline_vaccination_injected_flu(
    upload_offline_vaccination,
    page,
):
    ReportsVaccinationsPage(page).navigate_and_refresh_reports()
    DashboardPage(page).navigate()
    yield from upload_offline_vaccination(Programme.FLU)


def test_report_view(
    upload_offline_vaccination_injected_flu,
    schools,
    page,
    children,
):
    """
    Test: Verify reporting values update correctly after vaccination and edit.
    Steps:
    1. Record a flu vaccination for a child and verify initial reporting values.
    2. Refresh reports and check that the cohort and vaccination percentages update.
    3. Edit the child's vaccination record to mark the outcome as refused.
    4. Refresh reports and verify that the reporting values reflect the refusal.
    Verification:
    - After vaccination, report shows 1 more vaccinated and 0 more not vaccinated.
    - After marking as refused, report shows 0 more vaccinated and
      1 more not vaccinated.
    """

    child = children[Programme.FLU][0]
    school = schools[Programme.FLU][0]

    ReportsVaccinationsPage(page).navigate()
    ReportsVaccinationsPage(page).check_filter_for_programme(Programme.FLU)

    vaccinated_count = ReportsVaccinationsPage(page).get_children_count("Vaccinated")
    unvaccinated_count = ReportsVaccinationsPage(page).get_children_count(
        "Not vaccinated"
    )

    (
        expected_cohort_count,
        expected_unvaccinated_percentage,
        expected_vaccinated_percentage,
    ) = ReportsVaccinationsPage(page).get_expected_cohort_and_percentage_strings(
        unvaccinated_count, vaccinated_count
    )

    ReportsVaccinationsPage(page).check_cohort_has_n_children(expected_cohort_count)
    ReportsVaccinationsPage(page).check_category_percentage(
        "Not vaccinated", expected_unvaccinated_percentage
    )
    ReportsVaccinationsPage(page).check_category_percentage(
        "Vaccinated", expected_vaccinated_percentage
    )

    ReportsVaccinationsPage(page).header.click_children_header()
    ChildrenSearchPage(page).search_with_all_filters_for_child_name(str(child))
    ChildrenSearchPage(page).click_record_for_child(child)
    ChildRecordPage(page).click_vaccination_details(school)
    VaccinationRecordPage(page).click_edit_vaccination_record()
    EditVaccinationRecordPage(page).click_change_outcome()
    EditVaccinationRecordPage(page).click_they_refused_it()
    EditVaccinationRecordPage(page).click_continue()
    EditVaccinationRecordPage(page).click_save_changes()

    ReportsVaccinationsPage(page).navigate_and_refresh_reports()
    ReportsVaccinationsPage(page).check_filter_for_programme(Programme.FLU)
    (
        expected_cohort_count,
        expected_unvaccinated_percentage,
        expected_vaccinated_percentage,
    ) = ReportsVaccinationsPage(page).get_expected_cohort_and_percentage_strings(
        unvaccinated_count + 1, vaccinated_count
    )

    ReportsVaccinationsPage(page).check_cohort_has_n_children(expected_cohort_count)
    ReportsVaccinationsPage(page).check_category_percentage(
        "Not vaccinated", expected_unvaccinated_percentage
    )
    ReportsVaccinationsPage(page).check_category_percentage(
        "Vaccinated", expected_vaccinated_percentage
    )


def test_log_out_via_reporting_component(
    page,
    nurse,
    team,
):
    """
    Test: Verify that logging out via the reporting component works correctly.
    Steps:
    1. Log in as nurse and choose team if necessary.
    2. Navigate to the reports page.
    3. Log out using the reporting component.
    4. Verify the log out page is displayed.
    Verification:
    - User is successfully logged out and the log out page is shown.
    """
    LogInPage(page).navigate()
    LogInPage(page).log_in_and_choose_team_if_necessary(nurse, team)
    ReportsVaccinationsPage(page).navigate()
    LogInPage(page).log_out_via_reporting_component()
    LogOutPage(page).verify_log_out_page()
