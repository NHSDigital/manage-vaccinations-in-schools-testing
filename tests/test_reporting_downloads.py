import pytest

from mavis.test.annotations import issue
from mavis.test.constants import Programme, ReportFormat, Vaccine
from mavis.test.data import ClassFileMapping, VaccsFileMapping
from mavis.test.pages import (
    DashboardPage,
    ImportRecordsWizardPage,
    ImportsPage,
    ReportsDownloadPage,
    ReportsVaccinationsPage,
    SchoolChildrenPage,
    SchoolsSearchPage,
    SessionsOverviewPage,
    VaccinationReportPage,
)
from mavis.test.pages.utils import schedule_school_session_if_needed

pytestmark = pytest.mark.reporting


@pytest.fixture
def setup_reports(log_in_as_nurse, page):
    DashboardPage(page).click_reports()
    ReportsVaccinationsPage(page).tabs.click_download_data_tab()
    ReportsDownloadPage(page).click_continue()


@pytest.fixture
def setup_mmr_imports(
    log_in_as_nurse,
    schools,
    page,
    point_of_care_file_generator,
    year_groups,
):
    """Set up school session and navigate to vaccination records import page."""
    school = schools[Programme.MMR_MMRV][0]
    year_group = year_groups[Programme.MMR_MMRV]

    DashboardPage(page).click_schools()
    SchoolsSearchPage(page).click_school(school)
    SchoolChildrenPage(page).click_import_class_lists()
    ImportRecordsWizardPage(page, point_of_care_file_generator).import_class_list(
        ClassFileMapping.RANDOM_CHILD, year_group, programme_group=Programme.MMR_MMRV
    )
    schedule_school_session_if_needed(
        page,
        school,
        [Programme.MMR_MMRV],
        [year_group],
    )
    session_id = SessionsOverviewPage(page).get_session_id_from_offline_excel()
    SessionsOverviewPage(page).header.click_mavis()
    DashboardPage(page).click_manage_data()
    ImportsPage(page).click_upload_records()
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).navigate_to_vaccination_records_import()
    return session_id


def test_verify_careplus_report_for_hpv(
    setup_reports,
    page,
):
    """
    Test: Generate and verify CarePlus report for HPV programme.
    Steps:
    1. Navigate to reports page.
    2. Generate CarePlus report for HPV.
    Verification:
    - Report is generated in CarePlus format for HPV.
    """
    VaccinationReportPage(page).choose_programme(Programme.HPV)
    VaccinationReportPage(page).verify_report_format(
        report_format=ReportFormat.CAREPLUS,
    )


def test_verify_careplus_report_for_doubles(
    setup_reports,
    page,
):
    """
    Test: Generate and verify CarePlus report for MenACWY and Td/IPV programmes.
    Steps:
    1. Navigate to reports page.
    2. Generate CarePlus report for MenACWY.
    3. Generate CarePlus report for Td/IPV.
    Verification:
    - Reports are generated in CarePlus format for both MenACWY and Td/IPV.
    """
    VaccinationReportPage(page).choose_programme(Programme.MENACWY)
    VaccinationReportPage(page).verify_report_format(
        report_format=ReportFormat.CAREPLUS,
    )
    page.reload()
    VaccinationReportPage(page).choose_programme(Programme.TD_IPV)
    VaccinationReportPage(page).verify_report_format(
        report_format=ReportFormat.CAREPLUS,
    )


def test_verify_csv_report_for_hpv(
    setup_reports,
    page,
):
    """
    Test: Generate and verify CSV report for HPV programme.
    Steps:
    1. Navigate to reports page.
    2. Generate CSV report for HPV.
    Verification:
    - Report is generated in CSV format for HPV.
    """
    VaccinationReportPage(page).choose_programme(Programme.HPV)
    VaccinationReportPage(page).verify_report_format(
        report_format=ReportFormat.CSV,
    )


def test_verify_csv_report_for_doubles(
    setup_reports,
    page,
):
    """
    Test: Generate and verify CSV report for MenACWY and Td/IPV programmes.
    Steps:
    1. Navigate to reports page.
    2. Generate CSV report for MenACWY.
    3. Generate CSV report for Td/IPV.
    Verification:
    - Reports are generated in CSV format for both MenACWY and Td/IPV.
    """
    VaccinationReportPage(page).choose_programme(Programme.MENACWY)
    VaccinationReportPage(page).verify_report_format(
        report_format=ReportFormat.CSV,
    )
    page.reload()
    VaccinationReportPage(page).choose_programme(Programme.TD_IPV)
    VaccinationReportPage(page).verify_report_format(
        report_format=ReportFormat.CSV,
    )


def test_verify_systmone_report_for_hpv(
    setup_reports,
    page,
):
    """
    Test: Generate and verify SystmOne report for HPV programme.
    Steps:
    1. Navigate to reports page.
    2. Generate SystmOne report for HPV.
    Verification:
    - Report is generated in SystmOne format for HPV.
    """
    VaccinationReportPage(page).choose_programme(Programme.HPV)
    VaccinationReportPage(page).verify_report_format(
        report_format=ReportFormat.SYSTMONE,
    )


def test_verify_systmone_report_for_menacwy(
    setup_reports,
    page,
):
    """
    Test: Generate and verify SystmOne report for MenACWY programme.
    Steps:
    1. Navigate to reports page.
    2. Generate SystmOne report for MenACWY.
    Verification:
    - Report is generated in SystmOne format for MenACWY.
    """
    VaccinationReportPage(page).choose_programme(Programme.MENACWY)
    VaccinationReportPage(page).verify_report_format(
        report_format=ReportFormat.SYSTMONE,
    )


def test_verify_careplus_report_for_mmr(
    setup_reports,
    page,
):
    """
    Test: Generate and verify CarePlus report for MMR programme.
    Steps:
    1. Navigate to reports page.
    2. Generate CarePlus report for MMR.
    Verification:
    - Report is generated in CarePlus format for MMR.
    """
    VaccinationReportPage(page).choose_programme(Programme.MMR_MMRV)
    VaccinationReportPage(page).verify_report_format(
        report_format=ReportFormat.CAREPLUS,
    )


def test_verify_csv_report_for_mmr(
    setup_reports,
    page,
):
    """
    Test: Generate and verify CSV report for MMR programme.
    Steps:
    1. Navigate to reports page.
    2. Generate CSV report for MMR.
    Verification:
    - Report is generated in CSV format for MMR.
    """
    VaccinationReportPage(page).choose_programme(Programme.MMR_MMRV)
    VaccinationReportPage(page).verify_report_format(
        report_format=ReportFormat.CSV,
    )


def test_verify_systmone_report_for_mmr(
    setup_reports,
    page,
):
    """
    Test: Generate and verify SystmOne report for MMR programme.
    Steps:
    1. Navigate to reports page.
    2. Generate SystmOne report for MMR.
    Verification:
    - Report is generated in SystmOne format for MMR.
    """
    VaccinationReportPage(page).choose_programme(Programme.MMR_MMRV)
    VaccinationReportPage(page).verify_report_format(
        report_format=ReportFormat.SYSTMONE,
    )


@issue("MAV-5722")
def test_systmone_mmr_mmrv_procedure_codes(
    setup_mmr_imports,
    page,
    point_of_care_file_generator,
):
    """
    Test: Upload MMR and MMRV vaccination records and verify SystmOne procedure codes.

    Steps:
    1. Navigate to vaccination records import page.
    2. Upload a SystmOne file with MMR dose 1, MMR dose 2, MMRV dose 1, and MMRV dose 2.
    3. Navigate to reports page and download SystmOne report for MMR.
    4. Verify procedure codes in the downloaded report.

    Verification:
    - MMR dose 1 has procedure code: 65M1.
    - MMR dose 2 has procedure code: 65MA.
    - MMRV dose 1 has procedure code: Y3fec
    - MMRV dose 2 has procedure code: Y3fed
    """
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_and_verify_output(
        VaccsFileMapping.MMR_MMRV_PROCEDURE_CODES,
        session_id=setup_mmr_imports,
    )
    ImportRecordsWizardPage(page, point_of_care_file_generator).header.click_mavis()

    DashboardPage(page).click_reports()
    ReportsVaccinationsPage(page).tabs.click_download_data_tab()
    ReportsDownloadPage(page).click_continue()

    VaccinationReportPage(page).choose_programme(Programme.MMR_MMRV)
    VaccinationReportPage(page).click_report_format(ReportFormat.SYSTMONE)

    df = VaccinationReportPage(page).download_report_as_dataframe()
    expected_codes = set(Vaccine.systmone_procedure_codes().values())
    actual_codes = set(df["Vaccination"].dropna())

    missing_codes = expected_codes - actual_codes
    assert not missing_codes, (
        f"Missing expected procedure codes: {missing_codes}. Found: {actual_codes}"
    )
