import pytest

from libs.generic_constants import fixture_scope
from pages import pg_dashboard, pg_login


class Test_Login:
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()

    @pytest.fixture(scope=fixture_scope.FUNCTION, autouse=True)
    def setup_tests(self, start_mavis: None):
        yield

    test_parameters = [
        ("invalid_user", "invalid_password", "Invalid Email or password."),
        ("invalid_user", "", "Invalid Email or password."),
        ("", "invalid_password", "Invalid Email or password."),
        ("", "", "Invalid Email or password."),
    ]

    @pytest.mark.login
    @pytest.mark.mobile
    @pytest.mark.order(101)
    @pytest.mark.parametrize("user,pwd,expected_message", test_parameters)
    def test_invalid_login(self, user, pwd, expected_message):
        self.login_page.try_invalid_login(user=user, pwd=pwd, expected_message=expected_message)

    @pytest.mark.login
    @pytest.mark.mobile
    @pytest.mark.order(102)
    def test_home_page_links_for_nurse(self):
        self.login_page.go_to_login_page()
        self.login_page.login_as_nurse()
        self.dashboard_page.verify_all_expected_links_for_nurse()
        self.login_page.logout_of_mavis()

    @pytest.mark.login
    @pytest.mark.mobile
    @pytest.mark.order(103)
    def test_home_page_links_for_superuser(self):
        self.login_page.go_to_login_page()
        self.login_page.login_as_superuser()
        self.dashboard_page.verify_all_expected_links_for_superuser()
        self.login_page.logout_of_mavis()

    @pytest.mark.login
    @pytest.mark.mobile
    @pytest.mark.order(104)
    def test_home_page_links_for_admin(self):
        self.login_page.go_to_login_page()
        self.login_page.login_as_admin()
        self.dashboard_page.verify_all_expected_links_for_admin()
        self.login_page.logout_of_mavis()
