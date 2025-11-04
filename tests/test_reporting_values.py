import pytest

from mavis.test.models import (
    Programme,
)


@pytest.fixture
def upload_offline_vaccination_injected_flu(upload_offline_vaccination):
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

    reports_vaccinations_page.navigate_and_refresh_reports()
    reports_vaccinations_page.check_filter_for_programme(Programme.FLU)

    (
        expected_cohort_count,
        expected_unvaccinated_percentage,
        expected_vaccinated_percentage,
    ) = reports_vaccinations_page.get_expected_cohort_and_percentage_strings(
        unvaccinated_count, vaccinated_count + 1
    )

    reports_vaccinations_page.check_cohort_has_n_children(expected_cohort_count)
    reports_vaccinations_page.check_category_percentage(
        "Not vaccinated", expected_unvaccinated_percentage
    )
    reports_vaccinations_page.check_category_percentage(
        "Vaccinated", expected_vaccinated_percentage
    )

    dashboard_page.navigate()
    dashboard_page.click_children()
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
