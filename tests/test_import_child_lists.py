import pytest
from playwright.sync_api import expect

from mavis.test.annotations import issue
from mavis.test.data import ChildFileMapping
from mavis.test.data.file_mappings import ImportFormatDetails
from mavis.test.helpers.accessibility_helper import AccessibilityHelper
from mavis.test.pages import (
    ChildrenSearchPage,
    DashboardPage,
    ImportRecordsWizardPage,
    ImportsPage,
)
from mavis.test.pages.imports.import_issues_page import ImportIssuesPage, RecordToKeep


@pytest.fixture
def setup_child_import(
    log_in_as_nurse,
    page,
    point_of_care_file_generator,
):
    DashboardPage(page).click_manage_data()
    ImportsPage(page).click_upload_records()
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).navigate_to_child_record_import()


@issue("MAV-5893")
def test_child_list_file_upload_valid_data(
    setup_child_import,
    page,
    point_of_care_file_generator,
):
    """
    Test: Upload a valid child list file and verify successful import.
    Steps:
    1. Navigate to child record import page.
    2. Read and verify the import format details for child records.
    3. Upload a valid child list file.
    Verification:
    - Output indicates successful import of records.
    Scenarios covered:
    AllValidValues, Homeschooled, UnknownSchool, YearGroupEmpty, UnicodeApostrophe1,
    UnicodeApostrophe2, UnicodeApostrophe3, DuplicateEmail, PostcodeNFA,
    PostcodeAddressNotKnown, PostcodeAddressNotSpecified
    """
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).read_and_verify_import_format_details(ImportFormatDetails.CHILD)
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_and_verify_output(ChildFileMapping.POSITIVE)


def test_child_list_file_upload_invalid_data(
    setup_child_import,
    page,
    point_of_care_file_generator,
):
    """
    Test: Upload an invalid child list file and verify error handling.
    Steps:
    1. Navigate to child record import page.
    2. Upload a child list file with invalid data.
    Verification:
    - Output lists errors as expected for each record
    Scenarios covered:
    EmptyFirstName, EmptyLastName, EmptyURN, EmptyDOB, LongNHSNo, ShortNHSNo,
    InvalidPostCode, InvalidParent1Email, InvalidParent2Email, InvalidYearGroup,
    SpaceInDOB, InvalidFirstName, InvalidLastName, InvalidParent1Name,InvalidParent2Name
    """
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_and_verify_output(ChildFileMapping.NEGATIVE)


def test_child_list_file_upload_invalid_structure(
    setup_child_import,
    page,
    point_of_care_file_generator,
):
    """
    Test: Upload a child list file with invalid structure and verify error handling.
    Steps:
    1. Navigate to child record import page.
    2. Upload a file with incorrect structure.
    Verification:
    - Output indicates structural errors.
    """
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_and_verify_output(ChildFileMapping.INVALID_STRUCTURE)


def test_child_list_file_upload_header_only(
    setup_child_import,
    page,
    point_of_care_file_generator,
):
    """
    Test: Upload a child list file with only headers and verify no records are imported.
    Steps:
    1. Navigate to child record import page.
    2. Upload a header-only file.
    Verification:
    - Output indicates no records imported.
    """
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_and_verify_output(ChildFileMapping.HEADER_ONLY)


def test_child_list_file_upload_empty_file(
    setup_child_import,
    page,
    point_of_care_file_generator,
):
    """
    Test: Upload an empty child list file and verify error handling.
    Steps:
    1. Navigate to child record import page.
    2. Upload an empty file.
    Verification:
    - Output indicates error or no records imported.
    """
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_and_verify_output(ChildFileMapping.EMPTY_FILE)


def test_child_list_file_upload_whitespace_normalization(
    setup_child_import,
    page,
    point_of_care_file_generator,
):
    """
    Test: Upload a child list file with extra whitespace and verify normalization.
    Steps:
    1. Upload a file with whitespace issues.
    2. Navigate to children page.
    3. Verify the list is normalized and imported correctly.
    Verification:
    - Imported list matches expected normalized data.
    """
    input_file, _ = ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_and_verify_output(
        ChildFileMapping.WHITESPACE,
    )
    ImportsPage(page).header.click_mavis()
    DashboardPage(page).click_children()
    ChildrenSearchPage(page).verify_list_has_been_uploaded(
        input_file, is_vaccinations=False
    )


@issue("MAV-2782")
@pytest.mark.parametrize(
    "close_match_resolution",
    [RecordToKeep.UPLOADED, RecordToKeep.EXISTING, RecordToKeep.BOTH],
    ids=lambda x: f"Close match resolution: {x}",
)
def test_child_list_close_match_verify_counts(
    setup_child_import,
    page,
    point_of_care_file_generator,
    close_match_resolution,
):
    """
    Test: Upload child list files with close match records and verify different
    resolution strategies.

    This test is parametrized to verify all three resolution options:
    - Use uploaded record (replaces existing)
    - Keep existing record (discards uploaded)
    - Keep both records (creates two separate records)

    Steps:
    1. Upload first file (creates child record with NHS number).
    2. Upload second file (same child, no NHS number, different postcode).
    3. Verify close match review workflow is triggered.
    4. Resolve duplicate using parametrized resolution strategy.

    Verification:
    - Close match review workflow is triggered.
    - Resolution completes successfully with "Record updated" message.
    """
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_and_verify_output(ChildFileMapping.CLOSE_MATCH_1)
    ImportRecordsWizardPage(page, point_of_care_file_generator).header.click_mavis()
    DashboardPage(page).click_manage_data()
    ImportsPage(page).click_upload_records()
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).navigate_to_child_record_import()
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_and_verify_output(ChildFileMapping.CLOSE_MATCH_2)
    ImportRecordsWizardPage(page, point_of_care_file_generator).verify_close_match()
    ImportRecordsWizardPage(page, point_of_care_file_generator).review_link.click()
    ImportIssuesPage(page).resolve_duplicate(close_match_resolution)
    expect(
        ImportRecordsWizardPage(page, point_of_care_file_generator).success_alert
    ).to_contain_text("Record updated")


@pytest.mark.accessibility
def test_accessibility(
    log_in_as_nurse,
    page,
    point_of_care_file_generator,
):
    """
    Test: Verify that the import records page passes accessibility checks.
    Steps:
    1. Navigate to child record import page.
    2. Run accessibility checks.
    Verification:
    - No accessibility violations are found on the import records page.
    """
    DashboardPage(page).click_manage_data()
    AccessibilityHelper(page).check_accessibility()

    ImportsPage(page).click_upload_records()
    AccessibilityHelper(page).check_accessibility()

    ImportRecordsWizardPage(page, point_of_care_file_generator).select_child_records()
    ImportRecordsWizardPage(page, point_of_care_file_generator).click_continue()
    AccessibilityHelper(page).check_accessibility()

    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_and_verify_output(ChildFileMapping.POSITIVE)
    AccessibilityHelper(page).check_accessibility()
    AccessibilityHelper(page).check_accessibility()
