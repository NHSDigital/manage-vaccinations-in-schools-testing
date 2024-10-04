import pytest

from pages import pg_login


class Test_Regression_Login:
    login_page = pg_login.pg_login()

    test_parameters = [
        ("invalid_user", "invalid_password", "Invalid Email or password."),
        ("invalid_user", "", "Invalid Email or password."),
        ("", "invalid_password", "Invalid Email or password."),
    ]

    @pytest.mark.regression
    @pytest.mark.order(101)
    @pytest.mark.parametrize("user,pwd,expected_message", test_parameters)
    def test_reg_invalid_login(self, create_browser_page, user, pwd, expected_message):
        self.login_page.perform_invalid_login(user=user, pwd=pwd, expected_message=expected_message)
