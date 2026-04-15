import pytest
from playwright.sync_api import expect

from mavis.test.annotations import issue
from mavis.test.constants import Programme
from mavis.test.data import ClassFileMapping
from mavis.test.data.file_mappings import ImportFormatDetails
from mavis.test.pages import (
    ChildrenSearchPage,
    DashboardPage,
    ImportRecordsWizardPage,
    ImportsPage,
    SessionsOverviewPage,
)
from mavis.test.pages.imports.import_issues_page import ImportIssuesPage, RecordToKeep
from mavis.test.pages.utils import schedule_school_session_if_needed


@pytest.fixture
def setup_class_list_import(
    log_in_as_nurse,
    schools,
    page,
    point_of_care_file_generator,
    year_groups,
):
    school = schools[Programme.HPV][0]
    year_group = year_groups[Programme.HPV]

    schedule_school_session_if_needed(page, school, [Programme.HPV], [year_group])
    SessionsOverviewPage(page).header.click_mavis()
    DashboardPage(page).click_imports()
    ImportsPage(page).click_upload_records()
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).navigate_to_class_list_record_import(str(school), year_group)


@issue("MAV-5893")
def test_class_list_file_upload_valid_data(
    setup_class_list_import,
    page,
    point_of_care_file_generator,
):
    """
    Test: Upload a valid class list file and verify successful import.
    Steps:
    1. Navigate to class list import page for the correct school and year group.
    2. Read and verify the file specification for class lists.
    3. Upload a valid class list file.
    Verification:
    - Output indicates successful import of records.
    Scenarios covered:
    AllValidValues, YearGroupOverride, SameYearGroup, EmptyPostCode, EmptyYearGroup,
    UnicodeApostrophe1, UnicodeApostrophe2, UnicodeApostrophe3, DuplicateEmail,
    PostcodeNFA, PostcodeAddressNotKnown, PostcodeAddressNotSpecified
    """
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).read_and_verify_import_format_details(ImportFormatDetails.CLASS)
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_and_verify_output(ClassFileMapping.POSITIVE)


def test_class_list_file_upload_invalid_data(
    setup_class_list_import,
    page,
    point_of_care_file_generator,
):
    """
    Test: Upload an invalid class list file and verify error handling.
    Steps:
    1. Navigate to class list import page for the correct school and year group.
    2. Upload a class list file with invalid data.
    Verification:
    - Output lists errors as expected for each record
    Scenarios covered:
    EmptyFirstName, EmptyLastName, EmptyDOB, LongNHSNo, InvalidPostCode,
    InvalidParent1Email, InvalidParent2Email, InvalidYearGroup, InvalidFirstName,
    InvalidLastName, InvalidPrefFirstName, InvalidPrefLastName, InvalidParent1Name,
    InvalidParent2Name
    """
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_and_verify_output(ClassFileMapping.NEGATIVE)


def test_class_list_file_upload_invalid_structure(
    setup_class_list_import,
    page,
    point_of_care_file_generator,
):
    """
    Test: Upload a class list file with invalid structure and verify error handling.
    Steps:
    1. Navigate to class list import page for the correct school and year group.
    2. Upload a file with incorrect structure.
    Verification:
    - Output indicates structural errors.
    """
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_and_verify_output(ClassFileMapping.INVALID_STRUCTURE)


def test_class_list_file_upload_header_only(
    setup_class_list_import,
    page,
    point_of_care_file_generator,
):
    """
    Test: Upload a class list file with only headers and verify no
       records are imported.
    Steps:
    1. Navigate to class list import page for the correct school and year group.
    2. Upload a header-only file.
    Verification:
    - Output indicates no records imported.
    """
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_and_verify_output(ClassFileMapping.HEADER_ONLY)


def test_class_list_file_upload_empty_file(
    setup_class_list_import,
    page,
    point_of_care_file_generator,
):
    """
    Test: Upload an empty class list file and verify error handling.
    Steps:
    1. Navigate to class list import page for the correct school and year group.
    2. Upload an empty file.
    Verification:
    - Output indicates error or no records imported.
    """
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_and_verify_output(ClassFileMapping.EMPTY_FILE)


def test_class_list_file_upload_wrong_year_group(
    setup_class_list_import,
    page,
    point_of_care_file_generator,
):
    """
    Test: Upload a class list file with the wrong year group and verify error handling.
    Steps:
    1. Navigate to class list import page for the correct school and year group.
    2. Upload a file with an incorrect year group.
    Verification:
    - Output indicates year group mismatch or error.
    """
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_and_verify_output(ClassFileMapping.WRONG_YEAR_GROUP)


def test_class_list_file_upload_whitespace_normalization(
    setup_class_list_import,
    page,
    point_of_care_file_generator,
):
    """
    Test: Upload a class list file with extra whitespace and verify normalization.
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
        ClassFileMapping.WHITESPACE,
    )
    ImportsPage(page).header.click_mavis()
    DashboardPage(page).click_children()
    ChildrenSearchPage(page).verify_list_has_been_uploaded(
        input_file, is_vaccinations=False
    )


@issue("MAV-3840")
def test_class_list_file_upload_duplicate_different_postcode_keep_both(
    log_in_as_nurse,
    schools,
    page,
    point_of_care_file_generator,
    year_groups,
):
    """
    Test: Upload a patient with duplicate name/DOB but different postcode
    and empty NHS number.

    Steps:
    1. Upload the first patient record.
    2. Upload a second patient with same given name, family name and date of
       birth, but different postcode and empty NHS number.
    3. When import duplicate review is staged, click "Review".
    4. Select "Keep both records" and continue.

    Verification:
    - Both records are imported successfully.
    - Review and approve workflow is triggered for close match.
    """
    school = schools[Programme.HPV][0]
    year_group = year_groups[Programme.HPV]

    schedule_school_session_if_needed(page, school, [Programme.HPV], [year_group])
    SessionsOverviewPage(page).header.click_mavis()
    DashboardPage(page).click_imports()
    ImportsPage(page).click_upload_records()
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).navigate_to_class_list_record_import(str(school), year_group)

    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_and_verify_output(ClassFileMapping.DUPLICATE_POSTCODE)

    child = point_of_care_file_generator.fixed_random_child
    ImportRecordsWizardPage(page, point_of_care_file_generator).verify_linking(child)

    ImportsPage(page).header.click_mavis()
    DashboardPage(page).click_imports()
    ImportsPage(page).click_upload_records()

    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).navigate_to_class_list_record_import(str(school), year_group)

    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_and_verify_output(ClassFileMapping.DUPLICATE_POSTCODE_2)

    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_issue_link.click()

    ImportRecordsWizardPage(page, point_of_care_file_generator).click_review_link()

    ImportIssuesPage(page).resolve_duplicate(RecordToKeep.BOTH)

    expect(
        ImportRecordsWizardPage(page, point_of_care_file_generator).record_updated
    ).to_be_visible()

    ImportRecordsWizardPage(page, point_of_care_file_generator).verify_linking(child)

    ImportRecordsWizardPage(page, point_of_care_file_generator).header.click_mavis()
    DashboardPage(page).click_children()
    ChildrenSearchPage(page).search.search_for_child_by_name(str(child))

    expect(page.get_by_text("Showing 1 to 2 of 2 children")).to_be_visible()


@issue("MAV-2782")
@pytest.mark.parametrize(
    "close_match_resolution",
    [RecordToKeep.UPLOADED, RecordToKeep.EXISTING, RecordToKeep.BOTH],
    ids=lambda x: f"Close match resolution: {x}",
)
def test_class_list_close_match_verify_counts(
    setup_class_list_import,
    page,
    point_of_care_file_generator,
    close_match_resolution,
):
    """
    Test: Upload class list files with close match records and verify different
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
    - "Close matches to existing" heading is visible.
    - Import appears in Issues tab for review.
    - Resolution completes successfully with "Record updated" message.
    """
    # Upload first class list file
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_and_verify_output(ClassFileMapping.CLOSE_MATCH_1)

    # Navigate back to import page
    ImportRecordsWizardPage(page, point_of_care_file_generator).header.click_mavis()
    DashboardPage(page).click_imports()
    ImportsPage(page).click_upload_records()
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).navigate_to_class_list_record_import(
        str(point_of_care_file_generator.schools[Programme.HPV][0]),
        point_of_care_file_generator.year_groups[Programme.HPV],
    )

    # Upload second file with similar child details and verify close match UI
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_and_verify_output(ClassFileMapping.CLOSE_MATCH_2)
    ImportRecordsWizardPage(page, point_of_care_file_generator).verify_close_match()
    ImportRecordsWizardPage(page, point_of_care_file_generator).review_link.click()
    ImportIssuesPage(page).resolve_duplicate(close_match_resolution)
    expect(
        ImportRecordsWizardPage(page, point_of_care_file_generator).success_alert
    ).to_contain_text("Record updated")
