import pytest

from mavis.test.annotations import issue
from mavis.test.data import CohortsFileMapping
from mavis.test.models import Programme, ReportFormat


@pytest.fixture
def setup_cohort_upload(
    log_in_as_nurse,
    dashboard_page,
    programmes_list_page,
    programme_overview_page,
    programme_children_page,
):
    dashboard_page.click_programmes()
    programmes_list_page.click_programme_for_current_year(Programme.HPV)
    programme_overview_page.click_children_tab()
    programme_children_page.click_import_child_records()


@pytest.fixture
def setup_reports(log_in_as_nurse, dashboard_page):
    dashboard_page.click_programmes()


@pytest.mark.cohorts
def test_cohort_upload_with_valid_file(setup_cohort_upload, import_records_page):
    """
    Test: Upload a valid cohort (class list) file and verify successful import.
    Steps:
    1. Navigate to cohort import page.
    2. Upload a valid cohort file.
    Verification:
    - Import completes successfully with expected records.
    """
    import_records_page.import_class_list(CohortsFileMapping.POSITIVE)


@pytest.mark.cohorts
def test_cohort_upload_with_invalid_file(setup_cohort_upload, import_records_page):
    """
    Test: Upload an invalid cohort (class list) file and verify error handling.
    Steps:
    1. Navigate to cohort import page.
    2. Upload a cohort file with invalid data.
    Verification:
    - Import fails and error is shown.
    """
    import_records_page.import_class_list(CohortsFileMapping.NEGATIVE)


@pytest.mark.cohorts
def test_cohort_upload_with_invalid_structure(setup_cohort_upload, import_records_page):
    """
    Test: Upload a cohort file with invalid structure and verify error handling.
    Steps:
    1. Navigate to cohort import page.
    2. Upload a file with incorrect structure.
    Verification:
    - Import fails and structural error is shown.
    """
    import_records_page.import_class_list(CohortsFileMapping.INVALID_STRUCTURE)


@pytest.mark.cohorts
def test_cohort_upload_with_header_only_file(setup_cohort_upload, import_records_page):
    """
    Test: Upload a cohort file with only headers and verify no records are imported.
    Steps:
    1. Navigate to cohort import page.
    2. Upload a header-only file.
    Verification:
    - No records are imported and appropriate message is shown.
    """
    import_records_page.import_class_list(CohortsFileMapping.HEADER_ONLY)


@pytest.mark.cohorts
def test_cohort_upload_with_empty_file(setup_cohort_upload, import_records_page):
    """
    Test: Upload an empty cohort file and verify error handling.
    Steps:
    1. Navigate to cohort import page.
    2. Upload an empty file.
    Verification:
    - Import fails and error is shown.
    """
    import_records_page.import_class_list(CohortsFileMapping.EMPTY_FILE)


@issue("MAV-909")
@issue("MAV-1716")
@pytest.mark.cohorts
@pytest.mark.bug
def test_archive_and_unarchive_child_via_cohort_upload(
    setup_cohort_upload,
    programmes_list_page,
    programme_overview_page,
    programme_children_page,
    dashboard_page,
    children_search_page,
    child_record_page,
    child_archive_page,
    import_records_page,
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

    import_records_page.import_class_list(CohortsFileMapping.FIXED_CHILD)

    dashboard_page.click_mavis()
    dashboard_page.click_children()
    children_search_page.search_with_all_filters_for_child_name(str(child))
    children_search_page.click_record_for_child(child)
    child_record_page.click_archive_child_record()
    child_archive_page.archive_child_record()

    dashboard_page.click_mavis()
    dashboard_page.click_programmes()
    programmes_list_page.click_programme_for_current_year(Programme.HPV)
    programme_overview_page.click_children_tab()
    programme_children_page.click_import_child_records()

    import_records_page.import_class_list(CohortsFileMapping.FIXED_CHILD)

    dashboard_page.click_mavis()
    dashboard_page.click_children()
    children_search_page.search_with_all_filters_for_child_name(str(child))
    children_search_page.click_record_for_child(child)
    child_record_page.check_child_is_unarchived()


@pytest.fixture
def upload_offline_vaccination_hpv(upload_offline_vaccination):
    yield from upload_offline_vaccination(Programme.HPV)


@pytest.mark.rav
@pytest.mark.bug
def test_edit_vaccination_dose_to_not_given(
    upload_offline_vaccination_hpv,
    programme_children_page,
    vaccination_record_page,
    edit_vaccination_record_page,
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
    vaccination_record_page.click_edit_vaccination_record()
    edit_vaccination_record_page.click_change_outcome()
    edit_vaccination_record_page.click_they_refused_it()
    edit_vaccination_record_page.click_continue()
    edit_vaccination_record_page.click_save_changes()
    programme_children_page.expect_alert_text("Vaccination outcome recorded for HPV")


@pytest.mark.reports
def test_verify_careplus_report_for_hpv(
    setup_reports, programmes_list_page, programme_overview_page
):
    """
    Test: Generate and verify CarePlus report for HPV programme.
    Steps:
    1. Navigate to reports page.
    2. Generate CarePlus report for HPV.
    Verification:
    - Report is generated in CarePlus format for HPV.
    """
    programmes_list_page.click_programme_for_current_year(Programme.HPV)
    programme_overview_page.verify_report_format(
        report_format=ReportFormat.CAREPLUS,
    )


@pytest.mark.reports
def test_verify_careplus_report_for_doubles(
    setup_reports, programmes_list_page, programme_overview_page, dashboard_page
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
    programmes_list_page.click_programme_for_current_year(Programme.MENACWY)
    programme_overview_page.verify_report_format(
        report_format=ReportFormat.CAREPLUS,
    )
    dashboard_page.click_mavis()
    dashboard_page.click_programmes()
    programmes_list_page.click_programme_for_current_year(Programme.TD_IPV)
    programme_overview_page.verify_report_format(
        report_format=ReportFormat.CAREPLUS,
    )


@pytest.mark.reports
def test_verify_csv_report_for_hpv(
    setup_reports, programmes_list_page, programme_overview_page
):
    """
    Test: Generate and verify CSV report for HPV programme.
    Steps:
    1. Navigate to reports page.
    2. Generate CSV report for HPV.
    Verification:
    - Report is generated in CSV format for HPV.
    """
    programmes_list_page.click_programme_for_current_year(Programme.HPV)
    programme_overview_page.verify_report_format(
        report_format=ReportFormat.CSV,
    )


@pytest.mark.reports
def test_verify_csv_report_for_doubles(
    setup_reports, dashboard_page, programmes_list_page, programme_overview_page
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
    programmes_list_page.click_programme_for_current_year(Programme.MENACWY)
    programme_overview_page.verify_report_format(
        report_format=ReportFormat.CSV,
    )
    dashboard_page.click_mavis()
    dashboard_page.click_programmes()
    programmes_list_page.click_programme_for_current_year(Programme.TD_IPV)
    programme_overview_page.verify_report_format(
        report_format=ReportFormat.CSV,
    )


@pytest.mark.reports
def test_verify_systmone_report_for_hpv(
    setup_reports, programmes_list_page, programme_overview_page
):
    """
    Test: Generate and verify SystmOne report for HPV programme.
    Steps:
    1. Navigate to reports page.
    2. Generate SystmOne report for HPV.
    Verification:
    - Report is generated in SystmOne format for HPV.
    """
    programmes_list_page.click_programme_for_current_year(Programme.HPV)
    programme_overview_page.verify_report_format(
        report_format=ReportFormat.SYSTMONE,
    )


@pytest.mark.reports
def test_verify_systmone_report_for_menacwy(
    setup_reports, programmes_list_page, programme_overview_page
):
    """
    Test: Generate and verify SystmOne report for MenACWY programme.
    Steps:
    1. Navigate to reports page.
    2. Generate SystmOne report for MenACWY.
    Verification:
    - Report is generated in SystmOne format for MenACWY.
    """
    programmes_list_page.click_programme_for_current_year(Programme.MENACWY)
    programme_overview_page.verify_report_format(
        report_format=ReportFormat.SYSTMONE,
    )


@pytest.mark.reports
def test_verify_careplus_report_for_mmr(
    setup_reports, programmes_list_page, programme_overview_page
):
    """
    Test: Generate and verify CarePlus report for MMR programme.
    Steps:
    1. Navigate to reports page.
    2. Generate CarePlus report for MMR.
    Verification:
    - Report is generated in CarePlus format for MMR.
    """
    programmes_list_page.click_programme_for_current_year(Programme.MMR)
    programme_overview_page.verify_report_format(
        report_format=ReportFormat.CAREPLUS,
    )


@pytest.mark.reports
def test_verify_csv_report_for_mmr(
    setup_reports, programmes_list_page, programme_overview_page
):
    """
    Test: Generate and verify CSV report for MMR programme.
    Steps:
    1. Navigate to reports page.
    2. Generate CSV report for MMR.
    Verification:
    - Report is generated in CSV format for MMR.
    """
    programmes_list_page.click_programme_for_current_year(Programme.MMR)
    programme_overview_page.verify_report_format(
        report_format=ReportFormat.CSV,
    )


@pytest.mark.reports
def test_verify_systmone_report_for_mmr(
    setup_reports, programmes_list_page, programme_overview_page
):
    """
    Test: Generate and verify SystmOne report for MMR programme.
    Steps:
    1. Navigate to reports page.
    2. Generate SystmOne report for MMR.
    Verification:
    - Report is generated in SystmOne format for MMR.
    """
    programmes_list_page.click_programme_for_current_year(Programme.MMR)
    programme_overview_page.verify_report_format(
        report_format=ReportFormat.SYSTMONE,
    )


@pytest.mark.accessibility
def test_accessibility(
    setup_reports,
    dashboard_page,
    accessibility_helper,
    programmes_list_page,
    programme_overview_page,
):
    """
    Test: Check accessibility of the programmes page.
    Steps:
    1. Navigate to programmes page.
    Verification:
    - Page passes accessibility checks.
    """
    accessibility_helper.check_accessibility()

    programmes_list_page.click_programme_for_current_year(Programme.FLU)
    accessibility_helper.check_accessibility()

    programme_overview_page.click_download_report()
    accessibility_helper.check_accessibility()

    programme_overview_page.click_continue()
    accessibility_helper.check_accessibility()

    dashboard_page.click_mavis()
    dashboard_page.click_programmes()
    programmes_list_page.click_programme_for_current_year(Programme.FLU)

    programme_overview_page.click_sessions_tab()
    accessibility_helper.check_accessibility()

    programme_overview_page.click_children_tab()
    accessibility_helper.check_accessibility()
