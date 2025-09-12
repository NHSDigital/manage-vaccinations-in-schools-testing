import pytest

from mavis.test.data import ChildFileMapping


@pytest.fixture
def setup_child_list(log_in_as_nurse, dashboard_page, import_records_page):
    dashboard_page.click_import_records()
    import_records_page.navigate_to_child_record_import()


@pytest.mark.childlist
def test_child_list_file_upload_valid_data(setup_child_list, import_records_page):
    """
    Test: Upload a valid child list file and verify successful import.
    Steps:
    1. Navigate to child record import page.
    2. Upload a valid child list file.
    Verification:
    - Output indicates successful import of records.
    """
    import_records_page.upload_and_verify_output(ChildFileMapping.POSITIVE)


@pytest.mark.childlist
def test_child_list_file_upload_invalid_data(setup_child_list, import_records_page):
    """
    Test: Upload an invalid child list file and verify error handling.
    Steps:
    1. Navigate to child record import page.
    2. Upload a child list file with invalid data.
    Verification:
    - Output lists errors as expected for each record
    """
    import_records_page.upload_and_verify_output(ChildFileMapping.NEGATIVE)


@pytest.mark.childlist
def test_child_list_file_upload_invalid_structure(
    setup_child_list,
    import_records_page,
):
    """
    Test: Upload a child list file with invalid structure and verify error handling.
    Steps:
    1. Navigate to child record import page.
    2. Upload a file with incorrect structure.
    Verification:
    - Output indicates structural errors.
    """
    import_records_page.upload_and_verify_output(ChildFileMapping.INVALID_STRUCTURE)


@pytest.mark.childlist
def test_child_list_file_upload_header_only(setup_child_list, import_records_page):
    """
    Test: Upload a child list file with only headers and verify no records are imported.
    Steps:
    1. Navigate to child record import page.
    2. Upload a header-only file.
    Verification:
    - Output indicates no records imported.
    """
    import_records_page.upload_and_verify_output(ChildFileMapping.HEADER_ONLY)


@pytest.mark.childlist
def test_child_list_file_upload_empty_file(setup_child_list, import_records_page):
    """
    Test: Upload an empty child list file and verify error handling.
    Steps:
    1. Navigate to child record import page.
    2. Upload an empty file.
    Verification:
    - Output indicates error or no records imported.
    """
    import_records_page.upload_and_verify_output(ChildFileMapping.EMPTY_FILE)


@pytest.mark.childlist
@pytest.mark.bug
def test_child_list_file_upload_whitespace_normalization(
    setup_child_list,
    import_records_page,
    children_page,
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
    input_file, _ = import_records_page.upload_and_verify_output(
        ChildFileMapping.WHITESPACE,
    )
    dashboard_page.click_mavis()
    dashboard_page.click_children()
    children_page.verify_list_has_been_uploaded(input_file, is_vaccinations=False)
