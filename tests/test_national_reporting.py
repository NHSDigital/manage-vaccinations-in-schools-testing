from typing import Literal

import pandas as pd
import pytest
from playwright.sync_api._generated import Page

from mavis.test.constants import Programme
from mavis.test.data import VaccsFileMapping
from mavis.test.data.file_generator import FileGenerator
from mavis.test.data.file_mappings import ChildFileMapping
from mavis.test.data_models import (
    Child,
    NationalReportingTeam,
    Parent,
    PointOfCareTeam,
    User,
)
from mavis.test.helpers.sidekiq_helper import SidekiqHelper
from mavis.test.pages import (
    DashboardPage,
    GillickCompetencePage,
    ImportRecordsWizardPage,
    ImportsPage,
    LogInPage,
    SessionsChildrenPage,
    SessionsOverviewPage,
    SessionsPatientPage,
)
from mavis.test.pages.school_moves.school_moves_page import SchoolMovesPage
from mavis.test.pages.utils import schedule_school_session_if_needed


@pytest.fixture
def setup_national_reporting_import(
    page: Page,
    national_reporting_nurse: User,
    national_reporting_team: NationalReportingTeam,
):
    LogInPage(page).navigate()
    LogInPage(page).log_in_and_choose_team_if_necessary(
        national_reporting_nurse, national_reporting_team
    )
    DashboardPage(page).click_imports()
    ImportsPage(page).click_upload_records()


@pytest.fixture(scope="session")
def superusers(
    point_of_care_superuser: User,
    point_of_care_medical_secretary: User,
) -> dict[str, User]:
    return {
        "superuser": point_of_care_superuser,
        "medical_secretary": point_of_care_medical_secretary,
    }


@pytest.mark.vaccinations
def test_national_reporting_valid_data(
    setup_national_reporting_import: None,
    page: Page,
    national_reporting_file_generator: FileGenerator,
):
    """
    Test: Upload vaccination records file with valid data and verify import.
    Steps:
    1. Navigate to vaccination records import page.
    2. Upload a vaccination record file with valid data.
    Verification:
    - Output indicates successful import of records.
    Scenarios covered:
    HPV:
    HPV_Gardasil9, HPV_Gardasil, HPV_Cervarix, HPV_NFA, HPV_Add_Not_Known,
    HPV_AllowPastExpiryDate, HPV_SiteRAU, HPV_SiteRAL, HPV_NotVaccinated,
    HPV_PostcodeNFA, HPV_PostcodeAddressNotKnown, HPV_PostcodeAddressNotSpecified
    Flu:
    Flu_Optional, Flu_NFA, Flu_Add_Not_Known, Flu_AllowPastExpiryDate,
    Flu_SiteRAU, Flu_SiteRAL, Flu_NotVaccinated, Flu_BatchName100Chars
    """
    ImportRecordsWizardPage(
        page, national_reporting_file_generator
    ).upload_and_verify_output(VaccsFileMapping.NATIONAL_REPORTING_POSITIVE)


@pytest.mark.important_notices
@pytest.mark.parametrize(
    "role",
    ["superuser"],
    ids=lambda v: f"role: {v}",
)
def test_important_notices_dismiss_and_abort(
    role: Literal["superuser"],
    superusers: dict[str, User],
    page: Page,
    point_of_care_team: PointOfCareTeam,
    point_of_care_file_generator: FileGenerator,
    point_of_care_nurse: User,
    schools,
):
    """
    Test: Verify important notices handling for superuser roles.
    Steps:
    1. Upload cohort records file containing important notice triggers:
       - Death record
       - Gillick - do not inform parent
       - Child move to other area
       - Record flagged as invalid
       - Record flagged as sensitive
    2. Log in as specified superuser role.
    3. Verify important notices are displayed on dashboard.
    4. Attempt to dismiss an important notice.
    5. Abort the dismissal and return to dashboard.
    6. Confirm dismissal of important notice.
    7. Log out.
    Verification:
    - Important notices are visible on dashboard after upload.
    - User can dismiss notices.
    - User can abort dismissal and return.
    - Notices are removed after dismissal.
    """

    # Log in as the specified superuser role
    LogInPage(page).navigate()
    LogInPage(page).log_in_and_choose_team_if_necessary(
        point_of_care_nurse, point_of_care_team
    )

    # Upload cohort records with important notice triggers
    DashboardPage(page).click_imports()
    ImportsPage(page).click_upload_records()
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).navigate_to_child_record_import()
    input_file_path, _ = ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_and_verify_output(ChildFileMapping.NR_IMPORTANT_NOTICES)

    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).header.click_mavis_header()

    # Read the fourth child from the uploaded file for Gillick consent
    df = pd.read_csv(input_file_path)
    fourth_row = df.iloc[3]  # Fourth row (index 3) - the Gillick child
    gillick_child = Child(
        first_name=fourth_row["CHILD_FIRST_NAME"],
        last_name=fourth_row["CHILD_LAST_NAME"],
        date_of_birth=pd.to_datetime(fourth_row["CHILD_DATE_OF_BIRTH"]).date(),
        nhs_number=str(fourth_row["CHILD_NHS_NUMBER"]),
        address=(
            fourth_row["CHILD_ADDRESS_LINE_1"],
            fourth_row["CHILD_ADDRESS_LINE_2"],
            fourth_row["CHILD_TOWN"],
            fourth_row["CHILD_POSTCODE"],
        ),
        year_group=int(fourth_row["CHILD_YEAR_GROUP"]),
        parents=[
            Parent(
                full_name=fourth_row["PARENT_1_NAME"],
                email_address=fourth_row["PARENT_1_EMAIL"],
                relationship=fourth_row["PARENT_1_RELATIONSHIP"],
            ),
            Parent(
                full_name=fourth_row["PARENT_2_NAME"],
                email_address=fourth_row["PARENT_2_EMAIL"],
                relationship=fourth_row["PARENT_2_RELATIONSHIP"],
            ),
        ],
    )

    # Get the school from point_of_care_team and schedule a session
    school = schools[Programme.HPV.group][0]
    schedule_school_session_if_needed(
        page, school, [Programme.HPV], [gillick_child.year_group]
    )

    # Navigate to the child in the session and give Gillick consent
    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).search.search_and_click_child(gillick_child)
    SessionsPatientPage(page).click_programme_tab(Programme.HPV)
    SessionsPatientPage(page).click_assess_gillick_competence()
    GillickCompetencePage(page).add_gillick_competence(is_competent=True)

    # Return to dashboard
    GillickCompetencePage(page).header.click_mavis_header()

    SidekiqHelper().run_recurring_job("update_patients_from_pds")

    # Log out
    LogInPage(page).log_out()

    LogInPage(page).navigate()
    LogInPage(page).log_in_and_choose_team_if_necessary(
        superusers[role], point_of_care_team
    )

    DashboardPage(page).verify_important_notices_displayed()

    DashboardPage(page).click_school_moves()
    SchoolMovesPage(page).accept_all_school_moves()
    SchoolMovesPage(page).header.click_mavis_header()

    # Abort the dismissal and return to dashboard
    DashboardPage(page).click_important_notices()
    DashboardPage(page).cancel_dismiss_notice()

    # Verify notices are still displayed after aborting
    DashboardPage(page).verify_important_notices_displayed()

    # Dismiss the notice for real this time
    DashboardPage(page).click_dismiss_notice()
    DashboardPage(page).confirm_dismiss_notice()

    # Log out
    LogInPage(page).log_out()
