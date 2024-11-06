import pytest

from libs.constants import test_data_file_paths
from pages import pg_dashboard, pg_login, pg_programmes


class Test_Regression_Child_List_Upload:
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()
    programmes_page = pg_programmes.pg_programmes()

    @pytest.mark.childlist
    @pytest.mark.order(501)
    def test_reg_child_list_file_upload_positive(self, create_browser_page):
        self.login_page.perform_valid_login()
        self.dashboard_page.click_programmes()
        self.programmes_page.upload_hpv_child_records(file_paths=test_data_file_paths.CHILD_POSITIVE)

    @pytest.mark.childlist
    @pytest.mark.order(502)
    def test_reg_child_list_file_upload_negative(self, create_browser_page):
        self.login_page.perform_valid_login()
        self.dashboard_page.click_programmes()
        self.programmes_page.upload_hpv_child_records(file_paths=test_data_file_paths.CHILD_NEGATIVE)

    @pytest.mark.childlist
    @pytest.mark.order(503)
    def test_reg_child_list_file_structure(self, create_browser_page):
        self.login_page.perform_valid_login()
        self.dashboard_page.click_programmes()
        self.programmes_page.upload_invalid_hpv_child_records(file_paths=test_data_file_paths.CHILD_INVALID_STRUCTURE)

    @pytest.mark.childlist
    @pytest.mark.order(504)
    def test_reg_child_list_no_record(self, create_browser_page):
        self.login_page.perform_valid_login()
        self.dashboard_page.click_programmes()
        self.programmes_page.upload_invalid_hpv_child_records(file_paths=test_data_file_paths.CHILD_HEADER_ONLY)

    @pytest.mark.childlist
    @pytest.mark.order(505)
    def test_reg_child_list_empty_file(self, create_browser_page):
        self.login_page.perform_valid_login()
        self.dashboard_page.click_programmes()
        self.programmes_page.upload_invalid_hpv_child_records(file_paths=test_data_file_paths.CHILD_EMPTY_FILE)
