import pytest

from mavis.test.annotations import issue
from mavis.test.data import ClassFileMapping, VaccsFileMapping
from mavis.test.models import Programme


@pytest.fixture
def setup_vaccs(
    log_in_as_nurse,
    schools,
    dashboard_page,
    sessions_page,
    import_records_wizard_page,
    imports_page,
    year_groups,
):
    school = schools[Programme.HPV][0]
    year_group = year_groups[Programme.HPV]

    try:
        dashboard_page.click_sessions()
        sessions_page.ensure_session_scheduled_for_today(school, Programme.HPV)
        sessions_page.click_import_class_lists()
        import_records_wizard_page.import_class_list(
            ClassFileMapping.RANDOM_CHILD, year_group
        )
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.click_session_for_programme_group(school, Programme.HPV)
        session_id = sessions_page.get_session_id_from_offline_excel()
        dashboard_page.click_mavis()
        dashboard_page.click_import_records()
        imports_page.click_import_records()
        import_records_wizard_page.navigate_to_vaccination_records_import()
        yield session_id
    finally:
        dashboard_page.navigate()
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(school)


@pytest.mark.vaccinations
def test_vaccination_file_upload_valid_data(setup_vaccs, import_records_wizard_page):
    """
    Test: Upload a valid vaccination records file and verify successful import.
    Steps:
    1. Navigate to vaccination records import page.
    2. Upload a valid vaccination file.
    Verification:
    - Output indicates successful import of records.
    Scenarios covered:
    HPV:
    HPV_Optional, HPV_Gardasil9, HPV_Gardasil, HPV_Cervarix, HPV_NFA, HPV_Add_Not_Known,
    HPV_AllowPastExpiryDate, HPV_SiteRAU, HPV_SiteRAL, HPV_NotVaccinated,
    Doubles:
    TDIPV_Optional, TDIPV_NFA, TDIPV_Add_Not_Known, TDIPV_AllowPastExpiryDate,
    TDIPV_SiteRAU, TDIPV_SiteRAL, TDIPV_NotVaccinated, MenACWY_Optional, MenACWY_NFA,
    MenACWY_Add_Not_Known, MenACWY_AllowPastExpiryDate, MenACWY_SiteRAU,MenACWY_SiteRAL,
    MenACWY_NotVaccinated, MenACWY_BatchName100Chars,
    Flu:
    Flu_Optional, Flu_NFA,
    Flu_Add_Not_Known, Flu_AllowPastExpiryDate, Flu_SiteRAU, Flu_SiteRAL,
    Flu_NotVaccinated, Flu_BatchName100Chars,
    MMR:
    MMR_Optional, MMR_NFA, MMR_Add_Not_Known,
    MMR_AllowPastExpiryDate, MMR_SiteRAU, MMR_SiteRAL, MMR_NotVaccinated,
    MMR_BatchName100Chars, MMR_DoseSeq1WithoutSess, MMR_DoseSeq2WithoutSess,
    MMR_UnknownDoseSeq, MMRNoDelayDose1, MMRNoDelayDose2, MMR_NoDelayDoseUnknown
    """
    import_records_wizard_page.upload_and_verify_output(
        file_mapping=VaccsFileMapping.POSITIVE,
        session_id=setup_vaccs,
    )


@pytest.mark.vaccinations
def test_vaccination_file_upload_invalid_data(setup_vaccs, import_records_wizard_page):
    """
    Test: Upload an invalid vaccination records file and verify error handling.
    Steps:
    1. Navigate to vaccination records import page.
    2. Upload a vaccination file with invalid data.
    Verification:
    - Output lists errors as expected for each record
    Scenarios covered:

    HPV_InvalidODSCode, HPV_EmptyOrgCode, HPV_EmptySchoolURN, HPV_NotKnownSchoolEmpty,
    HPV_LongNHSNumber, HPV_ShortNHSNumber, HPV_EmptyForename, HPV_EmptyLastname,
    HPV_EmptyDOB, HPV_InvalidFormatDOB, HPV_FutureDOB, HPV_NonLeapYearDOB,
    HPV_EmptyGender, HPV_InvalidGender, HPV_EmptyPostCode, HPV_InvalidPostCode,
    HPV_EmptyVaccDate, HPV_FutureVaccDate, HPV_EmptyVaccGiven, HPV_EmptyBatchNumber,
    HPV_EmptyExpiryDate, HPV_EmptyAnatomicalSite, HPV_InvalidAnatomicalSite,
    HPV_EmptyDoseSeq, HPV_InvalidDoseSeq, HPV_EmptyCareSetting, HPV_InvalidProfFName,
    HPV_InvalidProfSName, HPV_InvalidProfEmail, HPV_InvalidClinic, HPV_InvalidTime,
    HPV_InvalidReason, HPV_InvalidVaccinatedFlag, HPV_InvalidCareSetting,
    HPV_TimeInFuture, HPV_VaccinatedFlagEmpty, TDIPV_EmptyDoseSeq, TDIPV_InvalidDoseSeq,
    MenACWY_EmptyDoseSeq, MenACWY_InvalidDoseSeq, MenACWY_LongBatchNumber, MMR_DoseSeq3
    """
    import_records_wizard_page.upload_and_verify_output(
        file_mapping=VaccsFileMapping.NEGATIVE,
        session_id=setup_vaccs,
    )


@pytest.mark.vaccinations
def test_vaccination_file_upload_duplicate_records(
    setup_vaccs,
    dashboard_page,
    import_records_wizard_page,
    imports_page,
):
    """
    Test: Upload duplicate vaccination records and verify duplicate handling.
    Steps:
    1. Upload a vaccination file with duplicate records.
    2. Upload a second file with more duplicates.
    Verification:
    - Output indicates duplicates are detected and handled.
    Scenarios covered:
    1. Duplicate records within the same file, and
    2. Duplicate records across 2 different files
    """
    import_records_wizard_page.upload_and_verify_output(
        VaccsFileMapping.DUP_1,
        session_id=setup_vaccs,
    )
    dashboard_page.click_mavis()
    dashboard_page.click_import_records()
    imports_page.click_import_records()
    import_records_wizard_page.navigate_to_vaccination_records_import()
    import_records_wizard_page.upload_and_verify_output(
        VaccsFileMapping.DUP_2,
        session_id=setup_vaccs,
    )


@pytest.mark.vaccinations
def test_vaccination_file_upload_invalid_structure(
    setup_vaccs, import_records_wizard_page
):
    """
    Test: Upload a vaccination records file with invalid structure and
       verify error handling.
    Steps:
    1. Navigate to vaccination records import page.
    2. Upload a file with incorrect structure.
    Verification:
    - Output indicates structural errors.
    """
    import_records_wizard_page.upload_and_verify_output(
        VaccsFileMapping.INVALID_STRUCTURE
    )


@pytest.mark.vaccinations
def test_vaccination_file_upload_header_only(setup_vaccs, import_records_wizard_page):
    """
    Test: Upload a vaccination records file with only headers and verify no records are
       imported.
    Steps:
    1. Navigate to vaccination records import page.
    2. Upload a header-only file.
    Verification:
    - Output indicates no records imported.
    """
    import_records_wizard_page.upload_and_verify_output(VaccsFileMapping.HEADER_ONLY)


@pytest.mark.vaccinations
def test_vaccination_file_upload_empty_file(setup_vaccs, import_records_wizard_page):
    """
    Test: Upload an empty vaccination records file and verify error handling.
    Steps:
    1. Navigate to vaccination records import page.
    2. Upload an empty file.
    Verification:
    - Output indicates error or no records imported.
    """
    import_records_wizard_page.upload_and_verify_output(VaccsFileMapping.EMPTY_FILE)


@issue("MAV-855")
@pytest.mark.vaccinations
@pytest.mark.bug
def test_vaccination_file_upload_creates_child_no_setting(
    setup_vaccs,
    schools,
    dashboard_page,
    import_records_wizard_page,
    children_search_page,
    child_record_page,
    vaccination_record_page,
    children,
):
    """
    Test: Upload a vaccination file with no URN/care setting and verify the child
    record is created and the location is set to school (MAV-855).
    Steps:
    1. Upload a vaccination file missing care setting for a child not in Mavis.
    2. Navigate to children page and search for the child.
    3. Open vaccination details for the child.
    Verification:
    - Vaccination location is displayed as the school.
    Scenarios covered: MAV-855
    """
    child = children[Programme.HPV][0]
    school = schools[Programme.HPV][0]

    import_records_wizard_page.upload_and_verify_output(
        VaccsFileMapping.NO_CARE_SETTING
    )
    dashboard_page.click_mavis()
    dashboard_page.click_children()

    children_search_page.click_advanced_filters()
    children_search_page.check_children_aged_out_of_programmes()
    children_search_page.search_with_all_filters_for_child_name(str(child))
    children_search_page.click_record_for_child(child)
    child_record_page.click_vaccination_details(school)
    vaccination_record_page.expect_vaccination_details("Location", str(school))


@pytest.mark.vaccinations
@pytest.mark.bug
def test_vaccination_file_upload_whitespace_normalization(
    setup_vaccs,
    import_records_wizard_page,
    children_search_page,
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
    Scenarios covered:
    TwoSpaces, Tabs, NBSP (non-breaking space), ZWJ (zero-width joiner)
    """
    input_file, _ = import_records_wizard_page.upload_and_verify_output(
        VaccsFileMapping.WHITESPACE,
        session_id=setup_vaccs,
    )
    dashboard_page.click_mavis()
    dashboard_page.click_children()
    children_search_page.verify_list_has_been_uploaded(input_file, is_vaccinations=True)


@issue("MAV-691")
@pytest.mark.vaccinations
@pytest.mark.bug
def test_vaccination_file_upload_community_clinic_name_case(
    setup_vaccs,
    import_records_wizard_page,
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
    import_records_wizard_page.upload_and_verify_output(
        VaccsFileMapping.CLINIC_NAME_CASE,
        session_id=setup_vaccs,
    )
