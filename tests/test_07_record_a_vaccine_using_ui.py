import pytest

from libs.constants import test_data_file_paths
from pages import pg_dashboard, pg_login, pg_sessions


class Test_Regression_Record_a_Vaccine_Using_UI:
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()
    sessions_page = pg_sessions.pg_sessions()

    @pytest.fixture()
    def test_setup(self, start_mavis: None):
        self.login_page.perform_valid_login()
        self.dashboard_page.click_sessions()
        self.sessions_page.schedule_a_valid_session()
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        yield
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.delete_all_sessions()
        self.login_page.perform_logout()

    @pytest.mark.rav
    @pytest.mark.order(701)
    def test_reg_rav_triage_positive(self, test_setup):
        self.sessions_page.update_triage_outcome_positive(file_paths=test_data_file_paths.COHORTS_POSITIVE)

    @pytest.mark.rav
    @pytest.mark.order(702)
    def test_reg_rav_triage_consent_refused(self, test_setup):
        self.sessions_page.update_triage_outcome_consent_refused(file_paths=test_data_file_paths.COHORTS_POSITIVE)
