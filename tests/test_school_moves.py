import pytest
from playwright.sync_api import expect

from mavis.test.data import ClassFileMapping
from mavis.test.models import Programme

pytestmark = pytest.mark.school_moves


@pytest.fixture
def setup_confirm_and_ignore(
    log_in_as_nurse,
    test_data,
    schools,
    dashboard_page,
    sessions_page,
    import_records_page,
    year_groups,
    children_page,
    children,
):
    schools = schools[Programme.HPV]
    year_group = year_groups[Programme.HPV]
    children = children[Programme.HPV]
    # We need to make sure we're uploading the same class with the same NHS numbers.
    input_file_path, output_file_path = test_data.get_file_paths(
        ClassFileMapping.TWO_FIXED_CHILDREN
    )

    def upload_class_list():
        sessions_page.click_import_class_lists()
        import_records_page.select_year_groups(year_group)
        sessions_page.choose_file_child_records(input_file_path)
        sessions_page.click_continue_button()
        import_records_page.record_upload_time()
        import_records_page.click_uploaded_file_datetime()
        import_records_page.wait_for_processed()
        import_records_page.verify_upload_output(output_file_path)

    try:
        dashboard_page.click_sessions()
        sessions_page.click_session_for_programme_group(schools[0], Programme.HPV)
        sessions_page.schedule_a_valid_session()
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.click_session_for_programme_group(schools[1], Programme.HPV)
        sessions_page.schedule_a_valid_session()
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.click_session_for_programme_group(schools[0], Programme.HPV)
        upload_class_list()
        children_page.click_record_for_child(children[0])
        children_page.click_activity_log()
        children_page.expect_activity_log_header(
            f"Added to the session at {schools[0]}", any=True
        )
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.click_session_for_programme_group(schools[1], Programme.HPV)
        upload_class_list()
        dashboard_page.click_mavis()
        dashboard_page.click_school_moves()
        yield
    finally:
        dashboard_page.navigate()
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(schools[0])
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(schools[1])


def test_confirm_and_ignore(
    setup_confirm_and_ignore,
    schools,
    school_moves_page,
    review_school_move_page,
    children,
):
    """
    Test: Confirm and ignore school moves for two children and verify the correct alerts.
    Steps:
    1. Setup: Schedule sessions for two schools, upload class lists for both, and trigger school moves.
    2. Go to the school moves page and locate rows for both children.
    3. For the first child, confirm the school move and verify the confirmation alert.
    4. For the second child, ignore the school move and verify the ignored alert.
    Verification:
    - The correct confirmation and ignored alerts are shown for each child.
    - The school moves table contains the expected text for both children.
    """
    schools = schools[Programme.HPV]
    child_1, child_2 = children[Programme.HPV][0], children[Programme.HPV][1]

    row1 = school_moves_page.get_row_for_child(*child_1.name)
    row2 = school_moves_page.get_row_for_child(*child_2.name)

    expect(row1).to_contain_text(f"Class list updated {schools[0]} to {schools[1]}")
    expect(row2).to_contain_text(f"Class list updated {schools[0]} to {schools[1]}")

    school_moves_page.click_child(*child_1.name)
    review_school_move_page.confirm()

    expect(school_moves_page.confirmed_alert).to_contain_text(
        f"{str(child_1)}’s school record updated"
    )

    school_moves_page.click_child(*child_2.name)
    review_school_move_page.ignore()

    expect(school_moves_page.ignored_alert).to_contain_text(
        f"{str(child_2)}’s school move ignored"
    )


def test_download_school_moves_csv(
    setup_confirm_and_ignore, school_moves_page, download_school_moves_page
):
    """
    Test: Download the school moves CSV and verify the headers.
    Steps:
    1. Setup: Ensure school moves exist by confirming/ignoring moves for two children.
    2. Click the download button on the school moves page.
    3. Enter a date range and confirm the download.
    4. Read the downloaded CSV and extract the headers.
    Verification:
    - The CSV contains all expected headers for school moves.
    """
    school_moves_page.click_download()
    download_school_moves_page.enter_date_range()
    school_moves_csv = download_school_moves_page.confirm()

    actual_headers = set(school_moves_csv.columns)
    expected_headers = {
        "NHS_REF",
        "SURNAME",
        "FORENAME",
        "GENDER",
        "DOB",
        "ADDRESS1",
        "ADDRESS2",
        "ADDRESS3",
        "TOWN",
        "POSTCODE",
        "COUNTY",
        "ETHNIC_OR",
        "ETHNIC_DESCRIPTION",
        "NATIONAL_URN_NO",
        "BASE_NAME",
        "STARTDATE",
        "STUD_ID",
        "DES_NUMBER",
    }

    # TODO: Check more than just the headers.
    assert actual_headers == expected_headers
