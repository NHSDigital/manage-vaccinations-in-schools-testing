import pytest

from mavis.test.mavis_constants import test_data_file_paths

pytestmark = pytest.mark.school_moves


@pytest.fixture
def setup_move_and_ignore(
    log_in_as_nurse, test_data, schools, dashboard_page, sessions_page
):
    # We need to make sure we're uploading the same class with the same NHS numbers.
    input_file_path, output_file_path = test_data.get_file_paths(
        test_data_file_paths.CLASS_MOVES_CONFIRM_IGNORE
    )

    def upload_class_list():
        sessions_page.click_import_class_list()
        sessions_page.select_year_groups(8, 9, 10, 11)
        sessions_page.choose_file_child_records(file_path=input_file_path)
        sessions_page.click_continue()
        sessions_page.verify_upload_output(file_path=output_file_path)

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
        yield
    finally:
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(schools[0])
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(schools[1])


@pytest.fixture
def setup_move_to_homeschool_and_unknown(
    log_in_as_nurse, schools, dashboard_page, sessions_page
):
    try:
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session(schools[0])
        sessions_page.click_location(schools[0])
        sessions_page.upload_class_list(
            test_data_file_paths.CLASS_MOVES_UNKNOWN_HOMESCHOOLED,
        )
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.click_scheduled()
        sessions_page.click_location(schools[1])
        sessions_page.upload_class_list(
            test_data_file_paths.CLASS_MOVES_CONFIRM_IGNORE,
        )
        yield
    finally:
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(schools[0])
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(schools[2])


def test_confirm_and_ignore(setup_move_and_ignore, schools, school_moves_page):
    school_moves_page.confirm_and_ignore_moves(schools)


@pytest.mark.skip(reason="Test under construction")
def test_to_homeschool_and_unknown(setup_move_to_homeschool_and_unknown):
    pass


def test_download_report(setup_move_and_ignore, dashboard_page, school_moves_page):
    dashboard_page.click_mavis()
    dashboard_page.click_school_moves()
    school_moves_page.download_and_verify_report()
