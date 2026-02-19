import pytest

from mavis.test.annotations import issue
from mavis.test.constants import ConsentOption, DeliverySite, Programme, Vaccine
from mavis.test.data import ClassFileMapping, VaccsFileMapping
from mavis.test.helpers.imms_api_helper import ImmsApiHelper
from mavis.test.pages import (
    DashboardPage,
    EditVaccinationRecordPage,
    ImportRecordsWizardPage,
    ImportsPage,
    SchoolsChildrenPage,
    SchoolsSearchPage,
    SessionsOverviewPage,
    SessionsPatientPage,
    VaccinationRecordPage,
)
from mavis.test.pages.utils import schedule_school_session_if_needed
from mavis.test.utils import get_current_datetime, random_datetime_earlier_today

pytestmark = pytest.mark.imms_api


@pytest.fixture(scope="session")
def imms_api_helper(authenticate_api):
    return ImmsApiHelper(authenticate_api)


@pytest.fixture
def setup_vaccs_flu(
    log_in_as_nurse,
    schools,
    page,
    point_of_care_file_generator,
    year_groups,
):
    school = schools[Programme.FLU][0]
    year_group = year_groups[Programme.FLU]

    DashboardPage(page).click_schools()
    SchoolsSearchPage(page).click_school(school)
    SchoolsChildrenPage(page).click_import_class_lists()

    ImportRecordsWizardPage(page, point_of_care_file_generator).import_class_list(
        ClassFileMapping.TWO_FIXED_CHILDREN,
        year_group,
        programme_group=Programme.FLU.group,
    )
    schedule_school_session_if_needed(page, school, [Programme.FLU], [year_group])
    session_id = SessionsOverviewPage(page).get_session_id_from_offline_excel()
    SessionsOverviewPage(page).header.click_mavis_header()
    DashboardPage(page).click_imports()
    ImportsPage(page).click_upload_records()
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).navigate_to_vaccination_records_import()
    return session_id


@pytest.fixture
def upload_offline_vaccination_injected_flu(upload_offline_vaccination):
    yield from upload_offline_vaccination(Programme.FLU)


@pytest.fixture
def upload_offline_vaccination_nasal_flu(upload_offline_vaccination):
    yield from upload_offline_vaccination(Programme.FLU, ConsentOption.NASAL_SPRAY)


def test_create_edit_delete_injected_flu_vaccination_and_verify_imms_api(
    log_in_as_nurse,
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
    log_in_as_nurse,
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


@issue("MAV-3076")
@pytest.mark.vaccinations
@pytest.mark.imms_api
def test_vaccination_file_upload_snomed_code_verification(
    setup_vaccs_flu,
    page,
    children,
    point_of_care_file_generator,
    imms_api_helper,
):
    """
    Covers Issue: MAV-3076
    
    Test: Upload a vaccination file with flu vaccines and verify SNOMED procedure codes.
    Steps:
    1. Upload a vaccination file with nasal and injected flu vaccination records.
    2. Wait for API sync and verify SNOMED procedure codes via IMMS API.

    Verification:
    - SNOMED procedure codes for flu vaccinations are correctly returned by API
    - Display text matches the returned SNOMED codes
    - Both nasal (Fluenz) and injected (Sequirus) vaccines have proper SNOMED codes

    Scenarios covered:
    - Nasal flu vaccination (AstraZeneca Fluenz) - dose 1 & 2 for a child
    - Injected flu vaccination (Sequirus Cell-based Trivalent) - dose 1 & 2 for a child
    """
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_and_verify_output(
        VaccsFileMapping.SNOMED_VERIFICATION,
        session_id=setup_vaccs_flu,
        programme_group=Programme.FLU.group,
    )

    flu_children = children[Programme.FLU]
    vaccine_configs = [
        Vaccine.FLUENZ,
        Vaccine.SEQUIRUS,
    ]

    # First child - nasal vaccinations
    first_child = flu_children[0]
    expected_nasal_first_dose_code = "884861000000100"
    expected_nasal_second_dose_code = "884881000000109"
    expected_nasal_first_dose_display = (
        "Administration of first intranasal seasonal influenza vaccination"
    )
    expected_nasal_second_dose_display = (
        "Administration of second intranasal seasonal influenza vaccination"
    )
    actual_record = imms_api_helper.get_raw_api_response_for_child(
        vaccine_configs[0], first_child
    ).text

    assert expected_nasal_first_dose_code in actual_record, (
        f"First nasal flu SNOMED code not found {actual_record}"
    )
    assert expected_nasal_second_dose_code in actual_record, (
        f"Second nasal flu SNOMED code not found {actual_record}"
    )

    assert expected_nasal_first_dose_display in actual_record, (
        f"First nasal flu SNOMED display not found {actual_record}"
    )
    assert expected_nasal_second_dose_display in actual_record, (
        f"Second nasal flu SNOMED display not found {actual_record}"
    )

    # Second child - injected vaccinations
    second_child = flu_children[1]
    expected_injected_first_dose_code = "985151000000100"
    expected_injected_second_dose_code = "985171000000109"
    expected_injected_first_dose_display = (
        "Administration of first inactivated seasonal influenza vaccination"
    )
    expected_injected_second_dose_display = (
        "Administration of second inactivated seasonal influenza vaccination"
    )
    actual_record_injected = imms_api_helper.get_raw_api_response_for_child(
        vaccine_configs[1], second_child
    ).text

    assert expected_injected_first_dose_code in actual_record_injected, (
        f"First injected flu SNOMED code not found {actual_record_injected}"
    )
    assert expected_injected_second_dose_code in actual_record_injected, (
        f"Second injected flu SNOMED code not found {actual_record_injected}"
    )

    assert expected_injected_first_dose_display in actual_record_injected, (
        f"First injected flu SNOMED display not found {actual_record_injected}"
    )
    assert expected_injected_second_dose_display in actual_record_injected, (
        f"Second injected flu SNOMED display not found {actual_record_injected}"
    )
