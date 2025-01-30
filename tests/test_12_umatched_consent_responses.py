from os import name

import pytest

from libs import CurrentExecution
from libs.wrappers import *
from pages import pg_dashboard, pg_login, pg_unmatched


class Test_Unmatched_Consent_Responses:
    ce = CurrentExecution()
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()
    unmatched_page = pg_unmatched.pg_unmatched()

    # ALL OF THE TESTS IN THIS CLASS DEPEND ON THE CONSENT WORKFLOW TESTS TO HAVE RUN FIRST
    # RUN THE CONSENT WORKFLOW TESTS OR THE FULL PACK BEFORE RUNNING THESE TESTS
    # SET THE 'RESET_ENV_BEFORE_EXECUTION' FLAG (in .env) TO 'false' IF RUNNING ONLY CONSENT TESTS

    @pytest.fixture(scope="function", autouse=True)
    def setup_tests(self, start_mavis: None):
        self.login_page.login_as_nurse()
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_unmatched_consent_responses()
        yield
        self.login_page.logout_of_mavis()

    @pytest.mark.unmatchedconsentresponses
    @pytest.mark.order(1201)
    @pytest.mark.dependency(name="ucr_records_exist")
    def test_ucr_check_records_exist(self):
        self.unmatched_page.verify_records_exist()

    @pytest.mark.unmatchedconsentresponses
    @pytest.mark.order(1202)
    @pytest.mark.dependency(depends=["ucr_records_exist"])
    def test_ucr_archive_record(self):
        self.unmatched_page.archive_record()  # Covers MAVIS-1782

    @pytest.mark.unmatchedconsentresponses
    @pytest.mark.order(1203)
    @pytest.mark.dependency(depends=["ucr_records_exist"])
    def test_ucr_create_record(self):
        self.unmatched_page.create_record()  # Covers MAVIS-1812

    @pytest.mark.unmatchedconsentresponses
    @pytest.mark.order(1204)
    @pytest.mark.dependency(depends=["ucr_records_exist"])
    def test_ucr_match_record(self):
        self.unmatched_page.match_with_record()  # Covers MAVIS-1812

    @pytest.mark.unmatchedconsentresponses
    @pytest.mark.order(1205)
    @pytest.mark.dependency(depends=["ucr_records_exist"])
    def test_ucr_create_record_with_no_nhs_number(self):
        self.unmatched_page.create_record_with_no_nhs_number()  # MAVIS-1781
