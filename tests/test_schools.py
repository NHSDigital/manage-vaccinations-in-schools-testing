import pytest

from mavis.test.constants import Programme
from mavis.test.helpers.accessibility_helper import AccessibilityHelper
from mavis.test.pages import (
    DashboardPage,
    SchoolsChildrenPage,
    SchoolsSearchPage,
    SchoolsSessionsPage,
)
from mavis.test.pages.add_session_wizard_page import AddSessionWizardPage

pytestmark = pytest.mark.schools


def test_schools_schedule_session_with_no_dates(
    log_in_as_nurse,
    page,
    schools,
    year_groups,
):
    """
    Test: Schedule a school session where no dates are initially available.
    Steps:
    1. Navigate to the schools page.
    2. Attempt to schedule a session for a school with no available dates.
    3. Verify that the session is scheduled successfully.
    Verification:
    - The session appears in the schools sessions list as Unscheduled
    """
    school = schools[Programme.HPV][0]
    year_group = year_groups[Programme.HPV]

    DashboardPage(page).click_schools()
    SchoolsSearchPage(page).click_school(school)
    SchoolsChildrenPage(page).tabs.click_sessions_tab()
    SchoolsSessionsPage(page).click_add_a_new_session()
    AddSessionWizardPage(page).schedule_school_session(
        school=None,
        programmes=[Programme.HPV],
        year_groups=[year_group],
        date_offset=None,
    )
    SchoolsSessionsPage(page).verify_session_exists(
        programmes=[Programme.HPV],
        year_groups=[year_group],
        scheduled=False,
    )


def test_schools_schedule_session_with_date(
    log_in_as_nurse,
    page,
    schools,
    year_groups,
):
    """
    Test: Schedule a school session with a date.
    Steps:
    1. Navigate to the schools page.
    2. Attempt to schedule a session for a school with a dates.
    3. Verify that the session is scheduled successfully.
    Verification:
    - The session appears in the schools sessions list as Scheduled
    """
    school = schools[Programme.HPV][0]
    year_group = year_groups[Programme.HPV]

    DashboardPage(page).click_schools()
    SchoolsSearchPage(page).click_school(school)
    SchoolsChildrenPage(page).tabs.click_sessions_tab()
    SchoolsSessionsPage(page).click_add_a_new_session()
    AddSessionWizardPage(page).schedule_school_session(
        school=None,
        programmes=[Programme.HPV],
        year_groups=[year_group],
        date_offset=0,
    )
    SchoolsSessionsPage(page).verify_session_exists(
        programmes=[Programme.HPV],
        year_groups=[year_group],
        scheduled=True,
    )


@pytest.mark.accessibility
def test_accessibility(
    log_in_as_nurse,
    schools,
    page,
):
    """
    Test: Check accessibility of the schools page.
    Steps:
    1. Navigate to the schools page.
    2. Run accessibility checks on the page.
    Verification:
    - The schools page passes accessibility checks.
    """
    school = schools[Programme.HPV][0]

    DashboardPage(page).click_schools()
    AccessibilityHelper(page).check_accessibility()

    SchoolsSearchPage(page).click_school(school)
    AccessibilityHelper(page).check_accessibility()

    SchoolsChildrenPage(page).tabs.click_sessions_tab()
    AccessibilityHelper(page).check_accessibility()
