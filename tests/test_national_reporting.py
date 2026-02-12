import pytest

from mavis.test.data import VaccsFileMapping
from mavis.test.pages import (
    DashboardPage,
    ImportRecordsWizardPage,
    ImportsPage,
    LogInPage,
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

    HPV_InvalidODSCode, HPV_EmptyOrgCode, HPV_EmptySchoolURN, HPV_NotKnownSchoolEmpty,
    HPV_LongNHSNumber, HPV_ShortNHSNumber, HPV_EmptyForename, HPV_EmptyLastname,
    HPV_EmptyDOB, HPV_InvalidFormatDOB, HPV_FutureDOB, HPV_NonLeapYearDOB,
    HPV_EmptyGender, HPV_InvalidGender, HPV_EmptyPostCode, HPV_InvalidPostCode,
    HPV_EmptyVaccDate, HPV_FutureVaccDate, HPV_EmptyVaccGiven, HPV_EmptyBatchNumber,
    HPV_EmptyExpiryDate, HPV_EmptyAnatomicalSite, HPV_InvalidAnatomicalSite,
    HPV_EmptyDoseSeq, HPV_InvalidDoseSeq, HPV_EmptyCareSetting, HPV_InvalidProfFName,
    HPV_InvalidProfSName, HPV_InvalidProfEmail, HPV_InvalidClinic, HPV_InvalidTime,
    HPV_InvalidReason, HPV_InvalidVaccinatedFlag, HPV_InvalidCareSetting,
    HPV_TimeInFuture, HPV_VaccinatedFlagEmpty,
    """
    ImportRecordsWizardPage(
        page, national_reporting_file_generator
    ).upload_and_verify_output(VaccsFileMapping.NATIONAL_REPORTING_NEGATIVE)
