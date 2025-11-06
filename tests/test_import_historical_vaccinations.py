import pytest

from mavis.test.data import VaccsFileMapping


@pytest.fixture
def setup_hist_vaccs(
    log_in_as_nurse,
    dashboard_page,
    import_records_page,
):
    dashboard_page.click_mavis()
    dashboard_page.click_import_records()
    import_records_page.navigate_to_vaccination_records_import()


@pytest.mark.vaccinations
def test_vaccination_file_upload_historic_valid_data(
    setup_hist_vaccs, import_records_page
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
    Doubles:
    TDIPV_Revaxis, TDIPV_NFA, TDIPV_Add_Not_Known, TDIPV_AllowPastExpiryDate,
    TDIPV_SiteRAU, TDIPV_SiteRAL, TDIPV_NotVaccinated, MenACWY_MenQuadfi, MenACWY_NFA,
    MenACWY_Add_Not_Known, MenACWY_AllowPastExpiryDate, MenACWY_SiteRAU,MenACWY_SiteRAL,
    MenACWY_NotVaccinated, MAV_855, MenACWY_BatchName100Chars,
    MMR:
    MMR, MMR_NFA, MMR_Add_Not_Known, MMR_AllowPastExpiryDate, MMR_SiteRAU, MMR_SiteRAL,
    MMR_NotVaccinated, MMR_DoseSeq1, MMR_DoseSeq2
    """
    import_records_page.upload_and_verify_output(VaccsFileMapping.HIST_POSITIVE)


@pytest.mark.vaccinations
def test_vaccination_file_upload_historic_invalid_data(
    setup_hist_vaccs,
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
    import_records_page.upload_and_verify_output(VaccsFileMapping.HIST_NEGATIVE)
