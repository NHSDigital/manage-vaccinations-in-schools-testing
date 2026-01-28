from datetime import timedelta

import pytest
from playwright.sync_api import expect

from mavis.test.annotations import issue
from mavis.test.constants import DeliverySite, Programme, Vaccine
from mavis.test.helpers.imms_api_helper import ImmsApiHelper
from mavis.test.helpers.sidekiq_helper import SidekiqHelper
from mavis.test.pages import ChildrenSearchPage, DashboardPage
from mavis.test.pages.children.child_record_page import ChildRecordPage
from mavis.test.pages.vaccination_record.vaccination_record_page import (
    VaccinationRecordPage,
)
from mavis.test.utils import get_current_datetime

pytestmark = pytest.mark.imms_api


@pytest.fixture(scope="session")
def imms_api_helper(authenticate_api):
    return ImmsApiHelper(authenticate_api)


@pytest.fixture
def setup_session_for_flu(setup_session_and_batches_with_fixed_child):
    return setup_session_and_batches_with_fixed_child(Programme.FLU)


@issue("MAV-2831")
def test_create_imms_record_then_verify_on_children_page(
    imms_api_helper,
    log_in_as_nurse,
    setup_session_for_flu,
    page,
    children,
    schools,
):
    """
    Test: Create a vaccination record via IMMS API, then log into MAVIS as a nurse.

    Steps:
    1. Create a vaccination record directly via IMMS API
    2. Verify the record was created successfully
    3. Navigate to MAVIS login page
    4. Log in as a nurse
    5. Navigate to the children page
    6. Search for the child associated with the vaccination record
    Verification:
    - The child appears in the search results on the children page
    - The vaccination record details match those created via the IMMS API
    """
    child = children[Programme.FLU][0]
    school = schools[Programme.FLU][0]
    vaccine = Vaccine.SEQUIRUS

    vaccination_time = (get_current_datetime() - timedelta(days=1)).replace(
        hour=10, minute=30, second=0, microsecond=0
    )
    sidekiq_job_name = "enqueue_vaccinations_search_in_nhs_job"

    # Create vaccination record via IMMS API
    imms_api_helper.create_vaccination_record(
        vaccine=vaccine,
        child=child,
        school=school,
        delivery_site=DeliverySite.LEFT_ARM_UPPER,
        vaccination_time=vaccination_time,
    )

    SidekiqHelper().run_recurring_job(sidekiq_job_name)

    # Verify the child created via IMMS API is visible in MAVIS children page
    DashboardPage(page).navigate()
    DashboardPage(page).click_children()

    # Search for the child by their details
    ChildrenSearchPage(page).search.search_for(str(child))

    # Verify the child appears in search results
    child_card_locator = ChildrenSearchPage(page).search.get_patient_card_locator(child)
    expect(child_card_locator).to_contain_text("FluVaccinated")

    ChildrenSearchPage(page).search.click_child(child)
    ChildRecordPage(page).click_vaccination_record_link()
    VaccinationRecordPage(page).expect_vaccination_details("Outcome", "Vaccinated")
    VaccinationRecordPage(page).expect_vaccination_details(
        "Source", "External source such as GP practice"
    )
