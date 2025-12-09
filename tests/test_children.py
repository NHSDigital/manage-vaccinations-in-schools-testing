import pytest

from mavis.test.annotations import issue
from mavis.test.constants import Programme
from mavis.test.data import ClassFileMapping, CohortsFileMapping, VaccsFileMapping
from mavis.test.helpers.accessibility_helper import AccessibilityHelper
from mavis.test.pages import (
    ChildActivityLogPage,
    ChildArchivePage,
    ChildEditPage,
    ChildRecordPage,
    ChildrenSearchPage,
    DashboardPage,
    ImportRecordsWizardPage,
    ImportsPage,
    ProgrammeChildrenPage,
    ProgrammeOverviewPage,
    ProgrammesListPage,
    SchoolsChildrenPage,
    SchoolsSearchPage,
    SessionsEditPage,
    SessionsOverviewPage,
    SessionsSearchPage,
    VaccinationRecordPage,
)
from mavis.test.utils import expect_alert_text, get_offset_date

pytestmark = pytest.mark.children


@pytest.fixture
def setup_children_session(
    log_in_as_nurse,
    page,
    test_data,
    schools,
    year_groups,
):
    def _setup(class_list_file):
        school = schools[Programme.HPV][0]
        year_group = year_groups[Programme.HPV]

        DashboardPage(page).click_schools()
        SchoolsSearchPage(page).click_school(school)
        SchoolsChildrenPage(page).click_import_class_lists()
        ImportRecordsWizardPage(page, test_data).import_class_list(
            class_list_file, year_group
        )
        ImportsPage(page).header.click_mavis_header()
        DashboardPage(page).click_sessions()
        SessionsSearchPage(page).click_session_for_programme_group(
            school, Programme.HPV.group
        )
        if not SessionsOverviewPage(page).is_date_scheduled(get_offset_date(0)):
            SessionsOverviewPage(page).schedule_or_edit_session()
            SessionsEditPage(page).schedule_a_valid_session(
                offset_days=0, skip_weekends=False
            )
        SessionsOverviewPage(page).header.click_mavis_header()
        DashboardPage(page).click_children()
        yield

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
    page,
    test_data,
    year_groups,
):
    school = schools[Programme.HPV][0]
    year_group = year_groups[Programme.HPV]

    DashboardPage(page).click_schools()
    SchoolsSearchPage(page).click_school(school)
    SchoolsChildrenPage(page).click_import_class_lists()
    ImportRecordsWizardPage(page, test_data).import_class_list(
        ClassFileMapping.RANDOM_CHILD, year_group
    )
    ImportsPage(page).header.click_mavis_header()
    DashboardPage(page).click_sessions()
    SessionsSearchPage(page).click_session_for_programme_group(
        school, Programme.HPV.group
    )
    if not SessionsOverviewPage(page).is_date_scheduled(get_offset_date(0)):
        SessionsOverviewPage(page).schedule_or_edit_session()
        SessionsEditPage(page).schedule_a_valid_session(
            offset_days=0, skip_weekends=False
        )
    session_id = SessionsOverviewPage(page).get_session_id_from_offline_excel()

    SessionsOverviewPage(page).header.click_mavis_header()
    DashboardPage(page).click_programmes()
    ProgrammesListPage(page).click_programme_for_current_year(Programme.HPV)
    ProgrammeOverviewPage(page).tabs.click_children_tab()
    ProgrammeChildrenPage(page).click_import_child_records()
    ImportRecordsWizardPage(page, test_data).import_class_list(
        CohortsFileMapping.FIXED_CHILD
    )

    ImportsPage(page).header.click_mavis_header()
    DashboardPage(page).click_imports()
    ImportsPage(page).click_upload_records()
    ImportRecordsWizardPage(page, test_data).navigate_to_vaccination_records_import()
    ImportRecordsWizardPage(page, test_data).upload_and_verify_output(
        file_mapping=VaccsFileMapping.NOT_GIVEN,
        session_id=session_id,
    )
    ImportsPage(page).header.click_mavis_header()
    DashboardPage(page).click_children()


@issue("MAV-853")
@pytest.mark.bug
def test_patient_details_load_with_missing_vaccine_info(
    setup_mav_853,
    schools,
    children,
    page,
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

    ChildrenSearchPage(page).search_with_all_filters_for_child_name(str(child))
    ChildrenSearchPage(page).click_record_for_child(child)
    # Verify activity log
    ChildRecordPage(page).tabs.click_activity_log()
    ChildActivityLogPage(page).expect_activity_log_header(
        "Vaccinated with Gardasil 9", unique=True
    )
    # Verify vaccination record
    ChildRecordPage(page).click_child_record()
    ChildRecordPage(page).click_vaccination_details(school)
    VaccinationRecordPage(page).expect_vaccination_details("Outcome", "Vaccinated")


@pytest.mark.bug
def test_invalid_nhs_number_change_is_rejected(
    setup_fixed_child,
    page,
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

    ChildrenSearchPage(page).search_with_all_filters_for_child_name(str(child))
    ChildrenSearchPage(page).click_record_for_child(child)
    ChildRecordPage(page).click_edit_child_record()
    ChildEditPage(page).click_change_nhs_no()
    ChildEditPage(page).fill_nhs_no_for_child(child, "9123456789")
    ChildEditPage(page).click_continue()
    expect_alert_text(page, "Enter a valid NHS number")


@issue("MAV-1839")
@pytest.mark.children
def test_merge_child_records_does_not_crash(
    setup_child_merge,
    page,
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
    ChildrenSearchPage(page).search_with_all_filters_for_child_name(str(child1))
    ChildrenSearchPage(page).click_record_for_child(child1)
    ChildRecordPage(page).click_archive_child_record()
    ChildArchivePage(page).click_its_a_duplicate(child2.nhs_number)
    ChildArchivePage(page).click_archive_record()
    expect_alert_text(page, "This record has been archived")


@pytest.mark.accessibility
def test_accessibility(
    setup_fixed_child,
    page,
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
    ChildrenSearchPage(page).click_advanced_filters()
    AccessibilityHelper(page).check_accessibility()

    child = children[Programme.HPV][0]
    ChildrenSearchPage(page).search_with_all_filters_for_child_name(str(child))
    ChildrenSearchPage(page).click_record_for_child(child)
    AccessibilityHelper(page).check_accessibility()

    ChildRecordPage(page).tabs.click_activity_log()
    AccessibilityHelper(page).check_accessibility()
