import allure
import pytest

from mavis.test.mavis_constants import mavis_file_types, test_data_file_paths

pytestmark = pytest.mark.children


@pytest.fixture
def setup_children_page(log_in_as_nurse, schools, dashboard_page, sessions_page):
    try:
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session(schools[0], for_today=True)
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.click_location(schools[0])
        sessions_page.upload_class_list(
            test_data_file_paths.CLASS_CHILDREN_FILTER,
        )
        dashboard_page.click_mavis()
        dashboard_page.click_children()
        yield
    finally:
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(schools[0])


@pytest.fixture
def setup_change_nhsno(log_in_as_nurse, schools, dashboard_page, sessions_page):
    try:
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session(schools[0], for_today=True)
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.click_location(schools[0])
        sessions_page.upload_class_list(
            test_data_file_paths.CLASS_CHANGE_NHSNO,
        )
        dashboard_page.click_mavis()
        dashboard_page.click_children()
        yield
    finally:
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(schools[0])


@pytest.fixture
def setup_mav_853(
    log_in_as_nurse,
    schools,
    dashboard_page,
    import_records_page,
    programmes_page,
    sessions_page,
):
    try:
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session(schools[0], for_today=True)
        import_records_page.import_class_list_records_from_school_session(
            file_paths=test_data_file_paths.CLASS_SESSION_ID
        )
        sessions_page.click_location(schools[0])
        session_id = sessions_page.get_session_id_from_offline_excel()
        dashboard_page.click_mavis()
        dashboard_page.click_programmes()
        programmes_page.upload_cohorts(test_data_file_paths.COHORTS_MAV_853)
        dashboard_page.click_mavis()
        dashboard_page.click_import_records()
        import_records_page.import_vaccination_records(
            file_paths=test_data_file_paths.VACCS_MAV_853,
            file_type=mavis_file_types.VACCS_MAVIS,
            session_id=session_id,
        )
        dashboard_page.click_mavis()
        dashboard_page.click_children()
        yield
    finally:
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(schools[0])


def test_headers_and_filter(setup_children_page, children_page):
    children_page.verify_headers()
    children_page.verify_filter()


@allure.issue("MAV-853")
@pytest.mark.bug
def test_details_mav_853(setup_mav_853, children_page):
    children_page.verify_mav_853()


@pytest.mark.bug
def test_change_nhsno(setup_change_nhsno, children_page):
    children_page.change_nhs_no()
