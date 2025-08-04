import pytest

from mavis.test.annotations import issue
from mavis.test.data import ChildFileMapping, ClassFileMapping, VaccsFileMapping
from mavis.test.models import Programme


@pytest.fixture
def setup_child_list(log_in_as_nurse, dashboard_page, import_records_page):
    dashboard_page.click_import_records()
    import_records_page.navigate_to_child_record_import()


@pytest.fixture
def setup_class_list(
    log_in_as_nurse,
    schools,
    dashboard_page,
    sessions_page,
    import_records_page,
):
    school = schools[Programme.HPV][0]
    try:
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session(school, Programme.HPV)
        dashboard_page.click_mavis()
        dashboard_page.click_import_records()
        yield
    finally:
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(school)


@pytest.fixture
def setup_vaccs(
    log_in_as_nurse,
    schools,
    dashboard_page,
    sessions_page,
    import_records_page,
):
    school = schools[Programme.HPV][0]
    try:
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session(school, Programme.HPV, for_today=True)
        sessions_page.click_import_class_lists()
        sessions_page.select_year_groups_for_programme(Programme.HPV)
        import_records_page.upload_and_verify_output(
            ClassFileMapping.RANDOM_CHILD_YEAR_9
        )
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.click_session_for_programme_group(school, Programme.HPV)
        session_id = sessions_page.get_session_id_from_offline_excel()
        dashboard_page.click_mavis()
        dashboard_page.click_import_records()
        import_records_page.navigate_to_vaccination_records_import()
        yield session_id
    finally:
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(school)


@pytest.fixture
def setup_vaccs_clinic(
    log_in_as_nurse,
    schools,
    dashboard_page,
    sessions_page,
    import_records_page,
):
    school = schools[Programme.HPV][0]
    try:
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session(
            "Community clinic", Programme.HPV, for_today=True
        )
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session(school, Programme.HPV, for_today=True)
        sessions_page.click_import_class_lists()
        sessions_page.select_year_groups_for_programme(Programme.HPV)
        import_records_page.upload_and_verify_output(
            ClassFileMapping.RANDOM_CHILD_YEAR_9
        )
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.click_session_for_programme_group(
            "Community clinic", Programme.HPV
        )
        session_id = sessions_page.get_session_id_from_offline_excel()
        dashboard_page.click_mavis()
        dashboard_page.click_import_records()
        import_records_page.navigate_to_vaccination_records_import()
        yield session_id
    finally:
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions("Community clinic")


@pytest.fixture
def setup_vaccs_systmone(
    log_in_as_nurse,
    schools,
    dashboard_page,
    sessions_page,
    import_records_page,
):
    school = schools[Programme.HPV][0]
    try:
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session(school, Programme.HPV, for_today=True)
        dashboard_page.click_mavis()
        dashboard_page.click_import_records()
        import_records_page.navigate_to_vaccination_records_import()
        yield
    finally:
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(school)


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
        ChildFileMapping.WHITESPACE
    )
    dashboard_page.click_mavis()
    dashboard_page.click_children()
    children_page.verify_list_has_been_uploaded(input_file, is_vaccinations=False)


########################################### CLASS LIST ###########################################


@pytest.mark.classlist
def test_class_list_file_upload_positive(
    setup_class_list, schools, import_records_page
):
    school = schools["doubles"][0]
    import_records_page.navigate_to_class_list_record_import(str(school))
    import_records_page.upload_and_verify_output(
        ClassFileMapping.POSITIVE, programme_group="doubles"
    )


@pytest.mark.classlist
def test_class_list_file_upload_negative(
    setup_class_list, schools, import_records_page
):
    school = schools["doubles"][0]
    import_records_page.navigate_to_class_list_record_import(str(school))
    import_records_page.upload_and_verify_output(
        ClassFileMapping.NEGATIVE, programme_group="doubles"
    )


@pytest.mark.classlist
def test_class_list_file_structure(setup_class_list, schools, import_records_page):
    school = schools["doubles"][0]
    import_records_page.navigate_to_class_list_record_import(str(school))
    import_records_page.upload_and_verify_output(
        ClassFileMapping.INVALID_STRUCTURE, programme_group="doubles"
    )


@pytest.mark.classlist
def test_class_list_no_record(setup_class_list, schools, import_records_page):
    school = schools["doubles"][0]
    import_records_page.navigate_to_class_list_record_import(str(school))
    import_records_page.upload_and_verify_output(
        ClassFileMapping.HEADER_ONLY, programme_group="doubles"
    )


@pytest.mark.classlist
def test_class_list_empty_file(setup_class_list, schools, import_records_page):
    school = schools["doubles"][0]
    import_records_page.navigate_to_class_list_record_import(str(school))
    import_records_page.upload_and_verify_output(
        ClassFileMapping.EMPTY_FILE, programme_group="doubles"
    )


@pytest.mark.classlist
def test_class_list_year_group(setup_class_list, schools, import_records_page):
    school = schools["doubles"][0]
    import_records_page.navigate_to_class_list_record_import(str(school), [9])
    import_records_page.upload_and_verify_output(
        ClassFileMapping.WRONG_YEAR_GROUP, programme_group="doubles"
    )


@pytest.mark.classlist
@pytest.mark.bug
def test_class_list_space_normalization(
    setup_class_list, schools, import_records_page, children_page, dashboard_page
):
    school = schools["doubles"][0]
    import_records_page.navigate_to_class_list_record_import(str(school))
    input_file, _ = import_records_page.upload_and_verify_output(
        ClassFileMapping.WHITESPACE, programme_group="doubles"
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


@issue("MAV-855")
@pytest.mark.vaccinations
@pytest.mark.bug
def test_vaccs_historic_no_urn_mav_855(
    setup_vaccs, schools, dashboard_page, import_records_page, children_page, children
):
    child = children[Programme.HPV][0]
    school = schools[Programme.HPV][0]

    import_records_page.upload_and_verify_output(VaccsFileMapping.NO_CARE_SETTING)
    dashboard_page.click_mavis()
    dashboard_page.click_children()

    children_page.search_for_a_child_name(str(child))
    children_page.click_record_for_child(child)
    children_page.click_vaccination_details(school)
    children_page.expect_text_in_main(str(school))


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
        VaccsFileMapping.WHITESPACE, session_id=setup_vaccs
    )
    dashboard_page.click_mavis()
    dashboard_page.click_children()
    children_page.verify_list_has_been_uploaded(input_file, is_vaccinations=True)


@pytest.mark.vaccinations
@pytest.mark.bug
def test_vaccs_systmone_space_normalization(setup_vaccs_systmone, import_records_page):
    import_records_page.upload_and_verify_output(
        VaccsFileMapping.SYSTMONE_WHITESPACE,
    )


@issue("MAV-1547")
@pytest.mark.vaccinations
@pytest.mark.bug
def test_vaccs_nivs_disallow_flu_for_previous_years(setup_vaccs, import_records_page):
    import_records_page.upload_and_verify_output(
        VaccsFileMapping.HIST_FLU_NIVS, session_id=setup_vaccs
    )


@issue("MAV-1599")
@pytest.mark.vaccinations
@pytest.mark.bug
def test_vaccs_systmone_disallow_flu_for_previous_years(
    setup_vaccs_systmone, import_records_page
):
    import_records_page.upload_and_verify_output(
        VaccsFileMapping.HIST_FLU_SYSTMONE, session_id=setup_vaccs_systmone
    )


@issue("MAV-691")
@pytest.mark.vaccinations
@pytest.mark.bug
def test_vaccs_community_clinic_name_case(setup_vaccs_clinic, import_records_page):
    import_records_page.upload_and_verify_output(VaccsFileMapping.CLINIC_NAME_CASE)
