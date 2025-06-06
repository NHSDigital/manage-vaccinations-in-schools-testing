import pytest

from mavis.test.mavis_constants import test_data_file_paths

pytestmark = pytest.mark.e2e


@pytest.fixture(autouse=True)
def setup_tests(
    nurse,
    organisation,
    schools,
    log_in_page,
    dashboard_page,
    sessions_page,
    start_page,
):
    start_page.navigate_and_start()
    log_in_page.log_in_and_select_organisation(nurse, organisation)
    yield
    dashboard_page.click_mavis()
    dashboard_page.click_sessions()
    sessions_page.delete_all_sessions(schools[0])
    log_in_page.log_out()


def test_e2e(schools, dashboard_page, programmes_page, sessions_page):
    dashboard_page.click_programmes()
    programmes_page.upload_cohorts(test_data_file_paths.COHORTS_E2E_1)
    dashboard_page.click_mavis()
    dashboard_page.click_sessions()
    sessions_page.schedule_a_valid_session(schools[0])
    sessions_page.give_consent_for_e2e1_child_by_parent_1()
