import pytest

from libs.mavis_constants import mavis_file_types, test_data_file_paths
from pages import (
    ChildrenPage,
    DashboardPage,
    ImportRecordsPage,
    LoginPage,
    ProgrammesPage,
    SessionsPage,
)


login_page = LoginPage()
dashboard_page = DashboardPage()
children_page = ChildrenPage()
sessions_page = SessionsPage()
import_records_page = ImportRecordsPage()
programmes_page = ProgrammesPage()


@pytest.fixture(scope="function", autouse=False)
def setup_tests(start_mavis, nurse):
    login_page.log_in(**nurse)
    yield
    login_page.log_out()


@pytest.fixture(scope="function", autouse=False)
def setup_children_page(setup_tests: None):
    try:
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session_in_school_1(for_today=True)
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.click_school1()
        sessions_page.upload_class_list_to_school_1(
            file_paths=test_data_file_paths.CLASS_CHILDREN_FILTER
        )
        dashboard_page.go_to_dashboard()
        dashboard_page.click_children()
        yield
    finally:
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions_for_school_1()


@pytest.fixture(scope="function", autouse=False)
def setup_change_nhsno(setup_tests: None):
    try:
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session_in_school_1(for_today=True)
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.click_school1()
        sessions_page.upload_class_list_to_school_1(
            file_paths=test_data_file_paths.CLASS_CHANGE_NHSNO
        )
        dashboard_page.go_to_dashboard()
        dashboard_page.click_children()
        yield
    finally:
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions_for_school_1()


@pytest.fixture(scope="function", autouse=False)
def setup_mav_853(setup_tests: None):
    try:
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session_in_school_1(for_today=True)
        import_records_page.import_class_list_records_from_school_session(
            file_paths=test_data_file_paths.CLASS_SESSION_ID
        )
        sessions_page.click_school1()
        sessions_page.save_session_id_from_offline_excel()
        dashboard_page.go_to_dashboard()
        dashboard_page.click_programmes()
        programmes_page.upload_cohorts(file_paths=test_data_file_paths.COHORTS_MAV_853)
        dashboard_page.go_to_dashboard()
        dashboard_page.click_import_records()
        import_records_page.import_vaccination_records(
            file_paths=test_data_file_paths.VACCS_MAV_853,
            file_type=mavis_file_types.VACCS_MAVIS,
        )
        dashboard_page.go_to_dashboard()
        dashboard_page.click_children()
        yield
    finally:
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions_for_school_1()


@pytest.mark.children
@pytest.mark.order(701)
def test_headers_and_filter(setup_children_page: None):
    children_page.verify_headers()
    children_page.verify_filter()


@pytest.mark.children
@pytest.mark.bug
@pytest.mark.order(702)
def test_details_mav_853(setup_mav_853: None):
    children_page.verify_mav_853()  # MAV-853


@pytest.mark.children
@pytest.mark.bug
@pytest.mark.order(703)
def test_change_nhsno(setup_change_nhsno: None):
    children_page.change_nhs_no()
