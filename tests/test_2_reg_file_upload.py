import pytest
from pages import pg_login
from pages import pg_home
from pages import pg_programmes


class Test_Regression:
    login_page = pg_login.pg_login()
    home_page = pg_home.pg_home()
    programmes_page = pg_programmes.pg_programmes()

    @pytest.mark.regression
    @pytest.mark.order(201)
    def test_reg_file_upload(self, create_browser_page):
        self.login_page.perform_login()
        self.home_page.click_programmes()
        self.programmes_page.upload_vaccination_records(template_path="test_data/hpv/file1.csv")
