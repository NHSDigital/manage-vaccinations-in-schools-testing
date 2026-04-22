import pytest

from mavis.test.constants import Programme
from mavis.test.data import ClassFileMapping, VaccsFileMapping
from mavis.test.helpers.sidekiq_helper import SidekiqHelper
from mavis.test.pages import (
    CareplusReportsPage,
    DashboardPage,
    ImportRecordsWizardPage,
    ImportsPage,
    SchoolChildrenPage,
    SchoolsSearchPage,
    SessionsEditPage,
    SessionsOverviewPage,
)
from mavis.test.pages.utils import schedule_school_session_if_needed

pytestmark = pytest.mark.reporting


@pytest.fixture
def setup_careplus_report_data(
    log_in_as_nurse,
    schools,
    page,
    point_of_care_file_generator,
    year_groups,
):
    school = schools[Programme.HPV][0]
    year_group = year_groups[Programme.HPV]

    DashboardPage(page).click_schools()
    SchoolsSearchPage(page).click_school(school)
    SchoolChildrenPage(page).click_import_class_lists()
    ImportRecordsWizardPage(page, point_of_care_file_generator).import_class_list(
        ClassFileMapping.FIXED_CHILD,
        year_group,
        Programme.HPV.group,
    )
    schedule_school_session_if_needed(page, school, [Programme.HPV], [year_group])

    session_id = SessionsOverviewPage(page).get_session_id_from_offline_excel()
    SessionsOverviewPage(page).click_edit_session()
    SessionsEditPage(page).ensure_session_has_dates_for_today_and_yesterday()
    SessionsOverviewPage(page).header.click_mavis()
    DashboardPage(page).click_imports()
    ImportsPage(page).click_upload_records()

    ImportRecordsWizardPage(page, point_of_care_file_generator).navigate_to_vaccination_records_import()
    return session_id


def test_careplus_reports_page_lists_generated_report(
    page,
    point_of_care_file_generator,
    setup_careplus_report_data,
):
    """
    Test: Import an offline vaccination with yesterday's date, run the automated
    CarePlus reporting job, and verify a report is listed.
    Steps:
    1. Schedule an HPV session and import a class list.
    2. Upload an offline vaccination file for that session using yesterday's date.
    3. Trigger the recurring automated CarePlus reports Sidekiq job.
    4. Navigate to the CarePlus reports page.
    Verification:
    - At least one CarePlus report is listed.
    """
    session_id = setup_careplus_report_data
    input_file_path, output_file_path = point_of_care_file_generator.get_file_paths(
        file_mapping=VaccsFileMapping.HPV_DOSE_TWO_YESTERDAY,
        session_id=session_id,
        programme_group=Programme.HPV.group,
    )

    ImportRecordsWizardPage(page, point_of_care_file_generator).upload_and_verify_output_for_input_output_files(
        input_file_path,
        output_file_path,
    )
    page.pause()

    SidekiqHelper().run_recurring_job("automated_careplus_reports")

    page.pause()
    CareplusReportsPage(page).navigate()
    CareplusReportsPage(page).expect_at_least_one_report()
