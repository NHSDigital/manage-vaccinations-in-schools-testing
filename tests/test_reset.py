import pytest

from mavis.test.mavis_constants import test_data_file_paths, Vaccine
from mavis.test.wrappers import wait_for_reset


@pytest.fixture
def setup_tests(reset_environment, nurse, organisation, log_in_page, start_page):
    reset_environment()
    wait_for_reset()
    start_page.navigate_and_start()
    log_in_page.log_in_and_select_organisation(**nurse, organisation=organisation)
    yield
    log_in_page.log_out()


@pytest.fixture
def setup_mav_965(
    setup_tests,
    schools,
    dashboard_page,
    import_records_page,
    sessions_page,
    vaccines_page,
):
    dashboard_page.click_vaccines()
    vaccines_page.add_batch(vaccine=Vaccine.GARDASIL_9)
    vaccines_page.add_batch(vaccine=Vaccine.MENQUADFI)
    vaccines_page.add_batch(vaccine=Vaccine.REVAXIS)
    dashboard_page.click_mavis()
    dashboard_page.click_sessions()
    sessions_page.schedule_a_valid_session(schools[0], for_today=True)
    import_records_page.import_class_list_records_from_school_session(
        file_paths=test_data_file_paths.CLASS_MAV_965
    )
    dashboard_page.click_mavis()
    dashboard_page.click_sessions()
    yield


@pytest.mark.rav
@pytest.mark.bug
def test_programmes_rav_prescreening_questions(setup_mav_965, schools, programmes_page):
    programmes_page.verify_mav_965(schools[0])
