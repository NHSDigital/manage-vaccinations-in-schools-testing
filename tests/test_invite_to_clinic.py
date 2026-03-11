import pytest

from mavis.test.annotations import issue
from mavis.test.constants import Programme
from mavis.test.data import ChildFileMapping
from mavis.test.pages import (
    ChildProgrammePage,
    ChildRecordPage,
    ChildrenSearchPage,
    ImportRecordsWizardPage,
    ImportsPage,
    SchoolChildrenPage,
    SchoolInviteToClinicPage,
    SchoolsSearchPage,
)
from mavis.test.pages.utils import schedule_community_clinic_session_if_needed

pytestmark = pytest.mark.clinics


@issue("MAV-2854")
def test_single_from_child_record(
    children, log_in_as_nurse, page, point_of_care_file_generator
):
    """
    Test: Invite a single child to the clinic from their child record.

    Steps:
    1. Schedule a community clinic session for the future.
    2. Import a child with parent details via child records.
    3. Find the child's record.
    4. Click on "Invite to community clinic"
    5. Check the activity log for an invitation having been sent.
    """

    programme = Programme.HPV
    child = children[programme][0]

    imports_page = ImportsPage(page)
    import_records_wizard_page = ImportRecordsWizardPage(
        page, point_of_care_file_generator
    )
    children_search_page = ChildrenSearchPage(page)
    child_programme_page = ChildProgrammePage(page)
    child_record_page = ChildRecordPage(page)

    schedule_community_clinic_session_if_needed(page, [programme])

    # Import a child with parent details via child records.
    imports_page.header.click_imports()
    imports_page.click_upload_records()
    import_records_wizard_page.navigate_to_child_record_import()
    import_records_wizard_page.upload_and_verify_output(ChildFileMapping.FIXED_CHILD)
    imports_page.header.click_children()

    # Find the child's record.
    children_search_page.search.search_for_a_child_name(str(child))
    children_search_page.search.click_child(child)

    # Click on "Invite to community clinic"
    child_record_page.click_programme(programme)
    child_programme_page.click_invite_to_community_clinic()

    # Check the activity log for an invitation having been sent.
    child_programme_page.expect_activity_log_entry(
        "Added to the session at Community Clinic"
    )

    # TODO: We can't check for the entry from the notifications log as no
    #   emails actually get sent from the end to end test environments.


@issue("MAV-2854")
def test_bulk_from_unknown_school(
    children, log_in_as_nurse, page, point_of_care_file_generator
):
    """
    Test: Invite a single child to the clinic from their child record.

    Steps:
    1. Schedule a community clinic session for the future.
    2. Import an unknown school child with parent details via child records.
    3. Click on "Invite to community clinic" from the unknown school.
    4. Choose a programme and submit the request to send invitations
    5. Find the child's record.
    6. Check the activity log for an invitation having been sent.
    """

    programme = Programme.HPV
    child = children[programme][0]

    imports_page = ImportsPage(page)
    import_records_wizard_page = ImportRecordsWizardPage(
        page, point_of_care_file_generator
    )
    children_search_page = ChildrenSearchPage(page)
    child_programme_page = ChildProgrammePage(page)
    child_record_page = ChildRecordPage(page)
    schools_search_page = SchoolsSearchPage(page)
    school_children_page = SchoolChildrenPage(page)
    school_invite_to_clinic_page = SchoolInviteToClinicPage(page)

    schedule_community_clinic_session_if_needed(page, [programme])

    # Import an unknown school child with parent details via child records.
    imports_page.header.click_imports()
    imports_page.click_upload_records()
    import_records_wizard_page.navigate_to_child_record_import()
    import_records_wizard_page.upload_and_verify_output(
        ChildFileMapping.UNKNOWN_SCHOOL_CHILD
    )
    imports_page.header.click_schools()

    # Click on "Invite to community clinic" from the unknown school.
    schools_search_page.click_school("No known school")
    school_children_page.click_send_clinic_invitations()

    # Choose a programme and submit the request to send invitations
    school_invite_to_clinic_page.check_programme(programme)
    school_invite_to_clinic_page.click_send_clinic_invitations()
    school_invite_to_clinic_page.header.click_children()

    # Find the child's record.
    children_search_page.search.search_for_a_child_name(str(child))
    children_search_page.search.click_child(child)
    child_record_page.click_programme(programme)

    # Check the activity log for an invitation having been sent.
    child_programme_page.expect_activity_log_entry(
        "Added to the session at Community Clinic"
    )

    # TODO: We can't check for the entry from the notifications log as no
    #   emails actually get sent from the end to end test environments.
