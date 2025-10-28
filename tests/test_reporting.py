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
def setup_recording_flu_and_hpv(
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
        batch_names = {
            vaccine: add_vaccine_batch(vaccine)
            for vaccine in [Vaccine.SEQUIRUS, Vaccine.GARDASIL_9]
        }
        for programme in [Programme.FLU, Programme.HPV]:
            dashboard_page.click_mavis()
            dashboard_page.click_sessions()
            sessions_page.ensure_session_scheduled_for_today(school, programme)
        sessions_page.click_import_class_lists()
        import_records_page.import_class_list(
            ClassFileMapping.FIXED_CHILD, year_group, Programme.HPV.group
        )
        yield batch_names
    finally:
        dashboard_page.navigate()
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(school)


@pytest.fixture
def record_injected_flu(
    setup_recording_flu_and_hpv,
    children_page,
    sessions_page,
    verbal_consent_page,
    children,
    schools,
    dashboard_page,
):
    child = children[Programme.HPV][0]
    school = schools[Programme.HPV][0]
    batch_name = setup_recording_flu_and_hpv[Vaccine.SEQUIRUS]

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


@pytest.fixture
def record_hpv(
    setup_recording_flu_and_hpv,
    children_page,
    sessions_page,
    verbal_consent_page,
    children,
    schools,
    dashboard_page,
):
    child = children[Programme.HPV][0]
    school = schools[Programme.HPV][0]
    batch_name = setup_recording_flu_and_hpv[Vaccine.GARDASIL_9]

    dashboard_page.click_mavis()
    dashboard_page.click_sessions()
    sessions_page.click_session_for_programme_group(school, Programme.HPV)
    sessions_page.click_consent_tab()

    children_page.search_with_all_filters_for_child_name(str(child))
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


def test_report_view(
    record_injected_flu,
    schools,
    reports_vaccinations_page,
    dashboard_page,
    children_page,
    vaccination_record_page,
    edit_vaccination_record_page,
):
    child, _ = record_injected_flu
    school = schools[Programme.HPV][0]

    reports_vaccinations_page.navigate()
    reports_vaccinations_page.check_filter_for_programme(Programme.FLU)

    reports_vaccinations_page.page.pause()
    reports_vaccinations_page.check_cohort_has_n_children(0)
    reports_vaccinations_page.check_category_percentage("Not vaccinated", "0")
    reports_vaccinations_page.check_category_percentage("Vaccinated", "0")

    reports_vaccinations_page.navigate_and_refresh_reports()
    reports_vaccinations_page.check_filter_for_programme(Programme.FLU)

    reports_vaccinations_page.check_cohort_has_n_children(1)
    reports_vaccinations_page.check_category_percentage("Not vaccinated", "0.0")
    reports_vaccinations_page.check_category_percentage("Vaccinated", "100.0")

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
    reports_vaccinations_page.check_cohort_has_n_children(1)
    reports_vaccinations_page.check_category_percentage("Not vaccinated", "100.0")
    reports_vaccinations_page.check_category_percentage("Vaccinated", "0.0")


def test_report_has_correct_values(
    record_hpv,
    reports_vaccinations_page,
    reports_download_page,
):
    reports_vaccinations_page.navigate()
    reports_vaccinations_page.check_filter_for_programme(Programme.HPV)

    reports_vaccinations_page.navigate_and_refresh_reports()
    reports_vaccinations_page.check_filter_for_programme(Programme.HPV)

    reports_vaccinations_page.page.pause()
    reports_vaccinations_page.check_cohort_has_n_children(1)
    reports_vaccinations_page.check_category_percentage("Not vaccinated", "0.0")
    reports_vaccinations_page.check_category_percentage("Vaccinated", "100.0")

    reports_vaccinations_page.click_download_data_tab()
    reports_download_page.check_aggregate_data_radio()
    reports_download_page.click_continue()
    reports_download_page.choose_programme(Programme.HPV)

    report = reports_download_page.download_and_get_dataframe()

    reports_download_page.check_vaccinated_values(
        report, expected_cohort=1, expected_vaccinated=1, expected_not_vaccinated=0
    )


def test_report_has_all_expected_headers(
    log_in_as_nurse,
    dashboard_page,
    reports_vaccinations_page,
    reports_download_page,
):
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
    log_in_page.navigate()
    log_in_page.log_in_and_choose_team_if_necessary(nurse, team)
    reports_vaccinations_page.navigate()
    log_in_page.log_out_via_reporting_component()
    log_out_page.verify_log_out_page()
