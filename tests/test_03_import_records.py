import pytest

from libs.generic_constants import fixture_scope
from libs.mavis_constants import child_year_group, test_data_file_paths
from pages import pg_children, pg_dashboard, pg_import_records, pg_login, pg_sessions


class Test_ImportRecords:
    login_page = pg_login.pg_login()
    dashboard_page = pg_dashboard.pg_dashboard()
    import_records_page = pg_import_records.pg_import_records()
    sessions_page = pg_sessions.pg_sessions()

    @pytest.fixture(scope=fixture_scope.FUNCTION, autouse=False)
    def setup_tests(self, start_mavis: None):
        self.login_page.login_as_nurse()
        yield
        self.login_page.logout_of_mavis()

    @pytest.fixture(scope=fixture_scope.FUNCTION, autouse=False)
    def setup_child_list(self, setup_tests: None):
        self.dashboard_page.click_import_records()
        self.import_records_page.click_import_records()
        yield

    @pytest.fixture(scope=fixture_scope.FUNCTION, autouse=False)
    def setup_class_list(self, setup_tests: None):
        try:
            self.dashboard_page.click_sessions()
            self.sessions_page.schedule_a_valid_session_in_school_1()
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_import_records()
            self.import_records_page.click_import_records()
            yield
        finally:
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.delete_all_sessions_for_school_1()

    @pytest.fixture(scope=fixture_scope.FUNCTION, autouse=False)
    def setup_vaccs(self, setup_tests: None):
        try:
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
            yield
        finally:
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.delete_all_sessions_for_school_1()

    ########################################### CHILD LIST ###########################################
    @pytest.mark.childlist
    @pytest.mark.order(301)
    def test_child_list_file_upload_positive(self, setup_child_list):
        self.import_records_page.import_child_records(file_paths=test_data_file_paths.CHILD_POSITIVE)

    @pytest.mark.childlist
    @pytest.mark.order(302)
    def test_child_list_file_upload_negative(self, setup_child_list):
        self.import_records_page.import_child_records(file_paths=test_data_file_paths.CHILD_NEGATIVE)

    @pytest.mark.childlist
    @pytest.mark.order(303)
    def test_child_list_file_structure(self, setup_child_list):
        self.import_records_page.import_child_records(file_paths=test_data_file_paths.CHILD_INVALID_STRUCTURE)

    @pytest.mark.childlist
    @pytest.mark.order(304)
    def test_child_list_no_record(self, setup_child_list):
        self.import_records_page.import_child_records(file_paths=test_data_file_paths.CHILD_HEADER_ONLY)

    @pytest.mark.childlist
    @pytest.mark.order(305)
    def test_child_list_empty_file(self, setup_child_list):
        self.import_records_page.import_child_records(file_paths=test_data_file_paths.CHILD_EMPTY_FILE)

    ########################################### CLASS LIST ###########################################

    @pytest.mark.classlist
    @pytest.mark.order(326)
    def test_class_list_file_upload_positive(self, setup_class_list: None):
        self.import_records_page.import_class_list_records(file_paths=test_data_file_paths.CLASS_POSITIVE)

    @pytest.mark.classlist
    @pytest.mark.order(327)
    def test_class_list_file_upload_negative(self, setup_class_list: None):
        self.import_records_page.import_class_list_records(file_paths=test_data_file_paths.CLASS_NEGATIVE)

    @pytest.mark.classlist
    @pytest.mark.order(328)
    def test_class_list_file_structure(self, setup_class_list: None):
        self.import_records_page.import_class_list_records(file_paths=test_data_file_paths.CLASS_INVALID_STRUCTURE)

    @pytest.mark.classlist
    @pytest.mark.order(329)
    def test_class_list_no_record(self, setup_class_list: None):
        self.import_records_page.import_class_list_records(file_paths=test_data_file_paths.CLASS_HEADER_ONLY)

    @pytest.mark.classlist
    @pytest.mark.order(330)
    def test_class_list_empty_file(self, setup_class_list: None):
        self.import_records_page.import_class_list_records(file_paths=test_data_file_paths.CLASS_EMPTY_FILE)

    @pytest.mark.classlist
    @pytest.mark.order(331)
    def test_class_list_year_group(self, setup_class_list: None):
        self.import_records_page.import_class_list_records(
            file_paths=test_data_file_paths.CLASS_YEAR_GROUP, year_group=child_year_group.YEAR_8
        )

    ########################################### VACCINATIONS ###########################################

    @pytest.mark.vaccinations
    @pytest.mark.order(351)
    def test_vaccs_positive_file_upload(self, setup_vaccs):
        self.import_records_page.import_vaccination_records(file_paths=test_data_file_paths.VACCS_POSITIVE)

    @pytest.mark.vaccinations
    @pytest.mark.order(352)
    def test_vaccs_negative_file_upload(self, setup_vaccs):
        self.import_records_page.import_vaccination_records(file_paths=test_data_file_paths.VACCS_NEGATIVE)

    @pytest.mark.vaccinations
    @pytest.mark.order(353)
    def test_vaccs_duplicate_record_upload(self, setup_vaccs):
        self.import_records_page.import_vaccination_records(file_paths=test_data_file_paths.VACCS_DUP_1)
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_import_records()
        self.import_records_page.click_import_records()
        self.import_records_page.import_vaccination_records(file_paths=test_data_file_paths.VACCS_DUP_2)

    @pytest.mark.vaccinations
    @pytest.mark.order(354)
    def test_vaccs_file_structure(self, setup_vaccs):
        self.import_records_page.import_vaccination_records(file_paths=test_data_file_paths.VACCS_INVALID_STRUCTURE)

    @pytest.mark.vaccinations
    @pytest.mark.order(355)
    def test_vaccs_no_record(self, setup_vaccs):
        self.import_records_page.import_vaccination_records(file_paths=test_data_file_paths.VACCS_HEADER_ONLY)

    @pytest.mark.vaccinations
    @pytest.mark.order(356)
    def test_vaccs_empty_file(self, setup_vaccs):
        self.import_records_page.import_vaccination_records(file_paths=test_data_file_paths.VACCS_EMPTY_FILE)

    @pytest.mark.vaccinations
    @pytest.mark.order(357)
    def test_vaccs_historic_positive_file_upload(self, setup_vaccs):
        self.import_records_page.import_vaccination_records(file_paths=test_data_file_paths.VACCS_HIST_POSITIVE)

    @pytest.mark.vaccinations
    @pytest.mark.order(358)
    def test_vaccs_historic_negative_file_upload(self, setup_vaccs):
        self.import_records_page.import_vaccination_records(file_paths=test_data_file_paths.VACCS_HIST_NEGATIVE)

    @pytest.mark.vaccinations
    @pytest.mark.order(359)
    def test_vaccs_historic_no_urn_mav_855(self, setup_vaccs):
        self.import_records_page.import_vaccination_records(file_paths=test_data_file_paths.VACCS_HPV_MAV_855)
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_children()
        self.import_records_page.verify_mav_855()
