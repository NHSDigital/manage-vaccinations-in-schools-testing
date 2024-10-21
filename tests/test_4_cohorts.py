import pytest

from libs.constants import test_data_file_paths
from pages import pg_home, pg_login, pg_programmes


class Test_Regression_Cohorts:
    login_page = pg_login.pg_login()
    home_page = pg_home.pg_home()
    programmes_page = pg_programmes.pg_programmes()

    @pytest.mark.cohorts
    @pytest.mark.regression
    @pytest.mark.order(401)
    def test_reg_cohort_upload_positive(self, create_browser_page):
        self.login_page.perform_login()
        self.home_page.click_programmes()
        self.programmes_page.upload_cohorts(file_paths=test_data_file_paths.COHORTS_POSITIVE)

    @pytest.mark.cohorts
    @pytest.mark.regression
    @pytest.mark.order(402)
    def test_reg_cohort_upload_negative(self, create_browser_page):
        self.login_page.perform_login()
        self.home_page.click_programmes()
        self.programmes_page.upload_cohorts(file_paths=test_data_file_paths.COHORTS_NEGATIVE)

    @pytest.mark.cohorts
    @pytest.mark.regression
    @pytest.mark.order(403)
    def test_reg_cohorts_file_structure(self, create_browser_page):
        self.login_page.perform_login()
        self.home_page.click_programmes()
        self.programmes_page.upload_invalid_cohorts(file_paths=test_data_file_paths.COHORTS_INVALID_STRUCTURE)

    @pytest.mark.cohorts
    @pytest.mark.regression
    @pytest.mark.order(404)
    def test_reg_cohorts_no_record(self, create_browser_page):
        self.login_page.perform_login()
        self.home_page.click_programmes()
        self.programmes_page.upload_invalid_cohorts(file_paths=test_data_file_paths.COHORTS_HEADER_ONLY)

    @pytest.mark.cohorts
    @pytest.mark.regression
    @pytest.mark.order(405)
    def test_reg_cohorts_empty_file(self, create_browser_page):
        self.login_page.perform_login()
        self.home_page.click_programmes()
        self.programmes_page.upload_invalid_cohorts(file_paths=test_data_file_paths.COHORTS_EMPTY_FILE)
