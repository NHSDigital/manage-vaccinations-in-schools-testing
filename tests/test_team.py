import pytest
from playwright.sync_api import expect

from mavis.test.constants import Programme
from mavis.test.data.file_mappings import ChildFileMapping
from mavis.test.data.file_utils import set_site_for_child_list
from mavis.test.pages import (
    DashboardPage,
    ImportRecordsWizardPage,
    ImportsPage,
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


def test_team_page_add_school_site(page, log_in_as_nurse, schools):
    """
    Test: Verify that the user can add a new school site to the team.
    Steps:
    1. Navigate to the team page.
    2. Click on the 'Schools' link.
    3. Click on the 'Add new school site' button.
    4. Select the school from the dropdown.
    5. Fill in the school site details.
    6. Confirm the details are correct.
    Verification:
    - The dropdown only shows schools associated with the team.
    - The new school site form is pre-filled with the school's address,
      but not the name.
    - Name of the site must be different from original school name and cannot be blank.
    - Address of the site can be edited.
    - The confirm screen shows the correct name and address details.
    - The new school site is listed on the Schools page.
    - The URNs of the new and original schools are updated with site identifiers.
    """
    school = schools[Programme.HPV.group][0]

    new_site_name = f"{school} (Site B)"
    new_site_urn = f"{school.urn}B"
    old_school_urn = f"{school.urn}A"

    DashboardPage(page).click_your_team()
    TeamContactDetailsPage(page).links.click_schools()
    TeamSchoolsPage(page).click_add_new_school_site()
    TeamSchoolsPage(page).check_only_expected_schools_visible_in_dropdown(schools)
    TeamSchoolsPage(page).select_school(school)
    TeamSchoolsPage(page).check_site_details_form(school)
    TeamSchoolsPage(page).fill_site_name(new_site_name)
    TeamSchoolsPage(page).add_new_site_details()
    TeamSchoolsPage(page).check_confirm_screen_shows_right_details(
        new_site_urn, new_site_name, "New Address Line 1"
    )
    TeamSchoolsPage(page).confirm_site()
    TeamSchoolsPage(page).check_new_site_is_listed(
        new_site_name, new_site_urn, old_school_urn
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
    school = schools[Programme.HPV.group][0]
    child = children[Programme.HPV][0]

    new_site_name = f"{school} (Site B)"

    DashboardPage(page).click_your_team()
    TeamContactDetailsPage(page).links.click_schools()
    TeamSchoolsPage(page).click_add_new_school_site()
    TeamSchoolsPage(page).select_school(school)
    TeamSchoolsPage(page).fill_site_name(new_site_name)
    TeamSchoolsPage(page).click_continue()
    TeamSchoolsPage(page).confirm_site()

    input_file_path, output_file_path = file_generator.get_file_paths(
        file_mapping=ChildFileMapping.FIXED_CHILD,
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

    set_site_for_child_list(input_file_path, "A")

    TeamSchoolsPage(page).header.click_mavis_header()
    DashboardPage(page).click_imports()
    ImportsPage(page).click_upload_records()
    ImportRecordsWizardPage(page, file_generator).navigate_to_child_record_import()
    ImportRecordsWizardPage(
        page, file_generator
    ).upload_and_verify_output_for_input_output_files(input_file_path, output_file_path)

    ImportRecordsWizardPage(page, file_generator).header.click_mavis_header()
    DashboardPage(page).click_schools()
    SchoolsSearchPage(page).click_school(school)
    SchoolsChildrenPage(page).search.search_for_a_child_name(str(child))

    SchoolsChildrenPage(page).header.click_mavis_header()
    DashboardPage(page).click_schools()
    SchoolsSearchPage(page).click_school(new_site_name)
    SchoolsChildrenPage(page).search.search_for_child_that_should_not_exist(child)
