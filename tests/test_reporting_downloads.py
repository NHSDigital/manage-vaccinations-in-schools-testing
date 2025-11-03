import pytest

from mavis.test.models import (
    Programme,
)


@pytest.fixture
def upload_offline_vaccination_hpv(upload_offline_vaccination):
    yield from upload_offline_vaccination(Programme.HPV)


def test_report_has_correct_values(
    upload_offline_vaccination_hpv,
    reports_vaccinations_page,
    reports_download_page,
):
    """
    Test: Verify that downloaded report has expected values
    Steps:
    1. Record an HPV vaccination for a child.
    2. Refresh reports and check cohort and vaccination percentages.
    3. Download the report and verify cohort, vaccinated, and not vaccinated values.
    Verification:
    - Cohort size, vaccinated, and not vaccinated values are correct in both UI
      and downloaded report.
    """
    reports_vaccinations_page.navigate()
    reports_vaccinations_page.check_filter_for_programme(Programme.HPV)

    reports_vaccinations_page.navigate_and_refresh_reports()
    reports_vaccinations_page.check_filter_for_programme(Programme.HPV)
    vaccinated_count = reports_vaccinations_page.get_children_count("Vaccinated")
    unvaccinated_count = reports_vaccinations_page.get_children_count("Not vaccinated")

    reports_vaccinations_page.click_download_data_tab()
    reports_download_page.check_aggregate_data_radio()
    reports_download_page.click_continue()
    reports_download_page.choose_programme(Programme.HPV)

    report = reports_download_page.download_and_get_dataframe()

    reports_download_page.check_vaccinated_values(
        report,
        expected_cohort=unvaccinated_count + vaccinated_count,
        expected_vaccinated=vaccinated_count,
        expected_not_vaccinated=unvaccinated_count,
    )


def test_report_has_all_expected_headers(
    log_in_as_nurse,
    dashboard_page,
    reports_vaccinations_page,
    reports_download_page,
):
    """
    Test: Verify that the downloaded report contains all expected headers.
    Steps:
    1. Navigate to the reports page.
    2. Select TD/IPV programme and all variables.
    3. Download the report.
    Verification:
    - The report contains all expected column headers.
    """
    reports_vaccinations_page.navigate()
    reports_vaccinations_page.click_download_data_tab()
    reports_download_page.check_aggregate_data_radio()
    reports_download_page.click_continue()
    reports_download_page.choose_programme(Programme.TD_IPV)
    reports_download_page.choose_variable("Local Authority")
    reports_download_page.choose_variable("School")
    reports_download_page.choose_variable("Year Group")
    reports_download_page.choose_variable("Gender")

    report = reports_download_page.download_and_get_dataframe()

    reports_download_page.check_report_headers(
        report,
        expected_headers=[
            "Local Authority",
            "School",
            "Year Group",
            "Gender",
            "Cohort",
            "Vaccinated",
            "Not Vaccinated",
            "Vaccinated by SAIS",
            "Vaccinated Elsewhere (Declared)",
            "Vaccinated Elsewhere (Recorded)",
            "Vaccinated Previously",
        ],
    )
    dashboard_page.navigate()


def test_log_out_via_reporting_component(
    log_in_page,
    log_out_page,
    reports_vaccinations_page,
    nurse,
    team,
):
    """
    Test: Verify that logging out via the reporting component works correctly.
    Steps:
    1. Log in as nurse and choose team if necessary.
    2. Navigate to the reports page.
    3. Log out using the reporting component.
    4. Verify the log out page is displayed.
    Verification:
    - User is successfully logged out and the log out page is shown.
    """
    log_in_page.navigate()
    log_in_page.log_in_and_choose_team_if_necessary(nurse, team)
    reports_vaccinations_page.navigate()
    log_in_page.log_out_via_reporting_component()
    log_out_page.verify_log_out_page()
