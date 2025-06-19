import pandas
from playwright.sync_api import expect
from mavis.test.data import ClassFileMapping
import pytest


pytestmark = pytest.mark.school_moves


@pytest.fixture
def setup_confirm_and_ignore(
    log_in_as_nurse,
    test_data,
    schools,
    dashboard_page,
    sessions_page,
    import_records_page,
):
    # We need to make sure we're uploading the same class with the same NHS numbers.
    input_file_path, output_file_path = test_data.get_file_paths(
        ClassFileMapping.MOVES_CONFIRM_IGNORE
    )

    def upload_class_list():
        sessions_page.click_import_class_list()
        sessions_page.select_year_groups(8, 9, 10, 11)
        sessions_page.choose_file_child_records(input_file_path)
        sessions_page.click_continue_button()
        import_records_page.verify_upload_output(output_file_path)

    try:
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session(schools[0])
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session(schools[1])
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.click_scheduled()
        sessions_page.click_location(schools[0])
        upload_class_list()
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.click_scheduled()
        sessions_page.click_location(schools[1])
        upload_class_list()
        dashboard_page.click_mavis()
        dashboard_page.click_school_moves()
        yield
    finally:
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
    child_1, child_2 = children[0], children[1]

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


def test_download(
    setup_confirm_and_ignore, school_moves_page, download_school_moves_page
):
    school_moves_page.click_download()
    download_school_moves_page.enter_date_range()
    path = download_school_moves_page.confirm()

    actual_headers = set(pandas.read_csv(path).columns)
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


@pytest.fixture
def setup_to_homeschool_and_unknown(
    log_in_as_nurse, schools, dashboard_page, sessions_page, import_records_page
):
    try:
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session(schools[0])
        sessions_page.click_location(schools[0])
        sessions_page.navigate_to_class_list_import()
        import_records_page.upload_and_verify_output(
            ClassFileMapping.MOVES_UNKNOWN_HOMESCHOOLED
        )
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.click_scheduled()
        sessions_page.click_location(schools[1])
        sessions_page.navigate_to_class_list_import()
        import_records_page.upload_and_verify_output(
            ClassFileMapping.MOVES_CONFIRM_IGNORE
        )
        yield
    finally:
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(schools[0])
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(schools[2])


@pytest.mark.skip(reason="Test under construction")
def test_to_homeschool_and_unknown(setup_to_homeschool_and_unknown):
    pass
