import pytest

from mavis.test.imms_api import ImmsApiHelper
from mavis.test.models import (
    ConsentOption,
    DeliverySite,
    Programme,
    Vaccine,
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


def test_create_edit_delete_injected_flu_vaccination_and_verify_imms_api(
    upload_offline_vaccination_injected_flu,
    schools,
    children,
    imms_api_helper,
    sessions_patient_page,
    vaccination_record_page,
    edit_vaccination_record_page,
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
        Vaccine.SEQUIRUS,
        child,
        school,
        DeliverySite.RIGHT_ARM_UPPER,
        vaccination_time,
    )

    # Step 6: Edit outcome to refused
    sessions_patient_page.click_vaccination_details(school)
    vaccination_record_page.expect_vaccination_details(
        "Synced with NHS England?", "Synced"
    )

    vaccination_record_page.click_edit_vaccination_record()
    edit_vaccination_record_page.click_change_outcome()
    edit_vaccination_record_page.click_they_refused_it()
    edit_vaccination_record_page.click_continue()
    edit_vaccination_record_page.click_save_changes()

    # Step 7: Verify deletion in IMMS API
    imms_api_helper.check_record_is_not_in_imms_api(Vaccine.SEQUIRUS, child)
    sessions_patient_page.click_vaccination_details(school)
    vaccination_record_page.expect_vaccination_details(
        "Synced with NHS England?", "Not synced"
    )


def test_create_edit_delete_nasal_flu_vaccination_and_verify_imms_api(
    upload_offline_vaccination_nasal_flu,
    schools,
    imms_api_helper,
    sessions_patient_page,
    vaccination_record_page,
    edit_vaccination_record_page,
    children,
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
        Vaccine.FLUENZ,
        child,
        school,
        DeliverySite.NOSE,
        vaccination_time,
    )

    # Step 4: Edit delivery site to RIGHT_ARM_LOWER
    vaccination_record_page.page.reload()
    vaccination_record_page.expect_vaccination_details(
        "Synced with NHS England?", "Synced"
    )

    vaccination_record_page.click_edit_vaccination_record()
    edit_vaccination_record_page.click_change_time()
    new_vaccination_time = random_datetime_earlier_today(vaccination_time)
    edit_vaccination_record_page.change_time_of_delivery(new_vaccination_time)
    edit_vaccination_record_page.click_continue()
    edit_vaccination_record_page.click_save_changes()

    # Step 5: Verify update in IMMS API
    imms_api_helper.check_record_in_imms_api(
        Vaccine.FLUENZ,
        child,
        school,
        DeliverySite.NOSE,
        new_vaccination_time,
    )

    # Step 6: Edit outcome to refused
    sessions_patient_page.click_vaccination_details(school)
    vaccination_record_page.expect_vaccination_details(
        "Synced with NHS England?", "Synced"
    )

    vaccination_record_page.click_edit_vaccination_record()
    edit_vaccination_record_page.click_change_outcome()
    edit_vaccination_record_page.click_they_refused_it()
    edit_vaccination_record_page.click_continue()
    edit_vaccination_record_page.click_save_changes()

    # Step 7: Verify deletion in IMMS API
    imms_api_helper.check_record_is_not_in_imms_api(Vaccine.FLUENZ, child)
    sessions_patient_page.click_vaccination_details(school)
    vaccination_record_page.expect_vaccination_details(
        "Synced with NHS England?", "Not synced"
    )
