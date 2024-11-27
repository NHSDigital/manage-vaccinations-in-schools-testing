import pytest

from pages import pg_dashboard, pg_login, pg_sessions


class Test_Regression_Sessions:
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()
    sessions_page = pg_sessions.pg_sessions()

    @pytest.fixture(scope="class", autouse=True)
    def test_setup(self, start_mavis):
        self.login_page.perform_valid_login()
        yield
        self.login_page.perform_logout()

    @pytest.fixture(scope="function", autouse=True)
    def reset_navigation(self):
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        yield
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()

    @pytest.mark.sessions
    @pytest.mark.order(201)
    def test_reg_create_valid_session(self):
        self.sessions_page.schedule_a_valid_session()

    @pytest.mark.sessions
    @pytest.mark.order(202)
    def test_reg_delete_all_sessions(self):
        self.sessions_page.delete_all_sessions()

    @pytest.mark.sessions
    @pytest.mark.order(203)
    def test_reg_create_invalid_session(self):
        self.sessions_page.create_invalid_session()
