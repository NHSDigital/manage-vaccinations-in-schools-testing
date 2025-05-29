import pytest

from mavis.test.mavis_constants import test_data_file_paths

from .helpers.parental_consent_helper_hpv import ParentalConsentHelper


helper = ParentalConsentHelper()


@pytest.fixture
def get_session_link(
    nurse, organisation, schools, dashboard_page, log_in_page, sessions_page
):
    try:
        log_in_page.navigate()
        log_in_page.log_in_and_select_organisation(**nurse, organisation=organisation)
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session(schools[0])
        link = sessions_page.get_hpv_consent_url()
        log_in_page.log_out()
        yield link
    finally:
        log_in_page.navigate()
        log_in_page.log_in_and_select_organisation(**nurse, organisation=organisation)
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(schools[0])
        log_in_page.log_out()


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


@pytest.fixture
def setup_invalidated_consent(log_in_as_nurse, schools, dashboard_page, sessions_page):
    try:
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session(schools[0])
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.click_location(schools[0])
        sessions_page.upload_class_list(
            test_data_file_paths.COHORTS_NO_CONSENT,
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
def test_gillick_competence(setup_gillick, schools, sessions_page):
    sessions_page.set_gillick_competence_for_student(schools[0])


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
