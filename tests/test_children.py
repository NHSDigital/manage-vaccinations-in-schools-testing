import allure
import pytest

from mavis.test.data import ClassFileMapping, CohortsFileMapping, VaccsFileMapping
from mavis.test.models import Programme

pytestmark = pytest.mark.children


@pytest.fixture
def setup_children_session(
    log_in_as_nurse, schools, dashboard_page, sessions_page, import_records_page
):
    def _setup(class_list_file):
        try:
            dashboard_page.click_sessions()
            sessions_page.schedule_a_valid_session(schools[0], for_today=True)
            dashboard_page.click_mavis()
            dashboard_page.click_sessions()
            sessions_page.click_location(schools[0])
            sessions_page.navigate_to_class_list_import()
            import_records_page.upload_and_verify_output(class_list_file)
            dashboard_page.click_mavis()
            dashboard_page.click_children()
            yield
        finally:
            dashboard_page.click_mavis()
            dashboard_page.click_sessions()
            sessions_page.delete_all_sessions(schools[0])

    return _setup


@pytest.fixture
def setup_children_page(setup_children_session):
    yield from setup_children_session(ClassFileMapping.CHILDREN_FILTER)


@pytest.fixture
def setup_change_nhsno(setup_children_session):
    yield from setup_children_session(ClassFileMapping.CHANGE_NHSNO)


@pytest.fixture
def setup_mav_853(
    log_in_as_nurse,
    schools,
    dashboard_page,
    import_records_page,
    programmes_page,
    sessions_page,
):
    try:
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session(schools[0], for_today=True)
        import_records_page.navigate_to_class_list_import()
        import_records_page.upload_and_verify_output(ClassFileMapping.SESSION_ID)
        sessions_page.click_location(schools[0])
        session_id = sessions_page.get_session_id_from_offline_excel()
        dashboard_page.click_mavis()
        dashboard_page.click_programmes()
        programmes_page.navigate_to_cohort_import(Programme.HPV)
        import_records_page.upload_and_verify_output(
            CohortsFileMapping.MAV_853,
        )
        dashboard_page.click_mavis()
        dashboard_page.click_import_records()
        import_records_page.navigate_to_vaccination_records_import()
        import_records_page.upload_and_verify_output(
            file_mapping=VaccsFileMapping.MAV_853,
            session_id=session_id,
        )
        dashboard_page.click_mavis()
        dashboard_page.click_children()
        yield
    finally:
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(schools[0])


def test_headers_and_filter(setup_children_page, children_page, children):
    child_name = str(children[0])

    children_page.verify_headers()
    children_page.search_for_a_child(child_name)
    children_page.assert_n_children_found(1)


@allure.issue("MAV-853")
@pytest.mark.bug
def test_details_mav_853(setup_mav_853, children_page, schools, children):
    """
    1. Upload vaccination records for a patient that doesn't contain vaccine information (VACCINE_GIVEN column)
    2. Navigate to the patient, either in a session or from the global children view
    3. Expected: patient details can be seen
    Actual: crash
    """
    child_name = str(children[0])

    children_page.search_for_a_child(child_name)
    children_page.click_record_for_child(child_name)
    # Verify activity log
    children_page.click_activity_log_and_wait()
    children_page.expect_text_in_main("Vaccinated with Gardasil 9")
    # Verify vaccination record
    children_page.click_child_record()
    children_page.click_vaccination_details(schools[0])
    children_page.expect_text_in_main("OutcomeVaccinated")


@pytest.mark.bug
def test_change_nhsno(setup_change_nhsno, children_page, children):
    child_name = str(children[0])

    children_page.search_for_a_child(child_name)
    children_page.click_record_for_child(child_name)
    children_page.click_edit_child_record()
    children_page.click_change_nhs_no()
    children_page.fill_nhs_no_for_child(child_name, "9123456789")
    children_page.click_continue()
    children_page.expect_text_in_main("Enter a valid NHS number")
