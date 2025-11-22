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
            sessions_page.ensure_session_scheduled_for_today(school, Programme.HPV)
            sessions_page.click_import_class_lists()
            import_records_page.import_class_list(class_list_file, year_group)
            dashboard_page.click_mavis()
            dashboard_page.click_children()
            yield
        finally:
            dashboard_page.navigate()
            dashboard_page.click_mavis()
            dashboard_page.click_sessions()
            sessions_page.delete_all_sessions(school)

    return _setup


@pytest.fixture
def setup_fixed_child(setup_children_session):
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
    programmes_list_page,
    programme_overview_page,
    programme_children_page,
    sessions_page,
    year_groups,
):
    school = schools[Programme.HPV][0]
    year_group = year_groups[Programme.HPV]

    try:
        dashboard_page.click_sessions()
        sessions_page.ensure_session_scheduled_for_today(school, Programme.HPV)
        sessions_page.click_import_class_lists()
        import_records_page.import_class_list(ClassFileMapping.RANDOM_CHILD, year_group)
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.click_session_for_programme_group(school, Programme.HPV)
        session_id = sessions_page.get_session_id_from_offline_excel()
        dashboard_page.click_mavis()
        dashboard_page.click_programmes()
        programmes_list_page.click_programme_for_current_year(Programme.HPV)
        programme_overview_page.click_children_tab()
        programme_children_page.click_import_child_records()
        import_records_page.import_class_list(CohortsFileMapping.FIXED_CHILD)
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
        dashboard_page.navigate()
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(school)


@issue("MAV-853")
@pytest.mark.bug
def test_patient_details_load_with_missing_vaccine_info(
    setup_mav_853,
    schools,
    children,
    child_record_page,
    child_activity_log_page,
    vaccination_record_page,
    children_search_page,
):
    """
    Test: Ensure patient details page loads for a child with missing vaccine info
       (MAV-853).
    Steps:
    1. Setup: Import class list, schedule session, import cohort, and upload vaccination
       records with missing vaccine info.
    2. Search for the child by name.
    3. Click to view the child's record.
    4. Open the activity log.
    5. View vaccination details for the child.
    Verification:
    - Activity log header shows "Vaccinated with Gardasil 9".
    - Vaccination details show "Outcome" as "Vaccinated".
    """
    child = children[Programme.HPV][0]
    school = schools[Programme.HPV][0]

    children_search_page.search_with_all_filters_for_child_name(str(child))
    children_search_page.click_record_for_child(child)
    # Verify activity log
    child_record_page.click_activity_log()
    child_activity_log_page.expect_activity_log_header(
        "Vaccinated with Gardasil 9", unique=True
    )
    # Verify vaccination record
    child_record_page.click_child_record()
    child_record_page.click_vaccination_details(school)
    vaccination_record_page.expect_vaccination_details("Outcome", "Vaccinated")


@pytest.mark.bug
def test_invalid_nhs_number_change_is_rejected(
    setup_fixed_child,
    children_search_page,
    child_record_page,
    child_edit_page,
    children,
):
    """
    Test: Changing a child's NHS number to an invalid value should fail.
    Steps:
    1. Setup: Import a fixed child class list and navigate to the children page.
    2. Search for the child by name.
    3. Open the child's record and edit it.
    4. Attempt to change the NHS number to an invalid value ("9123456789").
    5. Continue to submit the change.
    Verification:
    - An alert appears with the message "Enter a valid NHS number".
    """
    child = children[Programme.HPV][0]

    children_search_page.search_with_all_filters_for_child_name(str(child))
    children_search_page.click_record_for_child(child)
    child_record_page.click_edit_child_record()
    child_edit_page.click_change_nhs_no()
    child_edit_page.fill_nhs_no_for_child(child, "9123456789")
    child_edit_page.click_continue()
    child_record_page.expect_text_in_alert("Enter a valid NHS number")


@issue("MAV-1839")
@pytest.mark.children
def test_merge_child_records_does_not_crash(
    setup_child_merge,
    children_search_page,
    child_record_page,
    child_archive_page,
    children,
):
    """
    Test: Merging two child records does not cause a crash (MAV-1839).
    Steps:
    1. Setup: Import a class list with two fixed children and navigate to the
       children page.
    2. Search for the first child by name.
    3. Open the first child's record and start the archive (merge) process.
    4. Select the second child as the duplicate.
    5. Complete the archive/merge.
    Verification:
    - An alert appears with the message "This record has been archived"
    """
    child1 = children[Programme.HPV][0]
    child2 = children[Programme.HPV][1]
    children_search_page.search_with_all_filters_for_child_name(str(child1))
    children_search_page.click_record_for_child(child1)
    child_record_page.click_archive_child_record()
    child_archive_page.click_its_a_duplicate(child2.nhs_number)
    child_archive_page.click_archive_record()
    child_record_page.expect_text_in_alert("This record has been archived")


@pytest.mark.accessibility
def test_accessibility(
    setup_fixed_child,
    children_search_page,
    child_record_page,
    accessibility_helper,
    children,
):
    """
    Test: Verify that the children page passes accessibility checks.
    Steps:
    1. Navigate to the children page.
    2. Run accessibility checks using the accessibility helper.
    Verification:
    - No accessibility violations are found on the children page.
    """
    children_search_page.click_advanced_filters()
    accessibility_helper.check_accessibility()

    child = children[Programme.HPV][0]
    children_search_page.search_with_all_filters_for_child_name(str(child))
    children_search_page.click_record_for_child(child)
    accessibility_helper.check_accessibility()

    child_record_page.click_activity_log()
    accessibility_helper.check_accessibility()
