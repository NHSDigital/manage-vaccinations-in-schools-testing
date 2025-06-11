import allure
import pytest

from mavis.test.mavis_constants import test_data_file_paths

pytestmark = pytest.mark.consent


@pytest.fixture
def setup_session_with_file_upload(
    log_in_as_nurse, schools, dashboard_page, sessions_page, import_records_page
):
    def _setup(class_list_file):
        try:
            dashboard_page.click_sessions()
            sessions_page.schedule_a_valid_session(schools[0], for_today=True)
            dashboard_page.click_mavis()
            dashboard_page.click_sessions()
            sessions_page.click_location(schools[0])
            sessions_page.navigate_to_class_list_import()
            import_records_page.upload_and_verify_output(class_list_file)
            dashboard_page.click_mavis()
            dashboard_page.click_sessions()
            yield
        finally:
            dashboard_page.click_mavis()
            dashboard_page.click_sessions()
            sessions_page.delete_all_sessions(schools[0])

    return _setup


@pytest.fixture
def setup_gillick(setup_session_with_file_upload):
    yield from setup_session_with_file_upload(test_data_file_paths.COHORTS_FULL_NAME)


@pytest.fixture
def setup_gillick_notes_length(setup_session_with_file_upload):
    yield from setup_session_with_file_upload(
        test_data_file_paths.COHORTS_GILLICK_NOTES_LENGTH
    )


@pytest.fixture
def setup_mavis_1696(setup_session_with_file_upload):
    yield from setup_session_with_file_upload(
        test_data_file_paths.COHORTS_CONFLICTING_CONSENT
    )


@pytest.fixture
def setup_mavis_1864(setup_session_with_file_upload):
    yield from setup_session_with_file_upload(
        test_data_file_paths.COHORTS_CONSENT_TWICE
    )


@pytest.fixture
def setup_mavis_1818(setup_session_with_file_upload):
    yield from setup_session_with_file_upload(
        test_data_file_paths.COHORTS_CONFLICTING_GILLICK
    )


def test_gillick_competence(setup_gillick, schools, sessions_page):
    sessions_page.set_gillick_competence_for_student(schools[0])


@allure.issue("MAV-955")
def test_gillick_competence_notes(setup_gillick_notes_length, schools, sessions_page):
    sessions_page.set_gillick_competence_and_verify_notes_length(schools[0])


@allure.issue("MAVIS-1696")
@pytest.mark.bug
def test_invalid_consent(setup_mavis_1696, sessions_page, schools):
    sessions_page.click_scheduled()
    sessions_page.click_location(schools[0])
    sessions_page.click_consent_tab()
    sessions_page.bug_mavis_1696()


@allure.issue("MAVIS-1864")
@pytest.mark.bug
def test_parent_provides_consent_twice(setup_mavis_1864, sessions_page, schools):
    sessions_page.click_scheduled()
    sessions_page.click_location(schools[0])
    sessions_page.click_consent_tab()
    sessions_page.bug_mavis_1864()


@allure.issue("MAVIS-1818")
@pytest.mark.bug
def test_conflicting_consent_with_gillick_consent(
    setup_mavis_1818, sessions_page, schools
):
    sessions_page.click_scheduled()
    sessions_page.click_location(schools[0])
    sessions_page.click_consent_tab()
    sessions_page.bug_mavis_1818()
