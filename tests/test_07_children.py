import pytest

from libs.generic_constants import fixture_scope
from libs.mavis_constants import test_data_file_paths
from pages import (
    pg_children,
    pg_dashboard,
    pg_import_records,
    pg_login,
    pg_programmes,
    pg_sessions,
)


class Test_Children:
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()
    children_page = pg_children.pg_children()
    sessions_page = pg_sessions.pg_sessions()
    import_records_page = pg_import_records.pg_import_records()
    programmes_page = pg_programmes.pg_programmes()

    @pytest.fixture(scope=fixture_scope.FUNCTION, autouse=False)
    def setup_tests(self, start_mavis: None):
        self.login_page.login_as_nurse()
        yield
        self.login_page.logout_of_mavis()

    @pytest.fixture(scope=fixture_scope.FUNCTION, autouse=False)
    def setup_children_page(self, setup_tests: None):
        try:
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

    @pytest.fixture(scope=fixture_scope.FUNCTION, autouse=False)
    def setup_change_nhsno(self, setup_tests: None):
        try:
            self.dashboard_page.click_sessions()
            self.sessions_page.schedule_a_valid_session_in_school_1(for_today=True)
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.click_school1()
            self.sessions_page.upload_class_list_to_school_1(file_paths=test_data_file_paths.CLASS_CHANGE_NHSNO)
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_children()
            yield
        finally:
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.delete_all_sessions_for_school_1()

    @pytest.fixture(scope=fixture_scope.FUNCTION, autouse=False)
    def setup_mav_853(self, setup_tests: None):
        try:
            self.dashboard_page.click_sessions()
            self.sessions_page.schedule_a_valid_session_in_school_1(for_today=True)
            self.import_records_page.import_class_list_records_from_school_session(
                file_paths=test_data_file_paths.CLASS_SESSION_ID
            )
            self.sessions_page.click_school1()
            self.sessions_page.save_session_id_from_offline_excel()
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_programmes()
            self.programmes_page.upload_cohorts(file_paths=test_data_file_paths.COHORTS_MAV_853)
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_import_records()
            self.import_records_page.click_import_records()
            self.import_records_page.import_vaccination_records(file_paths=test_data_file_paths.VACCS_MAV_853)
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_children()
            yield
        finally:
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.delete_all_sessions_for_school_1()

    @pytest.mark.children
    @pytest.mark.order(701)
    def test_children_headers_and_filter(self, setup_children_page: None):
        self.children_page.verify_headers()
        self.children_page.verify_filter()

    @pytest.mark.children
    @pytest.mark.order(702)
    def test_children_details_mav_853(self, setup_mav_853: None):
        self.children_page.verify_mav_853()  # MAV-853

    @pytest.mark.children
    @pytest.mark.order(703)
    def test_children_change_nhsno(self, setup_change_nhsno: None):
        self.children_page.change_nhs_no()
