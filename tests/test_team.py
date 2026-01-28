import pytest

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
