import pytest

from mavis.test.data import ChildFileMapping


@pytest.fixture
def setup_child_import(
    log_in_as_nurse, dashboard_page, imports_page, import_records_journey_page
):
    dashboard_page.click_import_records()
    imports_page.click_import_records()
    import_records_journey_page.navigate_to_child_record_import()


@pytest.mark.childlist
def test_child_list_file_upload_valid_data(
    setup_child_import, import_records_journey_page
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
    import_records_journey_page.upload_and_verify_output(ChildFileMapping.POSITIVE)


@pytest.mark.childlist
def test_child_list_file_upload_invalid_data(
    setup_child_import, import_records_journey_page
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
    import_records_journey_page.upload_and_verify_output(ChildFileMapping.NEGATIVE)


@pytest.mark.childlist
def test_child_list_file_upload_invalid_structure(
    setup_child_import,
    import_records_journey_page,
):
    """
    Test: Upload a child list file with invalid structure and verify error handling.
    Steps:
    1. Navigate to child record import page.
    2. Upload a file with incorrect structure.
    Verification:
    - Output indicates structural errors.
    """
    import_records_journey_page.upload_and_verify_output(
        ChildFileMapping.INVALID_STRUCTURE
    )


@pytest.mark.childlist
def test_child_list_file_upload_header_only(
    setup_child_import, import_records_journey_page
):
    """
    Test: Upload a child list file with only headers and verify no records are imported.
    Steps:
    1. Navigate to child record import page.
    2. Upload a header-only file.
    Verification:
    - Output indicates no records imported.
    """
    import_records_journey_page.upload_and_verify_output(ChildFileMapping.HEADER_ONLY)


@pytest.mark.childlist
def test_child_list_file_upload_empty_file(
    setup_child_import, import_records_journey_page
):
    """
    Test: Upload an empty child list file and verify error handling.
    Steps:
    1. Navigate to child record import page.
    2. Upload an empty file.
    Verification:
    - Output indicates error or no records imported.
    """
    import_records_journey_page.upload_and_verify_output(ChildFileMapping.EMPTY_FILE)


@pytest.mark.childlist
@pytest.mark.bug
def test_child_list_file_upload_whitespace_normalization(
    setup_child_import,
    import_records_journey_page,
    children_search_page,
    dashboard_page,
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
    input_file, _ = import_records_journey_page.upload_and_verify_output(
        ChildFileMapping.WHITESPACE,
    )
    dashboard_page.click_mavis()
    dashboard_page.click_children()
    children_search_page.verify_list_has_been_uploaded(
        input_file, is_vaccinations=False
    )


@pytest.mark.accessibility
def test_accessibility(
    log_in_as_nurse,
    accessibility_helper,
    dashboard_page,
    import_records_journey_page,
):
    """
    Test: Verify that the import records page passes accessibility checks.
    Steps:
    1. Navigate to child record import page.
    2. Run accessibility checks.
    Verification:
    - No accessibility violations are found on the import records page.
    """
    dashboard_page.click_import_records()
    accessibility_helper.check_accessibility()

    import_records_journey_page.click_import_records()
    accessibility_helper.check_accessibility()

    import_records_journey_page.select_child_records()
    import_records_journey_page.click_continue()
    accessibility_helper.check_accessibility()

    import_records_journey_page.upload_and_verify_output(ChildFileMapping.POSITIVE)
    accessibility_helper.check_accessibility()
