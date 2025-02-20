import pytest

from libs.mavis_constants import test_data_file_paths
from pages import pg_dashboard, pg_login, pg_sessions


class Test_Sessions:
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()
    sessions_page = pg_sessions.pg_sessions()

    @pytest.fixture(scope="function", autouse=False)
    def setup_tests(self, start_mavis: None):
        self.login_page.login_as_nurse()
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        yield
        self.login_page.logout_of_mavis()

    @pytest.fixture(scope="function", autouse=False)
    def setup_mavis_1822(self, start_mavis: None):
        self.login_page.login_as_nurse()
        self.dashboard_page.click_sessions()
        self.sessions_page.schedule_a_valid_session_in_school_1(for_today=True)
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.upload_class_list_to_school_1(file_paths=test_data_file_paths.CLASS_POSITIVE)
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.click_today()
        self.sessions_page.click_school1()
        yield
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.delete_all_sessions_for_school_1()
        self.login_page.logout_of_mavis()

    @pytest.mark.mobile
    @pytest.mark.sessions
    @pytest.mark.order(201)
    def test_session_lifecycle(self, setup_tests):
        self.sessions_page.schedule_a_valid_session_in_school_1()
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.edit_a_session_to_today()
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.delete_all_sessions_for_school_1()

    @pytest.mark.sessions
    @pytest.mark.order(202)
    def test_verify_attendance_filters(self, setup_mavis_1822):
        self.sessions_page.verify_attendance_filters()
