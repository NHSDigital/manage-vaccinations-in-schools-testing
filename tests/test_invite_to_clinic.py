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


@issue("MAV-2854")
def test_single_from_child_record(
    children, page, point_of_care_file_generator, log_in_as_nurse
):
    """
    Test: Invite a single child to the clinic from their child record.

    Steps:
    1. Import a child with parent details via child records.
    2. Find the child's record.
    3. Click on "Invite to community clinic"
    4. Check the child has been invited.
    """

    programme = Programme.HPV
    child = children[programme][0]

    child_programme_page = ChildProgrammePage(page)
    child_record_page = ChildRecordPage(page)
    children_search_page = ChildrenSearchPage(page)
    import_records_wizard_page = ImportRecordsWizardPage(
        page, point_of_care_file_generator
    )
    imports_page = ImportsPage(page)

    # Import a child with parent details via child records.
    imports_page.header.click_manage_data()
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
    child_programme_page.header.click_children()

    # Check the child has been invited.
    children_search_page.search.search_invited_to_clinic()
    children_search_page.search.click_child(child)

    # TODO: We can't check for the entry from the notifications log as no
    #   emails actually get sent from the end to end test environments.


@issue("MAV-3886", "MAV-3159")
@pytest.mark.parametrize(
    ("child_file_mapping", "school_name"),
    [
        (ChildFileMapping.HOME_EDUCATED_CHILD, "Home-educated"),
        (ChildFileMapping.UNKNOWN_SCHOOL_CHILD, "Unknown school"),
    ],
)
def test_bulk_home_educated_or_unknown_school(
    children,
    log_in_as_nurse,
    page,
    point_of_care_file_generator,
    child_file_mapping,
    school_name,
):
    """
    Test: Invite a single child to the clinic from their child record.

    Steps:
    1. Import a home-educated or unknown school child with parent details via child
       records.
    2. Click on "Invite to community clinic" from the home-educated or unknown school.
    3. Choose a programme and submit the request to send invitations
    4. Find the child's record.
    5. Check the activity log for an invitation having been sent.
    """

    programme = Programme.HPV
    child = children[programme][0]

    imports_page = ImportsPage(page)
    import_records_wizard_page = ImportRecordsWizardPage(
        page, point_of_care_file_generator
    )
    children_search_page = ChildrenSearchPage(page)
    schools_search_page = SchoolsSearchPage(page)
    school_children_page = SchoolChildrenPage(page)
    school_invite_to_clinic_page = SchoolInviteToClinicPage(page)

    # Import a home-educated or unknown school child with parent details via child
    # records.
    imports_page.header.click_manage_data()
    imports_page.click_upload_records()
    import_records_wizard_page.navigate_to_child_record_import()
    import_records_wizard_page.upload_and_verify_output(child_file_mapping)
    imports_page.header.click_schools()

    # Click on "Invite to community clinic" from the home-educated or unknown school.
    schools_search_page.click_school(school_name)
    school_children_page.click_send_clinic_invitations()

    # Choose a programme and submit the request to send invitations
    school_invite_to_clinic_page.check_programme(programme)
    school_invite_to_clinic_page.click_send_clinic_invitations()
    school_invite_to_clinic_page.header.click_children()

    # Find the child's record.
    children_search_page.search.search_invited_to_clinic()
    children_search_page.search.click_child(child)

    # TODO: We can't check for the entry from the notifications log as no
    #   emails actually get sent from the end to end test environments.
