from typing import Hashable, Iterable

import pytest
from pandas.core.series import Series

from libs import CurrentExecution
from tests.helpers import parental_consent_helper_doubles

from pages import ConsentHPVPage, DashboardPage, LoginPage, SessionsPage


class Test_Consent_Doubles:
    ce = CurrentExecution()
    pc = ConsentHPVPage()
    helper = parental_consent_helper_doubles.parental_consent_helper()
    login_page = LoginPage()
    dashboard_page = DashboardPage()
    sessions_page = SessionsPage()

    @pytest.fixture(scope="function")
    def get_doubles_session_link(self, start_mavis, nurse):
        try:
            self.login_page.log_in(**nurse)
            self.dashboard_page.click_sessions()
            self.sessions_page.schedule_a_valid_session_in_school_1()
            link = self.sessions_page.get_doubles_consent_url()
            self.login_page.log_out()
            yield link
        finally:
            self.login_page.go_to_login_page()
            self.login_page.log_in(**nurse)
            self.dashboard_page.click_sessions()
            self.sessions_page.delete_all_sessions_for_school_1()
            self.login_page.log_out()

    @pytest.mark.consent
    @pytest.mark.mobile
    @pytest.mark.order(801)
    @pytest.mark.parametrize(
        "scenario_data",
        helper.df.iterrows(),
        ids=[tc[0] for tc in helper.df.iterrows()],
    )
    def test_consent_workflow_doubles(
        self,
        get_doubles_session_link: str,
        scenario_data: Iterable[tuple[Hashable, Series]],
    ):
        self.ce.page.goto(get_doubles_session_link)
        self.helper.read_data_for_scenario(scenario_data=scenario_data)
        self.helper.enter_details_on_mavis()
