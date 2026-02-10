import pytest
from playwright.sync_api import expect

from mavis.test.constants import Programme
from mavis.test.data.file_mappings import ChildFileMapping, ClassFileMapping
from mavis.test.data.file_utils import set_site_for_child_list
from mavis.test.pages import (
    DashboardPage,
    ImportRecordsWizardPage,
    ImportsPage,
    SchoolMovesPage,
    TeamContactDetailsPage,
    TeamSchoolsPage,
)
from mavis.test.pages.schools.schools_children_page import SchoolsChildrenPage
from mavis.test.pages.schools.schools_search_page import SchoolsSearchPage

pytestmark = pytest.mark.team


def test_check_team_contact_details(page, log_in_as_nurse, team):
    """
    Test: Check team contact details appear on the Contact Details page.
    Steps:
    1. Navigate to the team page.
    Verification:
    - Team name and email are visible on the Contact Details page.
    """
    DashboardPage(page).click_your_team()
    TeamContactDetailsPage(page).check_team_name_is_visible(team)
    TeamContactDetailsPage(page).check_team_email_is_visible(team)


def test_team_page_lists_correct_schools(page, log_in_as_nurse, schools):
    """
    Test: Verify that the Team Schools page lists only schools associated with the team.
    Steps:
    1. Navigate to the team page.
    2. Click on the 'Schools' link.
    Verification:
    - Only schools associated with the team are visible on the Schools page.
    """
    DashboardPage(page).click_your_team()
    TeamContactDetailsPage(page).links.click_schools()
    TeamSchoolsPage(page).check_only_expected_schools_visible(schools)


def test_team_page_add_school_sites(page, log_in_as_nurse, schools):
    """
    Test: Verify that the user can add multiple school sites to the team.
    Steps:
    1. Navigate to the team page.
    2. Click on the 'Schools' link.
    3. Create first site (Site B) for a school.
    4. Start creating a site for a different school,
       then change parent school back to original.
    5. Create second site (Site C) for the original school.
    Verification:
    - The dropdown only shows schools associated with the team.
    - The new school site form is pre-filled with the school's address,
      but not the name.
    - Name of the site must be different from original school name and cannot be blank.
    - Address of the site can be edited.
    - The confirm screen shows the correct name and address details.
    - Both new school sites are listed on the Schools page.
    - The URNs of the sites and original school are
      updated with site identifiers (A, B, C).
    - The "Change parent school" link allows switching schools during site creation.
    """
    school = schools[Programme.HPV.group][0]
    school_to_not_use = schools[Programme.HPV.group][1]

    new_site_name_1 = f"{school} (Site B)"
    new_site_urn_1 = f"{school.urn}B"
    old_school_urn = f"{school.urn}A"

    DashboardPage(page).click_your_team()
    TeamContactDetailsPage(page).links.click_schools()
    TeamSchoolsPage(page).click_add_new_school_site()
    TeamSchoolsPage(page).select_school(school)
    TeamSchoolsPage(page).check_site_details_form(school)
    TeamSchoolsPage(page).fill_site_name(new_site_name_1)
    TeamSchoolsPage(page).add_new_site_details()
    TeamSchoolsPage(page).check_confirm_screen_shows_right_details(
        new_site_urn_1, new_site_name_1, "New Address Line 1"
    )
    TeamSchoolsPage(page).confirm_site()
    TeamSchoolsPage(page).check_new_site_is_listed(
        new_site_name_1, new_site_urn_1, old_school_urn
    )

    TeamSchoolsPage(page).click_add_new_school_site()
    TeamSchoolsPage(page).select_school(school_to_not_use)
    TeamSchoolsPage(page).fill_site_name(f"{school_to_not_use} (Site 0)")
    TeamSchoolsPage(page).add_new_site_details()
    TeamSchoolsPage(page).click_change_parent_school()

    new_site_name_2 = f"{school} (Site C)"
    new_site_urn_2 = f"{school.urn}C"

    TeamSchoolsPage(page).select_school(school)
    TeamSchoolsPage(page).check_site_details_form(school)
    TeamSchoolsPage(page).fill_site_name(new_site_name_2)
    TeamSchoolsPage(page).add_new_site_details()
    TeamSchoolsPage(page).check_confirm_screen_shows_right_details(
        new_site_urn_2, new_site_name_2, "New Address Line 1"
    )
    TeamSchoolsPage(page).confirm_site()
    TeamSchoolsPage(page).check_new_site_is_listed(
        new_site_name_2, new_site_urn_2, old_school_urn
    )


def test_site_child_record_import(
    page, log_in_as_nurse, file_generator, schools, children
):
    """
    Test: Importing child records for a school that has been split into sites.
    Steps:
    1. From the team page, create a new school site (Site B) for an existing school.
    2. Attempt to import child records using the original school URN.
    3. Update the input file to use a site-specific URN (with an A/B identifier).
    4. Re-run the import and complete the wizard.
    5. Navigate to the original school and the new site Children pages.
    Verification:
    - An error message is shown when using the original URN, instructing the user
      to use URNs with site identifiers (e.g. {URN}A or {URN}B).
    - The import succeeds when the child record uses a valid site identifier.
    - The imported child appears under the original school site (A).
    - The imported child does not appear under the new school site (B).
    """
    school = schools[Programme.FLU][0]
    child = children[Programme.FLU][0]

    new_site_name = f"{school} (Site B)"

    DashboardPage(page).click_your_team()
    TeamContactDetailsPage(page).links.click_schools()
    TeamSchoolsPage(page).click_add_new_school_site()
    TeamSchoolsPage(page).select_school(school)
    TeamSchoolsPage(page).fill_site_name(new_site_name)
    TeamSchoolsPage(page).fill_missing_details()
    TeamSchoolsPage(page).click_continue()
    TeamSchoolsPage(page).confirm_site()

    input_file_path, output_file_path = file_generator.get_file_paths(
        file_mapping=ChildFileMapping.FIXED_CHILD, programme_group=Programme.FLU.group
    )

    TeamSchoolsPage(page).header.click_mavis_header()
    DashboardPage(page).click_imports()
    ImportsPage(page).click_upload_records()
    ImportRecordsWizardPage(page, file_generator).navigate_to_child_record_import()
    ImportRecordsWizardPage(page, file_generator).upload_input_file(input_file_path)
    expect(
        page.get_by_text(
            f"The URN {school.urn} has been split into sites. "
            f"Use {school.urn}A or {school.urn}B instead."
        )
    ).to_be_visible()

    file_with_site = set_site_for_child_list(input_file_path, "A")

    TeamSchoolsPage(page).header.click_mavis_header()
    DashboardPage(page).click_imports()
    ImportsPage(page).click_upload_records()
    ImportRecordsWizardPage(page, file_generator).navigate_to_child_record_import()
    ImportRecordsWizardPage(
        page, file_generator
    ).upload_and_verify_output_for_input_output_files(file_with_site, output_file_path)

    ImportRecordsWizardPage(page, file_generator).header.click_mavis_header()
    DashboardPage(page).click_schools()
    SchoolsSearchPage(page).click_school(school)
    SchoolsChildrenPage(page).search.search_for_a_child_name(str(child))

    SchoolsChildrenPage(page).header.click_mavis_header()
    DashboardPage(page).click_schools()
    SchoolsSearchPage(page).click_school(new_site_name)
    SchoolsChildrenPage(page).search.search_for_child_that_should_not_exist(child)


def test_site_class_list_import(
    page, log_in_as_nurse, file_generator, schools, children
):
    """
    Test: Importing class list records for a school that has been split into sites.
    Steps:
    1. From the team page, create a new school site (Site B) for an existing school.
    2. Import a class list for the original school.
    3. Import a class list for the new school site.
    4. Navigate to the School Moves page and verify the child appears.
    Verification:
    - The import succeeds for the original school site.
    - The import succeeds for the new school site (B).
    - The child is visible on the School Moves page.
    """
    school = schools[Programme.MMR][0]
    child = children[Programme.MMR][0]

    new_site_name = f"{school} (Site B)"

    DashboardPage(page).click_your_team()
    TeamContactDetailsPage(page).links.click_schools()
    TeamSchoolsPage(page).click_add_new_school_site()
    TeamSchoolsPage(page).select_school(school)
    TeamSchoolsPage(page).fill_site_name(new_site_name)
    TeamSchoolsPage(page).fill_missing_details()
    TeamSchoolsPage(page).click_continue()
    TeamSchoolsPage(page).confirm_site()

    TeamSchoolsPage(page).header.click_mavis_header()
    DashboardPage(page).click_imports()
    ImportsPage(page).click_upload_records()
    ImportRecordsWizardPage(page, file_generator).navigate_to_class_list_record_import(
        str(school), child.year_group
    )
    ImportRecordsWizardPage(page, file_generator).upload_and_verify_output(
        file_mapping=ClassFileMapping.FIXED_CHILD, programme_group=Programme.MMR.group
    )
    TeamSchoolsPage(page).header.click_mavis_header()
    DashboardPage(page).click_imports()
    ImportsPage(page).click_upload_records()
    ImportRecordsWizardPage(page, file_generator).navigate_to_class_list_record_import(
        new_site_name, child.year_group
    )
    ImportRecordsWizardPage(page, file_generator).upload_and_verify_output(
        file_mapping=ClassFileMapping.FIXED_CHILD, programme_group=Programme.MMR.group
    )
    TeamSchoolsPage(page).header.click_mavis_header()
    DashboardPage(page).click_school_moves()
    SchoolMovesPage(page).click_child(child)
