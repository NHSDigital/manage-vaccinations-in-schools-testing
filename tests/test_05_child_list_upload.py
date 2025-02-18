import pytest

from libs.constants import test_data_file_paths
from pages import pg_dashboard, pg_import_records, pg_login, pg_programmes


class Test_Child_List_Upload:
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()
    programmes_page = pg_programmes.pg_programmes()
    import_records_page = pg_import_records.pg_import_records()

    @pytest.fixture(scope="function", autouse=True)
    def setup_tests(self, start_mavis: None):
        self.login_page.login_as_nurse()
        self.dashboard_page.click_import_records()
        self.import_records_page.click_import_records()
        self.import_records_page.click_child_records()
        yield
        self.login_page.logout_of_mavis()

    @pytest.mark.childlist
    @pytest.mark.order(501)
    def test_child_list_file_upload_positive(self):
        self.programmes_page.upload_hpv_child_records(file_paths=test_data_file_paths.CHILD_POSITIVE)

    @pytest.mark.childlist
    @pytest.mark.order(502)
    def test_child_list_file_upload_negative(self):
        self.programmes_page.upload_hpv_child_records(file_paths=test_data_file_paths.CHILD_NEGATIVE)

    @pytest.mark.childlist
    @pytest.mark.order(503)
    def test_child_list_file_structure(self):
        self.programmes_page.upload_invalid_hpv_child_records(file_paths=test_data_file_paths.CHILD_INVALID_STRUCTURE)

    @pytest.mark.childlist
    @pytest.mark.order(504)
    def test_child_list_no_record(self):
        self.programmes_page.upload_invalid_hpv_child_records(file_paths=test_data_file_paths.CHILD_HEADER_ONLY)

    @pytest.mark.childlist
    @pytest.mark.order(505)
    def test_child_list_empty_file(self):
        self.programmes_page.upload_invalid_hpv_child_records(file_paths=test_data_file_paths.CHILD_EMPTY_FILE)
