import pytest

from libs.mavis_constants import test_data_file_paths, test_data_values, Location
from libs.wrappers import wait_for_reset


@pytest.fixture(autouse=True)
def setup_tests(
    reset_environment, nurse, log_in_page, dashboard_page, sessions_page, start_page
):
    reset_environment()
    wait_for_reset()
    start_page.navigate_and_start()
    log_in_page.log_in_and_select_role(**nurse, organisation=test_data_values.ORG_CODE)
    yield
    dashboard_page.click_mavis()
    dashboard_page.click_sessions()
    sessions_page.delete_all_sessions(Location.SCHOOL_1)
    log_in_page.log_out()


@pytest.mark.e2e
@pytest.mark.order(5001)
def test_e2e(dashboard_page, programmes_page, sessions_page):
    dashboard_page.click_programmes()
    programmes_page.upload_cohorts(file_paths=test_data_file_paths.COHORTS_E2E_1)
    dashboard_page.click_mavis()
    dashboard_page.click_sessions()
    sessions_page.schedule_a_valid_session(Location.SCHOOL_1)
    sessions_page.give_consent_for_e2e1_child_by_parent_1()
