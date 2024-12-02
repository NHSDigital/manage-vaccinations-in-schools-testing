import pytest

from libs.constants import test_data_file_paths
from pages import pg_dashboard, pg_login, pg_sessions


class Test_Class_List_Upload:
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()
    sessions_page = pg_sessions.pg_sessions()

    @pytest.fixture(scope="function", autouse=True)
    def setup_tests(self, start_mavis: None):
        self.login_page.perform_valid_login()
        self.dashboard_page.click_sessions()
        self.sessions_page.schedule_a_valid_session()
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        yield
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.delete_all_sessions()
        self.login_page.perform_logout()

    @pytest.mark.classlist
    @pytest.mark.order(301)
    def test_class_list_file_upload_positive(self):
        self.sessions_page.upload_class_list(file_paths=test_data_file_paths.CLASS_POSITIVE)

    @pytest.mark.classlist
    @pytest.mark.order(302)
    def test_class_list_file_upload_negative(self):
        self.sessions_page.upload_class_list(file_paths=test_data_file_paths.CLASS_NEGATIVE)

    @pytest.mark.classlist
    @pytest.mark.order(303)
    def test_class_list_file_structure(self):
        self.sessions_page.upload_invalid_class_list_records(file_paths=test_data_file_paths.CLASS_INVALID_STRUCTURE)

    @pytest.mark.classlist
    @pytest.mark.order(304)
    def test_class_list_no_record(self):
        self.sessions_page.upload_invalid_class_list_records(file_paths=test_data_file_paths.CLASS_HEADER_ONLY)

    @pytest.mark.classlist
    @pytest.mark.order(305)
    def test_class_list_empty_file(self):
        self.sessions_page.upload_invalid_class_list_records(file_paths=test_data_file_paths.CLASS_EMPTY_FILE)
