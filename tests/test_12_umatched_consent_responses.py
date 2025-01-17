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

    @pytest.fixture(scope="function", autouse=True)
    def setup_tests(self, start_mavis: None):
        if not self.ce.consent_workflow_run:
            run_shell_command(command="pytest -m consentworkflow")
        self.login_page.login_as_nurse()
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_unmatched_consent_responses()
        yield
        self.login_page.logout_of_mavis()

    @pytest.mark.unmatchedconsentresponses
    @pytest.mark.order(1201)
    def test_ucr_archive_record(self):
        self.unmatched_page.verify_records_exist()
        # self.unmatched_page.archive_record()  # Skipped till 1.4 release

    @pytest.mark.unmatchedconsentresponses
    @pytest.mark.order(1202)
    def test_ucr_archive_record2(self):
        pass