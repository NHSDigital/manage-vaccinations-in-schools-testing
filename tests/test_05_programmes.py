import pytest

from libs.generic_constants import fixture_scope
from libs.mavis_constants import programme_names, test_data_file_paths
from pages import (
    pg_dashboard,
    pg_import_records,
    pg_login,
    pg_programmes,
    pg_sessions,
    pg_vaccines,
)


class Test_Programmes:
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()
    sessions_page = pg_sessions.pg_sessions()
    programmes_page = pg_programmes.pg_programmes()
    import_records_page = pg_import_records.pg_import_records()
    vaccines_page = pg_vaccines.pg_vaccines()

    @pytest.fixture(scope=fixture_scope.FUNCTION, autouse=False)
    def setup_cohort_upload_and_reports(self, start_mavis: None):
        self.login_page.login_as_nurse()
        self.dashboard_page.click_programmes()
        yield
        self.login_page.logout_of_mavis()

    @pytest.fixture(scope=fixture_scope.FUNCTION, autouse=False)
    def setup_record_a_vaccine(self, start_mavis: None):
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
            self.vaccines_page.add_gardasil9_batch()
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

    @pytest.fixture(scope=fixture_scope.FUNCTION, autouse=False)
    def setup_mav_nnn(self, start_mavis: None):
        try:
            self.login_page.login_as_admin()
            self.dashboard_page.click_sessions()
            self.sessions_page.schedule_a_valid_session_in_school_1(for_today=True)
            self.import_records_page.import_class_list_records_from_school_session(
                file_paths=test_data_file_paths.CLASS_SINGLE_VACC
            )
            self.sessions_page.click_school1()
            self.sessions_page.save_session_id_from_offline_excel()
            yield
        finally:
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.delete_all_sessions_for_school_1()
            self.login_page.logout_of_mavis()

    @pytest.mark.cohorts
    @pytest.mark.order(501)
    def test_cohort_upload_positive(self, setup_cohort_upload_and_reports):
        self.programmes_page.upload_cohorts(file_paths=test_data_file_paths.COHORTS_POSITIVE)

    @pytest.mark.cohorts
    @pytest.mark.order(502)
    def test_cohort_upload_negative(self, setup_cohort_upload_and_reports):
        self.programmes_page.upload_cohorts(file_paths=test_data_file_paths.COHORTS_NEGATIVE)

    @pytest.mark.cohorts
    @pytest.mark.order(503)
    def test_cohorts_file_structure(self, setup_cohort_upload_and_reports):
        self.programmes_page.upload_invalid_cohorts(file_paths=test_data_file_paths.COHORTS_INVALID_STRUCTURE)

    @pytest.mark.cohorts
    @pytest.mark.order(504)
    def test_cohorts_no_record(self, setup_cohort_upload_and_reports):
        self.programmes_page.upload_invalid_cohorts(file_paths=test_data_file_paths.COHORTS_HEADER_ONLY)

    @pytest.mark.cohorts
    @pytest.mark.order(505)
    def test_cohorts_empty_file(self, setup_cohort_upload_and_reports):
        self.programmes_page.upload_invalid_cohorts(file_paths=test_data_file_paths.COHORTS_EMPTY_FILE)

    @pytest.mark.rav
    @pytest.mark.order(526)
    def test_programmes_rav_triage_positive(self, setup_record_a_vaccine):
        self.sessions_page.update_triage_outcome_positive(file_paths=test_data_file_paths.COHORTS_FULL_NAME)

    @pytest.mark.rav
    @pytest.mark.order(527)
    def test_programmes_rav_triage_consent_refused(self, setup_record_a_vaccine):
        self.sessions_page.update_triage_outcome_consent_refused(file_paths=test_data_file_paths.COHORTS_FULL_NAME)

    @pytest.mark.rav
    @pytest.mark.order(528)
    def test_programmes_rav_edit_dose_to_not_given(self, setup_mavis_1729):
        self.programmes_page.edit_dose_to_not_given()  # MAVIS-1729

    @pytest.mark.rav
    @pytest.mark.order(529)
    def test_programmes_rav_verify_excel_mav_854(self, setup_mav_854):
        self.programmes_page.verify_mav_854()  # MAV-854

    @pytest.mark.rav
    @pytest.mark.order(530)
    @pytest.mark.skip(reason="Test under construction")
    def test_programmes_rav_verify_banners(self, setup_mav_nnn):
        self.programmes_page.verify_mav_nnn()

    @pytest.mark.reports
    @pytest.mark.order(551)
    def test_programmes_verify_careplus_report_for_hpv(self, setup_cohort_upload_and_reports):
        self.programmes_page.verify_careplus_report_format(for_programme=programme_names.HPV)

    @pytest.mark.reports
    @pytest.mark.order(552)
    def test_programmes_verify_careplus_report_for_doubles(self, setup_cohort_upload_and_reports):
        self.programmes_page.verify_careplus_report_format(for_programme=programme_names.MENACWY)
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_programmes()
        self.programmes_page.verify_careplus_report_format(for_programme=programme_names.TDIPV)

    @pytest.mark.reports
    @pytest.mark.order(553)
    def test_programmes_verify_csv_report_for_hpv(self, setup_cohort_upload_and_reports):
        self.programmes_page.verify_csv_report_format(for_programme=programme_names.HPV)

    @pytest.mark.reports
    @pytest.mark.order(554)
    def test_programmes_verify_csv_report_for_doubles(self, setup_cohort_upload_and_reports):
        self.programmes_page.verify_csv_report_format(for_programme=programme_names.MENACWY)
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_programmes()
        self.programmes_page.verify_csv_report_format(for_programme=programme_names.TDIPV)

    @pytest.mark.reports
    @pytest.mark.order(555)
    def test_programmes_verify_systmone_report_for_hpv(self, setup_cohort_upload_and_reports):
        self.programmes_page.verify_systmone_report_format(for_programme=programme_names.HPV)
