from typing import Hashable, Iterable

import pytest
from pandas.core.series import Series

from libs.constants import test_data_file_paths
from pages import pg_dashboard, pg_login, pg_parental_consent, pg_sessions
from tests.helpers import parental_consent_helper


class Test_Consent:
    pc = pg_parental_consent.pg_parental_consent()
    helper = parental_consent_helper.parental_consent_helper()
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()
    sessions_page = pg_sessions.pg_sessions()

    @pytest.fixture
    def get_session_link(self, start_mavis: None):
        self.login_page.login_as_nurse()
        self.dashboard_page.click_sessions()
        self.sessions_page.schedule_a_valid_session()
        link = self.sessions_page.get_consent_url()
        self.login_page.logout_of_mavis()
        yield link
        self.login_page.go_to_login_page()
        self.login_page.login_as_nurse()
        self.dashboard_page.click_sessions()
        self.sessions_page.delete_all_sessions()
        self.login_page.logout_of_mavis()

    @pytest.mark.consent
    @pytest.mark.mobile
    @pytest.mark.order(901)
    @pytest.mark.parametrize("scenario_data", helper.df.iterrows(), ids=[tc[0] for tc in helper.df.iterrows()])
    def test_parental_consent_workflow(self, get_session_link: str, scenario_data: Iterable[tuple[Hashable, Series]]):
        self.login_page.go_to_url(url=get_session_link)
        self.helper.read_data_for_scenario(scenario_data=scenario_data)
        self.helper.enter_details()

    @pytest.mark.consent
    @pytest.mark.order(902)
    def test_gillick_competence(self, start_mavis: None):
        self.login_page.login_as_nurse()
        self.dashboard_page.click_sessions()
        self.sessions_page.schedule_a_valid_session(for_today=True)
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.upload_valid_class_list(file_paths=test_data_file_paths.COHORTS_POSITIVE)
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.set_gillick_competence_for_student()
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.delete_all_sessions()
        self.login_page.logout_of_mavis()

    @pytest.mark.consent
    @pytest.mark.order(903)
    def test_invalid_consent(self, start_mavis: None):
        self.login_page.login_as_nurse()
        self.dashboard_page.click_sessions()
        self.sessions_page.schedule_a_valid_session()
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.upload_valid_class_list(file_paths=test_data_file_paths.COHORTS_NO_APPROVAL)
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.click_scheduled()
        self.sessions_page.click_school1()
        self.sessions_page.click_check_consent_responses()
        self.sessions_page.disparate_consent_scenario()  # Bug: MAVIS-1696
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.delete_all_sessions()
        self.login_page.logout_of_mavis()
