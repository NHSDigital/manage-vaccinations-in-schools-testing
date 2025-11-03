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
def setup_recording_hpv(
    log_in_as_nurse,
    add_vaccine_batch,
    schools,
    dashboard_page,
    import_records_page,
    sessions_page,
    year_groups,
):
    school = schools[Programme.HPV][0]
    year_group = year_groups[Programme.HPV]

    try:
        batch_name = add_vaccine_batch(Vaccine.GARDASIL_9)
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.ensure_session_scheduled_for_today(school, Programme.HPV)
        sessions_page.click_import_class_lists()
        import_records_page.import_class_list(
            ClassFileMapping.FIXED_CHILD, year_group, Programme.HPV.group
        )
        yield batch_name
    finally:
        dashboard_page.navigate()
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(school)


@pytest.fixture
def record_hpv(
    setup_recording_hpv,
    sessions_page,
    verbal_consent_page,
    children,
    schools,
    dashboard_page,
    children_search_page,
):
    child = children[Programme.HPV][0]
    school = schools[Programme.HPV][0]
    batch_name = setup_recording_hpv

    dashboard_page.click_mavis()
    dashboard_page.click_sessions()
    sessions_page.click_session_for_programme_group(school, Programme.HPV)
    sessions_page.click_consent_tab()

    children_search_page.search_with_all_filters_for_child_name(str(child))
    sessions_page.navigate_to_consent_response(child, Programme.HPV)
    verbal_consent_page.select_parent(child.parents[0])
    verbal_consent_page.select_consent_method(ConsentMethod.IN_PERSON)
    verbal_consent_page.record_parent_positive_consent(
        Programme.HPV, ConsentOption.INJECTION
    )
    sessions_page.register_child_as_attending(child)
    vaccination_time = sessions_page.record_vaccination_for_child(
        VaccinationRecord(
            child,
            Programme.HPV,
            batch_name,
            consent_option=ConsentOption.INJECTION,
            delivery_site=DeliverySite.LEFT_ARM_UPPER,
        )
    )
    return child, vaccination_time


def test_report_has_correct_values(
    record_hpv,
    reports_vaccinations_page,
    reports_download_page,
):
    """
    Test: Verify that downloaded report has expected values
    Steps:
    1. Record an HPV vaccination for a child.
    2. Refresh reports and check cohort and vaccination percentages.
    3. Download the report and verify cohort, vaccinated, and not vaccinated values.
    Verification:
    - Cohort size, vaccinated, and not vaccinated values are correct in both UI
      and downloaded report.
    """
    reports_vaccinations_page.navigate()
    reports_vaccinations_page.check_filter_for_programme(Programme.HPV)

    reports_vaccinations_page.navigate_and_refresh_reports()
    reports_vaccinations_page.check_filter_for_programme(Programme.HPV)
    vaccinated_count = reports_vaccinations_page.get_children_count("Vaccinated")
    unvaccinated_count = reports_vaccinations_page.get_children_count("Not vaccinated")

    reports_vaccinations_page.click_download_data_tab()
    reports_download_page.check_aggregate_data_radio()
    reports_download_page.click_continue()
    reports_download_page.choose_programme(Programme.HPV)

    report = reports_download_page.download_and_get_dataframe()

    reports_download_page.check_vaccinated_values(
        report,
        expected_cohort=unvaccinated_count + vaccinated_count,
        expected_vaccinated=vaccinated_count,
        expected_not_vaccinated=unvaccinated_count,
    )


def test_report_has_all_expected_headers(
    log_in_as_nurse,
    dashboard_page,
    reports_vaccinations_page,
    reports_download_page,
):
    """
    Test: Verify that the downloaded report contains all expected headers.
    Steps:
    1. Navigate to the reports page.
    2. Select TD/IPV programme and all variables.
    3. Download the report.
    Verification:
    - The report contains all expected column headers.
    """
    reports_vaccinations_page.navigate()
    reports_vaccinations_page.click_download_data_tab()
    reports_download_page.check_aggregate_data_radio()
    reports_download_page.click_continue()
    reports_download_page.choose_programme(Programme.TD_IPV)
    reports_download_page.choose_variable("Local Authority")
    reports_download_page.choose_variable("School")
    reports_download_page.choose_variable("Year Group")
    reports_download_page.choose_variable("Gender")

    report = reports_download_page.download_and_get_dataframe()

    reports_download_page.check_report_headers(
        report,
        expected_headers=[
            "Local Authority",
            "School",
            "Year Group",
            "Gender",
            "Cohort",
            "Vaccinated",
            "Not Vaccinated",
            "Vaccinated by SAIS",
            "Vaccinated Elsewhere (Declared)",
            "Vaccinated Elsewhere (Recorded)",
            "Vaccinated Previously",
        ],
    )
    dashboard_page.navigate()


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
