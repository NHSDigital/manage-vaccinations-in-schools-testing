import pytest

from pages import pg_dashboard, pg_login, pg_vaccines


class Test_Regression_Cohorts:
    login_page = pg_login.pg_login()
    home_page = pg_dashboard.pg_dashboard()
    vaccines_page = pg_vaccines.pg_vaccines()

    @pytest.mark.vaccsbatch
    @pytest.mark.mobile
    @pytest.mark.order(601)
    def test_reg_batch_add_batch(self, create_browser_page):
        self.login_page.perform_valid_login()
        self.home_page.click_vaccines()
        self.vaccines_page.add_batch()

    @pytest.mark.vaccsbatch
    @pytest.mark.mobile
    @pytest.mark.order(602)
    def test_reg_batch_change_batch(self, create_browser_page):
        self.login_page.perform_valid_login()
        self.home_page.click_vaccines()
        self.vaccines_page.add_batch()
        self.vaccines_page.change_batch()

    @pytest.mark.vaccsbatch
    @pytest.mark.mobile
    @pytest.mark.order(603)
    def test_reg_batch_archive_batch(self, create_browser_page):
        self.login_page.perform_valid_login()
        self.home_page.click_vaccines()
        self.vaccines_page.add_batch()
        self.vaccines_page.archive_batch()

    @pytest.mark.vaccsbatch
    @pytest.mark.mobile
    @pytest.mark.order(604)
    def test_reg_batch_add_change_archive_batch(self, create_browser_page):
        self.login_page.perform_valid_login()
        self.home_page.click_vaccines()
        self.vaccines_page.add_batch()
        self.vaccines_page.change_batch()
        self.vaccines_page.archive_batch()
