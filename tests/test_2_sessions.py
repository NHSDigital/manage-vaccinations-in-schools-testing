import pytest

from pages import pg_dashboard, pg_login, pg_sessions


class Test_Regression_Sessions:
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()
    sessions_page = pg_sessions.pg_sessions()

    @pytest.mark.sessions
    @pytest.mark.order(201)
    def test_reg_create_valid_session(self, create_browser_page):
        self.login_page.perform_valid_login()
        self.dashboard_page.click_sessions()
        self.sessions_page.schedule_a_valid_session()

    @pytest.mark.sessions
    @pytest.mark.order(202)
    def test_reg_delete_all_sessions(self, create_browser_page):
        self.login_page.perform_valid_login()
        self.dashboard_page.click_sessions()
        self.sessions_page.delete_all_sessions()

    @pytest.mark.sessions
    @pytest.mark.order(203)
    def test_reg_create_invalid_schedule(self, create_browser_page):
        self.login_page.perform_valid_login()
        self.dashboard_page.click_sessions()
        self.sessions_page.create_invalid_session()
