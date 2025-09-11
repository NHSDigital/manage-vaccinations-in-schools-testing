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
        sessions_page.click_session_for_programme_group(school, Programme.HPV)
        sessions_page.schedule_a_valid_session()
        dashboard_page.click_mavis()
        dashboard_page.click_import_records()
        yield
    finally:
        dashboard_page.navigate()
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
    year_groups,
):
    school = schools[Programme.HPV][0]
    year_group = year_groups[Programme.HPV]

    try:
        dashboard_page.click_sessions()
        sessions_page.ensure_session_scheduled_for_today(school, Programme.HPV)
        sessions_page.click_import_class_lists()
        import_records_page.import_class_list(ClassFileMapping.RANDOM_CHILD, year_group)
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.click_session_for_programme_group(school, Programme.HPV)
        session_id = sessions_page.get_session_id_from_offline_excel()
        dashboard_page.click_mavis()
        dashboard_page.click_import_records()
        import_records_page.navigate_to_vaccination_records_import()
        yield session_id
    finally:
        dashboard_page.navigate()
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
    year_groups,
):
    school = schools[Programme.HPV][0]
    year_group = year_groups[Programme.HPV]

    try:
        dashboard_page.click_sessions()
        sessions_page.ensure_session_scheduled_for_today(school, Programme.HPV)
        sessions_page.click_import_class_lists()
        import_records_page.import_class_list(ClassFileMapping.RANDOM_CHILD, year_group)
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.click_session_for_programme_group(school, Programme.HPV)
        session_id = sessions_page.get_session_id_from_offline_excel()
        dashboard_page.click_mavis()
        dashboard_page.click_import_records()
        import_records_page.navigate_to_vaccination_records_import()
        yield session_id
    finally:
        dashboard_page.navigate()
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(school)


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
        sessions_page.ensure_session_scheduled_for_today(school, Programme.HPV)
        dashboard_page.click_mavis()
        dashboard_page.click_import_records()
        import_records_page.navigate_to_vaccination_records_import()
        yield
    finally:
        dashboard_page.navigate()
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(school)


################################# CHILD LIST #################################


@pytest.mark.childlist
def test_child_list_file_upload_valid_data(setup_child_list, import_records_page):
    """
    Test: Upload a valid child list file and verify successful import.
    Steps:
    1. Navigate to child record import page.
    2. Upload a valid child list file.
    Verification:
    - Output indicates successful import of records.
    """
    import_records_page.upload_and_verify_output(ChildFileMapping.POSITIVE)


@pytest.mark.childlist
def test_child_list_file_upload_invalid_data(setup_child_list, import_records_page):
    """
    Test: Upload an invalid child list file and verify error handling.
    Steps:
    1. Navigate to child record import page.
    2. Upload a child list file with invalid data.
    Verification:
    - Output lists errors as expected for each record
    """
    import_records_page.upload_and_verify_output(ChildFileMapping.NEGATIVE)


@pytest.mark.childlist
def test_child_list_file_upload_invalid_structure(
    setup_child_list,
    import_records_page,
):
    """
    Test: Upload a child list file with invalid structure and verify error handling.
    Steps:
    1. Navigate to child record import page.
    2. Upload a file with incorrect structure.
    Verification:
    - Output indicates structural errors.
    """
    import_records_page.upload_and_verify_output(ChildFileMapping.INVALID_STRUCTURE)


@pytest.mark.childlist
def test_child_list_file_upload_header_only(setup_child_list, import_records_page):
    """
    Test: Upload a child list file with only headers and verify no records are imported.
    Steps:
    1. Navigate to child record import page.
    2. Upload a header-only file.
    Verification:
    - Output indicates no records imported.
    """
    import_records_page.upload_and_verify_output(ChildFileMapping.HEADER_ONLY)


@pytest.mark.childlist
def test_child_list_file_upload_empty_file(setup_child_list, import_records_page):
    """
    Test: Upload an empty child list file and verify error handling.
    Steps:
    1. Navigate to child record import page.
    2. Upload an empty file.
    Verification:
    - Output indicates error or no records imported.
    """
    import_records_page.upload_and_verify_output(ChildFileMapping.EMPTY_FILE)


@pytest.mark.childlist
@pytest.mark.bug
def test_child_list_file_upload_whitespace_normalization(
    setup_child_list,
    import_records_page,
    children_page,
    dashboard_page,
):
    """
    Test: Upload a child list file with extra whitespace and verify normalization.
    Steps:
    1. Upload a file with whitespace issues.
    2. Navigate to children page.
    3. Verify the list is normalized and imported correctly.
    Verification:
    - Imported list matches expected normalized data.
    """
    input_file, _ = import_records_page.upload_and_verify_output(
        ChildFileMapping.WHITESPACE,
    )
    dashboard_page.click_mavis()
    dashboard_page.click_children()
    children_page.verify_list_has_been_uploaded(input_file, is_vaccinations=False)


######################### CLASS LIST ###########################


@pytest.mark.classlist
def test_class_list_file_upload_valid_data(
    setup_class_list,
    schools,
    import_records_page,
    year_groups,
):
    """
    Test: Upload a valid class list file and verify successful import.
    Steps:
    1. Navigate to class list import page for the correct school and year group.
    2. Upload a valid class list file.
    Verification:
    - Output indicates successful import of records.
    """
    school = schools["doubles"][0]
    year_group = year_groups["doubles"]

    import_records_page.navigate_to_class_list_record_import(str(school), year_group)
    import_records_page.upload_and_verify_output(
        ClassFileMapping.POSITIVE,
        programme_group="doubles",
    )


@pytest.mark.classlist
def test_class_list_file_upload_invalid_data(
    setup_class_list,
    schools,
    import_records_page,
    year_groups,
):
    """
    Test: Upload an invalid class list file and verify error handling.
    Steps:
    1. Navigate to class list import page for the correct school and year group.
    2. Upload a class list file with invalid data.
    Verification:
    - Output lists errors as expected for each record
    """
    school = schools["doubles"][0]
    year_group = year_groups["doubles"]

    import_records_page.navigate_to_class_list_record_import(str(school), year_group)
    import_records_page.upload_and_verify_output(
        ClassFileMapping.NEGATIVE,
        programme_group="doubles",
    )


@pytest.mark.classlist
def test_class_list_file_upload_invalid_structure(
    setup_class_list,
    schools,
    import_records_page,
    year_groups,
):
    """
    Test: Upload a class list file with invalid structure and verify error handling.
    Steps:
    1. Navigate to class list import page for the correct school and year group.
    2. Upload a file with incorrect structure.
    Verification:
    - Output indicates structural errors.
    """
    school = schools["doubles"][0]
    year_group = year_groups["doubles"]

    import_records_page.navigate_to_class_list_record_import(str(school), year_group)
    import_records_page.upload_and_verify_output(
        ClassFileMapping.INVALID_STRUCTURE,
        programme_group="doubles",
    )


@pytest.mark.classlist
def test_class_list_file_upload_header_only(
    setup_class_list,
    schools,
    import_records_page,
    year_groups,
):
    """
    Test: Upload a class list file with only headers and verify no
       records are imported.
    Steps:
    1. Navigate to class list import page for the correct school and year group.
    2. Upload a header-only file.
    Verification:
    - Output indicates no records imported.
    """
    school = schools["doubles"][0]
    year_group = year_groups["doubles"]

    import_records_page.navigate_to_class_list_record_import(str(school), year_group)
    import_records_page.upload_and_verify_output(
        ClassFileMapping.HEADER_ONLY,
        programme_group="doubles",
    )


@pytest.mark.classlist
def test_class_list_file_upload_empty_file(
    setup_class_list,
    schools,
    import_records_page,
    year_groups,
):
    """
    Test: Upload an empty class list file and verify error handling.
    Steps:
    1. Navigate to class list import page for the correct school and year group.
    2. Upload an empty file.
    Verification:
    - Output indicates error or no records imported.
    """
    school = schools["doubles"][0]
    year_group = year_groups["doubles"]

    import_records_page.navigate_to_class_list_record_import(str(school), year_group)
    import_records_page.upload_and_verify_output(
        ClassFileMapping.EMPTY_FILE,
        programme_group="doubles",
    )


@pytest.mark.classlist
def test_class_list_file_upload_wrong_year_group(
    setup_class_list,
    schools,
    import_records_page,
    year_groups,
):
    """
    Test: Upload a class list file with the wrong year group and verify error handling.
    Steps:
    1. Navigate to class list import page for the correct school and year group.
    2. Upload a file with an incorrect year group.
    Verification:
    - Output indicates year group mismatch or error.
    """
    school = schools["doubles"][0]
    year_group = year_groups["doubles"]

    import_records_page.navigate_to_class_list_record_import(str(school), year_group)
    import_records_page.upload_and_verify_output(
        ClassFileMapping.WRONG_YEAR_GROUP,
        programme_group="doubles",
    )


@pytest.mark.classlist
@pytest.mark.bug
def test_class_list_file_upload_whitespace_normalization(
    setup_class_list,
    schools,
    import_records_page,
    children_page,
    dashboard_page,
    year_groups,
):
    """
    Test: Upload a class list file with extra whitespace and verify normalization.
    Steps:
    1. Upload a file with whitespace issues.
    2. Navigate to children page.
    3. Verify the list is normalized and imported correctly.
    Verification:
    - Imported list matches expected normalized data.
    """
    school = schools["doubles"][0]
    year_group = year_groups["doubles"]

    import_records_page.navigate_to_class_list_record_import(str(school), year_group)
    input_file, _ = import_records_page.upload_and_verify_output(
        ClassFileMapping.WHITESPACE,
        programme_group="doubles",
    )
    dashboard_page.click_mavis()
    dashboard_page.click_children()
    children_page.verify_list_has_been_uploaded(input_file, is_vaccinations=False)


############################ VACCINATIONS ##############################


@pytest.mark.vaccinations
def test_vaccination_file_upload_valid_data(setup_vaccs, import_records_page):
    """
    Test: Upload a valid vaccination records file and verify successful import.
    Steps:
    1. Navigate to vaccination records import page.
    2. Upload a valid vaccination file.
    Verification:
    - Output indicates successful import of records.
    """
    import_records_page.upload_and_verify_output(
        file_mapping=VaccsFileMapping.POSITIVE,
        session_id=setup_vaccs,
    )


@pytest.mark.vaccinations
def test_vaccination_file_upload_invalid_data(setup_vaccs, import_records_page):
    """
    Test: Upload an invalid vaccination records file and verify error handling.
    Steps:
    1. Navigate to vaccination records import page.
    2. Upload a vaccination file with invalid data.
    Verification:
    - Output lists errors as expected for each record
    """
    import_records_page.upload_and_verify_output(
        file_mapping=VaccsFileMapping.NEGATIVE,
        session_id=setup_vaccs,
    )


@pytest.mark.vaccinations
def test_vaccination_file_upload_duplicate_records(
    setup_vaccs,
    dashboard_page,
    import_records_page,
):
    """
    Test: Upload duplicate vaccination records and verify duplicate handling.
    Steps:
    1. Upload a vaccination file with duplicate records.
    2. Upload a second file with more duplicates.
    Verification:
    - Output indicates duplicates are detected and handled.
    """
    import_records_page.upload_and_verify_output(
        VaccsFileMapping.DUP_1,
        session_id=setup_vaccs,
    )
    dashboard_page.click_mavis()
    dashboard_page.click_import_records()
    import_records_page.navigate_to_vaccination_records_import()
    import_records_page.upload_and_verify_output(
        VaccsFileMapping.DUP_2,
        session_id=setup_vaccs,
    )


@pytest.mark.vaccinations
def test_vaccination_file_upload_invalid_structure(setup_vaccs, import_records_page):
    """
    Test: Upload a vaccination records file with invalid structure and
       verify error handling.
    Steps:
    1. Navigate to vaccination records import page.
    2. Upload a file with incorrect structure.
    Verification:
    - Output indicates structural errors.
    """
    import_records_page.upload_and_verify_output(VaccsFileMapping.INVALID_STRUCTURE)


@pytest.mark.vaccinations
def test_vaccination_file_upload_header_only(setup_vaccs, import_records_page):
    """
    Test: Upload a vaccination records file with only headers and verify no records are
       imported.
    Steps:
    1. Navigate to vaccination records import page.
    2. Upload a header-only file.
    Verification:
    - Output indicates no records imported.
    """
    import_records_page.upload_and_verify_output(VaccsFileMapping.HEADER_ONLY)


@pytest.mark.vaccinations
def test_vaccination_file_upload_empty_file(setup_vaccs, import_records_page):
    """
    Test: Upload an empty vaccination records file and verify error handling.
    Steps:
    1. Navigate to vaccination records import page.
    2. Upload an empty file.
    Verification:
    - Output indicates error or no records imported.
    """
    import_records_page.upload_and_verify_output(VaccsFileMapping.EMPTY_FILE)


@pytest.mark.vaccinations
def test_vaccination_file_upload_historic_valid_data(setup_vaccs, import_records_page):
    """
    Test: Upload a historic vaccination records file with valid data and verify import.
    Steps:
    1. Navigate to vaccination records import page.
    2. Upload a historic file with valid data.
    Verification:
    - Output indicates successful import of historic records.
    """
    import_records_page.upload_and_verify_output(VaccsFileMapping.HIST_POSITIVE)


@pytest.mark.vaccinations
def test_vaccination_file_upload_historic_invalid_data(
    setup_vaccs,
    import_records_page,
):
    """
    Test: Upload a historic vaccination records file with invalid data and
       verify error handling.
    Steps:
    1. Navigate to vaccination records import page.
    2. Upload a historic file with invalid data.
    Verification:
    - Output lists errors as expected for each record
    """
    import_records_page.upload_and_verify_output(VaccsFileMapping.HIST_NEGATIVE)


@issue("MAV-855")
@pytest.mark.vaccinations
@pytest.mark.bug
def test_vaccination_file_upload_no_urn_location_mav_855(
    setup_vaccs,
    schools,
    dashboard_page,
    import_records_page,
    children_page,
    children,
):
    """
    Test: Upload a vaccination file with no URN/care setting and verify location is
       set to school (MAV-855).
    Steps:
    1. Upload a vaccination file missing care setting.
    2. Navigate to children page and search for the child.
    3. Open vaccination details for the child.
    Verification:
    - Vaccination location is displayed as the school.
    """
    child = children[Programme.HPV][0]
    school = schools[Programme.HPV][0]

    import_records_page.upload_and_verify_output(VaccsFileMapping.NO_CARE_SETTING)
    dashboard_page.click_mavis()
    dashboard_page.click_children()

    children_page.click_advanced_filters()
    children_page.check_children_aged_out_of_programmes()
    children_page.search_with_all_filters_for_child_name(str(child))
    children_page.click_record_for_child(child)
    children_page.click_vaccination_details(school)
    children_page.expect_vaccination_details("Location", str(school))


@pytest.mark.vaccinations
def test_vaccination_file_upload_systmone_valid_data(
    setup_vaccs_systmone,
    import_records_page,
):
    """
    Test: Upload a SystmOne vaccination records file with valid data and verify import.
    Steps:
    1. Navigate to vaccination records import page.
    2. Upload a SystmOne file with valid data.
    Verification:
    - Output indicates successful import of SystmOne records.
    """
    import_records_page.upload_and_verify_output(VaccsFileMapping.SYSTMONE_POSITIVE)


@pytest.mark.vaccinations
def test_vaccination_file_upload_systmone_invalid_data(
    setup_vaccs_systmone,
    import_records_page,
):
    """
    Test: Upload a SystmOne vaccination records file with invalid data and
       verify error handling.
    Steps:
    1. Navigate to vaccination records import page.
    2. Upload a SystmOne file with invalid data.
    Verification:
    - Output lists errors as expected for each record
    """
    import_records_page.upload_and_verify_output(VaccsFileMapping.SYSTMONE_NEGATIVE)


@pytest.mark.vaccinations
def test_vaccination_file_upload_systmone_historic_invalid_data(
    setup_vaccs_systmone,
    import_records_page,
):
    """
    Test: Upload a SystmOne historic vaccination records file with invalid data and
       verify error handling.
    Steps:
    1. Navigate to vaccination records import page.
    2. Upload a SystmOne historic file with invalid data.
    Verification:
    - Output lists errors as expected for each record
    """
    import_records_page.upload_and_verify_output(
        VaccsFileMapping.SYSTMONE_HIST_NEGATIVE,
    )


@pytest.mark.vaccinations
@pytest.mark.bug
def test_vaccination_file_upload_whitespace_normalization(
    setup_vaccs,
    import_records_page,
    children_page,
    dashboard_page,
):
    """
    Test: Upload a vaccination records file with extra whitespace and
       verify normalization.
    Steps:
    1. Upload a file with whitespace issues.
    2. Navigate to children page.
    3. Verify the list is normalized and imported correctly.
    Verification:
    - Imported list matches expected normalized data.
    """
    input_file, _ = import_records_page.upload_and_verify_output(
        VaccsFileMapping.WHITESPACE,
        session_id=setup_vaccs,
    )
    dashboard_page.click_mavis()
    dashboard_page.click_children()
    children_page.verify_list_has_been_uploaded(input_file, is_vaccinations=True)


@pytest.mark.vaccinations
@pytest.mark.bug
def test_vaccination_file_upload_systmone_whitespace_normalization(
    setup_vaccs_systmone,
    import_records_page,
):
    """
    Test: Upload a SystmOne vaccination records file with extra whitespace and
       verify normalization.
    Steps:
    1. Upload a SystmOne file with whitespace issues.
    Verification:
    - Output indicates successful normalization and import.
    """
    import_records_page.upload_and_verify_output(
        VaccsFileMapping.SYSTMONE_WHITESPACE,
    )


@issue("MAV-1547")
@pytest.mark.vaccinations
@pytest.mark.bug
def test_vaccination_file_upload_nivs_disallow_flu_for_previous_years(
    setup_vaccs,
    import_records_page,
):
    """
    Test: Upload a NIVS historic flu vaccination file for previous years and verify
       it is disallowed.
    Steps:
    1. Upload a historic flu file for previous years.
    Verification:
    - Output indicates flu vaccinations for previous years are not allowed.
    """
    import_records_page.upload_and_verify_output(
        VaccsFileMapping.HIST_FLU_NIVS,
        session_id=setup_vaccs,
    )


@issue("MAV-1599")
@pytest.mark.vaccinations
@pytest.mark.bug
def test_vaccination_file_upload_systmone_disallow_flu_for_previous_years(
    setup_vaccs_systmone,
    import_records_page,
):
    """
    Test: Upload a SystmOne historic flu vaccination file for previous years and verify
       it is disallowed.
    Steps:
    1. Upload a SystmOne historic flu file for previous years.
    Verification:
    - Output indicates flu vaccinations for previous years are not allowed.
    """
    import_records_page.upload_and_verify_output(
        VaccsFileMapping.HIST_FLU_SYSTMONE,
        session_id=setup_vaccs_systmone,
    )


@issue("MAV-691")
@pytest.mark.vaccinations
@pytest.mark.bug
def test_vaccination_file_upload_community_clinic_name_case(
    setup_vaccs_clinic,
    import_records_page,
):
    """
    Test: Upload a vaccination file with community clinic name case variations and
       verify correct handling.
    Steps:
    1. Upload a file with clinic name case variations.
    Verification:
    - Output indicates clinic names are handled case-insensitively and
       imported correctly.
    """
    import_records_page.upload_and_verify_output(
        VaccsFileMapping.CLINIC_NAME_CASE,
        session_id=setup_vaccs_clinic,
    )
