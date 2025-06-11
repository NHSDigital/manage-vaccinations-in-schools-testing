import pytest

from mavis.test.data import FilePath
from mavis.test.models import Programme

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


def test_e2e(
    schools,
    dashboard_page,
    programmes_page,
    sessions_page,
    import_records_page,
    consent_page,
):
    e2e_child = "CE2E1, CE2E1"

    dashboard_page.click_programmes()
    programmes_page.navigate_to_cohort_import(Programme.HPV)
    import_records_page.upload_and_verify_output(FilePath.COHORTS_E2E_1)
    dashboard_page.click_mavis()
    dashboard_page.click_sessions()
    sessions_page.schedule_a_valid_session(schools[0])
    sessions_page.click_consent_tab()
    sessions_page.navigate_to_consent_response(e2e_child, Programme.HPV)
    consent_page.parent_1_verbal_positive(change_phone=False)
