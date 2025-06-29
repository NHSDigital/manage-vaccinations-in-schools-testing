import pytest

from mavis.test.data import ChildFileMapping, ClassFileMapping, VaccsFileMapping


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
        import_records_page.upload_and_verify_output(ClassFileMapping.SESSION_ID)
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
    import_records_page.upload_and_verify_output(ChildFileMapping.POSITIVE)


@pytest.mark.childlist
def test_child_list_file_upload_negative(setup_child_list, import_records_page):
    import_records_page.upload_and_verify_output(ChildFileMapping.NEGATIVE)


@pytest.mark.childlist
def test_child_list_file_structure(setup_child_list, import_records_page):
    import_records_page.upload_and_verify_output(ChildFileMapping.INVALID_STRUCTURE)


@pytest.mark.childlist
def test_child_list_no_record(setup_child_list, import_records_page):
    import_records_page.upload_and_verify_output(ChildFileMapping.HEADER_ONLY)


@pytest.mark.childlist
def test_child_list_empty_file(setup_child_list, import_records_page):
    import_records_page.upload_and_verify_output(ChildFileMapping.EMPTY_FILE)


@pytest.mark.childlist
@pytest.mark.bug
def test_child_list_space_normalization(
    setup_child_list, import_records_page, children_page, dashboard_page
):
    input_file, _ = import_records_page.upload_and_verify_output(
        ChildFileMapping.MAV_1080
    )
    dashboard_page.click_mavis()
    dashboard_page.click_children()
    children_page.verify_list_has_been_uploaded(input_file, is_vaccinations=False)


########################################### CLASS LIST ###########################################


@pytest.mark.classlist
def test_class_list_file_upload_positive(
    setup_class_list, schools, import_records_page
):
    import_records_page.navigate_to_class_list_record_import(str(schools[0]))
    import_records_page.upload_and_verify_output(ClassFileMapping.POSITIVE)


@pytest.mark.classlist
def test_class_list_file_upload_negative(
    setup_class_list, schools, import_records_page
):
    import_records_page.navigate_to_class_list_record_import(str(schools[0]))
    import_records_page.upload_and_verify_output(ClassFileMapping.NEGATIVE)


@pytest.mark.classlist
def test_class_list_file_structure(setup_class_list, schools, import_records_page):
    import_records_page.navigate_to_class_list_record_import(str(schools[0]))
    import_records_page.upload_and_verify_output(ClassFileMapping.INVALID_STRUCTURE)


@pytest.mark.classlist
def test_class_list_no_record(setup_class_list, schools, import_records_page):
    import_records_page.navigate_to_class_list_record_import(str(schools[0]))
    import_records_page.upload_and_verify_output(ClassFileMapping.HEADER_ONLY)


@pytest.mark.classlist
def test_class_list_empty_file(setup_class_list, schools, import_records_page):
    import_records_page.navigate_to_class_list_record_import(str(schools[0]))
    import_records_page.upload_and_verify_output(ClassFileMapping.EMPTY_FILE)


@pytest.mark.classlist
def test_class_list_year_group(setup_class_list, schools, import_records_page):
    import_records_page.navigate_to_class_list_record_import(str(schools[0]), [8])
    import_records_page.upload_and_verify_output(ClassFileMapping.YEAR_GROUP)


@pytest.mark.classlist
@pytest.mark.bug
def test_class_list_space_normalization(
    setup_class_list, schools, import_records_page, children_page, dashboard_page
):
    import_records_page.navigate_to_class_list_record_import(str(schools[0]))
    input_file, _ = import_records_page.upload_and_verify_output(
        ClassFileMapping.MAV_1080
    )
    dashboard_page.click_mavis()
    dashboard_page.click_children()
    children_page.verify_list_has_been_uploaded(input_file, is_vaccinations=False)


########################################### VACCINATIONS ###########################################


@pytest.mark.vaccinations
def test_vaccs_positive_file_upload(setup_vaccs, import_records_page):
    import_records_page.upload_and_verify_output(
        file_mapping=VaccsFileMapping.POSITIVE, session_id=setup_vaccs
    )


@pytest.mark.vaccinations
def test_vaccs_negative_file_upload(setup_vaccs, import_records_page):
    import_records_page.upload_and_verify_output(
        file_mapping=VaccsFileMapping.NEGATIVE, session_id=setup_vaccs
    )


@pytest.mark.vaccinations
def test_vaccs_duplicate_record_upload(
    setup_vaccs, dashboard_page, import_records_page
):
    import_records_page.upload_and_verify_output(
        VaccsFileMapping.DUP_1, session_id=setup_vaccs
    )
    dashboard_page.click_mavis()
    dashboard_page.click_import_records()
    import_records_page.navigate_to_vaccination_records_import()
    import_records_page.upload_and_verify_output(
        VaccsFileMapping.DUP_2, session_id=setup_vaccs
    )


@pytest.mark.vaccinations
def test_vaccs_file_structure(setup_vaccs, import_records_page):
    import_records_page.upload_and_verify_output(VaccsFileMapping.INVALID_STRUCTURE)


@pytest.mark.vaccinations
def test_vaccs_no_record(setup_vaccs, import_records_page):
    import_records_page.upload_and_verify_output(VaccsFileMapping.HEADER_ONLY)


@pytest.mark.vaccinations
def test_vaccs_empty_file(setup_vaccs, import_records_page):
    import_records_page.upload_and_verify_output(VaccsFileMapping.EMPTY_FILE)


@pytest.mark.vaccinations
def test_vaccs_historic_positive_file_upload(setup_vaccs, import_records_page):
    import_records_page.upload_and_verify_output(VaccsFileMapping.HIST_POSITIVE)


@pytest.mark.vaccinations
def test_vaccs_historic_negative_file_upload(setup_vaccs, import_records_page):
    import_records_page.upload_and_verify_output(VaccsFileMapping.HIST_NEGATIVE)


@pytest.mark.vaccinations
@pytest.mark.bug
def test_vaccs_historic_no_urn_mav_855(
    setup_vaccs, schools, dashboard_page, import_records_page, children_page, children
):
    child_name = str(children[0])

    import_records_page.upload_and_verify_output(VaccsFileMapping.MAV_855)
    dashboard_page.click_mavis()
    dashboard_page.click_children()

    children_page.search_for_a_child(child_name)
    children_page.click_record_for_child(child_name)
    children_page.click_vaccination_details(schools[0])
    children_page.expect_text_in_main(str(schools[0]))


@pytest.mark.vaccinations
def test_vaccs_systmone_positive_file_upload(setup_vaccs_systmone, import_records_page):
    import_records_page.upload_and_verify_output(VaccsFileMapping.SYSTMONE_POSITIVE)


@pytest.mark.vaccinations
def test_vaccs_systmone_negative_file_upload(setup_vaccs_systmone, import_records_page):
    import_records_page.upload_and_verify_output(VaccsFileMapping.SYSTMONE_NEGATIVE)


@pytest.mark.vaccinations
def test_vaccs_systmone_negative_historical_file_upload(
    setup_vaccs_systmone, import_records_page
):
    import_records_page.upload_and_verify_output(
        VaccsFileMapping.SYSTMONE_HIST_NEGATIVE
    )


@pytest.mark.vaccinations
@pytest.mark.bug
def test_vaccs_hpv_space_normalization(
    setup_vaccs, import_records_page, children_page, dashboard_page
):
    input_file, _ = import_records_page.upload_and_verify_output(
        VaccsFileMapping.MAV_1080, session_id=setup_vaccs
    )
    dashboard_page.click_mavis()
    dashboard_page.click_children()
    children_page.verify_list_has_been_uploaded(input_file, is_vaccinations=True)


@pytest.mark.vaccinations
@pytest.mark.bug
def test_vaccs_systmone_space_normalization(setup_vaccs_systmone, import_records_page):
    import_records_page.upload_and_verify_output(
        VaccsFileMapping.SYSTMONE_MAV_1080,
    )
