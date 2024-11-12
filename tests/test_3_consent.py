import pytest

from pages import pg_dashboard, pg_login, pg_parental_consent, pg_sessions
from tests.helpers import parental_consent_helper


class Test_Regression_Consent:
    pc = pg_parental_consent.pg_parental_consent()
    helper = parental_consent_helper.parental_consent_helper()
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()
    sessions_page = pg_sessions.pg_sessions()

    @pytest.mark.consent
    @pytest.mark.mobile
    @pytest.mark.order(301)
    @pytest.mark.parametrize("scenario_data", helper.df.iterrows(), ids=[_tc[0] for _tc in helper.df.iterrows()])
    def test_reg_parental_consent_workflow(self, start_consent_workflow, scenario_data):
        self.helper.read_data_for_scenario(scenario_data=scenario_data)
        self.helper.enter_details()

    @pytest.mark.consent
    @pytest.mark.mobile
    @pytest.mark.order(302)
    def test_reg_gillick_consent(self, start_mavis):
        self.login_page.perform_valid_login()
        self.dashboard_page.click_sessions()
        self.sessions_page.set_gillick_competency_for_student()
