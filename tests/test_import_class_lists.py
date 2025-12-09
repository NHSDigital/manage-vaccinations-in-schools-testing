import pytest

from mavis.test.constants import Programme
from mavis.test.data import ClassFileMapping
from mavis.test.pages import (
    ChildrenSearchPage,
    DashboardPage,
    ImportRecordsWizardPage,
    ImportsPage,
    SessionsEditPage,
    SessionsOverviewPage,
    SessionsSearchPage,
)
from mavis.test.utils import get_offset_date


@pytest.fixture
def setup_class_list_import(
    log_in_as_nurse,
    schools,
    page,
    file_generator,
    year_groups,
):
    school = schools[Programme.HPV][0]
    year_group = year_groups[Programme.HPV]
    DashboardPage(page).click_sessions()
    SessionsSearchPage(page).click_session_for_programme_group(school, Programme.HPV)
    if not SessionsOverviewPage(page).is_date_scheduled(get_offset_date(7)):
        SessionsOverviewPage(page).schedule_or_edit_session()
        SessionsEditPage(page).schedule_a_valid_session(
            offset_days=7, skip_weekends=False
        )
    SessionsOverviewPage(page).header.click_mavis_header()
    DashboardPage(page).click_imports()
    ImportsPage(page).click_upload_records()
    ImportRecordsWizardPage(page, file_generator).navigate_to_class_list_record_import(
        str(school), year_group
    )


@pytest.mark.classlist
def test_class_list_file_upload_valid_data(
    setup_class_list_import,
    page,
    file_generator,
):
    """
    Test: Upload a valid class list file and verify successful import.
    Steps:
    1. Navigate to class list import page for the correct school and year group.
    2. Upload a valid class list file.
    Verification:
    - Output indicates successful import of records.
    Scenarios covered:
    AllValidValues, YearGroupOverride, SameYearGroup, EmptyPostCode, EmptyYearGroup,
    UnicodeApostrophe1, UnicodeApostrophe2, UnicodeApostrophe3, DuplicateEmail,
    PostcodeNFA, PostcodeAddressNotKnown, PostcodeAddressNotSpecified
    """
    ImportRecordsWizardPage(page, file_generator).upload_and_verify_output(
        ClassFileMapping.POSITIVE
    )


@pytest.mark.classlist
def test_class_list_file_upload_invalid_data(
    setup_class_list_import,
    page,
    file_generator,
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
    ImportRecordsWizardPage(page, file_generator).upload_and_verify_output(
        ClassFileMapping.NEGATIVE
    )


@pytest.mark.classlist
def test_class_list_file_upload_invalid_structure(
    setup_class_list_import,
    page,
    file_generator,
):
    """
    Test: Upload a class list file with invalid structure and verify error handling.
    Steps:
    1. Navigate to class list import page for the correct school and year group.
    2. Upload a file with incorrect structure.
    Verification:
    - Output indicates structural errors.
    """
    ImportRecordsWizardPage(page, file_generator).upload_and_verify_output(
        ClassFileMapping.INVALID_STRUCTURE
    )


@pytest.mark.classlist
def test_class_list_file_upload_header_only(
    setup_class_list_import,
    page,
    file_generator,
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
    ImportRecordsWizardPage(page, file_generator).upload_and_verify_output(
        ClassFileMapping.HEADER_ONLY
    )


@pytest.mark.classlist
def test_class_list_file_upload_empty_file(
    setup_class_list_import,
    page,
    file_generator,
):
    """
    Test: Upload an empty class list file and verify error handling.
    Steps:
    1. Navigate to class list import page for the correct school and year group.
    2. Upload an empty file.
    Verification:
    - Output indicates error or no records imported.
    """
    ImportRecordsWizardPage(page, file_generator).upload_and_verify_output(
        ClassFileMapping.EMPTY_FILE
    )


@pytest.mark.classlist
def test_class_list_file_upload_wrong_year_group(
    setup_class_list_import,
    schools,
    page,
    file_generator,
    year_groups,
):
    """
    Test: Upload a class list file with the wrong year group and verify error handling.
    Steps:
    1. Navigate to class list import page for the correct school and year group.
    2. Upload a file with an incorrect year group.
    Verification:
    - Output indicates year group mismatch or error.
    """
    ImportRecordsWizardPage(page, file_generator).upload_and_verify_output(
        ClassFileMapping.WRONG_YEAR_GROUP
    )


@pytest.mark.classlist
@pytest.mark.bug
def test_class_list_file_upload_whitespace_normalization(
    setup_class_list_import,
    page,
    file_generator,
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
        page, file_generator
    ).upload_and_verify_output(
        ClassFileMapping.WHITESPACE,
    )
    ImportsPage(page).header.click_mavis_header()
    DashboardPage(page).click_children()
    ChildrenSearchPage(page).verify_list_has_been_uploaded(
        input_file, is_vaccinations=False
    )
