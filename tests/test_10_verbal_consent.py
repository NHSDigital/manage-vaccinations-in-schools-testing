import pytest

from mavis.test.mavis_constants import test_data_file_paths


pytestmark = pytest.mark.consent


@pytest.fixture
def setup_gillick(log_in_as_nurse, schools, dashboard_page, sessions_page):
    try:
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session(schools[0], for_today=True)
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.click_location(schools[0])
        sessions_page.upload_class_list(
            test_data_file_paths.COHORTS_FULL_NAME,
        )
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        yield
    finally:
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(schools[0])


@pytest.mark.order(902)
def test_gillick_competence(setup_gillick, schools, sessions_page):
    sessions_page.set_gillick_competence_for_student(schools[0])


@pytest.fixture
def setup_mavis_1696(log_in_as_nurse, schools, dashboard_page, sessions_page):
    try:
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session(schools[0], for_today=True)
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.click_location(schools[0])
        sessions_page.upload_class_list(
            test_data_file_paths.COHORTS_CONFLICTING_CONSENT,
        )
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.click_scheduled()
        sessions_page.click_location(schools[0])
        sessions_page.click_consent_tab()
        yield
    finally:
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(schools[0])


@pytest.mark.bug
@pytest.mark.order(903)
def test_invalid_consent(setup_mavis_1696, sessions_page):
    sessions_page.bug_mavis_1696()  # MAVIS-1696


@pytest.fixture
def setup_mavis_1864(log_in_as_nurse, schools, dashboard_page, sessions_page):
    try:
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session(schools[0], for_today=True)
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.click_location(schools[0])
        sessions_page.upload_class_list(
            test_data_file_paths.COHORTS_CONSENT_TWICE,
        )
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.click_scheduled()
        sessions_page.click_location(schools[0])
        sessions_page.click_consent_tab()
        yield
    finally:
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(schools[0])


@pytest.mark.bug
@pytest.mark.order(905)
def test_parent_provides_consent_twice(setup_mavis_1864, sessions_page):
    sessions_page.bug_mavis_1864()  # MAVIS-1864


@pytest.fixture
def setup_mavis_1818(log_in_as_nurse, schools, dashboard_page, sessions_page):
    try:
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session(schools[0], for_today=True)
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.click_location(schools[0])
        sessions_page.upload_class_list(
            test_data_file_paths.COHORTS_CONFLICTING_GILLICK,
        )
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.click_scheduled()
        sessions_page.click_location(schools[0])
        sessions_page.click_consent_tab()
        yield
    finally:
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(schools[0])


@pytest.mark.bug
@pytest.mark.order(906)
def test_conflicting_consent_with_gillick_consent(setup_mavis_1818, sessions_page):
    sessions_page.bug_mavis_1818()  # MAVIS-1818
