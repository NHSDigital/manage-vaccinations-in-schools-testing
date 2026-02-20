import pytest

from mavis.test.constants import (
    Programme,
)
from mavis.test.data import VaccsFileMapping
from mavis.test.pages import (
    ChildRecordPage,
    ChildrenSearchPage,
    DashboardPage,
    ImportRecordsWizardPage,
    ImportsPage,
    LogInPage,
    VaccinationRecordPage,
)

pytestmark = pytest.mark.national_reporting


@pytest.fixture
def setup_national_reporting_import(
    page,
    national_reporting_nurse,
    national_reporting_team,
):
    LogInPage(page).navigate()
    LogInPage(page).log_in_and_choose_team_if_necessary(
        national_reporting_nurse, national_reporting_team
    )
    DashboardPage(page).click_imports()
    ImportsPage(page).click_upload_records()


def test_national_reporting_valid_data(
    setup_national_reporting_import,
    page,
    national_reporting_file_generator,
):
    """
    Test: Upload vaccination records file with valid data and verify import.
    Steps:
    1. Navigate to vaccination records import page.
    2. Upload a vaccination record file with valid data.
    Verification:
    - Output indicates successful import of records.
    Scenarios covered:
    HPV:
    HPV_Gardasil9, HPV_Gardasil, HPV_Cervarix, HPV_NFA, HPV_Add_Not_Known,
    HPV_AllowPastExpiryDate, HPV_SiteRAU, HPV_SiteRAL, HPV_NotVaccinated,
    HPV_PostcodeNFA, HPV_PostcodeAddressNotKnown, HPV_PostcodeAddressNotSpecified
    Flu:
    Flu_Optional, Flu_NFA, Flu_Add_Not_Known, Flu_AllowPastExpiryDate,
    Flu_SiteRAU, Flu_SiteRAL, Flu_NotVaccinated, Flu_BatchName100Chars
    """
    ImportRecordsWizardPage(
        page, national_reporting_file_generator
    ).upload_and_verify_output(VaccsFileMapping.NATIONAL_REPORTING_POSITIVE)


def test_national_reporting_invalid_data(
    setup_national_reporting_import,
    page,
    national_reporting_file_generator,
):
    """
    Test: Upload an invalid vaccination records file and verify error handling.
    Steps:
    1. Navigate to vaccination records import page.
    2. Upload a vaccination file with invalid data.
    Verification:
    - Output lists errors as expected for each record
    Scenarios covered:

    HPV_EmptyOrgCode, HPV_EmptySchoolURN, HPV_LongNHSNumber, HPV_ShortNHSNumber,
    HPV_EmptyForename, HPV_EmptyLastname, HPV_EmptyDOB, HPV_InvalidFormatDOB,
    HPV_FutureDOB, HPV_NonLeapYearDOB, HPV_EmptyGender, HPV_InvalidGender,
    HPV_EmptyPostCode, HPV_InvalidPostCode, HPV_EmptyVaccDate, HPV_FutureVaccDate,
    HPV_EmptyVaccGiven, HPV_EmptyBatchNumber, HPV_EmptyExpiryDate,
    HPV_EmptyAnatomicalSite, HPV_InvalidAnatomicalSite, HPV_InappropriateAnatomicalSite,
    HPV_EmptyDoseSeq, HPV_InvalidDoseSeq, HPV_InvalidTime, HPV_InvalidVaccinatedFlag,
    HPV_TimeInFuture
    """
    ImportRecordsWizardPage(
        page, national_reporting_file_generator
    ).upload_and_verify_output(VaccsFileMapping.NATIONAL_REPORTING_NEGATIVE)


def test_national_reporting_upload_creates_vaccination_record(
    setup_national_reporting_import,
    schools,
    page,
    point_of_care_file_generator,
    children,
):
    """
    Test: Upload a vaccination file with a fixed child and school
    Steps:
    1. Upload a vaccination file.
    2. Navigate to children page and search for the child.
    3. Open vaccination details for the child.
    Verification:
    - Vaccination location is displayed as the school.
    - Source shows as National Reporting
    """
    child = children[Programme.HPV][0]
    school = schools[Programme.HPV][0]

    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_and_verify_output(VaccsFileMapping.NATIONAL_REPORTING_HPV)
    ImportsPage(page).header.click_mavis_header()
    DashboardPage(page).click_children()

    ChildrenSearchPage(page).search.search_and_click_child(child)
    ChildRecordPage(page).click_vaccination_details(school)
    VaccinationRecordPage(page).expect_vaccination_details("Location", str(school))
    VaccinationRecordPage(page).expect_vaccination_details(
        "Source", "Mavis national reporting upload"
    )
