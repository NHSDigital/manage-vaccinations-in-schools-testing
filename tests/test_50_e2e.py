import pytest

from libs.mavis_constants import test_data_file_paths
from libs.wrappers import wait_for_reset


@pytest.fixture(autouse=True)
def setup_tests(reset_environment, nurse, login_page, dashboard_page, sessions_page):
    reset_environment()
    wait_for_reset()
    login_page.go_to_login_page()
    login_page.log_in(**nurse)
    yield
    dashboard_page.go_to_dashboard()
    dashboard_page.click_sessions()
    sessions_page.delete_all_sessions_for_school_1()
    login_page.log_out()


@pytest.mark.e2e
@pytest.mark.order(5001)
def test_e2e(dashboard_page, programmes_page, sessions_page):
    dashboard_page.click_programmes()
    programmes_page.upload_cohorts(file_paths=test_data_file_paths.COHORTS_E2E_1)
    dashboard_page.go_to_dashboard()
    dashboard_page.click_sessions()
    sessions_page.schedule_a_valid_session_in_school_1()
    sessions_page.give_consent_for_e2e1_child_by_parent_1()
