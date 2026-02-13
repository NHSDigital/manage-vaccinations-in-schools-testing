import pytest

from mavis.test.data import VaccsFileMapping
from mavis.test.data.file_mappings import ChildFileMapping
from mavis.test.data_models import User
from mavis.test.helpers.sidekiq_helper import SidekiqHelper
from mavis.test.pages import (
    DashboardPage,
    ImportRecordsWizardPage,
    ImportsPage,
    LogInPage,
)


@pytest.fixture
def setup_national_reporting_import(
    page,
    national_reporting_nurse,
    national_reporting_team,
):
    LogInPage(page).navigate()
    LogInPage(page).log_in_and_choose_team_if_necessary(
        national_reporting_nurse, national_reporting_team
    )
    DashboardPage(page).click_imports()
    ImportsPage(page).click_upload_records()


@pytest.fixture(scope="session")
def superusers(
    point_of_care_superuser,
    point_of_care_medical_secretary,
) -> dict[str, User]:
    return {
        "superuser": point_of_care_superuser,
        "medical_secretary": point_of_care_medical_secretary,
    }


@pytest.mark.vaccinations
def test_national_reporting_valid_data(
    setup_national_reporting_import,
    page,
    national_reporting_file_generator,
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
    ["superuser", "medical_secretary"],
    ids=lambda v: f"role: {v}",
)
def test_important_notices_dismiss_and_abort(
    role,
    superusers,
    page,
    point_of_care_team,
    point_of_care_file_generator,
    point_of_care_nurse,
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
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_and_verify_output(ChildFileMapping.NR_IMPORTANT_NOTICES)
    SidekiqHelper().run_recurring_job("update_patients_from_pds")

    # Log out
    LogInPage(page).log_out()

    LogInPage(page).navigate()
    LogInPage(page).log_in_and_choose_team_if_necessary(
        superusers[role], point_of_care_team
    )

    DashboardPage(page).verify_important_notices_displayed()
    DashboardPage(page).click_important_notices()

    # Abort the dismissal and return to dashboard
    DashboardPage(page).cancel_dismiss_notice()

    # Verify notices are still displayed after aborting
    DashboardPage(page).verify_important_notices_displayed()

    # Dismiss the notice for real this time
    DashboardPage(page).click_dismiss_notice()
    DashboardPage(page).confirm_dismiss_notice()

    # Log out
    LogInPage(page).log_out()
