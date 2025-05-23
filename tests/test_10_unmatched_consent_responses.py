import pytest

from libs import CurrentExecution
from libs.mavis_constants import test_data_file_paths


ce = CurrentExecution()

# ALL OF THE TESTS IN THIS CLASS DEPEND ON THE CONSENT WORKFLOW TESTS (HPV) TO HAVE RUN FIRST
# RUN THE CONSENT WORKFLOW TESTS OR THE FULL PACK BEFORE RUNNING THESE TESTS
# RUN WITH '--skip-reset' IF RUNNING ONLY CONSENT TESTS


@pytest.fixture(scope="function", autouse=False)
def setup_tests(start_mavis, nurse, login_page, dashboard_page):
    login_page.log_in(**nurse)
    dashboard_page.go_to_dashboard()
    dashboard_page.click_unmatched_consent_responses()
    yield
    login_page.log_out()


@pytest.fixture(scope="function", autouse=False)
def setup_ucr_match(start_mavis, nurse, login_page, dashboard_page, programmes_page):
    try:
        login_page.log_in(**nurse)
        dashboard_page.go_to_dashboard()
        dashboard_page.click_programmes()
        programmes_page.upload_cohorts(
            file_paths=test_data_file_paths.COHORTS_UCR_MATCH
        )
        dashboard_page.go_to_dashboard()
        dashboard_page.click_unmatched_consent_responses()
        yield
    finally:
        login_page.log_out()


@pytest.mark.unmatchedconsentresponses
@pytest.mark.order(1001)
@pytest.mark.dependency(name="ucr_records_exist")
def test_check_records_exist(setup_tests, unmatched_page):
    unmatched_page.verify_records_exist()


@pytest.mark.unmatchedconsentresponses
@pytest.mark.order(1002)
@pytest.mark.dependency(depends=["ucr_records_exist"])
def test_archive_record(setup_tests, unmatched_page):
    unmatched_page.archive_record()  # Covers MAVIS-1782


@pytest.mark.unmatchedconsentresponses
@pytest.mark.order(1003)
@pytest.mark.dependency(depends=["ucr_records_exist"])
def test_create_record(setup_tests, unmatched_page):
    unmatched_page.create_record()  # Covers MAVIS-1812


@pytest.mark.unmatchedconsentresponses
@pytest.mark.order(1004)
@pytest.mark.dependency(depends=["ucr_records_exist"])
def test_match_record(setup_ucr_match, unmatched_page):
    unmatched_page.match_with_record()  # Covers MAVIS-1812


@pytest.mark.unmatchedconsentresponses
@pytest.mark.order(1005)
@pytest.mark.dependency(depends=["ucr_records_exist"])
def test_create_record_with_no_nhs_number(setup_tests, unmatched_page):
    unmatched_page.create_record_with_no_nhs_number()  # MAVIS-1781
