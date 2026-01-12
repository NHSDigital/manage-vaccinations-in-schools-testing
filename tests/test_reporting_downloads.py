import pytest

from mavis.test.constants import Programme, ReportFormat
from mavis.test.pages import (
    DashboardPage,
    ReportsDownloadPage,
    ReportsVaccinationsPage,
    VaccinationReportPage,
)

pytestmark = pytest.mark.reporting


@pytest.fixture
def setup_reports(log_in_as_nurse, page):
    DashboardPage(page).click_reports()
    ReportsVaccinationsPage(page).tabs.click_download_data_tab()
    ReportsDownloadPage(page).click_continue()


@pytest.mark.reports
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


@pytest.mark.reports
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


@pytest.mark.reports
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


@pytest.mark.reports
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


@pytest.mark.reports
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


@pytest.mark.reports
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


@pytest.mark.reports
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
    VaccinationReportPage(page).choose_programme(Programme.MMR)
    VaccinationReportPage(page).verify_report_format(
        report_format=ReportFormat.CAREPLUS,
    )


@pytest.mark.reports
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
    VaccinationReportPage(page).choose_programme(Programme.MMR)
    VaccinationReportPage(page).verify_report_format(
        report_format=ReportFormat.CSV,
    )


@pytest.mark.reports
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
    VaccinationReportPage(page).choose_programme(Programme.MMR)
    VaccinationReportPage(page).verify_report_format(
        report_format=ReportFormat.SYSTMONE,
    )
