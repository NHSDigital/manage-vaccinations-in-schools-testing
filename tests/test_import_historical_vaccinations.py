import pytest

from mavis.test.constants import Programme
from mavis.test.data import VaccsFileMapping
from mavis.test.pages import (
    ChildRecordPage,
    ChildrenSearchPage,
    DashboardPage,
    ImportRecordsWizardPage,
    ImportsPage,
)


@pytest.fixture
def setup_hist_vaccs(
    log_in_as_nurse,
    page,
    file_generator,
):
    DashboardPage(page).click_imports()
    ImportsPage(page).click_upload_records()
    ImportRecordsWizardPage(
        page, file_generator
    ).navigate_to_vaccination_records_import()


@pytest.mark.vaccinations
def test_vaccination_file_upload_historic_valid_data(
    setup_hist_vaccs,
    page,
    file_generator,
):
    """
    Test: Upload a historic vaccination records file with valid data and verify import.
    Steps:
    1. Navigate to vaccination records import page.
    2. Upload a historic file with valid data.
    Verification:
    - Output indicates successful import of historic records.
    Scenarios covered:
    HPV:
    HPV_Gardasil9, HPV_Gardasil, HPV_Cervarix, HPV_NFA, HPV_Add_Not_Known,
    HPV_AllowPastExpiryDate, HPV_SiteRAU, HPV_SiteRAL, HPV_NotVaccinated,
    HPV_AddressNFA, HPV_AddressNotKnown, HPV_AddressNotSpecified
    Doubles:
    TDIPV_Revaxis, TDIPV_NFA, TDIPV_Add_Not_Known, TDIPV_AllowPastExpiryDate,
    TDIPV_SiteRAU, TDIPV_SiteRAL, TDIPV_NotVaccinated, MenACWY_MenQuadfi, MenACWY_NFA,
    MenACWY_Add_Not_Known, MenACWY_AllowPastExpiryDate, MenACWY_SiteRAU,MenACWY_SiteRAL,
    MenACWY_NotVaccinated, MAV_855, MenACWY_BatchName100Chars,
    MMR:
    MMR, MMR_NFA, MMR_Add_Not_Known, MMR_AllowPastExpiryDate, MMR_SiteRAU, MMR_SiteRAL,
    MMR_NotVaccinated, MMR_DoseSeq1, MMR_DoseSeq2
    """
    ImportRecordsWizardPage(page, file_generator).upload_and_verify_output(
        VaccsFileMapping.HIST_POSITIVE
    )


@pytest.mark.vaccinations
def test_vaccination_file_upload_historic_invalid_data(
    setup_hist_vaccs,
    page,
    file_generator,
):
    """
    Test: Upload a historic vaccination records file with invalid data and
       verify error handling.
    Steps:
    1. Navigate to vaccination records import page.
    2. Upload a historic file with invalid data.
    Verification:
    - Output lists errors as expected for each record
    Scenarios covered:
    InvalidODSCode, EmptyOrgCode, EmptySchoolURN, NotKnownSchoolEmpty, LongNHSNumber,
    ShortNHSNumber, EmptyForename, EmptyLastname, EmptyDOB, InvalidFormatDOB, FutureDOB,
    NonLeapYearDOB, EmptyGender, InvalidGender, EmptyPostCode, InvalidPostCode,
    EmptyVaccDate, FutureVaccDate, EmptyVaccGiven, EmptyBatchNumber, EmptyExpiryDate,
    EmptyAnatomicalSite, InvalidAnatomicalSite, InvalidAnatomicalSite,
    InvalidAnatomicalSite, EmptyDoseSeq, InvalidDoseSeq, EmptyCareSetting,
    InvalidProfFName, InvalidProfSName, InvalidProfEmail, InvalidClinic, InvalidTime,
    InvalidReason, InvalidVaccinatedFlag, InvalidCareSetting, TimeInFuture,
    LongBatchNumber
    """
    ImportRecordsWizardPage(page, file_generator).upload_and_verify_output(
        VaccsFileMapping.HIST_NEGATIVE
    )


def test_historical_vaccination_file_upload_creates_child(
    setup_hist_vaccs,
    schools,
    page,
    file_generator,
    children,
):
    """
    Test: Upload a vaccination file and verify the child record and vaccination record
       exist.
    Steps:
    1. Upload a vaccination file for a child not in mavis.
    2. Navigate to children page and search for the child.
    3. Open vaccination details for the child.
    Verification:
    - Vaccination record and child record exist.
    """
    child = children[Programme.HPV][0]
    school = schools[Programme.HPV][0]

    ImportRecordsWizardPage(page, file_generator).upload_and_verify_output(
        VaccsFileMapping.HIST_HPV
    )

    ImportsPage(page).header.click_mavis_header()
    DashboardPage(page).click_children()

    ChildrenSearchPage(page).search.click_advanced_filters()
    ChildrenSearchPage(page).search.check_children_aged_out_of_programmes()
    ChildrenSearchPage(page).search.search_for_child_name_with_all_filters(str(child))
    ChildrenSearchPage(page).search.click_child(child)
    ChildRecordPage(page).click_vaccination_details(school)
