import pytest

from pages import pg_children, pg_dashboard, pg_login


class Test_Regression_Bugs:
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()
    children_page = pg_children.pg_children()

    @pytest.mark.bugs
    @pytest.mark.order(5001)
    def test_reg_children_page(self, create_browser_page):
        self.login_page.perform_valid_login()
        self.dashboard_page.click_children()
        self.children_page.verify_headers()
