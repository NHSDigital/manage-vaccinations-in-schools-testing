from typing import Hashable, Iterable

import pytest
from pandas.core.series import Series

from libs import CurrentExecution, playwright_ops
from pages import pg_consent_hpv, pg_dashboard, pg_login, pg_sessions
from tests.helpers import parental_consent_helper_doubles


class Test_Consent_Doubles:
    ce = CurrentExecution()
    po = playwright_ops.playwright_operations()
    pc = pg_consent_hpv.pg_consent_hpv()
    helper = parental_consent_helper_doubles.parental_consent_helper()
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()
    sessions_page = pg_sessions.pg_sessions()

    @pytest.fixture
    def get_doubles_session_link(self, start_mavis: None):
        self.login_page.login_as_nurse()
        self.dashboard_page.click_sessions()
        self.sessions_page.schedule_a_valid_session_in_school_1()
        link = self.sessions_page.get_doubles_consent_url()
        self.login_page.logout_of_mavis()
        yield link
        self.login_page.go_to_login_page()
        self.login_page.login_as_nurse()
        self.dashboard_page.click_sessions()
        self.sessions_page.delete_all_sessions_for_school_1()
        self.login_page.logout_of_mavis()

    @pytest.mark.consent
    @pytest.mark.mobile
    @pytest.mark.order(801)
    @pytest.mark.parametrize("scenario_data", helper.df.iterrows(), ids=[tc[0] for tc in helper.df.iterrows()])
    def test_consent_workflow_doubles(
        self, get_doubles_session_link: str, scenario_data: Iterable[tuple[Hashable, Series]]
    ):
        self.po.go_to_url(url=get_doubles_session_link)
        self.helper.read_data_for_scenario(scenario_data=scenario_data)
        self.helper.enter_details_on_mavis()
