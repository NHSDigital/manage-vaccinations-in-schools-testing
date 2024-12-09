import pytest

from libs.constants import test_data_file_paths
from pages import pg_dashboard, pg_login, pg_sessions


class Test_Record_a_Vaccine_Using_UI:
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()
    sessions_page = pg_sessions.pg_sessions()

    @pytest.fixture(scope="function", autouse=True)
    def setup_tests(self, start_mavis: None):
        self.login_page.login_as_nurse()
        self.dashboard_page.click_sessions()
        self.sessions_page.schedule_a_valid_session()
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        yield
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.delete_all_sessions()
        self.login_page.logout_from_the_service()

    @pytest.mark.rav
    @pytest.mark.order(701)
    def test_rav_triage_positive(self):
        self.sessions_page.update_triage_outcome_positive(file_paths=test_data_file_paths.COHORTS_POSITIVE)

    @pytest.mark.rav
    @pytest.mark.order(702)
    def test_rav_triage_consent_refused(self):
        self.sessions_page.update_triage_outcome_consent_refused(file_paths=test_data_file_paths.COHORTS_POSITIVE)
