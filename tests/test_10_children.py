import pytest

from pages import pg_children, pg_dashboard, pg_login


class Test_Children:
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()
    children_page = pg_children.pg_children()

    @pytest.mark.children
    @pytest.mark.order(1001)
    def test_children_headers(self, start_mavis):
        self.login_page.perform_valid_login()
        self.dashboard_page.click_children()
        self.children_page.verify_headers()
