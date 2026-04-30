import nhs_number as nhs_number_lib
import pytest

from mavis.test.constants import Programme
from mavis.test.data import ChildFileMapping, ClassFileMapping
from mavis.test.pages import (
    ChildEditPage,
    ChildProgrammePage,
    ChildRecordPage,
    ChildrenSearchPage,
    DashboardPage,
    ImportIssuesPage,
    ImportRecordsWizardPage,
    ImportsPage,
    SchoolChildrenPage,
    SchoolsSearchPage,
    SessionsOverviewPage,
)
from mavis.test.pages.imports.import_issues_page import RecordToKeep
from mavis.test.pages.utils import schedule_school_session_if_needed
from mavis.test.utils import format_nhs_number

_MANUAL_EDIT_HEADING = "Record updated manually"
_CLASS_LIST_HEADING = "Record updated after new details were imported in a class upload"
_COHORT_HEADING = "Record updated after new details were imported in a cohort upload"


@pytest.fixture
def setup_child_for_activity_log(
    log_in_as_nurse,
    page,
    point_of_care_file_generator,
    schools,
    year_groups,
):
    """
    Import a fixed child via class list (no NHS number, no gender),
    navigate to children.
    """
    school = schools[Programme.HPV][0]
    year_group = year_groups[Programme.HPV]

    DashboardPage(page).click_schools()
    SchoolsSearchPage(page).click_school(school)
    SchoolChildrenPage(page).click_import_class_lists()
    ImportRecordsWizardPage(page, point_of_care_file_generator).import_class_list(
        ClassFileMapping.FIXED_CHILD_NO_NHS_GENDER, year_group
    )
    schedule_school_session_if_needed(page, school, [Programme.HPV], [year_group])
    SessionsOverviewPage(page).header.click_mavis()
    DashboardPage(page).click_children()


@pytest.fixture
def setup_two_children_for_activity_log(
    log_in_as_nurse,
    page,
    point_of_care_file_generator,
    schools,
    year_groups,
):
    """Import two children via class list — child 0 with gender, child 1 without."""
    school = schools[Programme.HPV][0]
    year_group = year_groups[Programme.HPV]

    DashboardPage(page).click_schools()
    SchoolsSearchPage(page).click_school(school)
    SchoolChildrenPage(page).click_import_class_lists()
    ImportRecordsWizardPage(page, point_of_care_file_generator).import_class_list(
        ClassFileMapping.TWO_CHILDREN_ACTIVITY_LOG, year_group
    )
    schedule_school_session_if_needed(page, school, [Programme.HPV], [year_group])
    SessionsOverviewPage(page).header.click_mavis()
    DashboardPage(page).click_children()


def test_manual_edit_creates_activity_log_entry(
    setup_child_for_activity_log,
    page,
    children,
):
    """
    Test: Manually editing a child record creates a "Record updated manually" activity
    log entry with field-level change details.
    Steps:
    1. Navigate to the child's record.
    2. Edit the child's NHS number.
    3. Save the change.
    Verification:
    - Activity log entry "Record updated manually" is visible.
    - Summary shows "1 field updated".
    - Field row shows "NHS number" changed from "Not provided" to "{new_nhs_number}".
    - Entry does not appear on the HPV programme-specific activity log.
    """
    child = children[Programme.HPV][0]
    new_nhs_number = nhs_number_lib.generate(
        for_region=nhs_number_lib.REGION_SYNTHETIC
    )[0]

    ChildrenSearchPage(page).search.search_for_child_name_with_all_filters(str(child))
    ChildrenSearchPage(page).search.click_child(child)
    ChildRecordPage(page).click_edit_child_record()
    ChildEditPage(page).click_change_nhs_no()
    ChildEditPage(page).fill_nhs_no_for_child(child, new_nhs_number)
    ChildEditPage(page).click_continue()
    ChildEditPage(page).click_save()

    ChildRecordPage(page).expect_activity_log_entry(_MANUAL_EDIT_HEADING, unique=True)
    ChildRecordPage(page).expect_activity_log_n_fields_updated(_MANUAL_EDIT_HEADING, 1)
    ChildRecordPage(page).open_activity_log_entry_details(_MANUAL_EDIT_HEADING)
    ChildRecordPage(page).expect_activity_log_field_change(
        _MANUAL_EDIT_HEADING,
        "NHS number",
        "Not provided",
        format_nhs_number(new_nhs_number),
    )

    ChildRecordPage(page).click_programme(Programme.HPV)
    ChildProgrammePage(page).expect_no_activity_log_entry(_MANUAL_EDIT_HEADING)


def test_class_list_upload_update_creates_activity_log_entry(
    setup_two_children_for_activity_log,
    page,
    point_of_care_file_generator,
    children,
    schools,
    year_groups,
):
    """
    Test: Updating a child record via a second class list upload creates the correct
    activity log entry with field-level change details. Both automatic and manual
    updates should be captured.
    Steps:
    1. Import two children.
    2. Import an updated class list for the same children (different address fields for
    one and added Gender for the other).
    3. Review import issue and accept changes.
    4. Navigate to each child's record.
    Verification:
    - Activity log entry titled
      "Record updated after new details were imported in a class list upload"
      is visible.
    - Summary shows the number of fields changed.
    - Field rows show the old and new values for each changed field.
    - Entry does not appear on the HPV programme-specific activity log.
    """
    child_0 = children[Programme.HPV][0]
    child_1 = children[Programme.HPV][1]
    school = schools[Programme.HPV][0]
    year_group = year_groups[Programme.HPV]

    wizard = ImportRecordsWizardPage(page, point_of_care_file_generator)
    ChildrenSearchPage(page).header.click_schools()
    SchoolsSearchPage(page).click_school(school)
    SchoolChildrenPage(page).click_import_class_lists()
    wizard.select_year_groups(year_group)
    wizard.upload_and_verify_output(ClassFileMapping.TWO_CHILDREN_ACTIVITY_LOG_UPDATED)
    wizard.verify_close_match()
    wizard.review_link.click()
    ImportIssuesPage(page).resolve_duplicate(RecordToKeep.UPLOADED)

    wizard.header.click_children()

    ChildrenSearchPage(page).search.search_for_child_name_with_all_filters(str(child_0))
    ChildrenSearchPage(page).search.click_child(child_0)

    ChildRecordPage(page).expect_activity_log_entry(_CLASS_LIST_HEADING, unique=True)
    ChildRecordPage(page).expect_activity_log_n_fields_updated(_CLASS_LIST_HEADING, 2)
    ChildRecordPage(page).open_activity_log_entry_details(_CLASS_LIST_HEADING)
    ChildRecordPage(page).expect_activity_log_field_change(
        _CLASS_LIST_HEADING,
        "Address line 1",
        child_0.address[0],
        "10 Updated Street",
    )
    ChildRecordPage(page).expect_activity_log_field_change(
        _CLASS_LIST_HEADING,
        "Postcode",
        child_0.address[3],
        "SW7 5LE",
    )
    ChildRecordPage(page).click_programme(Programme.HPV)
    ChildProgrammePage(page).expect_no_activity_log_entry(_CLASS_LIST_HEADING)

    ChildRecordPage(page).header.click_children()

    ChildrenSearchPage(page).search.search_for_child_name_with_all_filters(str(child_1))
    ChildrenSearchPage(page).search.click_child(child_1)

    ChildRecordPage(page).expect_activity_log_entry(_CLASS_LIST_HEADING, unique=True)
    ChildRecordPage(page).expect_activity_log_n_fields_updated(_CLASS_LIST_HEADING, 1)
    ChildRecordPage(page).open_activity_log_entry_details(_CLASS_LIST_HEADING)
    ChildRecordPage(page).expect_activity_log_field_change(
        _CLASS_LIST_HEADING,
        "Gender",
        "Not known",
        "Male",
    )
    ChildRecordPage(page).click_programme(Programme.HPV)
    ChildProgrammePage(page).expect_no_activity_log_entry(_CLASS_LIST_HEADING)


def test_cohort_upload_update_creates_activity_log_entry(
    setup_child_for_activity_log,
    page,
    point_of_care_file_generator,
    children,
):
    """
    Test: Updating a child record via a cohort upload creates the correct
    activity log entry with field-level change details.
    Steps:
    1. Import a cohort file for the existing child (adds NHS number, gender).
    2. Navigate to the child's record.
    Verification:
    - Activity log entry titled
      "Record updated after new details were imported in a cohort upload" is visible.
    - Summary shows the number of fields changed.
    - Field rows show the old and new values for each changed field.
    - Entry does not appear on the HPV programme tab.
    """
    child = children[Programme.HPV][0]

    ChildrenSearchPage(page).header.click_imports()
    ImportsPage(page).click_upload_records()
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).navigate_to_child_record_import()
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_and_verify_output(ChildFileMapping.FIXED_CHILD_ADD_NHS_GENDER)
    ImportsPage(page).header.click_children()

    ChildrenSearchPage(page).search.search_for_child_name_with_all_filters(str(child))
    ChildrenSearchPage(page).search.click_child(child)

    ChildRecordPage(page).expect_activity_log_entry(_COHORT_HEADING, unique=True)
    ChildRecordPage(page).expect_activity_log_n_fields_updated(_COHORT_HEADING, 2)
    ChildRecordPage(page).open_activity_log_entry_details(_COHORT_HEADING)
    ChildRecordPage(page).expect_activity_log_field_change(
        _COHORT_HEADING,
        "NHS number",
        "Not provided",
        format_nhs_number(child.nhs_number),
    )
    ChildRecordPage(page).expect_activity_log_field_change(
        _COHORT_HEADING, "Gender", "Not known", "Male"
    )

    ChildRecordPage(page).click_programme(Programme.HPV)
    ChildProgrammePage(page).expect_no_activity_log_entry(_COHORT_HEADING)
