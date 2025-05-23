import pytest

from libs.mavis_constants import test_data_file_paths
from pages import DashboardPage, LoginPage, SessionsPage


login_page = LoginPage()
dashboard_page = DashboardPage()
sessions_page = SessionsPage()


@pytest.fixture(scope="function", autouse=False)
def setup_tests(start_mavis, nurse):
    login_page.log_in(**nurse)
    dashboard_page.go_to_dashboard()
    dashboard_page.click_sessions()
    yield
    login_page.log_out()


@pytest.fixture(scope="function", autouse=False)
def setup_mavis_1822(start_mavis, nurse):
    try:
        login_page.log_in(**nurse)
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session_in_school_1(for_today=True)
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.click_school1()
        sessions_page.upload_class_list_to_school_1(
            file_paths=test_data_file_paths.CLASS_POSITIVE
        )
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.click_today()
        sessions_page.click_school1()
        yield
    finally:
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions_for_school_1()
        login_page.log_out()


@pytest.fixture(scope="function", autouse=False)
def setup_mav_1018(start_mavis, nurse):
    try:
        login_page.log_in(**nurse)
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session_in_school_1(for_today=True)
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.click_school1()
        sessions_page.upload_class_list_to_school_1(
            file_paths=test_data_file_paths.CLASS_SESSION_ID
        )
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.click_today()
        sessions_page.click_school1()
        yield
    finally:
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions_for_school_1()
        login_page.log_out()


@pytest.mark.sessions
@pytest.mark.order(201)
def test_lifecycle(setup_tests: None):
    sessions_page.schedule_a_valid_session_in_school_1()
    dashboard_page.go_to_dashboard()
    dashboard_page.click_sessions()
    sessions_page.edit_a_session_to_today()
    dashboard_page.go_to_dashboard()
    dashboard_page.click_sessions()
    sessions_page.delete_all_sessions_for_school_1()


@pytest.mark.sessions
@pytest.mark.order(202)
def test_invalid(setup_tests: None):
    sessions_page.create_invalid_session()


@pytest.mark.sessions
@pytest.mark.bug
@pytest.mark.order(203)
def test_verify_attendance_filters(setup_mavis_1822: None):
    sessions_page.verify_attendance_filters()  # MAVIS-1822


@pytest.mark.sessions
@pytest.mark.bug
@pytest.mark.order(204)
def test_verify_search(setup_mav_1018):
    sessions_page.verify_search()  # MAV-1018
