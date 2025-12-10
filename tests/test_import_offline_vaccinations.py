import pytest

from mavis.test.annotations import issue
from mavis.test.constants import Programme
from mavis.test.data import ClassFileMapping, VaccsFileMapping
from mavis.test.pages import (
    ChildRecordPage,
    ChildrenSearchPage,
    DashboardPage,
    ImportRecordsWizardPage,
    ImportsPage,
    SessionsEditPage,
    SessionsOverviewPage,
    SessionsSearchPage,
    VaccinationRecordPage,
)
from mavis.test.utils import get_offset_date


@pytest.fixture
def setup_vaccs(
    log_in_as_nurse,
    schools,
    page,
    file_generator,
    year_groups,
):
    school = schools[Programme.HPV][0]
    year_group = year_groups[Programme.HPV]

    DashboardPage(page).click_sessions()
    SessionsSearchPage(page).click_session_for_programme_group(
        school, Programme.HPV.group
    )
    if not SessionsOverviewPage(page).is_date_scheduled(get_offset_date(0)):
        SessionsOverviewPage(page).schedule_or_edit_session()
        SessionsEditPage(page).schedule_a_valid_session(
            offset_days=0, skip_weekends=False
        )
    SessionsOverviewPage(page).click_import_class_lists()
    ImportRecordsWizardPage(page, file_generator).import_class_list(
        ClassFileMapping.RANDOM_CHILD, year_group
    )
    ImportsPage(page).header.click_mavis_header()
    DashboardPage(page).click_sessions()
    SessionsSearchPage(page).click_session_for_programme_group(school, Programme.HPV)
    session_id = SessionsOverviewPage(page).get_session_id_from_offline_excel()
    SessionsOverviewPage(page).header.click_mavis_header()
    DashboardPage(page).click_imports()
    ImportsPage(page).click_upload_records()
    ImportRecordsWizardPage(
        page, file_generator
    ).navigate_to_vaccination_records_import()
    return session_id


@pytest.mark.vaccinations
def test_vaccination_file_upload_valid_data(setup_vaccs, page, file_generator):
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
    HPV_AddressNFA, HPV_AddressNotKnown, HPV_AddressNotSpecified
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
    ImportRecordsWizardPage(page, file_generator).upload_and_verify_output(
        file_mapping=VaccsFileMapping.POSITIVE,
        session_id=setup_vaccs,
    )


@pytest.mark.vaccinations
def test_vaccination_file_upload_invalid_data(setup_vaccs, page, file_generator):
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
    ImportRecordsWizardPage(page, file_generator).upload_and_verify_output(
        file_mapping=VaccsFileMapping.NEGATIVE,
        session_id=setup_vaccs,
    )


@pytest.mark.skip(reason="Need further clarification")
@pytest.mark.vaccinations
def test_vaccination_file_upload_duplicate_records(
    setup_vaccs,
    page,
    file_generator,
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
    ImportRecordsWizardPage(page, file_generator).upload_and_verify_output(
        VaccsFileMapping.DUP_1,
        session_id=setup_vaccs,
    )
    ImportsPage(page).header.click_mavis_header()
    DashboardPage(page).click_imports()
    ImportsPage(page).click_upload_records()
    ImportRecordsWizardPage(
        page, file_generator
    ).navigate_to_vaccination_records_import()
    ImportRecordsWizardPage(page, file_generator).upload_and_verify_output(
        VaccsFileMapping.DUP_2,
        session_id=setup_vaccs,
    )


@pytest.mark.vaccinations
def test_vaccination_file_upload_invalid_structure(
    setup_vaccs,
    page,
    file_generator,
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
    ImportRecordsWizardPage(page, file_generator).upload_and_verify_output(
        VaccsFileMapping.INVALID_STRUCTURE
    )


@pytest.mark.vaccinations
def test_vaccination_file_upload_header_only(setup_vaccs, page, file_generator):
    """
    Test: Upload a vaccination records file with only headers and verify no records are
       imported.
    Steps:
    1. Navigate to vaccination records import page.
    2. Upload a header-only file.
    Verification:
    - Output indicates no records imported.
    """
    ImportRecordsWizardPage(page, file_generator).upload_and_verify_output(
        VaccsFileMapping.HEADER_ONLY
    )


@pytest.mark.vaccinations
def test_vaccination_file_upload_empty_file(setup_vaccs, page, file_generator):
    """
    Test: Upload an empty vaccination records file and verify error handling.
    Steps:
    1. Navigate to vaccination records import page.
    2. Upload an empty file.
    Verification:
    - Output indicates error or no records imported.
    """
    ImportRecordsWizardPage(page, file_generator).upload_and_verify_output(
        VaccsFileMapping.EMPTY_FILE
    )


@issue("MAV-855")
@pytest.mark.vaccinations
@pytest.mark.bug
def test_vaccination_file_upload_creates_child_no_setting(
    setup_vaccs,
    schools,
    page,
    file_generator,
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

    ImportRecordsWizardPage(page, file_generator).upload_and_verify_output(
        VaccsFileMapping.NO_CARE_SETTING
    )
    ImportsPage(page).header.click_mavis_header()
    DashboardPage(page).click_children()

    ChildrenSearchPage(page).click_advanced_filters()
    ChildrenSearchPage(page).check_children_aged_out_of_programmes()
    ChildrenSearchPage(page).search_with_all_filters_for_child_name(str(child))
    ChildrenSearchPage(page).click_record_for_child(child)
    ChildRecordPage(page).click_vaccination_details(school)
    VaccinationRecordPage(page).expect_vaccination_details("Location", str(school))


@pytest.mark.vaccinations
@pytest.mark.bug
def test_vaccination_file_upload_whitespace_normalization(
    setup_vaccs,
    page,
    file_generator,
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
    input_file, _ = ImportRecordsWizardPage(
        page, file_generator
    ).upload_and_verify_output(
        VaccsFileMapping.WHITESPACE,
        session_id=setup_vaccs,
    )
    ImportsPage(page).header.click_mavis_header()
    DashboardPage(page).click_children()
    ChildrenSearchPage(page).verify_list_has_been_uploaded(
        input_file, is_vaccinations=True
    )


@issue("MAV-691")
@pytest.mark.vaccinations
@pytest.mark.bug
def test_vaccination_file_upload_community_clinic_name_case(
    setup_vaccs,
    page,
    file_generator,
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
    ImportRecordsWizardPage(page, file_generator).upload_and_verify_output(
        VaccsFileMapping.CLINIC_NAME_CASE,
        session_id=setup_vaccs,
    )
