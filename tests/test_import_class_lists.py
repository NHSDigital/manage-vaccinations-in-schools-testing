import pytest

from mavis.test.data import ClassFileMapping
from mavis.test.models import Programme


@pytest.fixture
def setup_class_list(
    log_in_as_nurse,
    schools,
    dashboard_page,
    sessions_page,
):
    school = schools[Programme.HPV][0]
    try:
        dashboard_page.click_sessions()
        sessions_page.ensure_session_scheduled_for_next_week(
            school, Programme.HPV.group
        )
        dashboard_page.click_mavis()
        dashboard_page.click_import_records()
        yield
    finally:
        dashboard_page.navigate()
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(school)


@pytest.mark.classlist
def test_class_list_file_upload_valid_data(
    setup_class_list,
    schools,
    import_records_page,
    year_groups,
):
    """
    Test: Upload a valid class list file and verify successful import.
    Steps:
    1. Navigate to class list import page for the correct school and year group.
    2. Upload a valid class list file.
    Verification:
    - Output indicates successful import of records.
    """
    school = schools["doubles"][0]
    year_group = year_groups["doubles"]

    import_records_page.navigate_to_class_list_record_import(str(school), year_group)
    import_records_page.upload_and_verify_output(
        ClassFileMapping.POSITIVE,
        programme_group="doubles",
    )


@pytest.mark.classlist
def test_class_list_file_upload_invalid_data(
    setup_class_list,
    schools,
    import_records_page,
    year_groups,
):
    """
    Test: Upload an invalid class list file and verify error handling.
    Steps:
    1. Navigate to class list import page for the correct school and year group.
    2. Upload a class list file with invalid data.
    Verification:
    - Output lists errors as expected for each record
    """
    school = schools["doubles"][0]
    year_group = year_groups["doubles"]

    import_records_page.navigate_to_class_list_record_import(str(school), year_group)
    import_records_page.upload_and_verify_output(
        ClassFileMapping.NEGATIVE,
        programme_group="doubles",
    )


@pytest.mark.classlist
def test_class_list_file_upload_invalid_structure(
    setup_class_list,
    schools,
    import_records_page,
    year_groups,
):
    """
    Test: Upload a class list file with invalid structure and verify error handling.
    Steps:
    1. Navigate to class list import page for the correct school and year group.
    2. Upload a file with incorrect structure.
    Verification:
    - Output indicates structural errors.
    """
    school = schools["doubles"][0]
    year_group = year_groups["doubles"]

    import_records_page.navigate_to_class_list_record_import(str(school), year_group)
    import_records_page.upload_and_verify_output(
        ClassFileMapping.INVALID_STRUCTURE,
        programme_group="doubles",
    )


@pytest.mark.classlist
def test_class_list_file_upload_header_only(
    setup_class_list,
    schools,
    import_records_page,
    year_groups,
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
    school = schools["doubles"][0]
    year_group = year_groups["doubles"]

    import_records_page.navigate_to_class_list_record_import(str(school), year_group)
    import_records_page.upload_and_verify_output(
        ClassFileMapping.HEADER_ONLY,
        programme_group="doubles",
    )


@pytest.mark.classlist
def test_class_list_file_upload_empty_file(
    setup_class_list,
    schools,
    import_records_page,
    year_groups,
):
    """
    Test: Upload an empty class list file and verify error handling.
    Steps:
    1. Navigate to class list import page for the correct school and year group.
    2. Upload an empty file.
    Verification:
    - Output indicates error or no records imported.
    """
    school = schools["doubles"][0]
    year_group = year_groups["doubles"]

    import_records_page.navigate_to_class_list_record_import(str(school), year_group)
    import_records_page.upload_and_verify_output(
        ClassFileMapping.EMPTY_FILE,
        programme_group="doubles",
    )


@pytest.mark.classlist
def test_class_list_file_upload_wrong_year_group(
    setup_class_list,
    schools,
    import_records_page,
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
    school = schools["doubles"][0]
    year_group = year_groups["doubles"]

    import_records_page.navigate_to_class_list_record_import(str(school), year_group)
    import_records_page.upload_and_verify_output(
        ClassFileMapping.WRONG_YEAR_GROUP,
        programme_group="doubles",
    )


@pytest.mark.classlist
@pytest.mark.bug
def test_class_list_file_upload_whitespace_normalization(
    setup_class_list,
    schools,
    import_records_page,
    children_page,
    dashboard_page,
    year_groups,
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
    school = schools["doubles"][0]
    year_group = year_groups["doubles"]

    import_records_page.navigate_to_class_list_record_import(str(school), year_group)
    input_file, _ = import_records_page.upload_and_verify_output(
        ClassFileMapping.WHITESPACE,
        programme_group="doubles",
    )
    dashboard_page.click_mavis()
    dashboard_page.click_children()
    children_page.verify_list_has_been_uploaded(input_file, is_vaccinations=False)
