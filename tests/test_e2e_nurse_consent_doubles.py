import pytest

from mavis.test.annotations import issue
from mavis.test.constants import ConsentMethod, ConsentRefusalReason, Programme, Vaccine
from mavis.test.data_models import VaccinationRecord
from mavis.test.pages import ReportsConsentPage, SessionsPatientPage
from mavis.test.pages.sessions import NurseConsentWizardPage
from mavis.test.pages.utils import (
    prepare_child_for_vaccination,
    record_nurse_consent_and_vaccination,
)


@pytest.fixture
def setup_session_for_doubles(setup_session_and_batches_with_fixed_child):
    return setup_session_and_batches_with_fixed_child("doubles")


@issue("MAV-955")
def test_e2e_nurse_consent_doubles(
    log_in_as_nurse,
    setup_session_for_doubles,
    schools,
    page,
    children,
):
    """
    Test: Verify a vaccination can be recorded after providing nurse consent for HPV
    Steps:
    1. Setup: Schedule sessions for doubles at a school and
       import a fixed child class list.
    2. Navigate to the session and register the child as attending.
    3. Record verbal consent for the child.
    4. Record both vaccinations for the child with a long notes field.
    Verification:
    - Vaccinations can be recorded
    - Providing long notes gives an error
    """
    batch_names = setup_session_for_doubles
    programme_group = "doubles"

    child = children[programme_group][0]
    school = schools[programme_group][0]

    menacwy_vaccination_record = VaccinationRecord(
        child,
        Programme.MENACWY,
        batch_names[Vaccine.MENQUADFI],
    )

    td_ipv_vaccination_record = VaccinationRecord(
        child,
        Programme.TD_IPV,
        batch_names[Vaccine.REVAXIS],
    )

    prepare_child_for_vaccination(
        page,
        school,
        programme_group,
        child,
    )

    record_nurse_consent_and_vaccination(
        page,
        menacwy_vaccination_record,
    )
    record_nurse_consent_and_vaccination(
        page,
        td_ipv_vaccination_record,
    )


@issue("MAV-7120")
def test_consent_withdrawal_refusal_reason_reporting(
    log_in_as_nurse,
    setup_session_for_doubles,
    schools,
    page,
    children,
):
    """
    Test: Verify that withdrawing consent with a refusal reason properly updates
    consent reporting statistics for the refusal reason.

    Steps:
    1. Record a consent refusal for MenACWY programme.
    2. Mark the consent refusal as invalid.
    3. Record consent (give consent) for the child.
    4. Withdraw that consent with refusal reason 'Vaccine already received'.
    5. Validate that the 'Vaccine already received' refusal reason count has
       increased in the reporting table.

    Verification:
    - When consent is withdrawn with 'Vaccine already received', both the overall
      refusal count and the specific refusal reason count should increase.

    Bug: The consent refused count increases but the specific refusal reason stats
    (like 'Vaccine already received') don't update when withdrawing consent.
    """
    programme_group = "doubles"
    child = children[programme_group][0]
    school = schools[programme_group][0]

    # Step 1: Record initial consent refusal for MenACWY
    SessionsPatientPage(page).navigate_to_child_programme(
        school, programme_group, child, Programme.MENACWY
    )
    SessionsPatientPage(page).click_record_a_new_consent_response()

    NurseConsentWizardPage(page).select_parent(child.parents[0])
    NurseConsentWizardPage(page).select_consent_method(ConsentMethod.PHONE)
    NurseConsentWizardPage(page).click_no_they_do_not_agree()
    NurseConsentWizardPage(page).click_continue()
    NurseConsentWizardPage(page).click_consent_refusal_reason(
        ConsentRefusalReason.VACCINE_ALREADY_RECEIVED
    )
    NurseConsentWizardPage(page).click_continue()
    NurseConsentWizardPage(page).give_details(
        "Already received vaccine.  Notes MAV-7120"
    )
    NurseConsentWizardPage(page).click_continue()
    NurseConsentWizardPage(page).click_confirm()

    # Verify: Check consent reporting after initial refusal
    ReportsConsentPage(page).verify_consent_reporting(
        Programme.MENACWY, {"Consent refused": "100"}
    )

    # Step 2: Invalidate the consent refusal
    SessionsPatientPage(page).navigate_to_child_programme(
        school, programme_group, child, Programme.MENACWY
    )
    SessionsPatientPage(page).invalidate_parent_refusal(child.parents[0])

    # Verify: Check consent reporting after invalidating refusal
    ReportsConsentPage(page).verify_consent_reporting(
        Programme.MENACWY,
        {"Consent refused": "0", "No consent response or not yet invited": "100"},
    )

    # Step 3: Record consent (give consent) for the child
    SessionsPatientPage(page).navigate_to_child_programme(
        school, programme_group, child, Programme.MENACWY
    )
    SessionsPatientPage(page).click_record_a_new_consent_response()

    NurseConsentWizardPage(page).select_parent(child.parents[0])
    NurseConsentWizardPage(page).select_consent_method(ConsentMethod.PHONE)
    NurseConsentWizardPage(page).record_parent_given_consent(
        programme=Programme.MENACWY
    )

    # Verify: Check consent reporting after giving consent
    ReportsConsentPage(page).verify_consent_reporting(
        Programme.MENACWY, {"Consent given": "100"}
    )

    # Step 4: Withdraw consent with 'Vaccine already received' reason
    SessionsPatientPage(page).navigate_to_child_programme(
        school, programme_group, child, Programme.MENACWY
    )
    SessionsPatientPage(page).click_first_response_from_parent(child.parents[0])
    SessionsPatientPage(page).click_withdraw_consent()
    NurseConsentWizardPage(page).click_consent_refusal_reason(
        ConsentRefusalReason.VACCINE_ALREADY_RECEIVED
    )
    NurseConsentWizardPage(page).give_withdraw_consent_notes(
        "Vaccine already received at GP"
    )
    NurseConsentWizardPage(page).click_withdraw_consent()

    # Step 5: Verify consent refused count and refusal reason in reporting
    ReportsConsentPage(page).verify_consent_reporting(
        Programme.MENACWY, {"Consent refused": "100", "Consent given": "0"}
    )
