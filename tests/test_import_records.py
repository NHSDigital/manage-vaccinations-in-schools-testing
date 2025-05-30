import pytest

from mavis.test.mavis_constants import mavis_file_types, test_data_file_paths


@pytest.fixture
def setup_child_list(log_in_as_nurse, dashboard_page):
    dashboard_page.click_import_records()


@pytest.fixture
def setup_class_list(log_in_as_nurse, schools, dashboard_page, sessions_page):
    try:
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session(schools[0])
        dashboard_page.click_mavis()
        dashboard_page.click_import_records()
        yield
    finally:
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(schools[0])


@pytest.fixture
def setup_vaccs(
    log_in_as_nurse, schools, dashboard_page, sessions_page, import_records_page
):
    try:
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session(schools[0], for_today=True)
        import_records_page.import_class_list_records_from_school_session(
            file_paths=test_data_file_paths.CLASS_SESSION_ID
        )
        sessions_page.click_location(schools[0])
        session_id = sessions_page.get_session_id_from_offline_excel()
        dashboard_page.click_mavis()
        dashboard_page.click_import_records()
        yield session_id
    finally:
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(schools[0])


@pytest.fixture
def setup_vaccs_systmone(log_in_as_nurse, schools, dashboard_page, sessions_page):
    try:
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session(schools[0], for_today=True)
        dashboard_page.click_mavis()
        dashboard_page.click_import_records()
        yield
    finally:
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(schools[0])


########################################### CHILD LIST ###########################################
@pytest.mark.childlist
def test_child_list_file_upload_positive(setup_child_list, import_records_page):
    import_records_page.import_child_records(
        file_paths=test_data_file_paths.CHILD_POSITIVE
    )


@pytest.mark.childlist
def test_child_list_file_upload_negative(setup_child_list, import_records_page):
    import_records_page.import_child_records(
        file_paths=test_data_file_paths.CHILD_NEGATIVE
    )


@pytest.mark.childlist
def test_child_list_file_structure(setup_child_list, import_records_page):
    import_records_page.import_child_records(
        file_paths=test_data_file_paths.CHILD_INVALID_STRUCTURE
    )


@pytest.mark.childlist
def test_child_list_no_record(setup_child_list, import_records_page):
    import_records_page.import_child_records(
        file_paths=test_data_file_paths.CHILD_HEADER_ONLY
    )


@pytest.mark.childlist
def test_child_list_empty_file(setup_child_list, import_records_page):
    import_records_page.import_child_records(
        file_paths=test_data_file_paths.CHILD_EMPTY_FILE
    )


@pytest.mark.childlist
@pytest.mark.bug
def test_child_list_space_normalization(setup_child_list, import_records_page):
    import_records_page.import_child_records(
        file_paths=test_data_file_paths.CHILD_MAV_1080, verify_on_children_page=True
    )


########################################### CLASS LIST ###########################################


@pytest.mark.classlist
def test_class_list_file_upload_positive(
    setup_class_list, schools, import_records_page
):
    import_records_page.import_class_list_records(
        schools[0], test_data_file_paths.CLASS_POSITIVE
    )


@pytest.mark.classlist
def test_class_list_file_upload_negative(
    setup_class_list, schools, import_records_page
):
    import_records_page.import_class_list_records(
        schools[0], test_data_file_paths.CLASS_NEGATIVE
    )


@pytest.mark.classlist
def test_class_list_file_structure(setup_class_list, schools, import_records_page):
    import_records_page.import_class_list_records(
        schools[0], test_data_file_paths.CLASS_INVALID_STRUCTURE
    )


@pytest.mark.classlist
def test_class_list_no_record(setup_class_list, schools, import_records_page):
    import_records_page.import_class_list_records(
        schools[0], test_data_file_paths.CLASS_HEADER_ONLY
    )


@pytest.mark.classlist
def test_class_list_empty_file(setup_class_list, schools, import_records_page):
    import_records_page.import_class_list_records(
        schools[0], test_data_file_paths.CLASS_EMPTY_FILE
    )


@pytest.mark.classlist
def test_class_list_year_group(setup_class_list, schools, import_records_page):
    import_records_page.import_class_list_records(
        schools[0],
        test_data_file_paths.CLASS_YEAR_GROUP,
        year_groups=[8],
    )


@pytest.mark.classlist
@pytest.mark.bug
def test_class_list_space_normalization(setup_class_list, schools, import_records_page):
    import_records_page.import_class_list_records(
        schools[0], test_data_file_paths.CLASS_MAV_1080, verify_on_children_page=True
    )


########################################### VACCINATIONS ###########################################


@pytest.mark.vaccinations
def test_vaccs_positive_file_upload(setup_vaccs, import_records_page):
    import_records_page.import_vaccination_records(
        file_paths=test_data_file_paths.VACCS_POSITIVE,
        file_type=mavis_file_types.VACCS_MAVIS,
        session_id=setup_vaccs,
    )


@pytest.mark.vaccinations
def test_vaccs_negative_file_upload(setup_vaccs, import_records_page):
    import_records_page.import_vaccination_records(
        file_paths=test_data_file_paths.VACCS_NEGATIVE,
        file_type=mavis_file_types.VACCS_MAVIS,
        session_id=setup_vaccs,
    )


@pytest.mark.vaccinations
def test_vaccs_duplicate_record_upload(
    setup_vaccs, dashboard_page, import_records_page
):
    import_records_page.import_vaccination_records(
        file_paths=test_data_file_paths.VACCS_DUP_1,
        file_type=mavis_file_types.VACCS_MAVIS,
    )
    dashboard_page.click_mavis()
    dashboard_page.click_import_records()
    import_records_page.import_vaccination_records(
        file_paths=test_data_file_paths.VACCS_DUP_2,
        file_type=mavis_file_types.VACCS_MAVIS,
    )


@pytest.mark.vaccinations
def test_vaccs_file_structure(setup_vaccs, import_records_page):
    import_records_page.import_vaccination_records(
        file_paths=test_data_file_paths.VACCS_INVALID_STRUCTURE,
        file_type=mavis_file_types.VACCS_MAVIS,
    )


@pytest.mark.vaccinations
def test_vaccs_no_record(setup_vaccs, import_records_page):
    import_records_page.import_vaccination_records(
        file_paths=test_data_file_paths.VACCS_HEADER_ONLY,
        file_type=mavis_file_types.VACCS_MAVIS,
    )


@pytest.mark.vaccinations
def test_vaccs_empty_file(setup_vaccs, import_records_page):
    import_records_page.import_vaccination_records(
        file_paths=test_data_file_paths.VACCS_EMPTY_FILE,
        file_type=mavis_file_types.VACCS_MAVIS,
    )


@pytest.mark.vaccinations
def test_vaccs_historic_positive_file_upload(setup_vaccs, import_records_page):
    import_records_page.import_vaccination_records(
        file_paths=test_data_file_paths.VACCS_HIST_POSITIVE,
        file_type=mavis_file_types.VACCS_MAVIS,
    )


@pytest.mark.vaccinations
def test_vaccs_historic_negative_file_upload(setup_vaccs, import_records_page):
    import_records_page.import_vaccination_records(
        file_paths=test_data_file_paths.VACCS_HIST_NEGATIVE,
        file_type=mavis_file_types.VACCS_MAVIS,
    )


@pytest.mark.vaccinations
@pytest.mark.bug
def test_vaccs_historic_no_urn_mav_855(
    setup_vaccs, schools, dashboard_page, import_records_page
):
    import_records_page.import_vaccination_records(
        file_paths=test_data_file_paths.VACCS_HPV_MAV_855,
        file_type=mavis_file_types.VACCS_MAVIS,
    )
    dashboard_page.click_mavis()
    dashboard_page.click_children()
    import_records_page.verify_mav_855(schools[0])


@pytest.mark.vaccinations
def test_vaccs_systmone_positive_file_upload(setup_vaccs_systmone, import_records_page):
    import_records_page.import_vaccination_records(
        file_paths=test_data_file_paths.VACCS_SYSTMONE_POSITIVE,
        file_type=mavis_file_types.VACCS_SYSTMONE,
    )


@pytest.mark.vaccinations
def test_vaccs_systmone_negative_file_upload(setup_vaccs_systmone, import_records_page):
    import_records_page.import_vaccination_records(
        file_paths=test_data_file_paths.VACCS_SYSTMONE_NEGATIVE,
        file_type=mavis_file_types.VACCS_SYSTMONE,
    )


@pytest.mark.vaccinations
def test_vaccs_systmone_negative_historical_file_upload(
    setup_vaccs_systmone, import_records_page
):
    import_records_page.import_vaccination_records(
        file_paths=test_data_file_paths.VACCS_SYSTMONE_HIST_NEGATIVE,
        file_type=mavis_file_types.VACCS_SYSTMONE,
    )


@pytest.mark.vaccinations
@pytest.mark.bug
def test_vaccs_hpv_space_normalization(setup_vaccs, import_records_page):
    import_records_page.import_vaccination_records(
        file_paths=test_data_file_paths.VACCS_MAV_1080,
        verify_on_children_page=True,
        file_type=mavis_file_types.VACCS_MAVIS,
    )


@pytest.mark.vaccinations
@pytest.mark.bug
def test_vaccs_systmone_space_normalization(setup_vaccs_systmone, import_records_page):
    import_records_page.import_vaccination_records(
        file_paths=test_data_file_paths.VACCS_SYSTMONE_MAV_1080,
        verify_on_children_page=False,
        file_type=mavis_file_types.VACCS_SYSTMONE,
    )
