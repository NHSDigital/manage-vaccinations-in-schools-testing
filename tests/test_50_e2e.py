import pytest

from libs.mavis_constants import test_data_file_paths
from pages import DashboardPage, LoginPage, ProgrammesPage, SessionsPage


class Test_E2E:
    login_page = LoginPage()
    dashboard_page = DashboardPage()
    programmes_page = ProgrammesPage()
    sessions_page = SessionsPage()

    @pytest.fixture(scope="function", autouse=True)
    def setup_tests(self, start_mavis, reset_environment, nurse):
        reset_environment()

        self.login_page.log_in(**nurse)
        yield
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.delete_all_sessions_for_school_1()
        self.login_page.log_out()

    @pytest.mark.e2e
    @pytest.mark.order(5001)
    def test_e2e(self):
        self.dashboard_page.click_programmes()
        self.programmes_page.upload_cohorts(
            file_paths=test_data_file_paths.COHORTS_E2E_1
        )
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.schedule_a_valid_session_in_school_1()
        self.sessions_page.give_consent_for_e2e1_child_by_parent_1()
