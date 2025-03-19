import pytest

from libs import CurrentExecution
from libs.generic_constants import fixture_scope
from libs.mavis_constants import test_data_file_paths
from pages import pg_dashboard, pg_login, pg_programmes, pg_sessions


class Test_E2E:
    ce = CurrentExecution()
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()
    programmes_page = pg_programmes.pg_programmes()
    sessions_page = pg_sessions.pg_sessions()

    @pytest.fixture(scope=fixture_scope.FUNCTION, autouse=True)
    def setup_tests(self, start_mavis: None):
        self.ce.reset_environment()
        self.login_page.login_as_nurse()
        yield
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.delete_all_sessions_for_school_1()
        self.login_page.logout_of_mavis()

    @pytest.mark.e2e
    @pytest.mark.order(5001)
    def test_e2e(self):
        self.dashboard_page.click_programmes()
        self.programmes_page.upload_cohorts(file_paths=test_data_file_paths.COHORTS_E2E_1)
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.schedule_a_valid_session_in_school_1()
        self.sessions_page.give_consent_for_e2e1_child_by_parent_1()
