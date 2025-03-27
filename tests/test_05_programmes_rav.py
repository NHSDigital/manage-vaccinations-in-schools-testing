import pytest

from libs.generic_constants import fixture_scope
from libs.mavis_constants import test_data_file_paths
from pages import (
    pg_dashboard,
    pg_import_records,
    pg_login,
    pg_programmes,
    pg_sessions,
    pg_vaccines,
)


class Test_Programmes_RAV:
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()
    sessions_page = pg_sessions.pg_sessions()
    programmes_page = pg_programmes.pg_programmes()
    import_records_page = pg_import_records.pg_import_records()
    vaccines_page = pg_vaccines.pg_vaccines()

    @pytest.fixture(scope=fixture_scope.FUNCTION, autouse=False)
    def setup_tests(self, start_mavis: None):
        try:
            self.login_page.login_as_nurse()
            self.dashboard_page.click_sessions()
            self.sessions_page.schedule_a_valid_session_in_school_1(for_today=True)
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            yield
        finally:
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.delete_all_sessions_for_school_1()
            self.login_page.logout_of_mavis()

    @pytest.fixture(scope=fixture_scope.FUNCTION, autouse=False)
    def setup_mavis_1729(self, start_mavis: None):
        try:
            self.login_page.login_as_nurse()
            self.dashboard_page.click_sessions()
            self.sessions_page.schedule_a_valid_session_in_school_1(for_today=True)
            self.import_records_page.import_class_list_records_from_school_session(
                file_paths=test_data_file_paths.CLASS_SESSION_ID
            )
            self.sessions_page.click_school1()
            self.sessions_page.save_session_id_from_offline_excel()
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_import_records()
            self.import_records_page.click_import_records()
            self.import_records_page.import_vaccination_records(file_paths=test_data_file_paths.VACCS_HPV_DOSE_TWO)
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_programmes()
            yield
        finally:
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.delete_all_sessions_for_school_1()
            self.login_page.logout_of_mavis()

    @pytest.fixture(scope=fixture_scope.FUNCTION, autouse=False)
    def setup_mav_854(self, start_mavis: None):
        try:
            self.login_page.login_as_nurse()
            self.dashboard_page.click_vaccines()
            self.vaccines_page.add_batch()
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.schedule_a_valid_session_in_school_1(for_today=True)
            self.import_records_page.import_class_list_records_from_school_session(
                file_paths=test_data_file_paths.CLASS_MAV_854
            )
            self.sessions_page.click_school1()
            self.sessions_page.save_session_id_from_offline_excel()
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.schedule_a_valid_session_in_community_clinics(for_today=True)
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_children()
            yield
        finally:
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.delete_all_sessions_for_school_1()
            self.login_page.logout_of_mavis()

    @pytest.mark.rav
    @pytest.mark.order(501)
    def test_programmes_rav_triage_positive(self, setup_tests):
        self.sessions_page.update_triage_outcome_positive(file_paths=test_data_file_paths.COHORTS_FULL_NAME)

    @pytest.mark.rav
    @pytest.mark.order(502)
    def test_programmes_rav_triage_consent_refused(self, setup_tests):
        self.sessions_page.update_triage_outcome_consent_refused(file_paths=test_data_file_paths.COHORTS_FULL_NAME)

    @pytest.mark.rav
    @pytest.mark.order(503)
    def test_programmes_rav_edit_dose_to_not_given(self, setup_mavis_1729):
        self.programmes_page.edit_dose_to_not_given()  # MAVIS-1729

    @pytest.mark.rav
    @pytest.mark.order(504)
    def test_programmes_rav_verify_download_excel(self, setup_mav_854):
        self.programmes_page.verify_mav_854()  # MAV-854
