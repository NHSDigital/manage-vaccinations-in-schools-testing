import pytest

from libs.generic_constants import fixture_scope
from pages import pg_dashboard, pg_login, pg_vaccines


class Test_Regression_Vaccines:
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()
    vaccines_page = pg_vaccines.pg_vaccines()

    @pytest.fixture(scope=fixture_scope.FUNCTION, autouse=True)
    def setup_tests(self, start_mavis: None):
        self.login_page.login_as_nurse()
        self.dashboard_page.click_vaccines()
        yield
        self.login_page.logout_of_mavis()

    @pytest.mark.vaccsbatch
    @pytest.mark.order(601)
    def test_batch_add_change_archive_batch(self):
        self.vaccines_page.add_gardasil9_batch()
        self.vaccines_page.change_batch()
        self.vaccines_page.archive_batch()
