import pytest

from libs.mavis_constants import test_data_file_paths


@pytest.fixture(scope="function", autouse=False)
def setup_tests(reset_environment, nurse, login_page):
    reset_environment()

    login_page.log_in(**nurse)
    yield
    login_page.log_out()


@pytest.fixture(scope="function", autouse=False)
def setup_move_and_ignore(setup_tests, dashboard_page, sessions_page):
    try:
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session_in_school_1()
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session_in_school_2()
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.click_scheduled()
        sessions_page.click_school1()
        sessions_page.upload_class_list_to_school_1(
            file_paths=test_data_file_paths.CLASS_MOVES_CONFIRM_IGNORE
        )
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.click_scheduled()
        sessions_page.click_school2()
        sessions_page.upload_class_list_to_school_2(
            file_paths=test_data_file_paths.CLASS_MOVES_CONFIRM_IGNORE
        )
        yield
    finally:
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions_for_school_1()
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions_for_school_2()


@pytest.fixture(scope="function", autouse=False)
def setup_move_to_homeschool_and_unknown(setup_tests, dashboard_page, sessions_page):
    try:
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session_in_school_1()
        sessions_page.click_school1()
        sessions_page.upload_class_list_to_school_1(
            file_paths=test_data_file_paths.CLASS_MOVES_UNKNOWN_HOMESCHOOLED
        )
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.click_scheduled()
        sessions_page.click_school2()
        sessions_page.upload_class_list_to_school_2(
            file_paths=test_data_file_paths.CLASS_MOVES_CONFIRM_IGNORE
        )
        yield
    finally:
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions_for_school_1()
        dashboard_page.go_to_dashboard()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions_for_school_2()


@pytest.mark.schoolmoves
@pytest.mark.order(401)
def test_confirm_and_ignore(setup_move_and_ignore, school_moves_page):
    school_moves_page.confirm_and_ignore_moves()


# Add tests for school moves to Homeschool or Unknown school
@pytest.mark.schoolmoves
@pytest.mark.order(402)
@pytest.mark.skip(reason="Test under construction")
def test_to_homeschool_and_unknown(setup_move_to_homeschool_and_unknown):
    pass


@pytest.mark.schoolmoves
@pytest.mark.order(403)
def test_download_report(setup_move_and_ignore, dashboard_page, school_moves_page):
    dashboard_page.go_to_dashboard()
    dashboard_page.click_school_moves()
    school_moves_page.download_and_verify_report()
