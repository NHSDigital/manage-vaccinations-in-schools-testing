import pytest
from playwright.sync_api import expect

from mavis.test.accessibility import AccessibilityHelper
from mavis.test.data import ClassFileMapping
from mavis.test.models import Programme
from mavis.test.pages import (
    ChildActivityLogPage,
    ChildRecordPage,
    ChildrenSearchPage,
    DashboardPage,
    DownloadSchoolMovesPage,
    ImportRecordsWizardPage,
    ImportsPage,
    ReviewSchoolMovePage,
    SchoolMovesPage,
    SessionsEditPage,
    SessionsOverviewPage,
    SessionsSearchPage,
)
from mavis.test.utils import get_current_datetime, get_offset_date

pytestmark = pytest.mark.school_moves


@pytest.fixture
def setup_confirm_and_ignore(
    log_in_as_nurse,
    page,
    test_data,
    schools,
    year_groups,
    children,
):
    schools = schools[Programme.HPV]
    year_group = year_groups[Programme.HPV]
    children = children[Programme.HPV]
    # We need to make sure we're uploading the same class with the same NHS numbers.
    input_file_path, output_file_path = test_data.get_file_paths(
        ClassFileMapping.TWO_FIXED_CHILDREN,
    )

    def upload_class_list():
        SessionsOverviewPage(page).click_import_class_lists()
        ImportRecordsWizardPage(page, test_data).select_year_groups(year_group)
        ImportRecordsWizardPage(page, test_data).set_input_file(input_file_path)
        ImportRecordsWizardPage(page, test_data).click_continue()
        upload_time = get_current_datetime()
        ImportRecordsWizardPage(page, test_data).click_uploaded_file_datetime(
            upload_time
        )
        ImportRecordsWizardPage(page, test_data).wait_for_processed()
        if ImportRecordsWizardPage(page, test_data).is_preview_page_link_visible():
            ImportRecordsWizardPage(page, test_data).approve_preview_if_shown(
                upload_time
            )
        ImportRecordsWizardPage(page, test_data).verify_upload_output(
            file_path=output_file_path
        )

    DashboardPage(page).click_sessions()
    SessionsSearchPage(page).click_session_for_programme_group(
        schools[0], Programme.HPV
    )
    if not SessionsOverviewPage(page).is_date_scheduled(get_offset_date(7)):
        SessionsOverviewPage(page).schedule_or_edit_session()
        SessionsEditPage(page).schedule_a_valid_session(
            offset_days=7, skip_weekends=False
        )
    SessionsOverviewPage(page).header.click_sessions_header()
    SessionsSearchPage(page).click_session_for_programme_group(
        schools[1], Programme.HPV
    )
    if not SessionsOverviewPage(page).is_date_scheduled(get_offset_date(7)):
        SessionsOverviewPage(page).schedule_or_edit_session()
        SessionsEditPage(page).schedule_a_valid_session(
            offset_days=7, skip_weekends=False
        )
    SessionsOverviewPage(page).header.click_sessions_header()
    SessionsSearchPage(page).click_session_for_programme_group(
        schools[0], Programme.HPV
    )
    upload_class_list()
    ImportsPage(page).header.click_children_header()
    ChildrenSearchPage(page).search_for_a_child_name(str(children[0]))
    ChildrenSearchPage(page).click_record_for_child(children[0])
    ChildRecordPage(page).tabs.click_activity_log()
    ChildActivityLogPage(page).expect_activity_log_header(
        f"Added to the session at {schools[0]}"
    )
    ChildActivityLogPage(page).header.click_sessions_header()
    SessionsSearchPage(page).click_session_for_programme_group(
        schools[1], Programme.HPV
    )
    upload_class_list()
    ImportsPage(page).header.click_school_moves_header()


def test_confirm_and_ignore(
    setup_confirm_and_ignore,
    schools,
    page,
    children,
):
    """
    Test: Confirm and ignore school moves for two children and
       verify the correct alerts.
    Steps:
    1. Setup: Schedule sessions for two schools, upload class lists for both,
       and trigger school moves.
    2. Go to the school moves page and locate rows for both children.
    3. For the first child, confirm the school move and verify the confirmation alert.
    4. For the second child, ignore the school move and verify the ignored alert.
    Verification:
    - The correct confirmation and ignored alerts are shown for each child.
    - The school moves table contains the expected text for both children.
    """
    schools = schools[Programme.HPV]
    child_1, child_2 = children[Programme.HPV][0], children[Programme.HPV][1]

    row1 = SchoolMovesPage(page).get_row_for_child(child_1)
    row2 = SchoolMovesPage(page).get_row_for_child(child_2)

    expect(row1).to_contain_text(f"Class list updated {schools[0]} to {schools[1]}")
    expect(row2).to_contain_text(f"Class list updated {schools[0]} to {schools[1]}")

    SchoolMovesPage(page).click_child(child_1)
    ReviewSchoolMovePage(page).confirm()

    expect(SchoolMovesPage(page).confirmed_alert).to_contain_text(
        f"{child_1!s}’s school record updated",
    )

    SchoolMovesPage(page).click_child(child_2)
    ReviewSchoolMovePage(page).ignore()

    expect(SchoolMovesPage(page).ignored_alert).to_contain_text(
        f"{child_2!s}’s school move ignored",
    )


def test_download_school_moves_csv(
    setup_confirm_and_ignore,
    page,
    schools,
    children,
):
    """
    Test: Download the school moves CSV and verify the headers.
    Steps:
    1. Setup: Ensure school moves exist by confirming/ignoring moves for two children.
    2. Click the download button on the school moves page.
    3. Enter a date range and confirm the download.
    4. Read the downloaded CSV.
    Verification:
    - The CSV contains all expected headers for school moves.
    - The CSV contains correct data for the two children involved in the school moves.
    """
    school = schools[Programme.HPV][0]
    children = children[Programme.HPV]
    SchoolMovesPage(page).click_download()
    DownloadSchoolMovesPage(page).enter_date_range()
    school_moves_csv = DownloadSchoolMovesPage(page).confirm_and_get_school_moves_csv()
    DownloadSchoolMovesPage(page).verify_school_moves_csv_contents(
        school_moves_csv, children, school
    )


@pytest.mark.accessibility
def test_accessibility(
    setup_confirm_and_ignore,
    page,
    children,
):
    """
    Test: Check accessibility of the school moves page.
    Steps:
    1. Setup: Ensure school moves exist by confirming/ignoring moves for two children.
    2. Navigate to the school moves page.
    3. Run accessibility checks on the page.
    Verification:
    - The school moves page passes accessibility checks.
    """
    child = children[Programme.HPV][0]

    AccessibilityHelper(page).check_accessibility()

    SchoolMovesPage(page).click_download()
    AccessibilityHelper(page).check_accessibility()

    DownloadSchoolMovesPage(page).click_continue()
    AccessibilityHelper(page).check_accessibility()

    DownloadSchoolMovesPage(page).header.click_school_moves_header()
    SchoolMovesPage(page).click_child(child)
    AccessibilityHelper(page).check_accessibility()
