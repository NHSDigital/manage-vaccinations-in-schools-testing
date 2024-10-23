import pytest

from libs.constants import test_data_file_paths
from pages import pg_home, pg_login, pg_programmes


class Test_Regression_Child_List_Upload:
    login_page = pg_login.pg_login()
    home_page = pg_home.pg_home()
    programmes_page = pg_programmes.pg_programmes()

    @pytest.mark.childlist
    @pytest.mark.regression
    @pytest.mark.order(501)
    @pytest.mark.skip(reason="Covered by cohort uploads")
    def test_reg_child_list_file_upload_positive(self, create_browser_page):
        self.login_page.perform_login()
        self.home_page.click_programmes()
        self.programmes_page.upload_hpv_child_records(file_paths=test_data_file_paths.CHILD_POSITIVE)

    @pytest.mark.childlist
    @pytest.mark.regression
    @pytest.mark.order(502)
    @pytest.mark.skip(reason="Covered by cohort uploads")
    def test_reg_child_list_file_upload_negative(self, create_browser_page):
        self.login_page.perform_login()
        self.home_page.click_programmes()
        self.programmes_page.upload_hpv_child_records(file_paths=test_data_file_paths.CHILD_NEGATIVE)

    @pytest.mark.childlist
    @pytest.mark.regression
    @pytest.mark.order(503)
    @pytest.mark.skip(reason="Covered by cohort uploads")
    def test_reg_child_list_file_structure(self, create_browser_page):
        self.login_page.perform_login()
        self.home_page.click_programmes()
        self.programmes_page.upload_invalid_hpv_child_records(file_paths=test_data_file_paths.CHILD_INVALID_STRUCTURE)

    @pytest.mark.childlist
    @pytest.mark.regression
    @pytest.mark.order(504)
    @pytest.mark.skip(reason="Covered by cohort uploads")
    def test_reg_child_list_no_record(self, create_browser_page):
        self.login_page.perform_login()
        self.home_page.click_programmes()
        self.programmes_page.upload_invalid_hpv_child_records(file_paths=test_data_file_paths.CHILD_HEADER_ONLY)

    @pytest.mark.childlist
    @pytest.mark.regression
    @pytest.mark.order(505)
    @pytest.mark.skip(reason="Covered by cohort uploads")
    def test_reg_child_list_empty_file(self, create_browser_page):
        self.login_page.perform_login()
        self.home_page.click_programmes()
        self.programmes_page.upload_invalid_hpv_child_records(file_paths=test_data_file_paths.CHILD_EMPTY_FILE)
