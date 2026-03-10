import pytest

from mavis.test.pages import DashboardPage, ImportsPage, LogInPage


@pytest.fixture
def setup_national_reporting_import(
    page,
    national_reporting_nurse,
    national_reporting_team,
):
    """Fixture to set up national reporting import page."""
    LogInPage(page).navigate()
    LogInPage(page).log_in_and_choose_team_if_necessary(
        national_reporting_nurse, national_reporting_team
    )
    DashboardPage(page).click_imports()
    ImportsPage(page).click_upload_records()
