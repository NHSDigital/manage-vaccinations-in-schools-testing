import pytest

from pages import pg_dashboard, pg_login, pg_sessions


class Test_Sessions:
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()
    sessions_page = pg_sessions.pg_sessions()

    @pytest.fixture(scope="function", autouse=True)
    def setup_tests(self, start_mavis: None):
        self.login_page.login_as_nurse()
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        yield
        self.login_page.perform_logout()

    @pytest.mark.sessions
    @pytest.mark.order(201)
    def test_create_valid_session(self):
        self.sessions_page.schedule_a_valid_session()

    @pytest.mark.sessions
    @pytest.mark.order(201)
    def test_edit_session(self):
        self.sessions_page.edit_a_session_to_today()

    @pytest.mark.sessions
    @pytest.mark.order(203)
    def test_delete_all_sessions(self):
        self.sessions_page.delete_all_sessions()

    @pytest.mark.sessions
    @pytest.mark.order(204)
    def test_create_invalid_session(self):
        self.sessions_page.create_invalid_session()
