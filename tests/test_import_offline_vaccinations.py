import pytest

from mavis.test.annotations import issue
from mavis.test.constants import Programme
from mavis.test.data import ClassFileMapping, VaccsFileMapping
from mavis.test.data.file_mappings import ImportFormatDetails
from mavis.test.fixtures.helpers import setup_national_reporting_import
from mavis.test.pages import (
    ChildProgrammePage,
    ChildRecordPage,
    ChildrenSearchPage,
    DashboardPage,
    ImportRecordsWizardPage,
    ImportsPage,
    SchoolChildrenPage,
    SchoolsSearchPage,
    SessionsOverviewPage,
    VaccinationRecordPage,
)
from mavis.test.pages.utils import schedule_school_session_if_needed
from mavis.test.utils import get_current_datetime

# Fixtures used via request.getfixturevalue() in parametrized tests
__fixtures__ = (setup_national_reporting_import,)


@pytest.fixture
def setup_vaccs(
    log_in_as_nurse,
    schools,
    page,
    point_of_care_file_generator,
    year_groups,
):
    school = schools["doubles"][0]
    year_group = year_groups["doubles"]

    DashboardPage(page).click_schools()
    SchoolsSearchPage(page).click_school(school)
    SchoolChildrenPage(page).click_import_class_lists()
    ImportRecordsWizardPage(page, point_of_care_file_generator).import_class_list(
        ClassFileMapping.RANDOM_CHILD, year_group, programme_group="doubles"
    )
    schedule_school_session_if_needed(
        page,
        school,
        [
            Programme.FLU,
            Programme.HPV,
            Programme.MENACWY,
            Programme.MMR,
            Programme.TD_IPV,
        ],
        [year_group],
    )
    session_id = SessionsOverviewPage(page).get_session_id_from_offline_excel()
    SessionsOverviewPage(page).header.click_mavis()
    DashboardPage(page).click_imports()
    ImportsPage(page).click_upload_records()
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).navigate_to_vaccination_records_import()
    return session_id


@pytest.mark.vaccinations
def test_vaccination_file_upload_valid_data(
    setup_vaccs, page, point_of_care_file_generator
):
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
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).read_and_verify_import_format_details(ImportFormatDetails.VACCS)
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_and_verify_output(
        file_mapping=VaccsFileMapping.POSITIVE,
        session_id=setup_vaccs,
    )


@pytest.mark.vaccinations
def test_vaccination_file_upload_invalid_data(
    setup_vaccs, page, point_of_care_file_generator
):
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
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_and_verify_output(
        file_mapping=VaccsFileMapping.NEGATIVE,
        session_id=setup_vaccs,
    )


@pytest.mark.skip(reason="Need further clarification")
@pytest.mark.vaccinations
def test_vaccination_file_upload_duplicate_records(
    setup_vaccs,
    page,
    point_of_care_file_generator,
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
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_and_verify_output(
        VaccsFileMapping.DUP_1,
        session_id=setup_vaccs,
    )
    ImportsPage(page).header.click_mavis()
    DashboardPage(page).click_imports()
    ImportsPage(page).click_upload_records()
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).navigate_to_vaccination_records_import()
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_and_verify_output(
        VaccsFileMapping.DUP_2,
        session_id=setup_vaccs,
    )


@issue("MAV-3408")
@pytest.mark.bug
@pytest.mark.parametrize(
    ("user_type", "setup_fixture", "file_generator_fixture", "include_session_id"),
    [
        pytest.param(
            "point_of_care",
            "setup_vaccs",
            "point_of_care_file_generator",
            True,
            marks=pytest.mark.vaccinations,
            id="point_of_care",
        ),
        pytest.param(
            "national_reporting",
            "setup_national_reporting_import",
            "national_reporting_file_generator",
            False,
            marks=pytest.mark.national_reporting,
            id="national_reporting",
        ),
    ],
)
def test_vaccination_file_upload_multiple_exact_duplicates(
    user_type,
    setup_fixture,
    file_generator_fixture,
    include_session_id,
    page,
    request,
):
    """
    Test: Upload a vaccination file with multiple exact duplicate rows and verify
    that the import summary correctly counts duplicates or rejects the file.
    This test covers both point of care and national reporting upload scenarios.

    Steps:
    1. Navigate to vaccination records import page.
    2. Upload a file containing multiple exact duplicate rows.
    3. Verify the import summary on the imports page.

    Verification:
    - Import summary shows correct duplicate count
    - Duplicate rows are handled appropriately (rejected or deduplicated)
    - Only unique records are imported into Mavis
    """
    setup = request.getfixturevalue(setup_fixture)
    file_generator = request.getfixturevalue(file_generator_fixture)

    if include_session_id:  # Point of care scenario requires session ID
        ImportRecordsWizardPage(page, file_generator).upload_and_verify_output(
            file_mapping=VaccsFileMapping.MULTIPLE_EXACT_DUPLICATES,
            session_id=setup,
        )
    else:  # National reporting scenario does not need session ID
        ImportRecordsWizardPage(page, file_generator).upload_and_verify_output(
            file_mapping=VaccsFileMapping.MULTIPLE_EXACT_DUPLICATES,
        )


@pytest.mark.vaccinations
def test_vaccination_file_upload_invalid_structure(
    setup_vaccs,
    page,
    point_of_care_file_generator,
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
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_and_verify_output(VaccsFileMapping.INVALID_STRUCTURE)


@pytest.mark.vaccinations
def test_vaccination_file_upload_header_only(
    setup_vaccs, page, point_of_care_file_generator
):
    """
    Test: Upload a vaccination records file with only headers and verify no records are
       imported.
    Steps:
    1. Navigate to vaccination records import page.
    2. Upload a header-only file.
    Verification:
    - Output indicates no records imported.
    """
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_and_verify_output(VaccsFileMapping.HEADER_ONLY)


@pytest.mark.vaccinations
def test_vaccination_file_upload_empty_file(
    setup_vaccs, page, point_of_care_file_generator
):
    """
    Test: Upload an empty vaccination records file and verify error handling.
    Steps:
    1. Navigate to vaccination records import page.
    2. Upload an empty file.
    Verification:
    - Output indicates error or no records imported.
    """
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_and_verify_output(VaccsFileMapping.EMPTY_FILE)


@issue("MAV-855")
@pytest.mark.vaccinations
@pytest.mark.bug
def test_vaccination_file_upload_creates_child_no_setting(
    setup_vaccs,
    schools,
    page,
    point_of_care_file_generator,
    children,
):
    """
    Test: Upload a vaccination file with no URN/care setting and verify the child
    record is created and the location is set to school.
    Steps:
    1. Upload a vaccination file missing care setting for a child not in Mavis.
    2. Navigate to children page and search for the child.
    3. Open vaccination details for the child.
    Verification:
    - Vaccination location is displayed as the school.
    """
    child = children[Programme.HPV][0]
    school = schools[Programme.HPV][0]

    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_and_verify_output(VaccsFileMapping.NO_CARE_SETTING)
    ImportsPage(page).header.click_mavis()
    DashboardPage(page).click_children()

    ChildrenSearchPage(page).search.click_advanced_filters()
    ChildrenSearchPage(page).search.check_children_aged_out_of_programmes()
    ChildrenSearchPage(page).search.search_for_child_name_with_all_filters(str(child))
    ChildrenSearchPage(page).search.click_child(child)
    ChildRecordPage(page).click_programme(Programme.HPV)
    ChildProgrammePage(page).click_vaccination_record(
        get_current_datetime().replace(year=get_current_datetime().year - 2)
    )
    VaccinationRecordPage(page).expect_vaccination_details("Location", str(school))


@pytest.mark.vaccinations
@pytest.mark.bug
def test_vaccination_file_upload_whitespace_normalization(
    setup_vaccs,
    page,
    point_of_care_file_generator,
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
        page, point_of_care_file_generator
    ).upload_and_verify_output(
        VaccsFileMapping.WHITESPACE,
        session_id=setup_vaccs,
    )
    ImportsPage(page).header.click_mavis()
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
    point_of_care_file_generator,
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
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_and_verify_output(
        VaccsFileMapping.CLINIC_NAME_CASE,
        session_id=setup_vaccs,
    )
