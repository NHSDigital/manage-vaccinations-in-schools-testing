import pytest

from mavis.test.data import ClassFileMapping
from mavis.test.models import (
    ConsentMethod,
    ConsentOption,
    DeliverySite,
    Programme,
    VaccinationRecord,
    Vaccine,
)


@pytest.fixture
def setup_recording_injected_flu(
    log_in_as_nurse,
    add_vaccine_batch,
    schools,
    dashboard_page,
    import_records_page,
    sessions_page,
    year_groups,
):
    school = schools[Programme.FLU][0]
    year_group = year_groups[Programme.FLU]

    try:
        batch_name = add_vaccine_batch(Vaccine.SEQUIRUS)
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.ensure_session_scheduled_for_today(school, Programme.FLU)
        sessions_page.click_import_class_lists()
        import_records_page.import_class_list(
            ClassFileMapping.FIXED_CHILD, year_group, Programme.FLU.group
        )
        yield batch_name
    finally:
        dashboard_page.navigate()
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(school)


@pytest.fixture
def record_injected_flu(
    setup_recording_injected_flu,
    children_page,
    sessions_page,
    verbal_consent_page,
    children,
    schools,
    dashboard_page,
):
    child = children[Programme.FLU][0]
    school = schools[Programme.FLU][0]
    batch_name = setup_recording_injected_flu

    dashboard_page.click_mavis()
    dashboard_page.click_sessions()
    sessions_page.click_session_for_programme_group(school, Programme.FLU)
    sessions_page.click_consent_tab()

    children_page.search_with_all_filters_for_child_name(str(child))
    sessions_page.navigate_to_consent_response(child, Programme.FLU)
    verbal_consent_page.select_parent(child.parents[0])
    verbal_consent_page.select_consent_method(ConsentMethod.IN_PERSON)
    verbal_consent_page.record_parent_positive_consent(
        Programme.FLU, ConsentOption.INJECTION
    )
    sessions_page.register_child_as_attending(child)
    vaccination_time = sessions_page.record_vaccination_for_child(
        VaccinationRecord(
            child,
            Programme.FLU,
            batch_name,
            consent_option=ConsentOption.INJECTION,
            delivery_site=DeliverySite.LEFT_ARM_UPPER,
        )
    )
    return child, vaccination_time


def test_report_view(
    record_injected_flu,
    schools,
    reports_vaccinations_page,
    dashboard_page,
    children_page,
    vaccination_record_page,
    edit_vaccination_record_page,
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

    child, _ = record_injected_flu
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
    children_page.search_with_all_filters_for_child_name(str(child))
    children_page.click_record_for_child(child)
    children_page.click_vaccination_details(school)
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
