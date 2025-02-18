from typing import Hashable, Iterable

import pytest
from pandas.core.series import Series

from libs import CurrentExecution, playwright_ops
from libs.constants import test_data_file_paths
from pages import pg_dashboard, pg_login, pg_parental_consent, pg_sessions
from tests.helpers import parental_consent_helper


class Test_Consent:
    ce = CurrentExecution()
    po = playwright_ops.playwright_operations()
    pc = pg_parental_consent.pg_parental_consent()
    helper = parental_consent_helper.parental_consent_helper()
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()
    sessions_page = pg_sessions.pg_sessions()

    @pytest.fixture
    def get_hpv_session_link(self, start_mavis: None):
        self.login_page.login_as_nurse()
        self.dashboard_page.click_sessions()
        self.sessions_page.schedule_a_valid_session_in_school_1()
        link = self.sessions_page.get_hpv_consent_url()
        self.login_page.logout_of_mavis()
        yield link
        self.login_page.go_to_login_page()
        self.login_page.login_as_nurse()
        self.dashboard_page.click_sessions()
        self.sessions_page.delete_all_sessions_for_school_1()
        self.login_page.logout_of_mavis()

    @pytest.fixture(scope="function", autouse=False)
    def setup_gillick(self, start_mavis: None):
        self.login_page.login_as_nurse()
        self.dashboard_page.click_sessions()
        self.sessions_page.schedule_a_valid_session_in_school_1(for_today=True)
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.upload_class_list_to_school_1(file_paths=test_data_file_paths.COHORTS_POSITIVE)
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        yield
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.delete_all_sessions_for_school_1()
        self.login_page.logout_of_mavis()

    @pytest.fixture(scope="function", autouse=False)
    def setup_invalidated_consent(self, start_mavis: None):
        self.login_page.login_as_nurse()
        self.dashboard_page.click_sessions()
        self.sessions_page.schedule_a_valid_session_in_school_1()
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.upload_class_list_to_school_1(file_paths=test_data_file_paths.COHORTS_NO_CONSENT)
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.click_scheduled()
        self.sessions_page.click_school1()
        self.sessions_page.click_check_consent_responses()
        yield
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.delete_all_sessions_for_school_1()
        self.login_page.logout_of_mavis()

    @pytest.fixture(scope="function", autouse=False)
    def setup_conflicting_consent(self, start_mavis: None):
        self.login_page.login_as_nurse()
        self.dashboard_page.click_sessions()
        self.sessions_page.schedule_a_valid_session_in_school_1(for_today=True)
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.upload_class_list_to_school_1(file_paths=test_data_file_paths.COHORTS_CONFLICTING_CONSENT)
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.click_scheduled()
        self.sessions_page.click_school1()
        self.sessions_page.click_check_consent_responses()
        yield
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.delete_all_sessions_for_school_1()
        self.login_page.logout_of_mavis()

    @pytest.mark.consent
    @pytest.mark.mobile
    @pytest.mark.order(901)
    @pytest.mark.parametrize("scenario_data", helper.df.iterrows(), ids=[tc[0] for tc in helper.df.iterrows()])
    def test_parental_consent_workflow(
        self, get_hpv_session_link: str, scenario_data: Iterable[tuple[Hashable, Series]]
    ):
        self.po.go_to_url(url=get_hpv_session_link)
        self.helper.read_data_for_scenario(scenario_data=scenario_data)
        self.helper.enter_details_on_mavis()

    @pytest.mark.consent
    @pytest.mark.order(902)
    def test_gillick_competence(self, setup_gillick: None):
        self.sessions_page.set_gillick_competence_for_student()

    @pytest.mark.consent
    @pytest.mark.order(903)
    def test_invalid_consent(self, setup_invalidated_consent: None):
        self.sessions_page.bug_mavis_1696()

    @pytest.mark.consent
    @pytest.mark.order(904)
    @pytest.mark.skip(reason="Development card in backlog")
    def test_phone_number_added_later_shows_phone_options(self, setup_invalidated_consent: None):
        self.sessions_page.bug_mavis_1801()

    @pytest.mark.consent
    @pytest.mark.order(905)
    def test_parent_provides_consent_twice(self, setup_invalidated_consent: None):
        self.sessions_page.bug_mavis_1864()

    @pytest.mark.consent
    @pytest.mark.order(906)
    def test_conflicting_consent_with_gillick_consent(self, setup_conflicting_consent: None):
        self.sessions_page.bug_mavis_1818()
