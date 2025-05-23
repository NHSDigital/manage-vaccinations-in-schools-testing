import pytest

from libs.mavis_constants import test_data_file_paths
from pages import pg_dashboard, pg_login, pg_sessions


class Test_Sessions:
    login_page = pg_login()
    dashboard_page = pg_dashboard()
    sessions_page = pg_sessions()

    @pytest.fixture(scope="function", autouse=False)
    def setup_tests(self, start_mavis, nurse):
        self.login_page.log_in(**nurse)
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        yield
        self.login_page.log_out()

    @pytest.fixture(scope="function", autouse=False)
    def setup_mavis_1822(self, start_mavis, nurse):
        try:
            self.login_page.log_in(**nurse)
            self.dashboard_page.click_sessions()
            self.sessions_page.schedule_a_valid_session_in_school_1(for_today=True)
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.click_school1()
            self.sessions_page.upload_class_list_to_school_1(
                file_paths=test_data_file_paths.CLASS_POSITIVE
            )
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.click_today()
            self.sessions_page.click_school1()
            yield
        finally:
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.delete_all_sessions_for_school_1()
            self.login_page.log_out()

    @pytest.fixture(scope="function", autouse=False)
    def setup_mav_1018(self, start_mavis, nurse):
        try:
            self.login_page.log_in(**nurse)
            self.dashboard_page.click_sessions()
            self.sessions_page.schedule_a_valid_session_in_school_1(for_today=True)
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.click_school1()
            self.sessions_page.upload_class_list_to_school_1(
                file_paths=test_data_file_paths.CLASS_SESSION_ID
            )
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.click_today()
            self.sessions_page.click_school1()
            yield
        finally:
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.delete_all_sessions_for_school_1()
            self.login_page.log_out()

    @pytest.mark.sessions
    @pytest.mark.order(201)
    def test_session_lifecycle(self, setup_tests: None):
        self.sessions_page.schedule_a_valid_session_in_school_1()
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.edit_a_session_to_today()
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.delete_all_sessions_for_school_1()

    @pytest.mark.sessions
    @pytest.mark.order(202)
    def test_invalid_session(self, setup_tests: None):
        self.sessions_page.create_invalid_session()

    @pytest.mark.sessions
    @pytest.mark.bug
    @pytest.mark.order(203)
    def test_verify_attendance_filters(self, setup_mavis_1822: None):
        self.sessions_page.verify_attendance_filters()  # MAVIS-1822

    @pytest.mark.sessions
    @pytest.mark.bug
    @pytest.mark.order(204)
    def test_verify_search(self, setup_mav_1018):
        self.sessions_page.verify_search()  # MAV-1018
