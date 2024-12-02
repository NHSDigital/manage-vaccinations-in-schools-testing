import pytest

from pages import pg_children, pg_dashboard, pg_login


class Test_Children:
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()
    children_page = pg_children.pg_children()

    @pytest.fixture(scope="function", autouse=True)
    def setup_tests(self, start_mavis):
        self.login_page.perform_valid_login()
        self.dashboard_page.click_children()
        yield
        self.login_page.perform_logout()

    @pytest.mark.children
    @pytest.mark.order(1001)
    def test_children_headers(self):
        self.children_page.verify_headers()

    @pytest.mark.children
    @pytest.mark.order(1002)
    def test_children_filter(self):
        self.children_page.verify_filter()
