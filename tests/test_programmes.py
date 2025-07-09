import allure
import pytest

from mavis.test.data import ClassFileMapping, CohortsFileMapping, VaccsFileMapping
from mavis.test.models import Programme, ReportFormat, Vaccine


@pytest.fixture
def setup_cohort_upload(log_in_as_nurse, dashboard_page, programmes_page):
    dashboard_page.click_programmes()
    programmes_page.navigate_to_cohort_import(Programme.HPV)


@pytest.fixture
def setup_reports(log_in_as_nurse, dashboard_page):
    dashboard_page.click_programmes()


@pytest.fixture
def setup_record_a_vaccine(
    log_in_as_nurse, schools, dashboard_page, sessions_page, programmes_enabled
):
    try:
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session(
            schools[0], programmes_enabled, for_today=True
        )
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        yield
    finally:
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(schools[0])


@pytest.fixture
def setup_mavis_1729(
    log_in_as_nurse,
    schools,
    dashboard_page,
    import_records_page,
    sessions_page,
    programmes_enabled,
):
    try:
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session(
            schools[0], programmes_enabled, for_today=True
        )
        import_records_page.navigate_to_class_list_import()
        import_records_page.upload_and_verify_output(
            ClassFileMapping.RANDOM_CHILD_YEAR_9
        )
        sessions_page.click_location(schools[0])
        session_id = sessions_page.get_session_id_from_offline_excel()
        dashboard_page.click_mavis()
        dashboard_page.click_import_records()
        import_records_page.navigate_to_vaccination_records_import()
        import_records_page.upload_and_verify_output(
            file_mapping=VaccsFileMapping.HPV_DOSE_TWO, session_id=session_id
        )
        dashboard_page.click_mavis()
        dashboard_page.click_programmes()
        yield
    finally:
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(schools[0])


@pytest.fixture
def setup_mav_854(
    log_in_as_nurse,
    add_vaccine_batch,
    schools,
    dashboard_page,
    import_records_page,
    sessions_page,
    programmes_enabled,
):
    try:
        batch_name = add_vaccine_batch(Vaccine.GARDASIL_9)
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session(
            schools[0], programmes_enabled, for_today=True
        )
        import_records_page.navigate_to_class_list_import()
        import_records_page.upload_and_verify_output(
            ClassFileMapping.FIXED_CHILD_YEAR_9
        )
        sessions_page.click_location(schools[0])
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session(
            "Community clinics", programmes_enabled, for_today=True
        )
        dashboard_page.click_mavis()
        dashboard_page.click_children()
        yield batch_name
    finally:
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(schools[0])


@pytest.mark.cohorts
def test_cohort_upload_positive(setup_cohort_upload, import_records_page):
    import_records_page.upload_and_verify_output(CohortsFileMapping.POSITIVE)


@pytest.mark.cohorts
def test_cohort_upload_negative(setup_cohort_upload, import_records_page):
    import_records_page.upload_and_verify_output(CohortsFileMapping.NEGATIVE)


@pytest.mark.cohorts
def test_cohorts_file_structure(setup_cohort_upload, import_records_page):
    import_records_page.upload_and_verify_output(CohortsFileMapping.INVALID_STRUCTURE)


@pytest.mark.cohorts
def test_cohorts_no_record(setup_cohort_upload, import_records_page):
    import_records_page.upload_and_verify_output(CohortsFileMapping.HEADER_ONLY)


@pytest.mark.cohorts
def test_cohorts_empty_file(setup_cohort_upload, import_records_page):
    import_records_page.upload_and_verify_output(CohortsFileMapping.EMPTY_FILE)


@allure.issue("MAV-909")
@pytest.mark.cohorts
@pytest.mark.bug
def test_cohorts_readd_to_cohort(
    setup_cohort_upload,
    programmes_page,
    dashboard_page,
    children_page,
    import_records_page,
    test_data,
    children,
):
    """
    Steps to reproduce:
    Find a patient in Year 8 and remove them from cohort using the button
    Upload a cohort list with their first name, surname, URN, date of birth and postcode

    Scenario 1
        Duplicate review is not flagged

        Expected result:
        The child is added back into the cohort, and in all the relevant sessions
        Actual Result:
        Server error page and user cannot bring the child back into the cohort

    Scenario 2
        The import screen flags for duplicate review, and user clicks "Review" next to the child's name

        Expected result:
        System allows you to review the new details against the previous record (before removing from cohort) and lets you choose which record to keep. Once review confirmed, the child is added back into the cohort, and in all the relevant sessions.
        Actual Result:
        Server error page and user cannot bring the child back into the cohort
    """
    child = children[0]

    input_file_path, _ = import_records_page.upload_and_verify_output(
        CohortsFileMapping.FIXED_CHILD_YEAR_8
    )

    dashboard_page.click_mavis()
    dashboard_page.click_children()
    children_page.remove_child_from_cohort(child)
    dashboard_page.click_mavis()
    dashboard_page.click_programmes()
    programmes_page.navigate_to_cohort_import(Programme.HPV)

    test_data.increment_date_of_birth_for_records(input_file_path)
    import_records_page.set_input_file(input_file_path)
    import_records_page.click_continue()

    programmes_page.expect_text("1 duplicate record needs review")
    programmes_page.click_review()
    programmes_page.click_use_duplicate()
    programmes_page.click_resolve_duplicate()
    programmes_page.expect_text("Record updated")


@pytest.mark.rav
def test_rav_triage_consent_given(
    setup_record_a_vaccine,
    schools,
    sessions_page,
    import_records_page,
    dashboard_page,
    consent_page,
    children,
):
    child = children[0]
    sessions_page.navigate_to_scheduled_sessions(schools[0])
    sessions_page.navigate_to_class_list_import()

    import_records_page.upload_and_verify_output(CohortsFileMapping.FIXED_CHILD_YEAR_9)
    dashboard_page.click_mavis()
    dashboard_page.click_sessions()

    sessions_page.navigate_to_scheduled_sessions(schools[0])
    sessions_page.click_consent_tab()
    sessions_page.navigate_to_consent_response(child, Programme.HPV)
    consent_page.parent_phone_positive(child.parents[0])

    dashboard_page.click_mavis()
    dashboard_page.click_sessions()

    sessions_page.navigate_to_scheduled_sessions(schools[0])

    sessions_page.click_register_tab()
    sessions_page.navigate_to_update_triage_outcome(child, Programme.HPV)
    sessions_page.select_yes_safe_to_vaccinate()
    sessions_page.click_save_triage()
    sessions_page.verify_triage_updated_for_child()


@pytest.mark.rav
def test_rav_triage_consent_refused(
    setup_record_a_vaccine,
    schools,
    sessions_page,
    import_records_page,
    dashboard_page,
    consent_page,
    children,
):
    child = children[0]
    sessions_page.navigate_to_scheduled_sessions(schools[0])
    sessions_page.navigate_to_class_list_import()

    import_records_page.upload_and_verify_output(CohortsFileMapping.FIXED_CHILD_YEAR_9)
    dashboard_page.click_mavis()
    dashboard_page.click_sessions()
    sessions_page.navigate_to_scheduled_sessions(schools[0])
    sessions_page.click_consent_tab()
    sessions_page.navigate_to_consent_response(child, Programme.HPV)

    consent_page.parent_paper_refuse_consent(child.parents[0])
    consent_page.expect_text_in_main(str(child))

    sessions_page.select_consent_refused()
    sessions_page.click_child(child)
    sessions_page.click_session_activity_and_notes()
    sessions_page.expect_main_to_contain_text(
        f"Consent refused by {child.parents[0].name_and_relationship}"
    )


@allure.issue("MAVIS-1729")
@pytest.mark.rav
@pytest.mark.bug
def test_rav_edit_dose_to_not_given(setup_mavis_1729, programmes_page, children):
    child = children[0]

    programmes_page.click_programme(Programme.HPV)
    programmes_page.click_vaccinations()
    programmes_page.click_child(child)
    programmes_page.click_edit_vaccination_record()
    programmes_page.click_change_outcome()
    programmes_page.click_they_refused_it()
    programmes_page.click_continue()
    programmes_page.click_save_changes()
    programmes_page.expect_to_not_see_text("Sorry, there’s a problem with the service")


@pytest.mark.rav
@pytest.mark.bug
def test_rav_verify_excel_mav_854(
    setup_mav_854,
    schools,
    clinics,
    children_page,
    sessions_page,
    dashboard_page,
    consent_page,
    children,
):
    child = children[0]
    batch_name = setup_mav_854

    children_page.search_for_a_child_name(str(child))
    children_page.click_record_for_child(child)
    sessions_page.click_session("Community clinics", Programme.HPV)
    sessions_page.click_get_verbal_consent()
    consent_page.parent_verbal_positive(parent=child.parents[0], change_phone=False)
    sessions_page.register_child_as_attending(child)
    sessions_page.record_vaccs_for_child(
        child=child,
        programme=Programme.HPV,
        batch_name=batch_name,
        at_school=False,
    )
    sessions_page.check_location_radio(clinics[0])
    sessions_page.click_continue_button()
    sessions_page.click_confirm_button()
    sessions_page.expect_main_to_contain_text("Vaccination outcome recorded for HPV")
    dashboard_page.click_mavis()
    dashboard_page.click_sessions()
    sessions_page.click_scheduled()
    sessions_page.click_location(schools[0])
    assert sessions_page.get_session_id_from_offline_excel()


@pytest.mark.reports
def test_verify_careplus_report_for_hpv(setup_reports, programmes_page):
    programmes_page.verify_report_format(
        programme=Programme.HPV, report_format=ReportFormat.CAREPLUS
    )


@pytest.mark.reports
def test_verify_careplus_report_for_doubles(
    setup_reports, dashboard_page, programmes_page
):
    programmes_page.verify_report_format(
        programme=Programme.MENACWY, report_format=ReportFormat.CAREPLUS
    )
    dashboard_page.click_mavis()
    dashboard_page.click_programmes()
    programmes_page.verify_report_format(
        programme=Programme.TD_IPV, report_format=ReportFormat.CAREPLUS
    )


@pytest.mark.reports
def test_verify_csv_report_for_hpv(setup_reports, programmes_page):
    programmes_page.verify_report_format(
        programme=Programme.HPV, report_format=ReportFormat.CSV
    )


@pytest.mark.reports
def test_verify_csv_report_for_doubles(setup_reports, dashboard_page, programmes_page):
    programmes_page.verify_report_format(
        programme=Programme.MENACWY, report_format=ReportFormat.CSV
    )
    dashboard_page.click_mavis()
    dashboard_page.click_programmes()
    programmes_page.verify_report_format(
        programme=Programme.TD_IPV, report_format=ReportFormat.CSV
    )


@pytest.mark.reports
def test_verify_systmone_report_for_hpv(setup_reports, programmes_page):
    programmes_page.verify_report_format(
        programme=Programme.HPV, report_format=ReportFormat.SYSTMONE
    )
