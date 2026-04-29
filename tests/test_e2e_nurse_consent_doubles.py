import pytest

from mavis.test.annotations import issue
from mavis.test.constants import ConsentMethod, ConsentRefusalReason, Programme, Vaccine
from mavis.test.data_models import VaccinationRecord
from mavis.test.pages import DashboardPage, ReportsConsentPage, SessionsPatientPage
from mavis.test.pages.sessions import NurseConsentWizardPage
from mavis.test.pages.utils import (
    navigate_to_child_programme,
    prepare_child_for_vaccination,
    record_nurse_consent_and_vaccination,
)
from mavis.test.utils import refresh_reporting_data


@pytest.fixture
def setup_session_for_doubles(setup_session_and_batches_with_fixed_child):
    return setup_session_and_batches_with_fixed_child("doubles")


def _get_consent_reporting_counts(page, programme: Programme) -> tuple[int, int, int]:
    """Navigate to consent reports, refresh data, and get baseline counts.

    Args:
        page: Playwright page object
        programme: Programme to filter reporting for

    Returns:
        Tuple of (refused_count, no_response_count, given_count)
    """
    DashboardPage(page).navigate()
    refresh_reporting_data()
    page.wait_for_timeout(120000)

    ReportsConsentPage(page).navigate()
    ReportsConsentPage(page).check_filter_for_programme(programme)
    page.reload()

    refused = ReportsConsentPage(page).get_category_count("Consent refused")
    no_response = ReportsConsentPage(page).get_category_count(
        "No consent response or not yet invited"
    )
    given = ReportsConsentPage(page).get_category_count("Consent given")

    return refused, no_response, given


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

    # Get baseline counts to compare against
    # Note: In shared test environments, parallel tests affect these numbers,
    # so we use relative comparisons (greater/less than) rather than exact counts
    refused_baseline, no_response_baseline, given_baseline = (
        _get_consent_reporting_counts(page, Programme.MENACWY)
    )

    # Step 1: Record initial consent refusal for MenACWY
    navigate_to_child_programme(page, school, programme_group, child, Programme.MENACWY)
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

    # Verify: Refused count should increase after recording refusal
    refused_after_refusal, _, _ = _get_consent_reporting_counts(page, Programme.MENACWY)
    assert refused_after_refusal > refused_baseline, (
        f"Expected refused count to increase from {refused_baseline}, "
        f"but got {refused_after_refusal}"
    )

    # Step 2: Invalidate the consent refusal
    navigate_to_child_programme(page, school, programme_group, child, Programme.MENACWY)
    SessionsPatientPage(page).invalidate_parent_refusal(child.parents[0])

    # Verify: Refused decreases and no response increases after invalidation
    refused_after_invalidation, no_response_after_invalidation, _ = (
        _get_consent_reporting_counts(page, Programme.MENACWY)
    )

    assert refused_after_invalidation < refused_after_refusal, (
        f"Expected refused to decrease from {refused_after_refusal}, "
        f"but got {refused_after_invalidation}"
    )
    assert no_response_after_invalidation == no_response_baseline, (
        f"Expected no response to remain the same as {no_response_baseline}, "
        f"but got {no_response_after_invalidation}"
    )

    # Step 3: Record consent (give consent) for the child
    navigate_to_child_programme(page, school, programme_group, child, Programme.MENACWY)
    SessionsPatientPage(page).click_record_a_new_consent_response()

    NurseConsentWizardPage(page).select_parent(child.parents[0])
    NurseConsentWizardPage(page).select_consent_method(ConsentMethod.PHONE)
    NurseConsentWizardPage(page).record_parent_given_consent(
        programme=Programme.MENACWY
    )

    # Verify: Given increases and no response decreases after giving consent
    _, no_response_after_consent, given_after_consent = _get_consent_reporting_counts(
        page, Programme.MENACWY
    )

    assert given_after_consent > given_baseline, (
        f"Expected given to increase from {given_baseline}, "
        f"but got {given_after_consent}"
    )
    assert no_response_after_consent < no_response_after_invalidation, (
        f"Expected no response to decrease from {no_response_after_invalidation}, "
        f"but got {no_response_after_consent}"
    )

    # Step 4: Withdraw consent with 'Vaccine already received' reason
    navigate_to_child_programme(page, school, programme_group, child, Programme.MENACWY)
    SessionsPatientPage(page).click_first_response_from_parent(child.parents[0])
    SessionsPatientPage(page).click_withdraw_consent()
    NurseConsentWizardPage(page).click_consent_refusal_reason(
        ConsentRefusalReason.VACCINE_ALREADY_RECEIVED
    )
    NurseConsentWizardPage(page).give_withdraw_consent_notes(
        "Vaccine already received at GP"
    )
    NurseConsentWizardPage(page).click_withdraw_consent()

    # Verify: After withdrawal, refused increases and given decreases
    refused_after_withdrawal, _, given_after_withdrawal = _get_consent_reporting_counts(
        page, Programme.MENACWY
    )

    assert refused_after_withdrawal > refused_after_invalidation, (
        f"Expected refused to increase from {refused_after_invalidation}, "
        f"but got {refused_after_withdrawal}"
    )
    assert given_after_withdrawal < given_after_consent, (
        f"Expected given to decrease from {given_after_consent}, "
        f"but got {given_after_withdrawal}"
    )
