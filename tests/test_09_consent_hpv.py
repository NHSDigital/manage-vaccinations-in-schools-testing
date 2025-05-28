import pytest

from libs.mavis_constants import test_data_file_paths

from .helpers.parental_consent_helper_hpv import ParentalConsentHelper


helper = ParentalConsentHelper()


@pytest.fixture
def get_session_link(nurse, dashboard_page, login_page, sessions_page):
    try:
        login_page.navigate_and_log_in(**nurse)
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session_in_school_1()
        link = sessions_page.get_hpv_consent_url()
        login_page.log_out()
        yield link
    finally:
        login_page.navigate_and_log_in(**nurse)
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions_for_school_1()
        login_page.log_out()


@pytest.fixture
def setup_gillick(log_in_as_nurse, dashboard_page, sessions_page):
    try:
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session_in_school_1(for_today=True)
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.click_school1()
        sessions_page.upload_class_list_to_school_1(
            file_paths=test_data_file_paths.COHORTS_FULL_NAME
        )
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        yield
    finally:
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions_for_school_1()


@pytest.fixture
def setup_invalidated_consent(log_in_as_nurse, dashboard_page, sessions_page):
    try:
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session_in_school_1()
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.click_school1()
        sessions_page.upload_class_list_to_school_1(
            file_paths=test_data_file_paths.COHORTS_NO_CONSENT
        )
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.click_scheduled()
        sessions_page.click_school1()
        sessions_page.click_consent_tab()
        yield
    finally:
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions_for_school_1()


@pytest.fixture
def setup_mavis_1696(log_in_as_nurse, dashboard_page, sessions_page):
    try:
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session_in_school_1(for_today=True)
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.click_school1()
        sessions_page.upload_class_list_to_school_1(
            file_paths=test_data_file_paths.COHORTS_CONFLICTING_CONSENT
        )
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.click_scheduled()
        sessions_page.click_school1()
        sessions_page.click_consent_tab()
        yield
    finally:
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions_for_school_1()


@pytest.fixture
def setup_mavis_1864(log_in_as_nurse, dashboard_page, sessions_page):
    try:
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session_in_school_1(for_today=True)
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.click_school1()
        sessions_page.upload_class_list_to_school_1(
            file_paths=test_data_file_paths.COHORTS_CONSENT_TWICE
        )
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.click_scheduled()
        sessions_page.click_school1()
        sessions_page.click_consent_tab()
        yield
    finally:
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions_for_school_1()


@pytest.fixture
def setup_mavis_1818(log_in_as_nurse, dashboard_page, sessions_page):
    try:
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session_in_school_1(for_today=True)
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.click_school1()
        sessions_page.upload_class_list_to_school_1(
            file_paths=test_data_file_paths.COHORTS_CONFLICTING_GILLICK
        )
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.click_scheduled()
        sessions_page.click_school1()
        sessions_page.click_consent_tab()
        yield
    finally:
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions_for_school_1()


@pytest.mark.consent
@pytest.mark.mobile
@pytest.mark.order(901)
@pytest.mark.parametrize(
    "scenario_data",
    helper.df.iterrows(),
    ids=[tc[0] for tc in helper.df.iterrows()],
)
def test_workflow(get_session_link, scenario_data, page, consent_page, start_page):
    helper.read_data_for_scenario(scenario_data=scenario_data)
    page.goto(get_session_link)
    start_page.start()
    helper.enter_details_on_mavis(consent_page)


@pytest.mark.consent
@pytest.mark.order(902)
def test_gillick_competence(setup_gillick, sessions_page):
    sessions_page.set_gillick_competence_for_student()


@pytest.mark.consent
@pytest.mark.bug
@pytest.mark.order(903)
def test_invalid_consent(setup_mavis_1696, sessions_page):
    sessions_page.bug_mavis_1696()  # MAVIS-1696


@pytest.mark.consent
@pytest.mark.bug
@pytest.mark.order(905)
def test_parent_provides_consent_twice(setup_mavis_1864, sessions_page):
    sessions_page.bug_mavis_1864()  # MAVIS-1864


@pytest.mark.consent
@pytest.mark.bug
@pytest.mark.order(906)
def test_conflicting_consent_with_gillick_consent(setup_mavis_1818, sessions_page):
    sessions_page.bug_mavis_1818()  # MAVIS-1818
