import pytest

from mavis.test.data import ClassFileMapping
from mavis.test.annotations import issue
from mavis.test.models import Programme

pytestmark = pytest.mark.sessions


@pytest.fixture
def setup_tests(log_in_as_nurse, dashboard_page):
    dashboard_page.click_sessions()


@pytest.fixture
def setup_session_with_file_upload(
    setup_tests,
    schools,
    dashboard_page,
    sessions_page,
    import_records_page,
):
    school = schools[Programme.HPV][0]

    def _setup(class_list_file):
        try:
            sessions_page.schedule_a_valid_session(
                school, Programme.HPV, for_today=True
            )
            dashboard_page.click_mavis()
            dashboard_page.click_sessions()
            sessions_page.click_session_for_programme_group(school, Programme.HPV)
            sessions_page.click_import_class_lists()
            sessions_page.select_year_groups_for_programme(Programme.HPV)
            import_records_page.upload_and_verify_output(class_list_file)
            dashboard_page.click_mavis()
            dashboard_page.click_sessions()
            sessions_page.click_session_for_programme_group(school, Programme.HPV)
            yield
        finally:
            dashboard_page.click_mavis()
            dashboard_page.click_sessions()
            sessions_page.delete_all_sessions(school)

    return _setup


@pytest.fixture
def setup_mavis_1822(setup_session_with_file_upload):
    yield from setup_session_with_file_upload(ClassFileMapping.POSITIVE)


@pytest.fixture
def setup_mav_1018(setup_session_with_file_upload):
    yield from setup_session_with_file_upload(ClassFileMapping.RANDOM_CHILD_YEAR_9)


@pytest.fixture
def setup_fixed_child(setup_session_with_file_upload):
    yield from setup_session_with_file_upload(ClassFileMapping.FIXED_CHILD)


def test_lifecycle(setup_tests, schools, dashboard_page, sessions_page):
    school = schools[Programme.HPV][0]

    sessions_page.schedule_a_valid_session(school, Programme.HPV)
    dashboard_page.click_mavis()
    dashboard_page.click_sessions()
    sessions_page.edit_a_session_to_today(school, Programme.HPV)
    dashboard_page.click_mavis()
    dashboard_page.click_sessions()
    sessions_page.delete_all_sessions(school)


def test_invalid(
    setup_tests,
    schools,
    sessions_page,
):
    school = schools[Programme.HPV][0]
    sessions_page.create_invalid_session(school, Programme.HPV)


@pytest.mark.bug
def test_verify_attendance_filters(setup_mavis_1822, sessions_page):
    sessions_page.verify_attendance_filters()


@issue("MAV-1018")
@pytest.mark.bug
def test_verify_search(setup_mav_1018, sessions_page):
    sessions_page.verify_search()


@issue("MAV-1381")
@pytest.mark.bug
def test_verify_consent_filters(setup_fixed_child, sessions_page, children):
    sessions_page.verify_consent_filters(children[Programme.HPV])


@issue("MAV-1265")
def test_recording_notes(setup_fixed_child, dashboard_page, sessions_page, schools, children):
    child = children[Programme.HPV][0]
    school = schools[Programme.HPV][0]
    NOTE_1 = "Note 1"
    NOTE_2 = "Note 2"

    sessions_page.click_consent_tab()
    sessions_page.search_child(child)
    sessions_page.click_session_activity_and_notes()
    sessions_page.add_note(NOTE_1)
    sessions_page.add_note(NOTE_2)
    dashboard_page.click_mavis()
    dashboard_page.click_sessions()
    sessions_page.click_session_for_programme_group(school, Programme.HPV)
    sessions_page.click_consent_tab()
    sessions_page.search_for(str(child))
    sessions_page.check_note_appears_in_search(child, NOTE_2)
    sessions_page.click_child(child)
    sessions_page.click_session_activity_and_notes()
    sessions_page.check_notes_appear_in_order([NOTE_2, NOTE_1])
