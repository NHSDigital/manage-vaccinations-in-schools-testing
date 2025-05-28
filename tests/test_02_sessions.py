import pytest

from mavis.test.mavis_constants import test_data_file_paths, Location


@pytest.fixture
def setup_tests(log_in_as_nurse, dashboard_page):
    dashboard_page.click_sessions()


@pytest.fixture
def setup_mavis_1822(setup_tests, dashboard_page, sessions_page):
    try:
        sessions_page.schedule_a_valid_session(
            for_today=True, location=Location.SCHOOL_1
        )
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.click_location(Location.SCHOOL_1)
        sessions_page.upload_class_list(
            file_paths=test_data_file_paths.CLASS_POSITIVE,
            location=Location.SCHOOL_1,
        )
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.click_today()
        sessions_page.click_location(Location.SCHOOL_1)
        yield
    finally:
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(Location.SCHOOL_1)


@pytest.fixture
def setup_mav_1018(setup_tests, dashboard_page, sessions_page):
    try:
        sessions_page.schedule_a_valid_session(
            for_today=True, location=Location.SCHOOL_1
        )
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.click_location(Location.SCHOOL_1)
        sessions_page.upload_class_list(
            file_paths=test_data_file_paths.CLASS_SESSION_ID,
            location=Location.SCHOOL_1,
        )
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.click_today()
        sessions_page.click_location(Location.SCHOOL_1)
        yield
    finally:
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(Location.SCHOOL_1)


@pytest.mark.sessions
@pytest.mark.order(201)
def test_lifecycle(setup_tests, dashboard_page, sessions_page):
    sessions_page.schedule_a_valid_session(Location.SCHOOL_1)
    dashboard_page.click_mavis()
    dashboard_page.click_sessions()
    sessions_page.edit_a_session_to_today(Location.SCHOOL_1)
    dashboard_page.click_mavis()
    dashboard_page.click_sessions()
    sessions_page.delete_all_sessions(Location.SCHOOL_1)


@pytest.mark.sessions
@pytest.mark.order(202)
def test_invalid(setup_tests, sessions_page):
    sessions_page.create_invalid_session(Location.SCHOOL_1)


@pytest.mark.sessions
@pytest.mark.bug
@pytest.mark.order(203)
def test_verify_attendance_filters(setup_mavis_1822, sessions_page):
    sessions_page.verify_attendance_filters()  # MAVIS-1822


@pytest.mark.sessions
@pytest.mark.bug
@pytest.mark.order(204)
def test_verify_search(setup_mav_1018, sessions_page):
    sessions_page.verify_search()  # MAV-1018
