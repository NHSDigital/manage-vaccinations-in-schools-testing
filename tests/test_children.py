import pytest

from mavis.test.annotations import issue
from mavis.test.data import ClassFileMapping, CohortsFileMapping, VaccsFileMapping
from mavis.test.models import Programme

pytestmark = pytest.mark.children


@pytest.fixture
def setup_children_session(
    log_in_as_nurse,
    schools,
    dashboard_page,
    sessions_page,
    import_records_page,
    year_groups,
):
    def _setup(class_list_file):
        school = schools[Programme.HPV][0]
        year_group = year_groups[Programme.HPV]

        try:
            dashboard_page.click_mavis()
            dashboard_page.click_sessions()
            sessions_page.schedule_a_valid_session(
                school, Programme.HPV, for_today=True
            )
            dashboard_page.click_mavis()
            dashboard_page.click_sessions()
            sessions_page.click_session_for_programme_group(school, Programme.HPV)
            sessions_page.click_import_class_lists()
            import_records_page.import_class_list_for_current_year(
                class_list_file, year_group
            )
            dashboard_page.click_mavis()
            dashboard_page.click_children()
            yield
        finally:
            dashboard_page.click_mavis()
            dashboard_page.click_sessions()
            sessions_page.delete_all_sessions(school)

    return _setup


@pytest.fixture
def setup_children_page(setup_children_session):
    yield from setup_children_session(ClassFileMapping.FIXED_CHILD)


@pytest.fixture
def setup_change_nhsno(setup_children_session):
    yield from setup_children_session(ClassFileMapping.FIXED_CHILD)


@pytest.fixture
def setup_child_merge(setup_children_session):
    yield from setup_children_session(ClassFileMapping.TWO_FIXED_CHILDREN)


@pytest.fixture
def setup_mav_853(
    log_in_as_nurse,
    schools,
    dashboard_page,
    import_records_page,
    programmes_page,
    sessions_page,
    year_groups,
):
    school = schools[Programme.HPV][0]
    year_group = year_groups[Programme.HPV]

    try:
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session(school, Programme.HPV, for_today=True)
        sessions_page.click_import_class_lists()
        import_records_page.import_class_list_for_current_year(
            ClassFileMapping.RANDOM_CHILD, year_group
        )
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.click_session_for_programme_group(school, Programme.HPV)
        session_id = sessions_page.get_session_id_from_offline_excel()
        dashboard_page.click_mavis()
        dashboard_page.click_programmes()
        programmes_page.navigate_to_cohort_import(Programme.HPV)
        import_records_page.import_class_list_for_current_year(
            CohortsFileMapping.FIXED_CHILD
        )
        dashboard_page.click_mavis()
        dashboard_page.click_import_records()
        import_records_page.navigate_to_vaccination_records_import()
        import_records_page.upload_and_verify_output(
            file_mapping=VaccsFileMapping.NOT_GIVEN,
            session_id=session_id,
        )
        dashboard_page.click_mavis()
        dashboard_page.click_children()
        yield
    finally:
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(school)


def test_headers_and_filter(setup_children_page, children_page, children):
    child = children[Programme.HPV][0]

    children_page.search_with_all_filters_for_child_name(str(child))
    children_page.verify_headers()
    children_page.assert_n_children_found(1)


@issue("MAV-853")
@pytest.mark.bug
def test_details_mav_853(setup_mav_853, children_page, schools, children):
    """
    1. Upload vaccination records for a patient that doesn't contain vaccine information (VACCINE_GIVEN column)
    2. Navigate to the patient, either in a session or from the global children view
    3. Expected: patient details can be seen
    Actual: crash
    """
    child = children[Programme.HPV][0]
    school = schools[Programme.HPV][0]

    children_page.search_with_all_filters_for_child_name(str(child))
    children_page.click_record_for_child(child)
    # Verify activity log
    children_page.click_activity_log()
    children_page.expect_text_in_main("Vaccinated with Gardasil 9")
    # Verify vaccination record
    children_page.click_child_record()
    children_page.click_vaccination_details(school)
    children_page.expect_text_in_main("OutcomeVaccinated")


@pytest.mark.bug
def test_change_nhsno(setup_change_nhsno, children_page, children):
    child = children[Programme.HPV][0]

    children_page.search_with_all_filters_for_child_name(str(child))
    children_page.click_record_for_child(child)
    children_page.click_edit_child_record()
    children_page.click_change_nhs_no()
    children_page.fill_nhs_no_for_child(child, "9123456789")
    children_page.click_continue()
    children_page.expect_text_in_main("Enter a valid NHS number")


@pytest.mark.children
def test_merge_does_not_crash(setup_child_merge, children_page, children):
    child1 = children[Programme.HPV][0]
    child2 = children[Programme.HPV][1]
    children_page.search_for_a_child_name(str(child1))
    children_page.click_record_for_child(child1)
    children_page.click_archive_child_record()
    children_page.click_its_a_duplicate(child2.nhs_number)
    children_page.click_archive_record()
    children_page.expect_text_in_alert("This record has been archived")
