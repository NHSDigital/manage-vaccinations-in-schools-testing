import pytest

from libs.constants import test_data_file_paths
from pages import pg_dashboard, pg_login, pg_parental_consent, pg_sessions
from tests.helpers import parental_consent_helper


class Test_Regression_Consent:
    pc = pg_parental_consent.pg_parental_consent()
    helper = parental_consent_helper.parental_consent_helper()
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()
    sessions_page = pg_sessions.pg_sessions()

    @pytest.fixture
    def test_setup(self, start_mavis):
        self.login_page.perform_valid_login()
        self.dashboard_page.click_sessions()
        self.sessions_page.schedule_a_valid_session(for_today=True)
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.upload_valid_class_list(file_paths=test_data_file_paths.COHORTS_POSITIVE)
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        yield
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.delete_all_sessions()
        self.login_page.perform_logout()

    @pytest.fixture
    def get_session_link(self, start_mavis):
        self.login_page.perform_valid_login()
        self.dashboard_page.click_sessions()
        self.sessions_page.schedule_a_valid_session()
        link = self.sessions_page.get_consent_url()
        self.login_page.perform_logout()
        yield link
        self.login_page.go_to_login_page()
        self.login_page.perform_valid_login()
        self.dashboard_page.click_sessions()
        self.sessions_page.delete_all_sessions()
        self.login_page.perform_logout()

    @pytest.mark.consent
    @pytest.mark.mobile
    @pytest.mark.order(901)
    @pytest.mark.parametrize("scenario_data", helper.df.iterrows(), ids=[tc[0] for tc in helper.df.iterrows()])
    def test_reg_parental_consent_workflow(self, get_session_link, scenario_data):
        self.login_page.go_to_url(url=get_session_link)
        self.helper.read_data_for_scenario(scenario_data=scenario_data)
        self.helper.enter_details()

    @pytest.mark.consent
    @pytest.mark.mobile
    @pytest.mark.order(902)
    def test_reg_gillick_competence(self, test_setup):
        self.sessions_page.set_gillick_competence_for_student()
