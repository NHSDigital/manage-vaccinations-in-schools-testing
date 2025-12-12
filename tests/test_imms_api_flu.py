import pytest
from playwright.sync_api import expect

from mavis.test.constants import ConsentOption, DeliverySite, Programme, Vaccine
from mavis.test.helpers.imms_api_helper import ImmsApiHelper
from mavis.test.helpers.sidekiq_helper import SidekiqHelper
from mavis.test.pages import (
    ChildrenSearchPage,
    DashboardPage,
    EditVaccinationRecordPage,
    LogInPage,
    SessionsPatientPage,
    StartPage,
    VaccinationRecordPage,
)
from mavis.test.utils import get_current_datetime, random_datetime_earlier_today

pytestmark = pytest.mark.imms_api


@pytest.fixture(scope="session")
def imms_api_helper(authenticate_api):
    return ImmsApiHelper(authenticate_api)


@pytest.fixture
def upload_offline_vaccination_injected_flu(upload_offline_vaccination):
    yield from upload_offline_vaccination(Programme.FLU)


@pytest.fixture
def upload_offline_vaccination_nasal_flu(upload_offline_vaccination):
    yield from upload_offline_vaccination(Programme.FLU, ConsentOption.NASAL_SPRAY)


def test_create_imms_record_then_verify_on_children_page(
    imms_api_helper, page, children, schools, nurse, team
):
    """
    Test: Create a vaccination record via IMMS API, then log into MAVIS as a nurse.

    Steps:
    1. Create a vaccination record directly via IMMS API
    2. Verify the record was created successfully
    3. Navigate to MAVIS login page
    4. Log in as a nurse
    5. Verify the child created via IMMS API is visible in MAVIS children page
    """
    sidekiq_helper = SidekiqHelper()

    # Step 1: Prepare test data - use available programme data
    if Programme.FLU in children and Programme.FLU in schools:
        child = children[Programme.FLU][0]
        school = schools[Programme.FLU][0]
        vaccine = Vaccine.SEQUIRUS
    else:
        # Fallback to any available programme
        available_programme = next(iter(children.keys()))
        child = children[available_programme][0]
        school = schools[available_programme][0]
        # Use appropriate vaccine for the programme
        if available_programme == Programme.HPV:
            vaccine = Vaccine.GARDASIL_9
        else:
            vaccine = Vaccine.SEQUIRUS

    vaccination_time = get_current_datetime().replace(
        hour=9, minute=30, second=0, microsecond=0
    )
    sidekiq_job_name = "enqueue_vaccinations_search_in_nhs_job"

    # Step 2: Create vaccination record via IMMS API
    imms_api_helper.create_vaccination_record(
        vaccine=vaccine,
        child=child,
        school=school,
        delivery_site=DeliverySite.LEFT_ARM_UPPER,
        vaccination_time=vaccination_time,
    )

    sidekiq_helper.run_recurring_job(sidekiq_job_name)

    # Step 3: Navigate to MAVIS and log in as nurse
    StartPage(page).navigate()
    StartPage(page).start()

    # Step 4: Log in as nurse
    LogInPage(page).log_in_and_choose_team_if_necessary(nurse, team)

    # Go to dashboard
    DashboardPage(page).navigate()
    DashboardPage(page).click_children()

    # Step 5: Verify the child created via IMMS API is visible in MAVIS children page
    children_search_page = ChildrenSearchPage(page)

    # Search for the child by their details
    children_search_page.search.search_for(str(child))

    # Verify the child appears in search results
    child_card_locator = children_search_page.search.get_patient_card_locator(child)
    expect(child_card_locator).to_be_visible()

    # Verify we can click on the child to access their record
    child_link = child_card_locator.get_by_role("link", name=str(child))
    expect(child_link).to_be_visible()

    # Click on the child to verify access to their detailed record
    children_search_page.search.click_child(child)

    # Verify we're now on the child's record page
    expect(page.get_by_text(f"NHS number: {child.nhs_number}")).to_be_visible()


def test_create_edit_delete_injected_flu_vaccination_and_verify_imms_api(
    upload_offline_vaccination_injected_flu,
    schools,
    children,
    imms_api_helper,
    page,
):
    """
    Test: Create, edit, and delete an injected flu vaccination record and verify changes
    in the IMMS API and Mavis status.
    Steps:
    1. Setup: Schedule flu session, import class list, add vaccine batch, and
       register child with verbal consent.
    2. Create: Record flu vaccination for the child (LEFT_ARM_UPPER).
    3. Verify: Check the vaccination record exists in the IMMS API.
       Check Mavis shows "Synced".
    4. Edit: Change the delivery site to RIGHT_ARM_LOWER and save.
    5. Verify: Check the updated vaccination record in the IMMS API.
       Check Mavis still shows "Synced".
    6. Edit: Change the outcome to "They refused it" and save.
    7. Verify: Check the vaccination record is removed from the IMMS API.
       Check Mavis shows "Not synced".
    """
    child = children[Programme.FLU][0]
    school = schools[Programme.FLU][0]

    vaccination_time = get_current_datetime().replace(
        hour=0, minute=1, second=0, microsecond=0
    )

    # Step 3: Verify creation in IMMS API
    imms_api_helper.check_record_in_imms_api(
        Vaccine.SEQUIRUS,
        child,
        school,
        DeliverySite.LEFT_ARM_UPPER,
        vaccination_time,
    )

    # Step 4: Edit delivery site to RIGHT_ARM_LOWER
    VaccinationRecordPage(page).page.reload()
    VaccinationRecordPage(page).expect_vaccination_details(
        "Synced with NHS England?", "Synced"
    )

    VaccinationRecordPage(page).click_edit_vaccination_record()
    EditVaccinationRecordPage(page).click_change_site()
    EditVaccinationRecordPage(page).click_delivery_site(DeliverySite.RIGHT_ARM_LOWER)
    EditVaccinationRecordPage(page).click_continue()
    EditVaccinationRecordPage(page).click_save_changes()

    # Step 5: Verify update in IMMS API
    imms_api_helper.check_record_in_imms_api(
        Vaccine.SEQUIRUS,
        child,
        school,
        DeliverySite.RIGHT_ARM_UPPER,
        vaccination_time,
    )

    # Step 6: Edit outcome to refused
    SessionsPatientPage(page).click_vaccination_details(school)
    VaccinationRecordPage(page).expect_vaccination_details(
        "Synced with NHS England?", "Synced"
    )

    VaccinationRecordPage(page).click_edit_vaccination_record()
    EditVaccinationRecordPage(page).click_change_outcome()
    EditVaccinationRecordPage(page).click_they_refused_it()
    EditVaccinationRecordPage(page).click_continue()
    EditVaccinationRecordPage(page).click_save_changes()

    # Step 7: Verify deletion in IMMS API
    imms_api_helper.check_record_is_not_in_imms_api(Vaccine.SEQUIRUS, child)
    SessionsPatientPage(page).click_vaccination_details(school)
    VaccinationRecordPage(page).expect_vaccination_details(
        "Synced with NHS England?", "Not synced"
    )


def test_create_edit_delete_nasal_flu_vaccination_and_verify_imms_api(
    upload_offline_vaccination_nasal_flu,
    schools,
    imms_api_helper,
    page,
    children,
):
    """
    Test: Create, edit, and delete a nasal flu vaccination record and verify changes
    in the IMMS API and Mavis status.
    Steps:
    1. Setup: Schedule flu session, import class list, add vaccine batch, and
       register child with verbal consent.
    2. Create: Record flu vaccination for the child.
    3. Verify: Check the vaccination record exists in the IMMS API.
       Check Mavis shows "Synced".
    4. Edit: Change the delivery time to an earlier time today and save.
    5. Verify: Check the updated vaccination record in the IMMS API.
       Check Mavis still shows "Synced".
    6. Edit: Change the outcome to "They refused it" and save.
    7. Verify: Check the vaccination record is removed from the IMMS API.
       Check Mavis shows "Not synced".
    """
    child = children[Programme.FLU][0]
    school = schools[Programme.FLU][0]

    vaccination_time = get_current_datetime().replace(
        hour=0, minute=1, second=0, microsecond=0
    )

    # Step 3: Verify creation in IMMS API
    imms_api_helper.check_record_in_imms_api(
        Vaccine.FLUENZ,
        child,
        school,
        DeliverySite.NOSE,
        vaccination_time,
    )

    # Step 4: Edit delivery time to an earlier time today
    VaccinationRecordPage(page).page.reload()
    VaccinationRecordPage(page).expect_vaccination_details(
        "Synced with NHS England?", "Synced"
    )

    VaccinationRecordPage(page).click_edit_vaccination_record()
    EditVaccinationRecordPage(page).click_change_time()
    new_vaccination_time = random_datetime_earlier_today(vaccination_time)
    EditVaccinationRecordPage(page).change_time_of_delivery(new_vaccination_time)
    EditVaccinationRecordPage(page).click_continue()
    EditVaccinationRecordPage(page).click_save_changes()

    # Step 5: Verify update in IMMS API
    imms_api_helper.check_record_in_imms_api(
        Vaccine.FLUENZ,
        child,
        school,
        DeliverySite.NOSE,
        new_vaccination_time,
    )

    # Step 6: Edit outcome to refused
    SessionsPatientPage(page).click_vaccination_details(school)
    VaccinationRecordPage(page).expect_vaccination_details(
        "Synced with NHS England?", "Synced"
    )

    VaccinationRecordPage(page).click_edit_vaccination_record()
    EditVaccinationRecordPage(page).click_change_outcome()
    EditVaccinationRecordPage(page).click_they_refused_it()
    EditVaccinationRecordPage(page).click_continue()
    EditVaccinationRecordPage(page).click_save_changes()

    # Step 7: Verify deletion in IMMS API
    imms_api_helper.check_record_is_not_in_imms_api(Vaccine.FLUENZ, child)
    SessionsPatientPage(page).click_vaccination_details(school)
    VaccinationRecordPage(page).expect_vaccination_details(
        "Synced with NHS England?", "Not synced"
    )
