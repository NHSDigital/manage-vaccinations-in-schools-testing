import pytest

from libs.mavis_constants import test_data_file_paths, vaccines
from pages import (
    DashboardPage,
    ImportRecordsPage,
    LoginPage,
    ProgrammesPage,
    SessionsPage,
    VaccinesPage,
)


class Test_Reset:
    login_page = LoginPage()
    dashboard_page = DashboardPage()
    programmes_page = ProgrammesPage()
    sessions_page = SessionsPage()
    vaccines_page = VaccinesPage()
    import_records_page = ImportRecordsPage()

    @pytest.fixture(scope="function", autouse=False)
    def setup_tests(self, start_mavis, reset_environment, nurse):
        reset_environment()

        self.login_page.log_in(**nurse)
        yield
        self.login_page.log_out()

        reset_environment()

    @pytest.fixture(scope="function", autouse=False)
    def setup_mav_965(self, setup_tests: None):
        self.dashboard_page.click_vaccines()
        self.vaccines_page.add_batch(vaccine_name=vaccines.GARDASIL9)  # HPV
        self.vaccines_page.add_batch(vaccine_name=vaccines.MENQUADFI)  # MenACWY
        self.vaccines_page.add_batch(vaccine_name=vaccines.REVAXIS)  # Td/IPV
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.schedule_a_valid_session_in_school_1(for_today=True)
        self.import_records_page.import_class_list_records_from_school_session(
            file_paths=test_data_file_paths.CLASS_MAV_965
        )
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        yield

    @pytest.fixture(scope="function", autouse=False)
    def setup_cohort_upload_and_reports(self, setup_tests: None):
        self.dashboard_page.click_programmes()
        yield

    @pytest.mark.rav
    @pytest.mark.bug
    @pytest.mark.order(9901)
    def test_programmes_rav_prescreening_questions(self, setup_mav_965):
        self.programmes_page.verify_mav_965()

    @pytest.mark.cohorts
    @pytest.mark.order(9902)
    @pytest.mark.skip(reason="Covered in performance testing")
    def test_cohort_upload_performance(
        self, setup_cohort_upload_and_reports
    ):  # MAV-927
        self.programmes_page.upload_cohorts(
            file_paths=test_data_file_paths.COHORTS_MAV_927_PERF, wait_long=True
        )
