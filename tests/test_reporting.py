import pytest

from mavis.test.models import (
    Programme,
)

pytestmark = pytest.mark.reporting


@pytest.fixture
def upload_offline_vaccination_injected_flu(
    upload_offline_vaccination, reports_vaccinations_page, dashboard_page
):
    reports_vaccinations_page.navigate_and_refresh_reports()
    dashboard_page.navigate()
    yield from upload_offline_vaccination(Programme.FLU)


def test_report_view(
    upload_offline_vaccination_injected_flu,
    schools,
    reports_vaccinations_page,
    dashboard_page,
    children_search_page,
    child_record_page,
    vaccination_record_page,
    edit_vaccination_record_page,
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

    reports_vaccinations_page.navigate()
    reports_vaccinations_page.check_filter_for_programme(Programme.FLU)

    vaccinated_count = reports_vaccinations_page.get_children_count("Vaccinated")
    unvaccinated_count = reports_vaccinations_page.get_children_count("Not vaccinated")

    (
        expected_cohort_count,
        expected_unvaccinated_percentage,
        expected_vaccinated_percentage,
    ) = reports_vaccinations_page.get_expected_cohort_and_percentage_strings(
        unvaccinated_count, vaccinated_count
    )

    reports_vaccinations_page.check_cohort_has_n_children(expected_cohort_count)
    reports_vaccinations_page.check_category_percentage(
        "Not vaccinated", expected_unvaccinated_percentage
    )
    reports_vaccinations_page.check_category_percentage(
        "Vaccinated", expected_vaccinated_percentage
    )

    reports_vaccinations_page.header.click_children_header()
    children_search_page.search_with_all_filters_for_child_name(str(child))
    children_search_page.click_record_for_child(child)
    child_record_page.click_vaccination_details(school)
    vaccination_record_page.click_edit_vaccination_record()
    edit_vaccination_record_page.click_change_outcome()
    edit_vaccination_record_page.click_they_refused_it()
    edit_vaccination_record_page.click_continue()
    edit_vaccination_record_page.click_save_changes()

    reports_vaccinations_page.navigate_and_refresh_reports()
    reports_vaccinations_page.check_filter_for_programme(Programme.FLU)
    (
        expected_cohort_count,
        expected_unvaccinated_percentage,
        expected_vaccinated_percentage,
    ) = reports_vaccinations_page.get_expected_cohort_and_percentage_strings(
        unvaccinated_count + 1, vaccinated_count
    )

    reports_vaccinations_page.check_cohort_has_n_children(expected_cohort_count)
    reports_vaccinations_page.check_category_percentage(
        "Not vaccinated", expected_unvaccinated_percentage
    )
    reports_vaccinations_page.check_category_percentage(
        "Vaccinated", expected_vaccinated_percentage
    )


def test_log_out_via_reporting_component(
    log_in_page,
    log_out_page,
    reports_vaccinations_page,
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
    log_in_page.navigate()
    log_in_page.log_in_and_choose_team_if_necessary(nurse, team)
    reports_vaccinations_page.navigate()
    log_in_page.log_out_via_reporting_component()
    log_out_page.verify_log_out_page()
