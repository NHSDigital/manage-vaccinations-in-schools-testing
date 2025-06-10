import pytest

from mavis.test.mavis_constants import Vaccine, mavis_file_types, test_data_file_paths


@pytest.fixture
def setup_child_list(log_in_as_nurse, dashboard_page, import_records_page):
    dashboard_page.click_import_records()
    import_records_page.navigate_to_child_record_import()


@pytest.fixture
def setup_class_list(
    log_in_as_nurse, schools, dashboard_page, sessions_page, import_records_page
):
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
        import_records_page.navigate_to_class_list_import()
        import_records_page.upload_and_verify_output(
            test_data_file_paths.CLASS_SESSION_ID
        )
        sessions_page.click_location(schools[0])
        session_id = sessions_page.get_session_id_from_offline_excel()
        dashboard_page.click_mavis()
        dashboard_page.click_import_records()
        import_records_page.navigate_to_vaccination_records_import()
        yield session_id
    finally:
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(schools[0])


@pytest.fixture
def setup_vaccs_systmone(
    log_in_as_nurse, schools, dashboard_page, sessions_page, import_records_page
):
    try:
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session(schools[0], for_today=True)
        dashboard_page.click_mavis()
        dashboard_page.click_import_records()
        import_records_page.navigate_to_vaccination_records_import()
        yield
    finally:
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(schools[0])


########################################### CHILD LIST ###########################################
@pytest.mark.childlist
def test_child_list_file_upload_positive(setup_child_list, import_records_page):
    import_records_page.upload_and_verify_output(test_data_file_paths.CHILD_POSITIVE)


@pytest.mark.childlist
def test_child_list_file_upload_negative(setup_child_list, import_records_page):
    import_records_page.upload_and_verify_output(test_data_file_paths.CHILD_NEGATIVE)


@pytest.mark.childlist
def test_child_list_file_structure(setup_child_list, import_records_page):
    import_records_page.upload_and_verify_output(
        test_data_file_paths.CHILD_INVALID_STRUCTURE
    )


@pytest.mark.childlist
def test_child_list_no_record(setup_child_list, import_records_page):
    import_records_page.upload_and_verify_output(test_data_file_paths.CHILD_HEADER_ONLY)


@pytest.mark.childlist
def test_child_list_empty_file(setup_child_list, import_records_page):
    import_records_page.upload_and_verify_output(test_data_file_paths.CHILD_EMPTY_FILE)


@pytest.mark.childlist
@pytest.mark.bug
def test_child_list_space_normalization(
    setup_child_list, import_records_page, children_page, dashboard_page
):
    input_file, _ = import_records_page.upload_and_verify_output(
        test_data_file_paths.CHILD_MAV_1080
    )
    dashboard_page.click_mavis()
    dashboard_page.click_children()
    children_page.verify_list_has_been_uploaded(input_file)


########################################### CLASS LIST ###########################################


@pytest.mark.classlist
def test_class_list_file_upload_positive(
    setup_class_list, schools, import_records_page
):
    import_records_page.navigate_to_class_list_record_import(str(schools[0]))
    import_records_page.upload_and_verify_output(test_data_file_paths.CLASS_POSITIVE)


@pytest.mark.classlist
def test_class_list_file_upload_negative(
    setup_class_list, schools, import_records_page
):
    import_records_page.navigate_to_class_list_record_import(str(schools[0]))
    import_records_page.upload_and_verify_output(test_data_file_paths.CLASS_NEGATIVE)


@pytest.mark.classlist
def test_class_list_file_structure(setup_class_list, schools, import_records_page):
    import_records_page.navigate_to_class_list_record_import(str(schools[0]))
    import_records_page.upload_and_verify_output(
        test_data_file_paths.CLASS_INVALID_STRUCTURE
    )


@pytest.mark.classlist
def test_class_list_no_record(setup_class_list, schools, import_records_page):
    import_records_page.navigate_to_class_list_record_import(str(schools[0]))
    import_records_page.upload_and_verify_output(test_data_file_paths.CLASS_HEADER_ONLY)


@pytest.mark.classlist
def test_class_list_empty_file(setup_class_list, schools, import_records_page):
    import_records_page.navigate_to_class_list_record_import(str(schools[0]))
    import_records_page.upload_and_verify_output(test_data_file_paths.CLASS_EMPTY_FILE)


@pytest.mark.classlist
def test_class_list_year_group(setup_class_list, schools, import_records_page):
    import_records_page.navigate_to_class_list_record_import(str(schools[0]), [8])
    import_records_page.upload_and_verify_output(test_data_file_paths.CLASS_YEAR_GROUP)


@pytest.mark.classlist
@pytest.mark.bug
def test_class_list_space_normalization(
    setup_class_list, schools, import_records_page, children_page, dashboard_page
):
    import_records_page.navigate_to_class_list_record_import(str(schools[0]))
    input_file, _ = import_records_page.upload_and_verify_output(
        test_data_file_paths.CLASS_MAV_1080
    )
    dashboard_page.click_mavis()
    dashboard_page.click_children()
    children_page.verify_list_has_been_uploaded(input_file)


########################################### VACCINATIONS ###########################################


@pytest.mark.vaccinations
def test_vaccs_positive_file_upload(setup_vaccs, import_records_page):
    import_records_page.upload_and_verify_output(
        file_paths=test_data_file_paths.VACCS_POSITIVE, session_id=setup_vaccs
    )


@pytest.mark.vaccinations
def test_vaccs_negative_file_upload(setup_vaccs, import_records_page):
    import_records_page.upload_and_verify_output(
        file_paths=test_data_file_paths.VACCS_NEGATIVE, session_id=setup_vaccs
    )


@pytest.mark.vaccinations
def test_vaccs_duplicate_record_upload(
    setup_vaccs, dashboard_page, import_records_page
):
    import_records_page.upload_and_verify_output(
        file_paths=test_data_file_paths.VACCS_DUP_1
    )
    dashboard_page.click_mavis()
    dashboard_page.click_import_records()
    import_records_page.navigate_to_vaccination_records_import()
    import_records_page.upload_and_verify_output(
        file_paths=test_data_file_paths.VACCS_DUP_2,
    )


@pytest.mark.vaccinations
def test_vaccs_file_structure(setup_vaccs, import_records_page):
    import_records_page.upload_and_verify_output(
        file_paths=test_data_file_paths.VACCS_INVALID_STRUCTURE
    )


@pytest.mark.vaccinations
def test_vaccs_no_record(setup_vaccs, import_records_page):
    import_records_page.upload_and_verify_output(
        file_paths=test_data_file_paths.VACCS_HEADER_ONLY
    )


@pytest.mark.vaccinations
def test_vaccs_empty_file(setup_vaccs, import_records_page):
    import_records_page.upload_and_verify_output(
        file_paths=test_data_file_paths.VACCS_EMPTY_FILE
    )


@pytest.mark.vaccinations
def test_vaccs_historic_positive_file_upload(setup_vaccs, import_records_page):
    import_records_page.upload_and_verify_output(
        file_paths=test_data_file_paths.VACCS_HIST_POSITIVE
    )


@pytest.mark.vaccinations
def test_vaccs_historic_negative_file_upload(setup_vaccs, import_records_page):
    import_records_page.upload_and_verify_output(
        file_paths=test_data_file_paths.VACCS_HIST_NEGATIVE
    )


@pytest.mark.vaccinations
@pytest.mark.bug
def test_vaccs_historic_no_urn_mav_855(
    setup_vaccs, schools, dashboard_page, import_records_page, children_page
):
    mav_855_child = "MAV_855, MAV_855"
    import_records_page.upload_and_verify_output(
        file_paths=test_data_file_paths.VACCS_HPV_MAV_855,
    )
    dashboard_page.click_mavis()
    dashboard_page.click_children()
    children_page.search_for_a_child(mav_855_child)
    children_page.click_record_for_child(mav_855_child)
    children_page.click_vaccination_details(Vaccine.GARDASIL_9)
    children_page.expect_text_in_main(str(schools[0]))


@pytest.mark.vaccinations
def test_vaccs_systmone_positive_file_upload(setup_vaccs_systmone, import_records_page):
    import_records_page.upload_and_verify_output(
        file_paths=test_data_file_paths.VACCS_SYSTMONE_POSITIVE
    )


@pytest.mark.vaccinations
def test_vaccs_systmone_negative_file_upload(setup_vaccs_systmone, import_records_page):
    import_records_page.upload_and_verify_output(
        file_paths=test_data_file_paths.VACCS_SYSTMONE_NEGATIVE
    )


@pytest.mark.vaccinations
def test_vaccs_systmone_negative_historical_file_upload(
    setup_vaccs_systmone, import_records_page
):
    import_records_page.upload_and_verify_output(
        file_paths=test_data_file_paths.VACCS_SYSTMONE_HIST_NEGATIVE
    )


@pytest.mark.vaccinations
@pytest.mark.bug
def test_vaccs_hpv_space_normalization(
    setup_vaccs, import_records_page, children_page, dashboard_page
):
    input_file, _ = import_records_page.upload_and_verify_output(
        file_paths=test_data_file_paths.VACCS_MAV_1080,
    )
    dashboard_page.click_mavis()
    dashboard_page.click_children()
    children_page.verify_list_has_been_uploaded(
        input_file,
        mavis_file_types.VACCS_MAVIS,
    )


@pytest.mark.vaccinations
@pytest.mark.bug
def test_vaccs_systmone_space_normalization(setup_vaccs_systmone, import_records_page):
    import_records_page.upload_and_verify_output(
        file_paths=test_data_file_paths.VACCS_SYSTMONE_MAV_1080,
    )
