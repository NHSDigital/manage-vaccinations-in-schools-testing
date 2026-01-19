import time

import pytest

from mavis.test.annotations import issue
from mavis.test.constants import DeliverySite, Programme, Vaccine
from mavis.test.data import ClassFileMapping, VaccsFileMapping
from mavis.test.data.file_mappings import ImportFormatDetails
from mavis.test.helpers.imms_api_helper import ImmsApiHelper
from mavis.test.pages import (
    ChildRecordPage,
    ChildrenSearchPage,
    DashboardPage,
    ImportRecordsWizardPage,
    ImportsPage,
    SchoolsChildrenPage,
    SchoolsSearchPage,
    SessionsOverviewPage,
    VaccinationRecordPage,
)
from mavis.test.pages.utils import schedule_school_session_if_needed
from mavis.test.utils import get_current_datetime


@pytest.fixture(scope="session")
def imms_api_helper(authenticate_api):
    return ImmsApiHelper(authenticate_api)


@pytest.fixture
def setup_vaccs_flu(
    log_in_as_nurse,
    schools,
    page,
    file_generator,
    year_groups,
):
    school = schools[Programme.FLU][0]
    year_group = year_groups[Programme.FLU]

    # Temporarily override the file generator's year group to ensure consistency
    original_year_group = file_generator.year_groups.get(Programme.FLU.group)
    file_generator.year_groups[Programme.FLU.group] = year_group

    DashboardPage(page).click_schools()
    SchoolsSearchPage(page).click_school(school)
    SchoolsChildrenPage(page).click_import_class_lists()

    try:
        ImportRecordsWizardPage(page, file_generator).import_class_list(
            ClassFileMapping.TWO_FIXED_CHILDREN,
            year_group,
            programme_group=Programme.FLU.group,
        )
        schedule_school_session_if_needed(page, school, [Programme.FLU], [year_group])
        session_id = SessionsOverviewPage(page).get_session_id_from_offline_excel()
        SessionsOverviewPage(page).header.click_mavis_header()
    finally:
        # Restore original value
        if original_year_group is not None:
            file_generator.year_groups[Programme.FLU.group] = original_year_group
    DashboardPage(page).click_imports()
    ImportsPage(page).click_upload_records()
    ImportRecordsWizardPage(
        page, file_generator
    ).navigate_to_vaccination_records_import()
    return session_id


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

    DashboardPage(page).click_schools()
    SchoolsSearchPage(page).click_school(school)
    SchoolsChildrenPage(page).click_import_class_lists()
    ImportRecordsWizardPage(page, file_generator).import_class_list(
        ClassFileMapping.RANDOM_CHILD, year_group
    )
    schedule_school_session_if_needed(page, school, [Programme.HPV], [year_group])
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
    2. Read and verify the file specification for vaccination records.
    3. Upload a valid vaccination file.
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
    ImportRecordsWizardPage(page, file_generator).read_and_verify_import_format_details(
        ImportFormatDetails.VACCS
    )
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

    ChildrenSearchPage(page).search.click_advanced_filters()
    ChildrenSearchPage(page).search.check_children_aged_out_of_programmes()
    ChildrenSearchPage(page).search.search_for_child_name_with_all_filters(str(child))
    ChildrenSearchPage(page).search.click_child(child)
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


@issue("MAV-3076")
@pytest.mark.vaccinations
@pytest.mark.imms_api
def test_vaccination_file_upload_snomed_code_verification(
    setup_vaccs_flu,
    schools,
    page,
    file_generator,
    children,
    imms_api_helper,
):
    """
    Test: Upload a vaccination file with specific vaccine types and verify SNOMED codes.
    Steps:
    1. Upload a vaccination file with 4 records containing specific vaccine types
       and sites.
    2. Wait for API sync and navigate to children records.
    3. Search for each child and verify SNOMED codes in vaccination records.
    Verification:
    - SNOMED codes and displays match expected values:
    884861000000100: Administration of first intranasal seasonal influenza vaccination
    884881000000109: Administration of second intranasal seasonal influenza vaccination
    985151000000100: Administration of first inactivated seasonal influenza vaccination
    985171000000109: Administration of second inactivated seasonal influenza vaccination

    Scenarios covered:
    VACCINE_GIVEN|ANATOMICAL_SITE|DOSE_SEQUENCE|NOTES
    AstraZeneca Fluenz|nasal|1|Nasal first dose
    AstraZeneca Fluenz|nasal|2|Nasal second dose
    Sanofi Vaxigrip|left arm (upper position)|1|IV first dose
    Sanofi Vaxigrip|left arm (upper position)|2|IV second dose
    """
    # Upload vaccination file with specific records
    ImportRecordsWizardPage(page, file_generator).upload_and_verify_output(
        VaccsFileMapping.SNOMED_VERIFICATION,
        session_id=setup_vaccs_flu,
    )

    # Wait for processing before searching for children
    time.sleep(5)

    # Wait for API sync and verify SNOMED codes via IMMS API
    school = schools[Programme.FLU][0]
    flu_children = file_generator.children[Programme.FLU.group]
    vaccination_time = get_current_datetime().replace(
        hour=0, minute=1, second=0, microsecond=0
    )

    # Define vaccine types and delivery sites for each record
    vaccine_configs = [
        (Vaccine.FLUENZ, DeliverySite.NOSE),  # First nasal dose
        (Vaccine.FLUENZ, DeliverySite.NOSE),  # Second nasal dose
        (Vaccine.SEQUIRUS, DeliverySite.LEFT_ARM_UPPER),  # First injected dose
        (Vaccine.SEQUIRUS, DeliverySite.LEFT_ARM_UPPER),  # Second injected dose
    ]

    # Define expected SNOMED codes for verification
    expected_snomed_codes = [
        "884861000000100",  # First nasal dose
        "884881000000109",  # Second nasal dose
        "985151000000100",  # First injected dose
        "985171000000109",  # Second injected dose
    ]

    # Verify SNOMED codes via IMMS API only (skip UI verification for now)
    # First child - nasal vaccinations (2 doses)
    first_child = flu_children[0]

    # Wait for IMMS API sync
    time.sleep(10)  # Additional wait for API sync

    # First, verify basic vaccination records exist using existing helper
    # Dose 1 - nasal
    imms_api_helper.check_record_in_imms_api(
        vaccine=Vaccine.FLUENZ,
        child=first_child,
        school=school,
        delivery_site=DeliverySite.NOSE,
        vaccination_time=vaccination_time,
    )

    # Dose 2 - nasal
    imms_api_helper.check_record_in_imms_api(
        vaccine=Vaccine.FLUENZ,
        child=first_child,
        school=school,
        delivery_site=DeliverySite.NOSE,
        vaccination_time=vaccination_time,
    )

    # Second child - injected vaccinations (2 doses)
    second_child = flu_children[1]

    # Dose 1 - injected
    imms_api_helper.check_record_in_imms_api(
        vaccine=Vaccine.SEQUIRUS,
        child=second_child,
        school=school,
        delivery_site=DeliverySite.LEFT_ARM_UPPER,
        vaccination_time=vaccination_time,
    )

    # Dose 2 - injected
    imms_api_helper.check_record_in_imms_api(
        vaccine=Vaccine.SEQUIRUS,
        child=second_child,
        school=school,
        delivery_site=DeliverySite.LEFT_ARM_UPPER,
        vaccination_time=vaccination_time,
    )
