import pytest

from mavis.test.annotations import issue
from mavis.test.constants import Programme, ReportFormat
from mavis.test.data import CohortsFileMapping
from mavis.test.helpers.accessibility_helper import AccessibilityHelper
from mavis.test.pages import (
    ChildArchivePage,
    ChildRecordPage,
    ChildrenSearchPage,
    DashboardPage,
    EditVaccinationRecordPage,
    ImportRecordsWizardPage,
    ImportsPage,
    ProgrammeChildrenPage,
    ProgrammeOverviewPage,
    ProgrammesListPage,
    VaccinationRecordPage,
)
from mavis.test.utils import expect_alert_text


@pytest.fixture
def setup_cohort_upload(
    log_in_as_nurse,
    page,
):
    DashboardPage(page).click_programmes()
    ProgrammesListPage(page).click_programme_for_current_year(Programme.HPV)
    ProgrammeOverviewPage(page).tabs.click_children_tab()
    ProgrammeChildrenPage(page).click_import_child_records()


@pytest.fixture
def setup_reports(log_in_as_nurse, page):
    DashboardPage(page).click_programmes()


@pytest.mark.cohorts
def test_cohort_upload_with_valid_file(setup_cohort_upload, page, test_data):
    """
    Test: Upload a valid cohort (class list) file and verify successful import.
    Steps:
    1. Navigate to cohort import page.
    2. Upload a valid cohort file.
    Verification:
    - Import completes successfully with expected records.
    """
    ImportRecordsWizardPage(page, test_data).import_class_list(
        CohortsFileMapping.POSITIVE
    )


@pytest.mark.cohorts
def test_cohort_upload_with_invalid_file(setup_cohort_upload, page, test_data):
    """
    Test: Upload an invalid cohort (class list) file and verify error handling.
    Steps:
    1. Navigate to cohort import page.
    2. Upload a cohort file with invalid data.
    Verification:
    - Import fails and error is shown.
    """
    ImportRecordsWizardPage(page, test_data).import_class_list(
        CohortsFileMapping.NEGATIVE
    )


@pytest.mark.cohorts
def test_cohort_upload_with_invalid_structure(setup_cohort_upload, page, test_data):
    """
    Test: Upload a cohort file with invalid structure and verify error handling.
    Steps:
    1. Navigate to cohort import page.
    2. Upload a file with incorrect structure.
    Verification:
    - Import fails and structural error is shown.
    """
    ImportRecordsWizardPage(page, test_data).import_class_list(
        CohortsFileMapping.INVALID_STRUCTURE
    )


@pytest.mark.cohorts
def test_cohort_upload_with_header_only_file(setup_cohort_upload, page, test_data):
    """
    Test: Upload a cohort file with only headers and verify no records are imported.
    Steps:
    1. Navigate to cohort import page.
    2. Upload a header-only file.
    Verification:
    - No records are imported and appropriate message is shown.
    """
    ImportRecordsWizardPage(page, test_data).import_class_list(
        CohortsFileMapping.HEADER_ONLY
    )


@pytest.mark.cohorts
def test_cohort_upload_with_empty_file(setup_cohort_upload, page, test_data):
    """
    Test: Upload an empty cohort file and verify error handling.
    Steps:
    1. Navigate to cohort import page.
    2. Upload an empty file.
    Verification:
    - Import fails and error is shown.
    """
    ImportRecordsWizardPage(page, test_data).import_class_list(
        CohortsFileMapping.EMPTY_FILE
    )


@issue("MAV-909")
@issue("MAV-1716")
@pytest.mark.cohorts
@pytest.mark.bug
def test_archive_and_unarchive_child_via_cohort_upload(
    setup_cohort_upload,
    page,
    test_data,
    children,
):
    """
    Test: Archive a child via cohort upload and then unarchive by re-uploading.
    Steps:
    1. Import a fixed child cohort file.
    2. Archive the child from the children page.
    3. Re-import the same cohort file.
    4. Verify the child is unarchived.
    Verification:
    - Child is archived after first import and unarchived after second import.
    """
    child = children[Programme.HPV][0]

    ImportRecordsWizardPage(page, test_data).import_class_list(
        CohortsFileMapping.FIXED_CHILD
    )

    ImportsPage(page).header.click_children_header()
    ChildrenSearchPage(page).search_with_all_filters_for_child_name(str(child))
    ChildrenSearchPage(page).click_record_for_child(child)
    ChildRecordPage(page).click_archive_child_record()
    ChildArchivePage(page).archive_child_record()

    ChildRecordPage(page).header.click_programmes_header()
    ProgrammesListPage(page).click_programme_for_current_year(Programme.HPV)
    ProgrammeOverviewPage(page).tabs.click_children_tab()
    ProgrammeChildrenPage(page).click_import_child_records()

    ImportRecordsWizardPage(page, test_data).import_class_list(
        CohortsFileMapping.FIXED_CHILD
    )

    ImportsPage(page).header.click_children_header()
    ChildrenSearchPage(page).search_with_all_filters_for_child_name(str(child))
    ChildrenSearchPage(page).click_record_for_child(child)
    ChildRecordPage(page).check_child_is_unarchived()


@pytest.fixture
def upload_offline_vaccination_hpv(upload_offline_vaccination):
    yield from upload_offline_vaccination(Programme.HPV)


@pytest.mark.rav
@pytest.mark.bug
def test_edit_vaccination_dose_to_not_given(
    upload_offline_vaccination_hpv,
    page,
):
    """
    Test: Edit a vaccination dose to 'not given' and verify outcome.
    Steps:
    1. Navigate to the child in the programme.
    2. Edit the vaccination record and change outcome to 'they refused it'.
    3. Save changes.
    Verification:
    - Alert confirms vaccination outcome recorded as refused.
    """
    VaccinationRecordPage(page).click_edit_vaccination_record()
    EditVaccinationRecordPage(page).click_change_outcome()
    EditVaccinationRecordPage(page).click_they_refused_it()
    EditVaccinationRecordPage(page).click_continue()
    EditVaccinationRecordPage(page).click_save_changes()
    expect_alert_text(page, "Vaccination outcome recorded for HPV")


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
    ProgrammeOverviewPage(page).header.click_programmes_header()
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
    ProgrammeOverviewPage(page).header.click_programmes_header()
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

    ProgrammeOverviewPage(page).header.click_programmes_header()
    ProgrammesListPage(page).click_programme_for_current_year(Programme.FLU)

    ProgrammeOverviewPage(page).tabs.click_sessions_tab()
    AccessibilityHelper(page).check_accessibility()

    ProgrammeOverviewPage(page).tabs.click_children_tab()
    AccessibilityHelper(page).check_accessibility()
