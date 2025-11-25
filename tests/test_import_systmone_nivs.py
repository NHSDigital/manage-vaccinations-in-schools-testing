import pytest

from mavis.test.annotations import issue
from mavis.test.data import VaccsFileMapping


@pytest.fixture
def setup_systmone_nivs(
    log_in_as_nurse,
    dashboard_page,
    import_records_wizard_page,
    imports_page,
):
    dashboard_page.click_mavis()
    dashboard_page.click_imports()
    imports_page.click_upload_records()
    import_records_wizard_page.navigate_to_vaccination_records_import()


@pytest.mark.vaccinations
def test_vaccination_file_upload_systmone_valid_data(
    setup_systmone_nivs,
    import_records_wizard_page,
):
    """
    Test: Upload a SystmOne vaccination records file with valid data and verify import.
    Steps:
    1. Navigate to vaccination records import page.
    2. Upload a SystmOne file with valid data.
    Verification:
    - Output indicates successful import of SystmOne records.
    Scenarios covered:
    AllValuesCervarix, AllValuesG9, AllValuesHistorical, MandatoryValues, Batch100Chars,
    AllValuesMMR_DoseSeq1, AllValuesMMR_DoseSeq2
    """
    import_records_wizard_page.upload_and_verify_output(
        VaccsFileMapping.SYSTMONE_POSITIVE
    )


@pytest.mark.vaccinations
def test_vaccination_file_upload_systmone_invalid_data(
    setup_systmone_nivs,
    import_records_wizard_page,
):
    """
    Test: Upload a SystmOne vaccination records file with invalid data and
       verify error handling.
    Steps:
    1. Navigate to vaccination records import page.
    2. Upload a SystmOne file with invalid data.
    Verification:
    - Output lists errors as expected for each record
    Scenarios covered:
    EmptyDoB, InvalidDoB, LongerNHSNo, ShorterNHSNo, InvalidVaccsType, InvalidVaccsDose,
    InvalidVaccsType, EmptyFirstName, EmptyPostcode, InvalidPostcode, EmptySex,
    InvalidSex, EmptyLastName, EmptyEventDate, InvalidEventDate, FutureEventDate,
    PastEventDate, InvalidEventTime, FutureEventTime, InvalidSchoolURN, LongBatchNumber,
    AllValuesMMR_DoseSeq3
    """
    import_records_wizard_page.upload_and_verify_output(
        VaccsFileMapping.SYSTMONE_NEGATIVE
    )


@pytest.mark.vaccinations
def test_vaccination_file_upload_systmone_historic_invalid_data(
    setup_systmone_nivs,
    import_records_wizard_page,
):
    """
    Test: Upload a SystmOne historic vaccination records file with invalid data and
       verify error handling.
    Steps:
    1. Navigate to vaccination records import page.
    2. Upload a SystmOne historic file with invalid data.
    Verification:
    - Output lists errors as expected for each record
    Scenarios covered:
    EmptyDoB, InvalidDoB, LongerNHSNo, ShorterNHSNo, InvalidVaccsType, InvalidVaccsDose,
    InvalidVaccsType, EmptyFirstName, EmptyPostcode, InvalidPostcode, EmptySex,
    InvalidSex, EmptyLastName, EmptyEventDate, InvalidEventDate, FutureEventDate,
    PastEventDate, InvalidEventTime, InvalidSchoolURN
    """
    import_records_wizard_page.upload_and_verify_output(
        VaccsFileMapping.SYSTMONE_HIST_NEGATIVE,
    )


@pytest.mark.vaccinations
@pytest.mark.bug
def test_vaccination_file_upload_systmone_whitespace_normalization(
    setup_systmone_nivs,
    import_records_wizard_page,
):
    """
    Test: Upload a SystmOne vaccination records file with extra whitespace and
       verify normalization.
    Steps:
    1. Upload a SystmOne file with whitespace issues.
    Verification:
    - Output indicates successful normalization and import.
    Scenarios covered:
    TwoSpaces, Tabs, NBSP (non-breaking space), ZWJ (zero-width joiner),
    HistoricalTwoSpaces, HistoricalTabs, HistoricalNBSP, HistoricalZWJ
    """
    import_records_wizard_page.upload_and_verify_output(
        VaccsFileMapping.SYSTMONE_WHITESPACE,
    )


@issue("MAV-1547")
@pytest.mark.vaccinations
@pytest.mark.bug
def test_vaccination_file_upload_nivs_disallow_flu_for_previous_years(
    setup_systmone_nivs,
    import_records_wizard_page,
):
    """
    Test: Upload a NIVS historic flu vaccination file for previous years and verify
       it is disallowed.
    Steps:
    1. Upload a historic flu file for previous years.
    Verification:
    - Output indicates flu vaccinations for previous years are not allowed.
    """
    import_records_wizard_page.upload_and_verify_output(
        VaccsFileMapping.HIST_FLU_NIVS,
    )


@issue("MAV-1599")
@pytest.mark.vaccinations
@pytest.mark.bug
def test_vaccination_file_upload_systmone_disallow_flu_for_previous_years(
    setup_systmone_nivs,
    import_records_wizard_page,
):
    """
    Test: Upload a SystmOne historic flu vaccination file for previous years and verify
       it is disallowed.
    Steps:
    1. Upload a SystmOne historic flu file for previous years.
    Verification:
    - Output indicates flu vaccinations for previous years are not allowed.
    """
    import_records_wizard_page.upload_and_verify_output(
        VaccsFileMapping.HIST_FLU_SYSTMONE,
    )
