import pytest

from libs.generic_constants import fixture_scope
from libs.mavis_constants import test_data_file_paths
from pages import pg_children, pg_dashboard, pg_login, pg_sessions


class Test_Children:
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()
    children_page = pg_children.pg_children()
    sessions_page = pg_sessions.pg_sessions()

    @pytest.fixture(scope=fixture_scope.FUNCTION, autouse=True)
    def setup_tests(self, start_mavis: None):
        try:
            self.login_page.login_as_nurse()
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.schedule_a_valid_session_in_school_1(for_today=True)
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.click_school1()
            self.sessions_page.upload_class_list_to_school_1(file_paths=test_data_file_paths.CLASS_CHILDREN_FILTER)
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_children()
            yield
        finally:
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.delete_all_sessions_for_school_1()
            self.login_page.logout_of_mavis()

    @pytest.mark.children
    @pytest.mark.order(701)
    def test_children_headers_and_filter(self):
        self.children_page.verify_headers()
        self.children_page.verify_filter()
