import pytest

from pages import pg_dashboard, pg_login


class Test_Regression_Login:
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()

    test_parameters = [
        ("invalid_user", "invalid_password", "Invalid Email or password."),
        ("invalid_user", "", "Invalid Email or password."),
        ("", "invalid_password", "Invalid Email or password."),
    ]

    @pytest.mark.login
    @pytest.mark.mobile
    @pytest.mark.order(101)
    @pytest.mark.parametrize("user,pwd,expected_message", test_parameters)
    def test_reg_invalid_login(self, create_browser_page, user, pwd, expected_message):
        self.login_page.perform_invalid_login(user=user, pwd=pwd, expected_message=expected_message)

    @pytest.mark.login
    @pytest.mark.mobile
    @pytest.mark.order(102)
    def test_reg_home_page_links(self, create_browser_page):
        self.login_page.perform_valid_login()
        self.dashboard_page.verify_all_expected_links()
