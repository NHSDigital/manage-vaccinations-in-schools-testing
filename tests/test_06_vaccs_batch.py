import pytest

from libs.generic_constants import fixture_scope
from libs.mavis_constants import vaccine_names
from pages import pg_dashboard, pg_login, pg_vaccines


class Test_Regression_Vaccines:
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()
    vaccines_page = pg_vaccines.pg_vaccines()
    doubles_vaccines = [vaccine_names.MENQUADFI, vaccine_names.MENVEO, vaccine_names.NIMENRIX, vaccine_names.REVAXIS]

    @pytest.fixture(scope=fixture_scope.FUNCTION, autouse=True)
    def setup_tests(self, start_mavis: None):
        self.login_page.login_as_nurse()
        self.dashboard_page.click_vaccines()
        yield
        self.login_page.logout_of_mavis()

    @pytest.mark.vaccsbatch
    @pytest.mark.order(601)
    def test_batch_add_change_archive_hpv(self):
        self.vaccines_page.add_batch(vaccine_name=vaccine_names.GARDASIL9)
        self.vaccines_page.change_batch(vaccine_name=vaccine_names.GARDASIL9)
        self.vaccines_page.archive_batch(vaccine_name=vaccine_names.GARDASIL9)

    @pytest.mark.vaccsbatch
    @pytest.mark.order(602)
    @pytest.mark.parametrize(
        "vaccine_name",
        doubles_vaccines,
        ids=[id[0] for id in doubles_vaccines],
    )
    def test_batch_add_change_archive_doubles(self, vaccine_name):
        self.vaccines_page.add_batch(vaccine_name=vaccine_name)
        self.vaccines_page.change_batch(vaccine_name=vaccine_name)
        self.vaccines_page.archive_batch(vaccine_name=vaccine_name)
