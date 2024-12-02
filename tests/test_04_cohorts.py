import pytest

from libs.constants import test_data_file_paths
from pages import pg_dashboard, pg_login, pg_programmes


class Test_Cohorts:
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()
    programmes_page = pg_programmes.pg_programmes()

    @pytest.fixture(scope="function", autouse=True)
    def setup_tests(self, start_mavis: None):
        self.login_page.perform_valid_login()
        self.dashboard_page.click_programmes()
        yield
        self.login_page.perform_logout()

    @pytest.mark.cohorts
    @pytest.mark.order(401)
    def test_cohort_upload_positive(self):
        self.programmes_page.upload_cohorts(file_paths=test_data_file_paths.COHORTS_POSITIVE)

    @pytest.mark.cohorts
    @pytest.mark.order(402)
    def test_cohort_upload_negative(self):
        self.programmes_page.upload_cohorts(file_paths=test_data_file_paths.COHORTS_NEGATIVE)

    @pytest.mark.cohorts
    @pytest.mark.order(403)
    def test_cohorts_file_structure(self):
        self.programmes_page.upload_invalid_cohorts(file_paths=test_data_file_paths.COHORTS_INVALID_STRUCTURE)

    @pytest.mark.cohorts
    @pytest.mark.order(404)
    def test_cohorts_no_record(self):
        self.programmes_page.upload_invalid_cohorts(file_paths=test_data_file_paths.COHORTS_HEADER_ONLY)

    @pytest.mark.cohorts
    @pytest.mark.order(405)
    def test_cohorts_empty_file(self):
        self.programmes_page.upload_invalid_cohorts(file_paths=test_data_file_paths.COHORTS_EMPTY_FILE)
