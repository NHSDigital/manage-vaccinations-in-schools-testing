import pytest

from libs.constants import test_data_file_paths
from pages import pg_home, pg_login, pg_programmes


class Test_Regression_Vaccinations_Upload:
    login_page = pg_login.pg_login()
    home_page = pg_home.pg_home()
    programmes_page = pg_programmes.pg_programmes()

    @pytest.mark.vaccinations
    @pytest.mark.regression
    @pytest.mark.order(201)
    def test_reg_hpv_positive_file_upload(self, create_browser_page):
        self.login_page.perform_login()
        self.home_page.click_programmes()
        self.programmes_page.upload_hpv_vaccination_records(file_paths=test_data_file_paths.VACCS_HPV_POSITIVE)

    @pytest.mark.vaccinations
    @pytest.mark.regression
    @pytest.mark.order(202)
    def test_reg_hpv_negative_file_upload(self, create_browser_page):
        self.login_page.perform_login()
        self.home_page.click_programmes()
        self.programmes_page.upload_hpv_vaccination_records(file_paths=test_data_file_paths.VACCS_HPV_NEGATIVE)

    @pytest.mark.vaccinations
    @pytest.mark.regression
    @pytest.mark.order(203)
    def test_reg_hpv_duplicate_record_upload(self, create_browser_page):
        self.login_page.perform_login()
        self.home_page.click_programmes()
        self.programmes_page.upload_hpv_vaccination_records(file_paths=test_data_file_paths.VACCS_HPV_DUP_1)
        self.home_page.click_programmes()
        self.programmes_page.upload_hpv_vaccination_records(file_paths=test_data_file_paths.VACCS_HPV_DUP_2)

    @pytest.mark.vaccinations
    @pytest.mark.regression
    @pytest.mark.order(204)
    def test_reg_hpv_file_structure(self, create_browser_page):
        self.login_page.perform_login()
        self.home_page.click_programmes()
        self.programmes_page.upload_invalid_files(file_paths=test_data_file_paths.VACCS_HPV_INVALID_STRUCTURE)

    @pytest.mark.vaccinations
    @pytest.mark.regression
    @pytest.mark.order(205)
    def test_reg_hpv_no_record(self, create_browser_page):
        self.login_page.perform_login()
        self.home_page.click_programmes()
        self.programmes_page.upload_invalid_files(file_paths=test_data_file_paths.VACCS_HPV_HEADER_ONLY)

    @pytest.mark.vaccinations
    @pytest.mark.regression
    @pytest.mark.order(206)
    def test_reg_hpv_empty_file(self, create_browser_page):
        self.login_page.perform_login()
        self.home_page.click_programmes()
        self.programmes_page.upload_invalid_files(file_paths=test_data_file_paths.VACCS_HPV_EMPTY_FILE)
