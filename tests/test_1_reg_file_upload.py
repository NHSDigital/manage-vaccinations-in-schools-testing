import pytest
from pages import pg_login


class Test_Regression:
    login_page = pg_login.login()

    @pytest.mark.regression
    @pytest.mark.order(101)
    def test_reg_file_upload(self, browser_page):
        self.login_page.perform_login(browser_page=browser_page)
