import pytest

from libs.mavis_constants import (
    mavis_file_types,
    test_data_file_paths,
)


@pytest.fixture(scope="function", autouse=False)
def setup_tests(nurse, login_page):
    login_page.log_in(**nurse)
    yield
    login_page.log_out()


@pytest.fixture(scope="function", autouse=False)
def setup_child_list(setup_tests, dashboard_page):
    dashboard_page.click_import_records()
    yield


@pytest.fixture(scope="function", autouse=False)
def setup_class_list(setup_tests, dashboard_page, sessions_page):
    try:
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session_in_school_1()
        dashboard_page.go_to_dashboard()
        dashboard_page.click_import_records()
        yield
    finally:
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions_for_school_1()


@pytest.fixture(scope="function", autouse=False)
def setup_vaccs(setup_tests, dashboard_page, sessions_page, import_records_page):
    try:
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session_in_school_1(for_today=True)
        import_records_page.import_class_list_records_from_school_session(
            file_paths=test_data_file_paths.CLASS_SESSION_ID
        )
        sessions_page.click_school1()
        session_id = sessions_page.get_session_id_from_offline_excel()
        dashboard_page.go_to_dashboard()
        dashboard_page.click_import_records()
        yield session_id
    finally:
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions_for_school_1()


@pytest.fixture(scope="function", autouse=False)
def setup_vaccs_systmone(setup_tests, dashboard_page, sessions_page):
    try:
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session_in_school_1(for_today=True)
        dashboard_page.go_to_dashboard()
        dashboard_page.click_import_records()
        yield
    finally:
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions_for_school_1()


########################################### CHILD LIST ###########################################
@pytest.mark.childlist
@pytest.mark.order(301)
def test_child_list_file_upload_positive(setup_child_list, import_records_page):
    import_records_page.import_child_records(
        file_paths=test_data_file_paths.CHILD_POSITIVE
    )


@pytest.mark.childlist
@pytest.mark.order(302)
def test_child_list_file_upload_negative(setup_child_list, import_records_page):
    import_records_page.import_child_records(
        file_paths=test_data_file_paths.CHILD_NEGATIVE
    )


@pytest.mark.childlist
@pytest.mark.order(303)
def test_child_list_file_structure(setup_child_list, import_records_page):
    import_records_page.import_child_records(
        file_paths=test_data_file_paths.CHILD_INVALID_STRUCTURE
    )


@pytest.mark.childlist
@pytest.mark.order(304)
def test_child_list_no_record(setup_child_list, import_records_page):
    import_records_page.import_child_records(
        file_paths=test_data_file_paths.CHILD_HEADER_ONLY
    )


@pytest.mark.childlist
@pytest.mark.order(305)
def test_child_list_empty_file(setup_child_list, import_records_page):
    import_records_page.import_child_records(
        file_paths=test_data_file_paths.CHILD_EMPTY_FILE
    )


@pytest.mark.childlist
@pytest.mark.bug
@pytest.mark.order(306)
def test_child_list_space_normalization(setup_child_list, import_records_page):
    import_records_page.import_child_records(
        file_paths=test_data_file_paths.CHILD_MAV_1080, verify_on_children_page=True
    )


########################################### CLASS LIST ###########################################


@pytest.mark.classlist
@pytest.mark.order(326)
def test_class_list_file_upload_positive(setup_class_list, import_records_page):
    import_records_page.import_class_list_records(
        file_paths=test_data_file_paths.CLASS_POSITIVE
    )


@pytest.mark.classlist
@pytest.mark.order(327)
def test_class_list_file_upload_negative(setup_class_list, import_records_page):
    import_records_page.import_class_list_records(
        file_paths=test_data_file_paths.CLASS_NEGATIVE
    )


@pytest.mark.classlist
@pytest.mark.order(328)
def test_class_list_file_structure(setup_class_list, import_records_page):
    import_records_page.import_class_list_records(
        file_paths=test_data_file_paths.CLASS_INVALID_STRUCTURE
    )


@pytest.mark.classlist
@pytest.mark.order(329)
def test_class_list_no_record(setup_class_list, import_records_page):
    import_records_page.import_class_list_records(
        file_paths=test_data_file_paths.CLASS_HEADER_ONLY
    )


@pytest.mark.classlist
@pytest.mark.order(330)
def test_class_list_empty_file(setup_class_list, import_records_page):
    import_records_page.import_class_list_records(
        file_paths=test_data_file_paths.CLASS_EMPTY_FILE
    )


@pytest.mark.classlist
@pytest.mark.order(331)
def test_class_list_year_group(setup_class_list, import_records_page):
    import_records_page.import_class_list_records(
        file_paths=test_data_file_paths.CLASS_YEAR_GROUP,
        year_groups=[8],
    )


@pytest.mark.classlist
@pytest.mark.bug
@pytest.mark.order(332)
def test_class_list_space_normalization(setup_class_list, import_records_page):
    import_records_page.import_class_list_records(
        file_paths=test_data_file_paths.CLASS_MAV_1080, verify_on_children_page=True
    )


########################################### VACCINATIONS ###########################################


@pytest.mark.vaccinations
@pytest.mark.order(351)
def test_vaccs_positive_file_upload(setup_vaccs, import_records_page):
    import_records_page.import_vaccination_records(
        file_paths=test_data_file_paths.VACCS_POSITIVE,
        file_type=mavis_file_types.VACCS_MAVIS,
        session_id=setup_vaccs,
    )


@pytest.mark.vaccinations
@pytest.mark.order(352)
def test_vaccs_negative_file_upload(setup_vaccs, import_records_page):
    import_records_page.import_vaccination_records(
        file_paths=test_data_file_paths.VACCS_NEGATIVE,
        file_type=mavis_file_types.VACCS_MAVIS,
        session_id=setup_vaccs,
    )


@pytest.mark.vaccinations
@pytest.mark.order(353)
def test_vaccs_duplicate_record_upload(
    setup_vaccs, dashboard_page, import_records_page
):
    import_records_page.import_vaccination_records(
        file_paths=test_data_file_paths.VACCS_DUP_1,
        file_type=mavis_file_types.VACCS_MAVIS,
    )
    dashboard_page.go_to_dashboard()
    dashboard_page.click_import_records()
    import_records_page.import_vaccination_records(
        file_paths=test_data_file_paths.VACCS_DUP_2,
        file_type=mavis_file_types.VACCS_MAVIS,
    )


@pytest.mark.vaccinations
@pytest.mark.order(354)
def test_vaccs_file_structure(setup_vaccs, import_records_page):
    import_records_page.import_vaccination_records(
        file_paths=test_data_file_paths.VACCS_INVALID_STRUCTURE,
        file_type=mavis_file_types.VACCS_MAVIS,
    )


@pytest.mark.vaccinations
@pytest.mark.order(355)
def test_vaccs_no_record(setup_vaccs, import_records_page):
    import_records_page.import_vaccination_records(
        file_paths=test_data_file_paths.VACCS_HEADER_ONLY,
        file_type=mavis_file_types.VACCS_MAVIS,
    )


@pytest.mark.vaccinations
@pytest.mark.order(356)
def test_vaccs_empty_file(setup_vaccs, import_records_page):
    import_records_page.import_vaccination_records(
        file_paths=test_data_file_paths.VACCS_EMPTY_FILE,
        file_type=mavis_file_types.VACCS_MAVIS,
    )


@pytest.mark.vaccinations
@pytest.mark.order(357)
def test_vaccs_historic_positive_file_upload(setup_vaccs, import_records_page):
    import_records_page.import_vaccination_records(
        file_paths=test_data_file_paths.VACCS_HIST_POSITIVE,
        file_type=mavis_file_types.VACCS_MAVIS,
    )


@pytest.mark.vaccinations
@pytest.mark.order(358)
def test_vaccs_historic_negative_file_upload(setup_vaccs, import_records_page):
    import_records_page.import_vaccination_records(
        file_paths=test_data_file_paths.VACCS_HIST_NEGATIVE,
        file_type=mavis_file_types.VACCS_MAVIS,
    )


@pytest.mark.vaccinations
@pytest.mark.bug
@pytest.mark.order(359)
def test_vaccs_historic_no_urn_mav_855(
    setup_vaccs, dashboard_page, import_records_page
):
    import_records_page.import_vaccination_records(
        file_paths=test_data_file_paths.VACCS_HPV_MAV_855,
        file_type=mavis_file_types.VACCS_MAVIS,
    )
    dashboard_page.go_to_dashboard()
    dashboard_page.click_children()
    import_records_page.verify_mav_855()


@pytest.mark.vaccinations
@pytest.mark.order(360)
def test_vaccs_systmone_positive_file_upload(setup_vaccs_systmone, import_records_page):
    import_records_page.import_vaccination_records(
        file_paths=test_data_file_paths.VACCS_SYSTMONE_POSITIVE,
        file_type=mavis_file_types.VACCS_SYSTMONE,
    )


@pytest.mark.vaccinations
@pytest.mark.order(361)
def test_vaccs_systmone_negative_file_upload(setup_vaccs_systmone, import_records_page):
    import_records_page.import_vaccination_records(
        file_paths=test_data_file_paths.VACCS_SYSTMONE_NEGATIVE,
        file_type=mavis_file_types.VACCS_SYSTMONE,
    )


@pytest.mark.vaccinations
@pytest.mark.order(362)
def test_vaccs_systmone_negative_historical_file_upload(
    setup_vaccs_systmone, import_records_page
):
    import_records_page.import_vaccination_records(
        file_paths=test_data_file_paths.VACCS_SYSTMONE_HIST_NEGATIVE,
        file_type=mavis_file_types.VACCS_SYSTMONE,
    )


@pytest.mark.vaccinations
@pytest.mark.bug
@pytest.mark.order(363)
def test_vaccs_hpv_space_normalization(setup_vaccs, import_records_page):
    import_records_page.import_vaccination_records(
        file_paths=test_data_file_paths.VACCS_MAV_1080,
        verify_on_children_page=True,
        file_type=mavis_file_types.VACCS_MAVIS,
    )


@pytest.mark.vaccinations
@pytest.mark.bug
@pytest.mark.order(364)
def test_vaccs_systmone_space_normalization(setup_vaccs_systmone, import_records_page):
    import_records_page.import_vaccination_records(
        file_paths=test_data_file_paths.VACCS_SYSTMONE_MAV_1080,
        verify_on_children_page=False,
        file_type=mavis_file_types.VACCS_SYSTMONE,
    )
