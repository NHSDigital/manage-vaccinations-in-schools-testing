import pytest

from mavis.test.constants import Programme
from mavis.test.pages import (
    DashboardPage,
    TeamContactDetailsPage,
    TeamSchoolsPage,
)

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
