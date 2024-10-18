import pytest

from libs.constants import test_data_file_paths
from pages import pg_home, pg_login, pg_programmes


class Test_Regression_Child_List_Upload:
    login_page = pg_login.pg_login()
    home_page = pg_home.pg_home()
    programmes_page = pg_programmes.pg_programmes()

    @pytest.mark.vaccinations
    @pytest.mark.regression
    @pytest.mark.order(501)
    def test_reg_child_list_file_upload_positive(self, create_browser_page):
        self.login_page.perform_login()
        self.home_page.click_programmes()
        self.programmes_page.upload_hpv_child_records(file_paths=test_data_file_paths.CHILD_POSITIVE)

    @pytest.mark.vaccinations
    @pytest.mark.regression
    @pytest.mark.order(502)
    def test_reg_child_list_file_upload_negative(self, create_browser_page):
        self.login_page.perform_login()
        self.home_page.click_programmes()
        self.programmes_page.upload_hpv_child_records(file_paths=test_data_file_paths.CHILD_NEGATIVE)
