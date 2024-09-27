import pytest
from pages import pg_login
from pages import pg_home
from pages import pg_programmes


class Test_Regression:
    login_page = pg_login.pg_login()
    home_page = pg_home.pg_home()
    programmes_page = pg_programmes.pg_programmes()

    @pytest.mark.regression
    @pytest.mark.order(101)
    def test_reg_file_upload(self, browser_page):
        self.login_page.perform_login(browser_page=browser_page)
        self.home_page.click_programmes(browser_page=browser_page)
        self.programmes_page.click_HPV(browser_page=browser_page)
        self.programmes_page.click_Imports(browser_page=browser_page)
        self.programmes_page.click_ImportRecords(browser_page=browser_page)
        self.programmes_page.select_VaccinationRecords(browser_page=browser_page)
        self.programmes_page.click_Continue(browser_page=browser_page)
        self.programmes_page.choose_file_vaccination_records(
            browser_page=browser_page, file_path="test_data/hpv/file1.csv"
        )
        self.programmes_page.click_Continue(browser_page=browser_page)
