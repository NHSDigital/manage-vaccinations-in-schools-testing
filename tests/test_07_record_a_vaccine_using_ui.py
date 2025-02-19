import pytest

from libs.constants import test_data_file_paths
from pages import pg_dashboard, pg_import_records, pg_login, pg_programmes, pg_sessions


class Test_Record_a_Vaccine_Using_UI:
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()
    sessions_page = pg_sessions.pg_sessions()
    programmes_page = pg_programmes.pg_programmes()
    import_records_page = pg_import_records.pg_import_records()

    @pytest.fixture(scope="function", autouse=False)
    def setup_tests(self, start_mavis: None):
        self.login_page.login_as_nurse()
        self.dashboard_page.click_sessions()
        self.sessions_page.schedule_a_valid_session_in_school_1()
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        yield
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.delete_all_sessions_for_school_1()
        self.login_page.logout_of_mavis()

    @pytest.fixture(scope="function", autouse=False)
    def setup_mavis_1729(self, start_mavis: None):
        self.login_page.login_as_nurse()
        self.dashboard_page.click_sessions()
        self.sessions_page.schedule_a_valid_session_in_school_1(for_today=True)
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_import_records()
        self.import_records_page.click_import_records()
        self.import_records_page.click_vaccination_records()
        self.programmes_page.upload_hpv_vaccination_records(file_paths=test_data_file_paths.VACCS_HPV_DOSE_TWO)
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_programmes()
        yield
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.delete_all_sessions_for_school_1()
        self.login_page.logout_of_mavis()

    @pytest.mark.rav
    @pytest.mark.order(701)
    def test_rav_triage_positive(self, setup_tests):
        self.sessions_page.update_triage_outcome_positive(file_paths=test_data_file_paths.COHORTS_POSITIVE)

    @pytest.mark.rav
    @pytest.mark.order(702)
    def test_rav_triage_consent_refused(self, setup_tests):
        self.sessions_page.update_triage_outcome_consent_refused(file_paths=test_data_file_paths.COHORTS_POSITIVE)

    @pytest.mark.rav
    @pytest.mark.order(703)
    def test_rav_edit_dose_to_not_given(self, setup_mavis_1729):
        self.programmes_page.edit_dose_to_not_given()  # MAVIS-1729
