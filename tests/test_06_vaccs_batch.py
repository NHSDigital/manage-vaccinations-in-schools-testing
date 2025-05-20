import pytest

from libs.mavis_constants import vaccines
from pages import pg_dashboard, pg_login, pg_vaccines


class Test_Regression_Vaccines:
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()
    vaccines_page = pg_vaccines.pg_vaccines()
    doubles_vaccines = [
        vaccines.MENQUADFI,
        vaccines.MENVEO,
        vaccines.NIMENRIX,
        vaccines.REVAXIS,
    ]

    @pytest.fixture(scope="function", autouse=True)
    def setup_tests(self, start_mavis: None):
        self.login_page.login_as_nurse()
        self.dashboard_page.click_vaccines()
        yield
        self.login_page.logout_of_mavis()

    @pytest.mark.vaccsbatch
    @pytest.mark.order(601)
    def test_batch_add_change_archive_hpv(self):
        self.vaccines_page.add_batch(vaccine_name=vaccines.GARDASIL9)
        self.vaccines_page.change_batch(vaccine_name=vaccines.GARDASIL9)
        self.vaccines_page.archive_batch(vaccine_name=vaccines.GARDASIL9)

    @pytest.mark.vaccsbatch
    @pytest.mark.order(602)
    @pytest.mark.parametrize(
        "vaccine",
        doubles_vaccines,
        ids=[id[0] for id in doubles_vaccines],
    )
    def test_batch_add_change_archive_doubles(self, vaccine):
        self.vaccines_page.add_batch(vaccine_name=vaccine)
        self.vaccines_page.change_batch(vaccine_name=vaccine)
        self.vaccines_page.archive_batch(vaccine_name=vaccine)
