import pytest

from mavis.test.constants import Programme, ReportFormat
from mavis.test.helpers.accessibility_helper import AccessibilityHelper
from mavis.test.pages import (
    DashboardPage,
    ProgrammeOverviewPage,
    ProgrammesListPage,
)


@pytest.fixture
def setup_reports(log_in_as_nurse, page):
    DashboardPage(page).click_programmes()


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
    ProgrammesListPage(page).click_programme_for_current_year(Programme.HPV)
    ProgrammeOverviewPage(page).verify_report_format(
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
    ProgrammesListPage(page).click_programme_for_current_year(Programme.MENACWY)
    ProgrammeOverviewPage(page).verify_report_format(
        report_format=ReportFormat.CAREPLUS,
    )
    ProgrammeOverviewPage(page).header.click_mavis_header()
    DashboardPage(page).click_programmes()
    ProgrammesListPage(page).click_programme_for_current_year(Programme.TD_IPV)
    ProgrammeOverviewPage(page).verify_report_format(
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
    ProgrammesListPage(page).click_programme_for_current_year(Programme.HPV)
    ProgrammeOverviewPage(page).verify_report_format(
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
    ProgrammesListPage(page).click_programme_for_current_year(Programme.MENACWY)
    ProgrammeOverviewPage(page).verify_report_format(
        report_format=ReportFormat.CSV,
    )
    ProgrammeOverviewPage(page).header.click_mavis_header()
    DashboardPage(page).click_programmes()
    ProgrammesListPage(page).click_programme_for_current_year(Programme.TD_IPV)
    ProgrammeOverviewPage(page).verify_report_format(
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
    ProgrammesListPage(page).click_programme_for_current_year(Programme.HPV)
    ProgrammeOverviewPage(page).verify_report_format(
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
    ProgrammesListPage(page).click_programme_for_current_year(Programme.MENACWY)
    ProgrammeOverviewPage(page).verify_report_format(
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
    ProgrammesListPage(page).click_programme_for_current_year(Programme.MMR)
    ProgrammeOverviewPage(page).verify_report_format(
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
    ProgrammesListPage(page).click_programme_for_current_year(Programme.MMR)
    ProgrammeOverviewPage(page).verify_report_format(
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
    ProgrammesListPage(page).click_programme_for_current_year(Programme.MMR)
    ProgrammeOverviewPage(page).verify_report_format(
        report_format=ReportFormat.SYSTMONE,
    )


@pytest.mark.accessibility
def test_accessibility(
    setup_reports,
    page,
):
    """
    Test: Check accessibility of the programmes page.
    Steps:
    1. Navigate to programmes page.
    Verification:
    - Page passes accessibility checks.
    """
    AccessibilityHelper(page).check_accessibility()

    ProgrammesListPage(page).click_programme_for_current_year(Programme.FLU)
    AccessibilityHelper(page).check_accessibility()

    ProgrammeOverviewPage(page).click_download_report()
    AccessibilityHelper(page).check_accessibility()

    ProgrammeOverviewPage(page).click_continue()
    AccessibilityHelper(page).check_accessibility()

    ProgrammeOverviewPage(page).header.click_mavis_header()
    DashboardPage(page).click_programmes()
    ProgrammesListPage(page).click_programme_for_current_year(Programme.FLU)

    ProgrammeOverviewPage(page).tabs.click_sessions_tab()
    AccessibilityHelper(page).check_accessibility()

    ProgrammeOverviewPage(page).tabs.click_children_tab()
    AccessibilityHelper(page).check_accessibility()
