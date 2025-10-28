import pytest

from mavis.test.data import ClassFileMapping
from mavis.test.imms_api import ImmsApiHelper
from mavis.test.models import (
    ConsentMethod,
    DeliverySite,
    Programme,
    VaccinationRecord,
    Vaccine,
)


@pytest.fixture(scope="session")
def imms_api_helper(authenticate_api):
    return ImmsApiHelper(authenticate_api)


@pytest.fixture
def setup_recording_hpv(
    log_in_as_nurse,
    add_vaccine_batch,
    schools,
    dashboard_page,
    import_records_page,
    sessions_page,
    year_groups,
):
    school = schools[Programme.HPV][0]
    year_group = year_groups[Programme.HPV]

    try:
        batch_name = add_vaccine_batch(Vaccine.GARDASIL_9)
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.ensure_session_scheduled_for_today(school, Programme.HPV)
        sessions_page.click_import_class_lists()
        import_records_page.import_class_list(ClassFileMapping.FIXED_CHILD, year_group)
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.click_session_for_programme_group(school, Programme.HPV)
        sessions_page.click_consent_tab()
        yield batch_name
    finally:
        dashboard_page.navigate()
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(school)


@pytest.fixture
def record_hpv(
    setup_recording_hpv,
    children_page,
    sessions_page,
    verbal_consent_page,
    children,
):
    child = children[Programme.HPV][0]
    batch_name = setup_recording_hpv

    children_page.search_with_all_filters_for_child_name(str(child))
    sessions_page.navigate_to_consent_response(child, Programme.HPV)
    verbal_consent_page.select_parent(child.parents[0])
    verbal_consent_page.select_consent_method(ConsentMethod.IN_PERSON)
    verbal_consent_page.record_parent_positive_consent()
    sessions_page.register_child_as_attending(child)
    vaccination_time = sessions_page.record_vaccination_for_child(
        VaccinationRecord(
            child, Programme.HPV, batch_name, delivery_site=DeliverySite.LEFT_ARM_UPPER
        )
    )
    return child, vaccination_time


def test_create_edit_delete_hpv_vaccination_and_verify_imms_api(
    record_hpv,
    schools,
    imms_api_helper,
    sessions_page,
    vaccination_record_page,
    edit_vaccination_record_page,
    children_page,
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
    child, vaccination_time = record_hpv
    school = schools[Programme.HPV][0]

    # Step 3: Verify creation in IMMS API
    imms_api_helper.check_record_in_imms_api(
        Vaccine.GARDASIL_9,
        child,
        school,
        DeliverySite.LEFT_ARM_UPPER,
        vaccination_time,
    )

    # Step 4: Edit delivery site to RIGHT_ARM_LOWER
    sessions_page.click_vaccination_details(school)
    children_page.expect_vaccination_details("Synced with NHS England?", "Synced")

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
    children_page.expect_vaccination_details("Synced with NHS England?", "Synced")

    vaccination_record_page.click_edit_vaccination_record()
    edit_vaccination_record_page.click_change_outcome()
    edit_vaccination_record_page.click_they_refused_it()
    edit_vaccination_record_page.click_continue()
    edit_vaccination_record_page.click_save_changes()

    # Step 7: Verify deletion in IMMS API
    imms_api_helper.check_record_is_not_in_imms_api(Vaccine.GARDASIL_9, child)
    sessions_page.click_vaccination_details(school)
    children_page.expect_vaccination_details("Synced with NHS England?", "Not synced")
