import pytest

from libs.mavis_constants import test_data_file_paths
from pages import pg_dashboard, pg_login, pg_school_moves, pg_sessions


class Test_School_Moves:
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()
    sessions_page = pg_sessions.pg_sessions()
    school_moves_page = pg_school_moves.pg_school_moves()

    @pytest.fixture(scope="function", autouse=False)
    def setup_tests(self, start_mavis: None):
        self.login_page.login_as_nurse()
        yield
        self.login_page.logout_of_mavis()

    @pytest.fixture(scope="function", autouse=False)
    def setup_move_and_ignore(self, setup_tests: None):
        try:
            self.dashboard_page.click_sessions()
            self.sessions_page.schedule_a_valid_session_in_school_1()
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.schedule_a_valid_session_in_school_2()
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.click_scheduled()
            self.sessions_page.click_school1()
            self.sessions_page.upload_class_list_to_school_1(file_paths=test_data_file_paths.CLASS_MOVES_ONE)
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.click_scheduled()
            self.sessions_page.click_school2()
            self.sessions_page.upload_class_list_to_school_2(file_paths=test_data_file_paths.CLASS_MOVES_ONE)
            yield
        finally:
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.delete_all_sessions_for_school_1()
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.delete_all_sessions_for_school_2()

    @pytest.mark.schoolmoves
    @pytest.mark.order(1101)
    def test_school_moves_confirm_and_ignore(self, setup_move_and_ignore: None):
        self.school_moves_page.confirm_and_ignore_moves()
