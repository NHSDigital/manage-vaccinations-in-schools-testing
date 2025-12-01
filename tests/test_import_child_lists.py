import pytest

from mavis.test.accessibility import AccessibilityHelper
from mavis.test.data import ChildFileMapping
from mavis.test.pages import (
    ChildrenSearchPage,
    DashboardPage,
    ImportRecordsWizardPage,
    ImportsPage,
)


@pytest.fixture
def setup_child_import(
    log_in_as_nurse,
    page,
    test_data,
):
    DashboardPage(page).click_imports()
    ImportsPage(page).click_upload_records()
    ImportRecordsWizardPage(page, test_data).navigate_to_child_record_import()


@pytest.mark.childlist
def test_child_list_file_upload_valid_data(
    setup_child_import,
    page,
    test_data,
):
    """
    Test: Upload a valid child list file and verify successful import.
    Steps:
    1. Navigate to child record import page.
    2. Upload a valid child list file.
    Verification:
    - Output indicates successful import of records.
    Scenarios covered:
    AllValidValues, Homeschooled, UnknownSchool, YearGroupEmpty, UnicodeApostrophe1,
    UnicodeApostrophe2, UnicodeApostrophe3, DuplicateEmail
    """
    ImportRecordsWizardPage(page, test_data).upload_and_verify_output(
        ChildFileMapping.POSITIVE
    )


@pytest.mark.childlist
def test_child_list_file_upload_invalid_data(
    setup_child_import,
    page,
    test_data,
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
    ImportRecordsWizardPage(page, test_data).upload_and_verify_output(
        ChildFileMapping.NEGATIVE
    )


@pytest.mark.childlist
def test_child_list_file_upload_invalid_structure(
    setup_child_import,
    page,
    test_data,
):
    """
    Test: Upload a child list file with invalid structure and verify error handling.
    Steps:
    1. Navigate to child record import page.
    2. Upload a file with incorrect structure.
    Verification:
    - Output indicates structural errors.
    """
    ImportRecordsWizardPage(page, test_data).upload_and_verify_output(
        ChildFileMapping.INVALID_STRUCTURE
    )


@pytest.mark.childlist
def test_child_list_file_upload_header_only(
    setup_child_import,
    page,
    test_data,
):
    """
    Test: Upload a child list file with only headers and verify no records are imported.
    Steps:
    1. Navigate to child record import page.
    2. Upload a header-only file.
    Verification:
    - Output indicates no records imported.
    """
    ImportRecordsWizardPage(page, test_data).upload_and_verify_output(
        ChildFileMapping.HEADER_ONLY
    )


@pytest.mark.childlist
def test_child_list_file_upload_empty_file(
    setup_child_import,
    page,
    test_data,
):
    """
    Test: Upload an empty child list file and verify error handling.
    Steps:
    1. Navigate to child record import page.
    2. Upload an empty file.
    Verification:
    - Output indicates error or no records imported.
    """
    ImportRecordsWizardPage(page, test_data).upload_and_verify_output(
        ChildFileMapping.EMPTY_FILE
    )


@pytest.mark.childlist
@pytest.mark.bug
def test_child_list_file_upload_whitespace_normalization(
    setup_child_import,
    page,
    test_data,
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
    input_file, _ = ImportRecordsWizardPage(page, test_data).upload_and_verify_output(
        ChildFileMapping.WHITESPACE,
    )
    ImportsPage(page).header.click_children_header()
    ChildrenSearchPage(page).verify_list_has_been_uploaded(
        input_file, is_vaccinations=False
    )


@pytest.mark.accessibility
def test_accessibility(
    log_in_as_nurse,
    page,
    test_data,
):
    """
    Test: Verify that the import records page passes accessibility checks.
    Steps:
    1. Navigate to child record import page.
    2. Run accessibility checks.
    Verification:
    - No accessibility violations are found on the import records page.
    """
    DashboardPage(page).click_imports()
    AccessibilityHelper(page).check_accessibility()

    ImportsPage(page).click_upload_records()
    AccessibilityHelper(page).check_accessibility()

    ImportRecordsWizardPage(page, test_data).select_child_records()
    ImportRecordsWizardPage(page, test_data).click_continue()
    AccessibilityHelper(page).check_accessibility()

    ImportRecordsWizardPage(page, test_data).upload_and_verify_output(
        ChildFileMapping.POSITIVE
    )
    AccessibilityHelper(page).check_accessibility()
