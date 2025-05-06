import pytest

from libs import CurrentExecution
from libs.generic_constants import fixture_scope
from libs.mavis_constants import test_data_file_paths, vaccine_names
from pages import (
    pg_dashboard,
    pg_import_records,
    pg_login,
    pg_programmes,
    pg_sessions,
    pg_vaccines,
)


class Test_Reset:
    ce = CurrentExecution()
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()
    programmes_page = pg_programmes.pg_programmes()
    sessions_page = pg_sessions.pg_sessions()
    vaccines_page = pg_vaccines.pg_vaccines()
    import_records_page = pg_import_records.pg_import_records()

    @pytest.fixture(scope=fixture_scope.FUNCTION, autouse=False)
    def setup_tests(self, start_mavis: None):
        self.ce.reset_environment()
        self.login_page.login_as_nurse()
        yield
        self.login_page.logout_of_mavis()
        self.ce.reset_environment()

    @pytest.fixture(scope=fixture_scope.FUNCTION, autouse=False)
    def setup_mav_965(self, setup_tests: None):
        self.dashboard_page.click_vaccines()
        self.vaccines_page.add_batch(vaccine_name=vaccine_names.GARDASIL9)  # HPV
        self.vaccines_page.add_batch(vaccine_name=vaccine_names.MENQUADFI)  # MenACWY
        self.vaccines_page.add_batch(vaccine_name=vaccine_names.REVAXIS)  # Td/IPV
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.schedule_a_valid_session_in_school_1(for_today=True)
        self.import_records_page.import_class_list_records_from_school_session(
            file_paths=test_data_file_paths.CLASS_MAV_965
        )
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        yield

    @pytest.fixture(scope=fixture_scope.FUNCTION, autouse=False)
    def setup_cohort_upload_and_reports(self, setup_tests: None):
        self.dashboard_page.click_programmes()
        yield

    @pytest.mark.rav
    @pytest.mark.order(9901)
    def test_programmes_rav_prescreening_questions(self, setup_mav_965):
        self.programmes_page.verify_mav_965()

    @pytest.mark.cohorts
    @pytest.mark.order(9902)
    @pytest.mark.skip(reason="Covered in performance testing")
    def test_cohort_upload_performance(self, setup_cohort_upload_and_reports):  # MAV-927
        self.programmes_page.upload_cohorts(file_paths=test_data_file_paths.COHORTS_MAV_927_PERF, wait_long=True)
