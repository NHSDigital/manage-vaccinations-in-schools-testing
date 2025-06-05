import allure
import pytest

from mavis.test.mavis_constants import test_data_file_paths

pytestmark = pytest.mark.sessions


@pytest.fixture
def setup_tests(log_in_as_nurse, dashboard_page):
    dashboard_page.click_sessions()


@pytest.fixture
def setup_session_with_class_list(setup_tests, schools, dashboard_page, sessions_page):
    def _setup(class_list_file):
        try:
            sessions_page.schedule_a_valid_session(schools[0], for_today=True)
            dashboard_page.click_mavis()
            dashboard_page.click_sessions()
            sessions_page.click_location(schools[0])
            sessions_page.upload_class_list(class_list_file)
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
def setup_mavis_1822(setup_session_with_class_list):
    yield from setup_session_with_class_list(test_data_file_paths.CLASS_POSITIVE)


@pytest.fixture
def setup_mav_1018(setup_session_with_class_list):
    yield from setup_session_with_class_list(test_data_file_paths.CLASS_SESSION_ID)


@pytest.fixture
def setup_note_test(setup_session_with_class_list):
    yield from setup_session_with_class_list(test_data_file_paths.CLASS_NOTES)


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


@allure.issue("MAV-1265")
def test_recording_notes(setup_note_test, sessions_page, schools):
    notes_child = "CLNOTES1, CFNotes1"

    sessions_page.click_consent_tab()
    sessions_page.search_for(notes_child)
    sessions_page.click_child(notes_child)
    sessions_page.click_session_activity_and_notes()
    sessions_page.add_note("Note 1")
    sessions_page.add_note("Note 2")

    sessions_page.click_location(schools[0])
    sessions_page.click_consent_tab()
    sessions_page.search_for(notes_child)
    sessions_page.check_note_appears_in_search(notes_child, "Note 2")

    sessions_page.click_child(notes_child)
    sessions_page.click_session_activity_and_notes()
    sessions_page.check_notes_appear_in_order(["Note 2", "Note 1"])
