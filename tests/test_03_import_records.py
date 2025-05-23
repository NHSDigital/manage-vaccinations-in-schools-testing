import pytest

from libs.mavis_constants import (
    mavis_file_types,
    test_data_file_paths,
)
from pages import DashboardPage, ImportRecordsPage, LoginPage, SessionsPage


class Test_ImportRecords:
    login_page = LoginPage()
    dashboard_page = DashboardPage()
    import_records_page = ImportRecordsPage()
    sessions_page = SessionsPage()

    @pytest.fixture(scope="function", autouse=False)
    def setup_tests(self, start_mavis, nurse):
        self.login_page.log_in(**nurse)
        yield
        self.login_page.log_out()

    @pytest.fixture(scope="function", autouse=False)
    def setup_child_list(self, setup_tests: None):
        self.dashboard_page.click_import_records()
        yield

    @pytest.fixture(scope="function", autouse=False)
    def setup_class_list(self, setup_tests: None):
        try:
            self.dashboard_page.click_sessions()
            self.sessions_page.schedule_a_valid_session_in_school_1()
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_import_records()
            yield
        finally:
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.delete_all_sessions_for_school_1()

    @pytest.fixture(scope="function", autouse=False)
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
            yield
        finally:
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.delete_all_sessions_for_school_1()

    @pytest.fixture(scope="function", autouse=False)
    def setup_vaccs_systmone(self, setup_tests: None):
        try:
            self.dashboard_page.click_sessions()
            self.sessions_page.schedule_a_valid_session_in_school_1(for_today=True)
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_import_records()
            yield
        finally:
            self.dashboard_page.go_to_dashboard()
            self.dashboard_page.click_sessions()
            self.sessions_page.delete_all_sessions_for_school_1()

    ########################################### CHILD LIST ###########################################
    @pytest.mark.childlist
    @pytest.mark.order(301)
    def test_child_list_file_upload_positive(self, setup_child_list):
        self.import_records_page.import_child_records(
            file_paths=test_data_file_paths.CHILD_POSITIVE
        )

    @pytest.mark.childlist
    @pytest.mark.order(302)
    def test_child_list_file_upload_negative(self, setup_child_list):
        self.import_records_page.import_child_records(
            file_paths=test_data_file_paths.CHILD_NEGATIVE
        )

    @pytest.mark.childlist
    @pytest.mark.order(303)
    def test_child_list_file_structure(self, setup_child_list):
        self.import_records_page.import_child_records(
            file_paths=test_data_file_paths.CHILD_INVALID_STRUCTURE
        )

    @pytest.mark.childlist
    @pytest.mark.order(304)
    def test_child_list_no_record(self, setup_child_list):
        self.import_records_page.import_child_records(
            file_paths=test_data_file_paths.CHILD_HEADER_ONLY
        )

    @pytest.mark.childlist
    @pytest.mark.order(305)
    def test_child_list_empty_file(self, setup_child_list):
        self.import_records_page.import_child_records(
            file_paths=test_data_file_paths.CHILD_EMPTY_FILE
        )

    @pytest.mark.childlist
    @pytest.mark.bug
    @pytest.mark.order(306)
    def test_child_list_space_normalization(self, setup_child_list):
        self.import_records_page.import_child_records(
            file_paths=test_data_file_paths.CHILD_MAV_1080, verify_on_children_page=True
        )

    ########################################### CLASS LIST ###########################################

    @pytest.mark.classlist
    @pytest.mark.order(326)
    def test_class_list_file_upload_positive(self, setup_class_list: None):
        self.import_records_page.import_class_list_records(
            file_paths=test_data_file_paths.CLASS_POSITIVE
        )

    @pytest.mark.classlist
    @pytest.mark.order(327)
    def test_class_list_file_upload_negative(self, setup_class_list: None):
        self.import_records_page.import_class_list_records(
            file_paths=test_data_file_paths.CLASS_NEGATIVE
        )

    @pytest.mark.classlist
    @pytest.mark.order(328)
    def test_class_list_file_structure(self, setup_class_list: None):
        self.import_records_page.import_class_list_records(
            file_paths=test_data_file_paths.CLASS_INVALID_STRUCTURE
        )

    @pytest.mark.classlist
    @pytest.mark.order(329)
    def test_class_list_no_record(self, setup_class_list: None):
        self.import_records_page.import_class_list_records(
            file_paths=test_data_file_paths.CLASS_HEADER_ONLY
        )

    @pytest.mark.classlist
    @pytest.mark.order(330)
    def test_class_list_empty_file(self, setup_class_list: None):
        self.import_records_page.import_class_list_records(
            file_paths=test_data_file_paths.CLASS_EMPTY_FILE
        )

    @pytest.mark.classlist
    @pytest.mark.order(331)
    def test_class_list_year_group(self, setup_class_list: None):
        self.import_records_page.import_class_list_records(
            file_paths=test_data_file_paths.CLASS_YEAR_GROUP,
            year_groups=[8],
        )

    @pytest.mark.classlist
    @pytest.mark.bug
    @pytest.mark.order(332)
    def test_class_list_space_normalization(self, setup_class_list: None):
        self.import_records_page.import_class_list_records(
            file_paths=test_data_file_paths.CLASS_MAV_1080, verify_on_children_page=True
        )

    ########################################### VACCINATIONS ###########################################

    @pytest.mark.vaccinations
    @pytest.mark.order(351)
    def test_vaccs_positive_file_upload(self, setup_vaccs):
        self.import_records_page.import_vaccination_records(
            file_paths=test_data_file_paths.VACCS_POSITIVE,
            file_type=mavis_file_types.VACCS_MAVIS,
        )

    @pytest.mark.vaccinations
    @pytest.mark.order(352)
    def test_vaccs_negative_file_upload(self, setup_vaccs):
        self.import_records_page.import_vaccination_records(
            file_paths=test_data_file_paths.VACCS_NEGATIVE,
            file_type=mavis_file_types.VACCS_MAVIS,
        )

    @pytest.mark.vaccinations
    @pytest.mark.order(353)
    def test_vaccs_duplicate_record_upload(self, setup_vaccs):
        self.import_records_page.import_vaccination_records(
            file_paths=test_data_file_paths.VACCS_DUP_1,
            file_type=mavis_file_types.VACCS_MAVIS,
        )
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_import_records()
        self.import_records_page.import_vaccination_records(
            file_paths=test_data_file_paths.VACCS_DUP_2,
            file_type=mavis_file_types.VACCS_MAVIS,
        )

    @pytest.mark.vaccinations
    @pytest.mark.order(354)
    def test_vaccs_file_structure(self, setup_vaccs):
        self.import_records_page.import_vaccination_records(
            file_paths=test_data_file_paths.VACCS_INVALID_STRUCTURE,
            file_type=mavis_file_types.VACCS_MAVIS,
        )

    @pytest.mark.vaccinations
    @pytest.mark.order(355)
    def test_vaccs_no_record(self, setup_vaccs):
        self.import_records_page.import_vaccination_records(
            file_paths=test_data_file_paths.VACCS_HEADER_ONLY,
            file_type=mavis_file_types.VACCS_MAVIS,
        )

    @pytest.mark.vaccinations
    @pytest.mark.order(356)
    def test_vaccs_empty_file(self, setup_vaccs):
        self.import_records_page.import_vaccination_records(
            file_paths=test_data_file_paths.VACCS_EMPTY_FILE,
            file_type=mavis_file_types.VACCS_MAVIS,
        )

    @pytest.mark.vaccinations
    @pytest.mark.order(357)
    def test_vaccs_historic_positive_file_upload(self, setup_vaccs):
        self.import_records_page.import_vaccination_records(
            file_paths=test_data_file_paths.VACCS_HIST_POSITIVE,
            file_type=mavis_file_types.VACCS_MAVIS,
        )

    @pytest.mark.vaccinations
    @pytest.mark.order(358)
    def test_vaccs_historic_negative_file_upload(self, setup_vaccs):
        self.import_records_page.import_vaccination_records(
            file_paths=test_data_file_paths.VACCS_HIST_NEGATIVE,
            file_type=mavis_file_types.VACCS_MAVIS,
        )

    @pytest.mark.vaccinations
    @pytest.mark.bug
    @pytest.mark.order(359)
    def test_vaccs_historic_no_urn_mav_855(self, setup_vaccs):
        self.import_records_page.import_vaccination_records(
            file_paths=test_data_file_paths.VACCS_HPV_MAV_855,
            file_type=mavis_file_types.VACCS_MAVIS,
        )
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_children()
        self.import_records_page.verify_mav_855()

    @pytest.mark.vaccinations
    @pytest.mark.order(360)
    def test_vaccs_systmone_positive_file_upload(self, setup_vaccs_systmone):
        self.import_records_page.import_vaccination_records(
            file_paths=test_data_file_paths.VACCS_SYSTMONE_POSITIVE,
            file_type=mavis_file_types.VACCS_SYSTMONE,
        )

    @pytest.mark.vaccinations
    @pytest.mark.order(361)
    def test_vaccs_systmone_negative_file_upload(self, setup_vaccs_systmone):
        self.import_records_page.import_vaccination_records(
            file_paths=test_data_file_paths.VACCS_SYSTMONE_NEGATIVE,
            file_type=mavis_file_types.VACCS_SYSTMONE,
        )

    @pytest.mark.vaccinations
    @pytest.mark.order(362)
    def test_vaccs_systmone_negative_historical_file_upload(self, setup_vaccs_systmone):
        self.import_records_page.import_vaccination_records(
            file_paths=test_data_file_paths.VACCS_SYSTMONE_HIST_NEGATIVE,
            file_type=mavis_file_types.VACCS_SYSTMONE,
        )

    @pytest.mark.vaccinations
    @pytest.mark.bug
    @pytest.mark.order(363)
    def test_vaccs_hpv_space_normalization(self, setup_vaccs):
        self.import_records_page.import_vaccination_records(
            file_paths=test_data_file_paths.VACCS_MAV_1080,
            verify_on_children_page=True,
            file_type=mavis_file_types.VACCS_MAVIS,
        )

    @pytest.mark.vaccinations
    @pytest.mark.bug
    @pytest.mark.order(364)
    def test_vaccs_systmone_space_normalization(self, setup_vaccs_systmone):
        self.import_records_page.import_vaccination_records(
            file_paths=test_data_file_paths.VACCS_SYSTMONE_MAV_1080,
            verify_on_children_page=False,
            file_type=mavis_file_types.VACCS_SYSTMONE,
        )
