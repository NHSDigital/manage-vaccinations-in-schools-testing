import pytest

from libs.constants import test_data_file_paths
from pages import pg_dashboard, pg_login, pg_programmes, pg_sessions


class Test_Regression_Vaccinations_Upload:
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()
    programmes_page = pg_programmes.pg_programmes()
    sessions_page = pg_sessions.pg_sessions()

    @pytest.fixture()
    def test_setup(self, start_mavis: None):
        self.login_page.perform_valid_login()
        self.dashboard_page.click_sessions()
        self.sessions_page.schedule_a_valid_session(for_today=True)
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_programmes()
        yield
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.delete_all_sessions()

    @pytest.mark.vaccinations
    @pytest.mark.order(801)
    def test_reg_hpv_positive_file_upload(self, test_setup):
        self.programmes_page.upload_hpv_vaccination_records(file_paths=test_data_file_paths.VACCS_HPV_POSITIVE)

    @pytest.mark.vaccinations
    @pytest.mark.order(802)
    def test_reg_hpv_negative_file_upload(self, test_setup):
        self.programmes_page.upload_hpv_vaccination_records(file_paths=test_data_file_paths.VACCS_HPV_NEGATIVE)

    @pytest.mark.vaccinations
    @pytest.mark.order(803)
    def test_reg_hpv_duplicate_record_upload(self, test_setup):
        self.programmes_page.upload_hpv_vaccination_records(file_paths=test_data_file_paths.VACCS_HPV_DUP_1)
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_programmes()
        self.programmes_page.upload_hpv_vaccination_records(file_paths=test_data_file_paths.VACCS_HPV_DUP_2)

    @pytest.mark.vaccinations
    @pytest.mark.order(804)
    def test_reg_hpv_file_structure(self, test_setup):
        self.programmes_page.upload_invalid_files(file_paths=test_data_file_paths.VACCS_HPV_INVALID_STRUCTURE)

    @pytest.mark.vaccinations
    @pytest.mark.order(805)
    def test_reg_hpv_no_record(self, test_setup):
        self.programmes_page.upload_invalid_files(file_paths=test_data_file_paths.VACCS_HPV_HEADER_ONLY)

    @pytest.mark.vaccinations
    @pytest.mark.order(806)
    def test_reg_hpv_empty_file(self, test_setup):
        self.programmes_page.upload_invalid_files(file_paths=test_data_file_paths.VACCS_HPV_EMPTY_FILE)
