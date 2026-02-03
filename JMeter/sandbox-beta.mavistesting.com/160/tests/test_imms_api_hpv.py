import pytest

from mavis.test.imms_api import ImmsApiHelper
from mavis.test.models import (
    DeliverySite,
    Programme,
    Vaccine,
)
from mavis.test.utils import get_current_datetime


@pytest.fixture(scope="session")
def imms_api_helper(authenticate_api):
    return ImmsApiHelper(authenticate_api)


@pytest.fixture
def upload_offline_vaccination_hpv(upload_offline_vaccination):
    yield from upload_offline_vaccination(Programme.HPV)


def test_create_edit_delete_hpv_vaccination_and_verify_imms_api(
    upload_offline_vaccination_hpv,
    schools,
    imms_api_helper,
    sessions_page,
    vaccination_record_page,
    edit_vaccination_record_page,
    children,
):
    """
    Test: Create, edit, and delete an HPV vaccination record and verify changes in
       the IMMS API and Mavis status.
    Steps:
    1. Setup: Schedule HPV session, import class list, add vaccine batch, and
       register child with verbal consent.
    2. Create: Record HPV vaccination for the child (LEFT_ARM_UPPER).
    3. Verify: Check the vaccination record exists in the IMMS API.
       Check Mavis shows "Synced".
    4. Edit: Change the delivery site to RIGHT_ARM_LOWER and save.
    5. Verify: Check the updated vaccination record in the IMMS API.
       Check Mavis still shows "Synced".
    6. Edit: Change the outcome to "They refused it" and save.
    7. Verify: Check the vaccination record is removed from the IMMS API.
       Check Mavis shows "Not synced".
    """
    child = children[Programme.HPV][0]
    school = schools[Programme.HPV][0]

    vaccination_time = get_current_datetime().replace(
        hour=0, minute=1, second=0, microsecond=0
    )

    # Step 3: Verify creation in IMMS API
    imms_api_helper.check_record_in_imms_api(
        Vaccine.GARDASIL_9,
        child,
        school,
        DeliverySite.LEFT_ARM_UPPER,
        vaccination_time,
    )

    # Step 4: Edit delivery site to RIGHT_ARM_LOWER
    vaccination_record_page.page.reload()
    vaccination_record_page.expect_vaccination_details(
        "Synced with NHS England?", "Synced"
    )

    vaccination_record_page.click_edit_vaccination_record()
    edit_vaccination_record_page.click_change_site()
    edit_vaccination_record_page.click_delivery_site(DeliverySite.RIGHT_ARM_LOWER)
    edit_vaccination_record_page.click_continue()
    edit_vaccination_record_page.click_save_changes()

    # Step 5: Verify update in IMMS API
    imms_api_helper.check_record_in_imms_api(
        Vaccine.GARDASIL_9,
        child,
        school,
        DeliverySite.RIGHT_ARM_UPPER,
        vaccination_time,
    )

    # Step 6: Edit outcome to refused
    sessions_page.click_vaccination_details(school)
    vaccination_record_page.expect_vaccination_details(
        "Synced with NHS England?", "Synced"
    )

    vaccination_record_page.click_edit_vaccination_record()
    edit_vaccination_record_page.click_change_outcome()
    edit_vaccination_record_page.click_they_refused_it()
    edit_vaccination_record_page.click_continue()
    edit_vaccination_record_page.click_save_changes()

    # Step 7: Verify deletion in IMMS API
    imms_api_helper.check_record_is_not_in_imms_api(Vaccine.GARDASIL_9, child)
    sessions_page.click_vaccination_details(school)
    vaccination_record_page.expect_vaccination_details(
        "Synced with NHS England?", "Not synced"
    )
