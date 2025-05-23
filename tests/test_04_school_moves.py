import pytest

from libs.mavis_constants import test_data_file_paths
from pages import DashboardPage, LoginPage, SchoolMovesPage, SessionsPage


class Test_School_Moves:
    login_page = LoginPage()
    dashboard_page = DashboardPage()
    sessions_page = SessionsPage()
    school_moves_page = SchoolMovesPage()

    @pytest.fixture(scope="function", autouse=False)
    def setup_tests(self, start_mavis, reset_environment, nurse):
        reset_environment()

        self.login_page.log_in(**nurse)
        yield
        self.login_page.log_out()

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
            self.sessions_page.upload_class_list_to_school_1(
                file_paths=test_data_file_paths.CLASS_MOVES_CONFIRM_IGNORE
            )
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.click_scheduled()
            self.sessions_page.click_school2()
            self.sessions_page.upload_class_list_to_school_2(
                file_paths=test_data_file_paths.CLASS_MOVES_CONFIRM_IGNORE
            )
            yield
        finally:
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.delete_all_sessions_for_school_1()
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.delete_all_sessions_for_school_2()

    @pytest.fixture(scope="function", autouse=False)
    def setup_move_to_homeschool_and_unknown(self, setup_tests: None):
        try:
            self.dashboard_page.click_sessions()
            self.sessions_page.schedule_a_valid_session_in_school_1()
            self.sessions_page.click_school1()
            self.sessions_page.upload_class_list_to_school_1(
                file_paths=test_data_file_paths.CLASS_MOVES_UNKNOWN_HOMESCHOOLED
            )
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.click_scheduled()
            self.sessions_page.click_school2()
            self.sessions_page.upload_class_list_to_school_2(
                file_paths=test_data_file_paths.CLASS_MOVES_CONFIRM_IGNORE
            )
            yield
        finally:
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.delete_all_sessions_for_school_1()
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.delete_all_sessions_for_school_2()

    @pytest.mark.schoolmoves
    @pytest.mark.order(401)
    def test_school_moves_confirm_and_ignore(self, setup_move_and_ignore: None):
        self.school_moves_page.confirm_and_ignore_moves()

    # Add tests for school moves to Homeschool or Unknown school
    @pytest.mark.schoolmoves
    @pytest.mark.order(402)
    @pytest.mark.skip(reason="Test under construction")
    def test_school_moves_to_homeschool_and_unknown(
        self, setup_move_to_homeschool_and_unknown: None
    ):
        pass

    @pytest.mark.schoolmoves
    @pytest.mark.order(403)
    def test_school_moves_download_report(self, setup_move_and_ignore: None):
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_school_moves()
        self.school_moves_page.download_and_verify_report()
