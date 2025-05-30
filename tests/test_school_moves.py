import pytest

from mavis.test.mavis_constants import test_data_file_paths

pytestmark = pytest.mark.school_moves


@pytest.fixture
def setup_tests(log_in_as_nurse, reset_environment):
    reset_environment()


@pytest.fixture
def setup_move_and_ignore(setup_tests, schools, dashboard_page, sessions_page):
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
        sessions_page.upload_class_list(
            test_data_file_paths.CLASS_MOVES_CONFIRM_IGNORE,
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
        sessions_page.delete_all_sessions(schools[1])


@pytest.fixture
def setup_move_to_homeschool_and_unknown(
    setup_tests, schools, dashboard_page, sessions_page
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
