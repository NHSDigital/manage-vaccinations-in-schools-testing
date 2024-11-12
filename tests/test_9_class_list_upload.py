import pytest

from libs.constants import test_data_file_paths
from pages import pg_dashboard, pg_login, pg_sessions


class Test_Regression_Class_List_Upload:
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()
    sessions_page = pg_sessions.pg_sessions()

    @pytest.mark.classlist
    @pytest.mark.order(901)
    def test_reg_class_list_file_upload_positive(self, start_mavis):
        self.login_page.perform_valid_login()
        self.dashboard_page.click_sessions()
        self.sessions_page.upload_class_list(file_paths=test_data_file_paths.CLASS_POSITIVE)

    @pytest.mark.classlist
    @pytest.mark.order(902)
    def test_reg_class_list_file_upload_negative(self, start_mavis):
        self.login_page.perform_valid_login()
        self.dashboard_page.click_sessions()
        self.sessions_page.upload_class_list(file_paths=test_data_file_paths.CLASS_NEGATIVE)

    @pytest.mark.classlist
    @pytest.mark.order(903)
    def test_reg_class_list_file_structure(self, start_mavis):
        self.login_page.perform_valid_login()
        self.dashboard_page.click_sessions()
        self.sessions_page.upload_invalid_class_list_records(file_paths=test_data_file_paths.CLASS_INVALID_STRUCTURE)

    @pytest.mark.classlist
    @pytest.mark.order(904)
    def test_reg_class_list_no_record(self, start_mavis):
        self.login_page.perform_valid_login()
        self.dashboard_page.click_sessions()
        self.sessions_page.upload_invalid_class_list_records(file_paths=test_data_file_paths.CLASS_HEADER_ONLY)

    @pytest.mark.classlist
    @pytest.mark.order(905)
    def test_reg_class_list_empty_file(self, start_mavis):
        self.login_page.perform_valid_login()
        self.dashboard_page.click_sessions()
        self.sessions_page.upload_invalid_class_list_records(file_paths=test_data_file_paths.CLASS_EMPTY_FILE)
