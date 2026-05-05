import json
import re
import urllib.parse
from datetime import timedelta

import httpx
import pytest
from playwright.sync_api import expect

from mavis.test.annotations import issue
from mavis.test.constants import DeliverySite, Programme, Vaccine
from mavis.test.helpers.imms_api_helper import ImmsApiHelper
from mavis.test.pages import (
    ChildProgrammePage,
    ChildRecordPage,
    ChildrenSearchPage,
    DashboardPage,
    VaccinationRecordPage,
)
from mavis.test.utils import deliberate_sleep, get_current_datetime

pytestmark = pytest.mark.imms_api


def _replace_all_uuids_with_static_data(data):
    """
    Recursively replaces all urn:uuid:* references in FHIR response data
    with a static placeholder to allow comparison.
    """

    json_str = json.dumps(data)
    # Replace all urn:uuid references with a static placeholder
    static_uuid = re.sub(
        r"urn:uuid:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}",
        "urn:uuid:static_uuid",
        json_str,
    )
    return json.loads(static_uuid)


@pytest.fixture(scope="session")
def imms_api_helper(authenticate_api):
    return ImmsApiHelper(authenticate_api)


@pytest.fixture
def setup_session_for_flu(setup_session_and_batches_with_fixed_child):
    return setup_session_and_batches_with_fixed_child(Programme.FLU)


@issue("MAV-2831")
@pytest.mark.unstable
def test_create_imms_record_then_verify_on_children_page(
    imms_api_helper,
    log_in_as_nurse,
    setup_session_for_flu,
    base_url,
    page,
    children,
    schools,
):
    """
    Test: Create a vaccination record via IMMS API, then log into Mavis as a nurse.

    Steps:
    1. Create a vaccination record directly via IMMS API
    2. Verify the record was created successfully
    3. Navigate to Mavis login page
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

    vaccination_date = get_current_datetime() - timedelta(days=1)
    vaccination_time = vaccination_date.replace(
        hour=10, minute=30, second=0, microsecond=0
    )
    # Create vaccination record via IMMS API
    imms_api_helper.create_vaccination_record(
        vaccine=vaccine,
        child=child,
        school=school,
        delivery_site=DeliverySite.LEFT_ARM_UPPER,
        vaccination_time=vaccination_time,
    )

    api_url = urllib.parse.urljoin(base_url, "api/testing/vaccinations-search-in-nhs")
    httpx.post(api_url, timeout=30).raise_for_status()

    # Poll until the search queue has drained (GET returns 200 when empty)
    for _ in range(1200):
        r = httpx.get(api_url, timeout=30)
        if r.is_success:
            break
        deliberate_sleep(0.25, "waiting for IMMS search queue to drain")
    r.raise_for_status()

    # Verify the child created via IMMS API is visible in Mavis children page
    DashboardPage(page).navigate()
    DashboardPage(page).click_children()

    # Search for the child by their details
    ChildrenSearchPage(page).search.search_for(str(child))

    # Verify the child appears in search results
    child_card_locator = ChildrenSearchPage(page).search.get_patient_card_locator(child)
    expect(child_card_locator).to_contain_text("FluVaccinated")

    ChildrenSearchPage(page).search.click_child(child)
    ChildRecordPage(page).click_programme(Programme.FLU)
    ChildProgrammePage(page).click_vaccination_record(vaccination_date)
    VaccinationRecordPage(page).expect_vaccination_details("Outcome", "Vaccinated")
    VaccinationRecordPage(page).expect_vaccination_details(
        "Source", "External source such as GP practice"
    )


@issue("MAV-6055")
def test_duplicate_records_with_different_primary_source_remain_stable(
    imms_api_helper,
    log_in_as_nurse,
    setup_session_for_flu,
    children,
    schools,
):
    """
    Test: Create duplicate vaccination records with different primarySource
    values. Verify that subsequent searches return stable results with no
    changes.

    Steps:
    1. Create a vaccination record with primarySource: true
    2. Create a duplicate record (same patient, date, programme) with
       primarySource: false
    3. Perform a search for the patient
    4. Perform a second search for the same patient

    Expected result:
    The two search results should be identical, indicating records are up to
    date and no synchronization changes occur.
    """
    child = children[Programme.FLU][0]
    school = schools[Programme.FLU][0]
    vaccine = Vaccine.SEQUIRUS

    vaccination_date = get_current_datetime() - timedelta(days=1)
    vaccination_time = vaccination_date.replace(
        hour=10, minute=30, second=0, microsecond=0
    )

    # Create first vaccination record with primarySource: true
    imms_api_helper.create_vaccination_record(
        vaccine=vaccine,
        child=child,
        school=school,
        delivery_site=DeliverySite.LEFT_ARM_UPPER,
        vaccination_time=vaccination_time,
        primary_source=True,
        skip_verification=True,
    )

    # Create duplicate vaccination record with primarySource: false
    imms_api_helper.create_vaccination_record(
        vaccine=vaccine,
        child=child,
        school=school,
        delivery_site=DeliverySite.LEFT_ARM_UPPER,
        vaccination_time=vaccination_time,
        primary_source=False,
        skip_verification=True,
    )

    # Perform first search
    first_response = imms_api_helper.get_raw_api_response_for_child(vaccine, child)
    first_response_data = first_response.json()

    # Perform second search
    second_response = imms_api_helper.get_raw_api_response_for_child(vaccine, child)
    second_response_data = second_response.json()

    # Static UUIDs before comparison (UUIDs are dynamically generated)
    static_first = _replace_all_uuids_with_static_data(first_response_data)
    static_second = _replace_all_uuids_with_static_data(second_response_data)

    # Verify both search results are identical
    assert static_first == static_second, (
        "Search results changed between first and second search. "
        f"First: {static_first}, Second: {static_second}"
    )
