import pytest

from pages import pg_dashboard, pg_login, pg_vaccines


class Test_Regression_Cohorts:
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()
    vaccines_page = pg_vaccines.pg_vaccines()

    @pytest.fixture(scope="function", autouse=True)
    def setup_tests(self, start_mavis: None):
        self.login_page.perform_valid_login()
        self.dashboard_page.click_vaccines()
        yield
        self.login_page.perform_logout()

    @pytest.mark.vaccsbatch
    @pytest.mark.mobile
    @pytest.mark.order(601)
    def test_reg_batch_add_batch(self):
        self.vaccines_page.add_batch()

    @pytest.mark.vaccsbatch
    @pytest.mark.mobile
    @pytest.mark.order(602)
    def test_reg_batch_change_batch(self):
        self.vaccines_page.add_batch()
        self.vaccines_page.change_batch()

    @pytest.mark.vaccsbatch
    @pytest.mark.mobile
    @pytest.mark.order(603)
    def test_reg_batch_archive_batch(self):
        self.vaccines_page.add_batch()
        self.vaccines_page.archive_batch()

    @pytest.mark.vaccsbatch
    @pytest.mark.mobile
    @pytest.mark.order(604)
    def test_reg_batch_add_change_archive_batch(self):
        self.vaccines_page.add_batch()
        self.vaccines_page.change_batch()
        self.vaccines_page.archive_batch()
