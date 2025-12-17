from playwright.sync_api import Page

from mavis.test.constants import Programme
from mavis.test.data_models import Clinic, School
from mavis.test.pages import AddSessionWizardPage, DashboardPage, SessionsSearchPage


def schedule_school_session_if_needed(
    page: Page,
    school: School,
    programmes: list[Programme],
    year_groups: list[int],
    date_offset: int = 0,
) -> None:
    DashboardPage(page).header.click_mavis_header()
    DashboardPage(page).click_sessions()
    if not SessionsSearchPage(page).click_session_if_exists(
        school, programmes, year_groups, date_offset
    ):
        SessionsSearchPage(page).click_add_a_new_session()
        AddSessionWizardPage(page).schedule_school_session(
            school, programmes, year_groups, date_offset
        )


def schedule_community_clinic_session_if_needed(
    page: Page,
    programmes: list[Programme],
    date_offset: int = 0,
) -> None:
    DashboardPage(page).header.click_mavis_header()
    DashboardPage(page).click_sessions()
    if not SessionsSearchPage(page).click_session_if_exists(
        Clinic("community clinic"), programmes, [], date_offset
    ):
        SessionsSearchPage(page).click_add_a_new_session()
        AddSessionWizardPage(page).schedule_clinic_session(programmes, date_offset)
