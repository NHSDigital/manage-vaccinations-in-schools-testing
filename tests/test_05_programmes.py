import pytest

from libs.mavis_constants import (
    mavis_file_types,
    programmes,
    test_data_file_paths,
    vaccines,
)


@pytest.fixture(scope="function", autouse=False)
def setup_cohort_upload_and_reports(start_mavis, nurse, dashboard_page, login_page):
    login_page.log_in(**nurse)
    dashboard_page.click_programmes()
    yield
    login_page.log_out()


@pytest.fixture(scope="function", autouse=False)
def setup_record_a_vaccine(
    start_mavis, nurse, dashboard_page, login_page, sessions_page
):
    try:
        login_page.log_in(**nurse)
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session_in_school_1(for_today=True)
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        yield
    finally:
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions_for_school_1()
        login_page.log_out()


@pytest.fixture(scope="function", autouse=False)
def setup_mavis_1729(
    start_mavis, nurse, dashboard_page, import_records_page, login_page, sessions_page
):
    try:
        login_page.log_in(**nurse)
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session_in_school_1(for_today=True)
        import_records_page.import_class_list_records_from_school_session(
            file_paths=test_data_file_paths.CLASS_SESSION_ID
        )
        sessions_page.click_school1()
        sessions_page.save_session_id_from_offline_excel()
        dashboard_page.go_to_dashboard()
        dashboard_page.click_import_records()
        import_records_page.import_vaccination_records(
            file_paths=test_data_file_paths.VACCS_HPV_DOSE_TWO,
            file_type=mavis_file_types.VACCS_MAVIS,
        )
        dashboard_page.go_to_dashboard()
        dashboard_page.click_programmes()
        yield
    finally:
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions_for_school_1()
        login_page.log_out()


@pytest.fixture(scope="function", autouse=False)
def setup_mav_854(
    start_mavis,
    nurse,
    dashboard_page,
    import_records_page,
    login_page,
    sessions_page,
    vaccines_page,
):
    try:
        login_page.log_in(**nurse)
        dashboard_page.click_vaccines()
        vaccines_page.add_batch(vaccine_name=vaccines.GARDASIL9)
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session_in_school_1(for_today=True)
        import_records_page.import_class_list_records_from_school_session(
            file_paths=test_data_file_paths.CLASS_MAV_854
        )
        sessions_page.click_school1()
        sessions_page.save_session_id_from_offline_excel()
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session_in_community_clinics(for_today=True)
        dashboard_page.go_to_dashboard()
        dashboard_page.click_children()
        yield
    finally:
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions_for_school_1()
        login_page.log_out()


@pytest.fixture(scope="function", autouse=False)
def setup_mav_nnn(
    start_mavis, admin, dashboard_page, login_page, import_records_page, sessions_page
):
    try:
        login_page.log_in(**admin)
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session_in_school_1(for_today=True)
        import_records_page.import_class_list_records_from_school_session(
            file_paths=test_data_file_paths.CLASS_SINGLE_VACC
        )
        sessions_page.click_school1()
        sessions_page.save_session_id_from_offline_excel()
        yield
    finally:
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions_for_school_1()
        login_page.log_out()


@pytest.mark.cohorts
@pytest.mark.order(501)
def test_cohort_upload_positive(setup_cohort_upload_and_reports, programmes_page):
    programmes_page.upload_cohorts(file_paths=test_data_file_paths.COHORTS_POSITIVE)


@pytest.mark.cohorts
@pytest.mark.order(502)
def test_cohort_upload_negative(setup_cohort_upload_and_reports, programmes_page):
    programmes_page.upload_cohorts(file_paths=test_data_file_paths.COHORTS_NEGATIVE)


@pytest.mark.cohorts
@pytest.mark.order(503)
def test_cohorts_file_structure(setup_cohort_upload_and_reports, programmes_page):
    programmes_page.upload_cohorts(
        file_paths=test_data_file_paths.COHORTS_INVALID_STRUCTURE
    )


@pytest.mark.cohorts
@pytest.mark.order(504)
def test_cohorts_no_record(setup_cohort_upload_and_reports, programmes_page):
    programmes_page.upload_cohorts(file_paths=test_data_file_paths.COHORTS_HEADER_ONLY)


@pytest.mark.cohorts
@pytest.mark.order(505)
def test_cohorts_empty_file(setup_cohort_upload_and_reports, programmes_page):
    programmes_page.upload_cohorts(file_paths=test_data_file_paths.COHORTS_EMPTY_FILE)


@pytest.mark.cohorts
@pytest.mark.bug
@pytest.mark.order(506)
def test_cohorts_readd_to_cohort(
    setup_cohort_upload_and_reports, programmes_page
):  # MAV-909
    programmes_page.upload_cohorts(file_paths=test_data_file_paths.COHORTS_MAV_909)
    programmes_page.verify_mav_909()


@pytest.mark.rav
@pytest.mark.order(526)
def test_rav_triage_positive(setup_record_a_vaccine, sessions_page):
    sessions_page.update_triage_outcome_positive(
        file_paths=test_data_file_paths.COHORTS_FULL_NAME
    )


@pytest.mark.rav
@pytest.mark.order(527)
def test_rav_triage_consent_refused(setup_record_a_vaccine, sessions_page):
    sessions_page.update_triage_outcome_consent_refused(
        file_paths=test_data_file_paths.COHORTS_FULL_NAME
    )


@pytest.mark.rav
@pytest.mark.bug
@pytest.mark.order(528)
def test_rav_edit_dose_to_not_given(setup_mavis_1729, programmes_page):
    programmes_page.edit_dose_to_not_given()  # MAVIS-1729


@pytest.mark.rav
@pytest.mark.bug
@pytest.mark.order(529)
def test_rav_verify_excel_mav_854(setup_mav_854, programmes_page):
    programmes_page.verify_mav_854()  # MAV-854


@pytest.mark.rav
@pytest.mark.order(530)
@pytest.mark.skip(reason="Test under construction")
def test_rav_verify_banners(setup_mav_nnn):
    # programmes_page.verify_mav_nnn()
    pass


@pytest.mark.reports
@pytest.mark.order(551)
def test_verify_careplus_report_for_hpv(
    setup_cohort_upload_and_reports, programmes_page
):
    programmes_page.verify_careplus_report_format(for_programme=programmes.HPV)


@pytest.mark.reports
@pytest.mark.order(552)
def test_verify_careplus_report_for_doubles(
    setup_cohort_upload_and_reports, dashboard_page, programmes_page
):
    programmes_page.verify_careplus_report_format(for_programme=programmes.MENACWY)
    dashboard_page.go_to_dashboard()
    dashboard_page.click_programmes()
    programmes_page.verify_careplus_report_format(for_programme=programmes.TDIPV)


@pytest.mark.reports
@pytest.mark.order(553)
def test_verify_csv_report_for_hpv(setup_cohort_upload_and_reports, programmes_page):
    programmes_page.verify_csv_report_format(for_programme=programmes.HPV)


@pytest.mark.reports
@pytest.mark.order(554)
def test_verify_csv_report_for_doubles(
    setup_cohort_upload_and_reports, dashboard_page, programmes_page
):
    programmes_page.verify_csv_report_format(for_programme=programmes.MENACWY)
    dashboard_page.go_to_dashboard()
    dashboard_page.click_programmes()
    programmes_page.verify_csv_report_format(for_programme=programmes.TDIPV)


@pytest.mark.reports
@pytest.mark.order(555)
def test_verify_systmone_report_for_hpv(
    setup_cohort_upload_and_reports, programmes_page
):
    programmes_page.verify_systmone_report_format(for_programme=programmes.HPV)
