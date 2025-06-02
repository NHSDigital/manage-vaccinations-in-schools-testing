import allure
import pytest

from mavis.test.mavis_constants import (
    mavis_file_types,
    test_data_file_paths,
    Programme,
    Vaccine,
    ReportFormat,
)


@pytest.fixture
def setup_cohort_upload_and_reports(log_in_as_nurse, dashboard_page):
    dashboard_page.click_programmes()


@pytest.fixture
def setup_record_a_vaccine(log_in_as_nurse, schools, dashboard_page, sessions_page):
    try:
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session(schools[0], for_today=True)
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        yield
    finally:
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(schools[0])


@pytest.fixture
def setup_mavis_1729(
    log_in_as_nurse, schools, dashboard_page, import_records_page, sessions_page
):
    try:
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session(schools[0], for_today=True)
        import_records_page.import_class_list_records_from_school_session(
            file_paths=test_data_file_paths.CLASS_SESSION_ID
        )
        sessions_page.click_location(schools[0])
        session_id = sessions_page.get_session_id_from_offline_excel()
        dashboard_page.click_mavis()
        dashboard_page.click_import_records()
        import_records_page.import_vaccination_records(
            file_paths=test_data_file_paths.VACCS_HPV_DOSE_TWO,
            file_type=mavis_file_types.VACCS_MAVIS,
            session_id=session_id,
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
    schools,
    dashboard_page,
    import_records_page,
    sessions_page,
    vaccines_page,
):
    session = "Community clinics"

    try:
        dashboard_page.click_vaccines()
        vaccines_page.add_batch(vaccine=Vaccine.GARDASIL_9)
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session(schools[0], for_today=True)
        import_records_page.import_class_list_records_from_school_session(
            test_data_file_paths.CLASS_MAV_854
        )
        sessions_page.click_location(schools[0])
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session(session, for_today=True)
        dashboard_page.click_mavis()
        dashboard_page.click_children()
        yield
    finally:
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(session)


@pytest.fixture
def setup_mav_nnn(
    log_in_as_admin, schools, dashboard_page, import_records_page, sessions_page
):
    try:
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session(schools[0], for_today=True)
        import_records_page.import_class_list_records_from_school_session(
            file_paths=test_data_file_paths.CLASS_SINGLE_VACC
        )
        sessions_page.click_location(schools[0])
        yield
    finally:
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(schools[0])


@pytest.mark.cohorts
def test_cohort_upload_positive(setup_cohort_upload_and_reports, programmes_page):
    programmes_page.upload_cohorts(file_paths=test_data_file_paths.COHORTS_POSITIVE)


@pytest.mark.cohorts
def test_cohort_upload_negative(setup_cohort_upload_and_reports, programmes_page):
    programmes_page.upload_cohorts(file_paths=test_data_file_paths.COHORTS_NEGATIVE)


@pytest.mark.cohorts
def test_cohorts_file_structure(setup_cohort_upload_and_reports, programmes_page):
    programmes_page.upload_cohorts(
        file_paths=test_data_file_paths.COHORTS_INVALID_STRUCTURE
    )


@pytest.mark.cohorts
def test_cohorts_no_record(setup_cohort_upload_and_reports, programmes_page):
    programmes_page.upload_cohorts(file_paths=test_data_file_paths.COHORTS_HEADER_ONLY)


@pytest.mark.cohorts
def test_cohorts_empty_file(setup_cohort_upload_and_reports, programmes_page):
    programmes_page.upload_cohorts(file_paths=test_data_file_paths.COHORTS_EMPTY_FILE)


@allure.issue("MAV-909")
@pytest.mark.cohorts
@pytest.mark.bug
def test_cohorts_readd_to_cohort(
    setup_cohort_upload_and_reports, programmes_page, dashboard_page, children_page
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
    mav_909_child = "MAV_909, MAV_909"
    programmes_page.upload_cohorts(file_paths=test_data_file_paths.COHORTS_MAV_909)

    dashboard_page.click_mavis()
    dashboard_page.click_children()
    children_page.remove_child_from_cohort(child_name=mav_909_child)
    dashboard_page.click_mavis()
    dashboard_page.click_programmes()
    programmes_page.upload_cohorts(file_paths=test_data_file_paths.COHORTS_MAV_909)
    programmes_page.expect_text("1 duplicate record needs review")
    programmes_page.click_review()
    programmes_page.click_use_duplicate()
    programmes_page.click_resolve_duplicate()
    programmes_page.expect_text("Record updated")


@pytest.mark.rav
def test_rav_triage_positive(setup_record_a_vaccine, schools, sessions_page):
    sessions_page.update_triage_outcome_positive(
        schools[0], test_data_file_paths.COHORTS_FULL_NAME
    )


@pytest.mark.rav
def test_rav_triage_consent_refused(setup_record_a_vaccine, schools, sessions_page):
    sessions_page.update_triage_outcome_consent_refused(
        schools[0], test_data_file_paths.COHORTS_FULL_NAME
    )


@allure.issue("MAVIS-1729")
@pytest.mark.rav
@pytest.mark.bug
def test_rav_edit_dose_to_not_given(setup_mavis_1729, programmes_page):
    programmes_page.edit_dose_to_not_given()


@pytest.mark.rav
@pytest.mark.bug
def test_rav_verify_excel_mav_854(
    setup_mav_854,
    schools,
    clinics,
    programmes_page,
    children_page,
    sessions_page,
    dashboard_page,
):
    children_page.search_for_a_child(child_name="MAV_854, MAV_854")
    programmes_page.click_mav_854_child()
    sessions_page.click_location(clinics)
    sessions_page._vaccinate_child_mav_854(clinics[0])
    dashboard_page.click_mavis()
    dashboard_page.click_sessions()
    sessions_page.click_scheduled()
    sessions_page.click_location(schools[0])
    assert sessions_page.get_session_id_from_offline_excel()


@pytest.mark.rav
@pytest.mark.skip(reason="Test under construction")
def test_rav_verify_banners(setup_mav_nnn):
    # programmes_page.verify_mav_nnn()
    pass


@pytest.mark.reports
def test_verify_careplus_report_for_hpv(
    setup_cohort_upload_and_reports, programmes_page
):
    programmes_page.verify_report_format(
        programme=Programme.HPV, report_format=ReportFormat.CAREPLUS
    )


@pytest.mark.reports
def test_verify_careplus_report_for_doubles(
    setup_cohort_upload_and_reports, dashboard_page, programmes_page
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
def test_verify_csv_report_for_hpv(setup_cohort_upload_and_reports, programmes_page):
    programmes_page.verify_report_format(
        programme=Programme.HPV, report_format=ReportFormat.CSV
    )


@pytest.mark.reports
def test_verify_csv_report_for_doubles(
    setup_cohort_upload_and_reports, dashboard_page, programmes_page
):
    programmes_page.verify_report_format(
        programme=Programme.MENACWY, report_format=ReportFormat.CSV
    )
    dashboard_page.click_mavis()
    dashboard_page.click_programmes()
    programmes_page.verify_report_format(
        programme=Programme.TD_IPV, report_format=ReportFormat.CSV
    )


@pytest.mark.reports
def test_verify_systmone_report_for_hpv(
    setup_cohort_upload_and_reports, programmes_page
):
    programmes_page.verify_report_format(
        programme=Programme.HPV, report_format=ReportFormat.SYSTMONE
    )
