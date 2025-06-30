import allure
import pytest

from mavis.test.data import ClassFileMapping

pytestmark = pytest.mark.sessions


@pytest.fixture
def setup_tests(log_in_as_nurse, dashboard_page):
    dashboard_page.click_sessions()


@pytest.fixture
def setup_session_with_file_upload(
    setup_tests, schools, dashboard_page, sessions_page, import_records_page
):
    def _setup(class_list_file):
        try:
            sessions_page.schedule_a_valid_session(schools[0], for_today=True)
            dashboard_page.click_mavis()
            dashboard_page.click_sessions()
            sessions_page.click_location(schools[0])
            sessions_page.navigate_to_class_list_import()
            import_records_page.upload_and_verify_output(class_list_file)
            dashboard_page.click_mavis()
            dashboard_page.click_sessions()
            sessions_page.click_today()
            sessions_page.click_location(schools[0])
            yield
        finally:
            dashboard_page.click_mavis()
            dashboard_page.click_sessions()
            sessions_page.delete_all_sessions(schools[0])

    return _setup


@pytest.fixture
def setup_mavis_1822(setup_session_with_file_upload):
    yield from setup_session_with_file_upload(ClassFileMapping.POSITIVE)


@pytest.fixture
def setup_mav_1018(setup_session_with_file_upload):
    yield from setup_session_with_file_upload(ClassFileMapping.RANDOM_CHILD_YEAR_9)


@pytest.fixture
def setup_mav_1381(setup_session_with_file_upload):
    yield from setup_session_with_file_upload(ClassFileMapping.FIXED_CHILD_YEAR_9)


def test_lifecycle(setup_tests, schools, dashboard_page, sessions_page):
    sessions_page.schedule_a_valid_session(schools[0])
    dashboard_page.click_mavis()
    dashboard_page.click_sessions()
    sessions_page.edit_a_session_to_today(schools[0])
    dashboard_page.click_mavis()
    dashboard_page.click_sessions()
    sessions_page.delete_all_sessions(schools[0])


def test_invalid(setup_tests, schools, sessions_page):
    sessions_page.create_invalid_session(schools[0])


@allure.issue("MAVIS-1822")
@pytest.mark.bug
def test_verify_attendance_filters(setup_mavis_1822, sessions_page):
    sessions_page.verify_attendance_filters()


@allure.issue("MAV-1018")
@pytest.mark.bug
def test_verify_search(setup_mav_1018, sessions_page):
    sessions_page.verify_search()


@allure.issue("MAV-1381")
@pytest.mark.bug
def test_verify_consent_filters(setup_mav_1381, sessions_page, children):
    sessions_page.verify_consent_filters(children)
