import pytest

from libs.mavis_constants import test_data_file_paths, vaccines
from libs.wrappers import wait_for_reset


@pytest.fixture(scope="function", autouse=False)
def setup_tests(start_mavis, reset_environment, nurse, login_page):
    reset_environment()
    wait_for_reset()
    login_page.log_in(**nurse)
    yield
    login_page.log_out()


@pytest.fixture(scope="function", autouse=False)
def setup_mav_965(
    setup_tests, dashboard_page, import_records_page, sessions_page, vaccines_page
):
    dashboard_page.click_vaccines()
    vaccines_page.add_batch(vaccine_name=vaccines.GARDASIL9)  # HPV
    vaccines_page.add_batch(vaccine_name=vaccines.MENQUADFI)  # MenACWY
    vaccines_page.add_batch(vaccine_name=vaccines.REVAXIS)  # Td/IPV
    dashboard_page.go_to_dashboard()
    dashboard_page.click_sessions()
    sessions_page.schedule_a_valid_session_in_school_1(for_today=True)
    import_records_page.import_class_list_records_from_school_session(
        file_paths=test_data_file_paths.CLASS_MAV_965
    )
    dashboard_page.go_to_dashboard()
    dashboard_page.click_sessions()
    yield


@pytest.fixture(scope="function", autouse=False)
def setup_cohort_upload_and_reports(setup_tests, dashboard_page):
    dashboard_page.click_programmes()
    yield


@pytest.mark.rav
@pytest.mark.bug
@pytest.mark.order(9901)
def test_programmes_rav_prescreening_questions(setup_mav_965, programmes_page):
    programmes_page.verify_mav_965()


@pytest.mark.cohorts
@pytest.mark.order(9902)
@pytest.mark.skip(reason="Covered in performance testing")
def test_cohort_upload_performance(
    setup_cohort_upload_and_reports, programmes_page
):  # MAV-927
    programmes_page.upload_cohorts(
        file_paths=test_data_file_paths.COHORTS_MAV_927_PERF, wait_long=True
    )
