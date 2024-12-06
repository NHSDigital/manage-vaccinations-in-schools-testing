import pytest

from libs.constants import test_data_file_paths
from pages import pg_dashboard, pg_login, pg_school_moves, pg_sessions


class Test_School_Moves:
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()
    sessions_page = pg_sessions.pg_sessions()
    school_moves_page = pg_school_moves.pg_school_moves()

    @pytest.fixture(scope="function", autouse=True)
    def setup_tests(self, start_mavis: None):
        self.login_page.login_as_nurse()
        self.dashboard_page.click_sessions()
        self.sessions_page.schedule_a_valid_session()
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.upload_class_list(file_paths=test_data_file_paths.CLASS_POSITIVE)
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.update_triage_outcome_positive(file_paths=test_data_file_paths.COHORTS_POSITIVE)
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_school_moves()
        yield
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.delete_all_sessions()
        self.login_page.perform_logout()

    @pytest.mark.schoolmoves
    @pytest.mark.order(1101)
    def test_school_moves_verify_headers(self):
        self.school_moves_page.verify_headers()

    @pytest.mark.schoolmoves
    @pytest.mark.order(1102)
    def test_school_moves_update_school_movers(self):
        self.school_moves_page.update_school_move()
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_school_moves()
        self.school_moves_page.ignore_school_move()
