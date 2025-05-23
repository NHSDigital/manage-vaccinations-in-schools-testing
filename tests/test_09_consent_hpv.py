from typing import Hashable, Iterable

import pytest
from pandas.core.series import Series

from libs import CurrentExecution
from libs.mavis_constants import test_data_file_paths
from pages import pg_consent_hpv, pg_dashboard, pg_login, pg_sessions
from tests.helpers import parental_consent_helper_hpv


class Test_Consent_HPV:
    ce = CurrentExecution()
    pc = pg_consent_hpv.pg_consent_hpv()
    helper = parental_consent_helper_hpv.parental_consent_helper()
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()
    sessions_page = pg_sessions.pg_sessions()

    @pytest.fixture(scope="function")
    def get_hpv_session_link(self, start_mavis, nurse):
        try:
            self.login_page.log_in(**nurse)
            self.dashboard_page.click_sessions()
            self.sessions_page.schedule_a_valid_session_in_school_1()
            link = self.sessions_page.get_hpv_consent_url()
            self.login_page.log_out()
            yield link
        finally:
            self.login_page.go_to_login_page()
            self.login_page.log_in(**nurse)
            self.dashboard_page.click_sessions()
            self.sessions_page.delete_all_sessions_for_school_1()
            self.login_page.log_out()

    @pytest.fixture(scope="function", autouse=False)
    def setup_gillick(self, start_mavis, nurse):
        try:
            self.login_page.log_in(**nurse)
            self.dashboard_page.click_sessions()
            self.sessions_page.schedule_a_valid_session_in_school_1(for_today=True)
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.click_school1()
            self.sessions_page.upload_class_list_to_school_1(
                file_paths=test_data_file_paths.COHORTS_FULL_NAME
            )
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            yield
        finally:
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.delete_all_sessions_for_school_1()
            self.login_page.log_out()

    @pytest.fixture(scope="function", autouse=False)
    def setup_invalidated_consent(self, start_mavis, nurse):
        try:
            self.login_page.log_in(**nurse)
            self.dashboard_page.click_sessions()
            self.sessions_page.schedule_a_valid_session_in_school_1()
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.click_school1()
            self.sessions_page.upload_class_list_to_school_1(
                file_paths=test_data_file_paths.COHORTS_NO_CONSENT
            )
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.click_scheduled()
            self.sessions_page.click_school1()
            self.sessions_page.click_consent_tab()
            yield
        finally:
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.delete_all_sessions_for_school_1()
            self.login_page.log_out()

    @pytest.fixture(scope="function", autouse=False)
    def setup_mavis_1696(self, start_mavis, nurse):
        try:
            self.login_page.log_in(**nurse)
            self.dashboard_page.click_sessions()
            self.sessions_page.schedule_a_valid_session_in_school_1(for_today=True)
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.click_school1()
            self.sessions_page.upload_class_list_to_school_1(
                file_paths=test_data_file_paths.COHORTS_CONFLICTING_CONSENT
            )
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.click_scheduled()
            self.sessions_page.click_school1()
            self.sessions_page.click_consent_tab()
            yield
        finally:
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.delete_all_sessions_for_school_1()
            self.login_page.log_out()

    @pytest.fixture(scope="function", autouse=False)
    def setup_mavis_1864(self, start_mavis, nurse):
        try:
            self.login_page.log_in(**nurse)
            self.dashboard_page.click_sessions()
            self.sessions_page.schedule_a_valid_session_in_school_1(for_today=True)
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.click_school1()
            self.sessions_page.upload_class_list_to_school_1(
                file_paths=test_data_file_paths.COHORTS_CONSENT_TWICE
            )
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.click_scheduled()
            self.sessions_page.click_school1()
            self.sessions_page.click_consent_tab()
            yield
        finally:
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.delete_all_sessions_for_school_1()
            self.login_page.log_out()

    @pytest.fixture(scope="function", autouse=False)
    def setup_mavis_1818(self, start_mavis, nurse):
        try:
            self.login_page.log_in(**nurse)
            self.dashboard_page.click_sessions()
            self.sessions_page.schedule_a_valid_session_in_school_1(for_today=True)
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.click_school1()
            self.sessions_page.upload_class_list_to_school_1(
                file_paths=test_data_file_paths.COHORTS_CONFLICTING_GILLICK
            )
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.click_scheduled()
            self.sessions_page.click_school1()
            self.sessions_page.click_consent_tab()
            yield
        finally:
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.delete_all_sessions_for_school_1()
            self.login_page.log_out()

    @pytest.mark.consent
    @pytest.mark.mobile
    @pytest.mark.order(901)
    @pytest.mark.parametrize(
        "scenario_data",
        helper.df.iterrows(),
        ids=[tc[0] for tc in helper.df.iterrows()],
    )
    def test_consent_workflow_hpv(
        self,
        get_hpv_session_link: str,
        scenario_data: Iterable[tuple[Hashable, Series]],
    ):
        self.ce.page.goto(get_hpv_session_link)
        self.helper.read_data_for_scenario(scenario_data=scenario_data)
        self.helper.enter_details_on_mavis()

    @pytest.mark.consent
    @pytest.mark.order(902)
    def test_gillick_competence(self, setup_gillick: None):
        self.sessions_page.set_gillick_competence_for_student()

    @pytest.mark.consent
    @pytest.mark.bug
    @pytest.mark.order(903)
    def test_invalid_consent(self, setup_mavis_1696: None):
        self.sessions_page.bug_mavis_1696()  # MAVIS-1696

    @pytest.mark.consent
    @pytest.mark.bug
    @pytest.mark.order(905)
    def test_parent_provides_consent_twice(self, setup_mavis_1864: None):
        self.sessions_page.bug_mavis_1864()  # MAVIS-1864

    @pytest.mark.consent
    @pytest.mark.bug
    @pytest.mark.order(906)
    def test_conflicting_consent_with_gillick_consent(self, setup_mavis_1818: None):
        self.sessions_page.bug_mavis_1818()  # MAVIS-1818
