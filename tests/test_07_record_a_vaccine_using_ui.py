import pytest

from libs.constants import test_data_file_paths
from pages import pg_dashboard, pg_login, pg_sessions


class Test_Regression_Record_a_Vaccine_Using_UI:
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()
    sessions_page = pg_sessions.pg_sessions()

    @pytest.mark.rav
    @pytest.mark.order(701)
    def test_reg_rav_triage_positive(self, start_mavis):
        self.login_page.perform_valid_login()
        self.dashboard_page.click_sessions()
        self.sessions_page.update_triage_outcome_positive(file_paths=test_data_file_paths.COHORTS_POSITIVE)
