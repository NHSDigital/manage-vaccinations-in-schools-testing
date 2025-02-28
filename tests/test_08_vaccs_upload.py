import pytest

from libs.mavis_constants import test_data_file_paths
from pages import pg_dashboard, pg_import_records, pg_login, pg_programmes, pg_sessions


class Test_Vaccinations_Upload:
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()
    programmes_page = pg_programmes.pg_programmes()
    sessions_page = pg_sessions.pg_sessions()
    import_records_page = pg_import_records.pg_import_records()

    @pytest.fixture(scope="function", autouse=True)
    def setup_tests(self, start_mavis: None):
        self.login_page.login_as_nurse()
        self.dashboard_page.click_sessions()
        self.sessions_page.schedule_a_valid_session_in_school_1(for_today=True)
        self.sessions_page.upload_class_list_to_school_1(file_paths=test_data_file_paths.CLASS_POSITIVE)
        self.sessions_page.click_school1()
        self.sessions_page.save_session_id()
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_import_records()
        self.import_records_page.click_import_records()
        self.import_records_page.click_vaccination_records()
        yield
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.delete_all_sessions_for_school_1()
        self.login_page.logout_of_mavis()

    @pytest.mark.vaccinations
    @pytest.mark.order(801)
    def test_vaccs_positive_file_upload(self):
        self.programmes_page.upload_vaccination_records(file_paths=test_data_file_paths.VACCS_POSITIVE)

    @pytest.mark.vaccinations
    @pytest.mark.order(802)
    def test_vaccs_negative_file_upload(self):
        self.programmes_page.upload_vaccination_records(file_paths=test_data_file_paths.VACCS_NEGATIVE)

    @pytest.mark.vaccinations
    @pytest.mark.order(803)
    def test_vaccs_duplicate_record_upload(self):
        self.programmes_page.upload_vaccination_records(file_paths=test_data_file_paths.VACCS_DUP_1)
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_import_records()
        self.import_records_page.click_import_records()
        self.import_records_page.click_vaccination_records()
        self.programmes_page.upload_vaccination_records(file_paths=test_data_file_paths.VACCS_DUP_2)

    @pytest.mark.vaccinations
    @pytest.mark.order(804)
    def test_vaccs_file_structure(self):
        self.programmes_page.upload_vaccination_records(file_paths=test_data_file_paths.VACCS_INVALID_STRUCTURE)

    @pytest.mark.vaccinations
    @pytest.mark.order(805)
    def test_vaccs_no_record(self):
        self.programmes_page.upload_vaccination_records(file_paths=test_data_file_paths.VACCS_HEADER_ONLY)

    @pytest.mark.vaccinations
    @pytest.mark.order(806)
    def test_vaccs_empty_file(self):
        self.programmes_page.upload_vaccination_records(file_paths=test_data_file_paths.VACCS_EMPTY_FILE)

    @pytest.mark.vaccinations
    @pytest.mark.order(807)
    def test_vaccs_historic_positive_file_upload(self):
        self.programmes_page.upload_vaccination_records(file_paths=test_data_file_paths.VACCS_HIST_POSITIVE)

    @pytest.mark.vaccinations
    @pytest.mark.order(808)
    def test_vaccs_historic_negative_file_upload(self):
        self.programmes_page.upload_vaccination_records(file_paths=test_data_file_paths.VACCS_HIST_NEGATIVE)
