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
def setup_recording_flu(
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
        batch_names = {
            vaccine: add_vaccine_batch(vaccine)
            for vaccine in [Vaccine.SEQUIRUS, Vaccine.FLUENZ]
        }
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.ensure_session_scheduled_for_today(school, Programme.FLU)
        sessions_page.click_import_class_lists()
        import_records_page.import_class_list(
            ClassFileMapping.FIXED_CHILD, year_group, Programme.FLU.group
        )
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.click_session_for_programme_group(school, Programme.FLU)
        sessions_page.click_consent_tab()
        yield batch_names
    finally:
        dashboard_page.navigate()
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(school)


@pytest.fixture
def record_flu_with_consent_option(
    setup_recording_flu,
    children_search_page,
    sessions_page,
    verbal_consent_page,
    children,
):
    def _factory(consent_option):
        child = children[Programme.FLU][0]
        batch_names = setup_recording_flu

        children_search_page.search_with_all_filters_for_child_name(str(child))
        sessions_page.navigate_to_consent_response(child, Programme.FLU)
        verbal_consent_page.select_parent(child.parents[0])
        verbal_consent_page.select_consent_method(ConsentMethod.IN_PERSON)
        verbal_consent_page.record_parent_positive_consent(
            Programme.FLU, consent_option
        )
        sessions_page.register_child_as_attending(child)

        vaccine = (
            Vaccine.SEQUIRUS
            if consent_option is ConsentOption.INJECTION
            else Vaccine.FLUENZ
        )
        delivery_site = (
            DeliverySite.LEFT_ARM_UPPER
            if consent_option is ConsentOption.INJECTION
            else DeliverySite.NOSE
        )
        vaccination_time = sessions_page.record_vaccination_for_child(
            VaccinationRecord(
                child,
                Programme.FLU,
                batch_names[vaccine],
                consent_option=consent_option,
                delivery_site=delivery_site,
            )
        )
        return child, vaccination_time

    return _factory


def test_report_view(
    record_flu_with_consent_option,
    schools,
    reports_vaccinations_page,
    dashboard_page,
    children_search_page,
    child_details_page,
    vaccination_record_page,
    edit_vaccination_record_page,
):
    child, _ = record_flu_with_consent_option(ConsentOption.INJECTION)
    school = schools[Programme.FLU][0]

    reports_vaccinations_page.navigate()
    reports_vaccinations_page.check_filter_for_programme(Programme.FLU)

    reports_vaccinations_page.check_cohort_has_n_children(0)
    reports_vaccinations_page.check_category_percentage("Not vaccinated", 0.0)
    reports_vaccinations_page.check_category_percentage("Vaccinated", 0.0)

    reports_vaccinations_page.navigate_and_refresh_reports()
    reports_vaccinations_page.check_filter_for_programme(Programme.FLU)

    reports_vaccinations_page.check_cohort_has_n_children(1)
    reports_vaccinations_page.check_category_percentage("Not vaccinated", 0.0)
    reports_vaccinations_page.check_category_percentage("Vaccinated", 100.0)

    dashboard_page.navigate()
    dashboard_page.click_children()
    children_search_page.search_with_all_filters_for_child_name(str(child))
    child_details_page.click_vaccination_details(school)
    vaccination_record_page.click_edit_vaccination_record()
    edit_vaccination_record_page.click_change_outcome()
    edit_vaccination_record_page.click_they_refused_it()
    edit_vaccination_record_page.click_continue()
    edit_vaccination_record_page.click_save_changes()

    reports_vaccinations_page.navigate_and_refresh_reports()
    reports_vaccinations_page.check_filter_for_programme(Programme.FLU)
    reports_vaccinations_page.check_cohort_has_n_children(1)
    reports_vaccinations_page.check_category_percentage("Not vaccinated", 100.0)
    reports_vaccinations_page.check_category_percentage("Vaccinated", 0.0)


def test_report_has_correct_values(
    record_flu_with_consent_option,
    schools,
    reports_vaccinations_page,
    reports_download_page,
):
    reports_vaccinations_page.navigate()
    reports_vaccinations_page.check_filter_for_programme(Programme.FLU)

    reports_vaccinations_page.navigate_and_refresh_reports()
    reports_vaccinations_page.check_filter_for_programme(Programme.FLU)

    reports_vaccinations_page.check_cohort_has_n_children(1)
    reports_vaccinations_page.check_category_percentage("Not vaccinated", 0.0)
    reports_vaccinations_page.check_category_percentage("Vaccinated", 100.0)

    reports_vaccinations_page.click_download_data_tab()
    reports_download_page.check_aggregate_data_radio()
    reports_download_page.click_continue_button()
    reports_download_page.choose_programme(Programme.FLU)

    report = reports_download_page.download_and_get_dataframe()

    reports_download_page.check_vaccinated_values(
        report, expected_cohort=1, expected_vaccinated=1, expected_not_vaccinated=0
    )


def test_report_has_all_expected_headers(
    reports_vaccinations_page,
    reports_download_page,
):
    reports_vaccinations_page.navigate()
    reports_vaccinations_page.click_download_data_tab()
    reports_download_page.check_aggregate_data_radio()
    reports_download_page.click_continue_button()
    reports_download_page.choose_programme(Programme.FLU)
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
