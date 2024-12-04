import pytest

from pages import pg_dashboard, pg_login, pg_school_moves


class Test_School_Moves:
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()
    school_moves_page = pg_school_moves.pg_school_moves()

    @pytest.fixture(scope="function", autouse=True)
    def setup_tests(self, start_mavis: None):
        self.login_page.perform_valid_login()
        self.dashboard_page.click_school_moves()
        yield
        self.login_page.perform_logout()

    @pytest.mark.schoolmoves
    @pytest.mark.mobile
    @pytest.mark.order(1101)
    def test_verify_headers(self):
        self.school_moves_page.verify_headers()
