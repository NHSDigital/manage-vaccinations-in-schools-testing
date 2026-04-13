import pytest

from mavis.test.constants import (
    ConsentOption,
    ConsentRefusalReason,
    ConsentStatus,
    Programme,
    Vaccine,
)
from mavis.test.data import ClassFileMapping
from mavis.test.pages import (
    ConsentConfirmRefusalPage,
    ConsentRefusalFollowUpPage,
    ConsentResponseDetailsPage,
    DashboardPage,
    GillickCompetencePage,
    ImportRecordsWizardPage,
    NurseConsentWizardPage,
    OnlineConsentWizardPage,
    SchoolChildrenPage,
    SchoolsSearchPage,
    SessionsChildrenPage,
    SessionsOverviewPage,
    SessionsPatientPage,
    SessionsPatientSessionActivityPage,
    SessionsSearchPage,
    StartPage,
    VaccinesPage,
)
from mavis.test.pages.utils import schedule_school_session_if_needed
from mavis.test.utils import expect_alert_text


@pytest.fixture
def setup_session_for_mmr(
    log_in_as_nurse,
    add_vaccine_batch,
    schools,
    children,
    page,
    point_of_care_file_generator,
):
    """
    Set up MMR session with vaccine batches and class list import.

    Returns:
        Tuple of (consent_url, batch_name) for the MMR session.
    """
    school = schools[Programme.MMR_MMRV][0]
    child = children[Programme.MMR_MMRV][0]

    DashboardPage(page).navigate()
    batch_name = add_vaccine_batch(Vaccine.MMR_VAXPRO, "MMRVaxPro123")

    VaccinesPage(page).header.click_mavis()
    DashboardPage(page).click_sessions()
    schedule_school_session_if_needed(
        page, school, [Programme.MMR_MMRV], [child.year_group], date_offset=7
    )

    consent_url = SessionsOverviewPage(page).get_online_consent_url(Programme.MMR_MMRV)

    SessionsOverviewPage(page).header.click_mavis()
    DashboardPage(page).click_schools()
    SchoolsSearchPage(page).click_school(school)
    SchoolChildrenPage(page).click_import_class_lists()
    ImportRecordsWizardPage(page, point_of_care_file_generator).import_class_list(
        ClassFileMapping.FIXED_CHILD,
        child.year_group,
        Programme.MMR_MMRV.group,
    )

    return consent_url, batch_name


@pytest.fixture
def give_online_consent_with_follow_up_request(
    setup_session_for_mmr,
    page,
    children,
    schools,
):
    """Submit online consent refusal with follow-up request from parent 1."""
    consent_url, _ = setup_session_for_mmr
    child = children[Programme.MMR_MMRV][0]
    schools = schools[Programme.MMR_MMRV]

    page.goto(consent_url)
    StartPage(page).start()
    OnlineConsentWizardPage(page).fill_details(child, child.parents[0], schools)
    OnlineConsentWizardPage(page).submit_refusal(follow_up_requested=True)


@pytest.mark.parametrize(
    "refusal_reason",
    [
        ConsentRefusalReason.MEDICAL_REASONS,
        ConsentRefusalReason.PERSONAL_CHOICE,
        ConsentRefusalReason.CONTAINS_GELATINE,
        ConsentRefusalReason.DO_NOT_WANT_VACCINATION_AT_SCHOOL,
        ConsentRefusalReason.OTHER,
    ],
    ids=lambda v: f"refusal_reason: {v}",
)
@pytest.mark.parametrize(
    "follow_up_requested",
    [True, False],
    ids=lambda v: f"follow_up_requested: {v}",
)
def test_consent_refusal_with_follow_up_request(
    setup_session_for_mmr,
    page,
    schools,
    children,
    refusal_reason,
    follow_up_requested,
):
    """
    Test: Submit online consent refusing vaccination with follow-up request option.
    Steps:
    1. Navigate to online consent form and fill in child and parent details.
    2. Refuse consent and try to continue without selecting reason - verify error.
    3. Select reason for refusal and verify hint text.
    4. Answer follow-up question and verify check and confirm page.
    5. Submit form and verify confirmation.
    Verification:
    - Error shown when no refusal reason selected.
    - Medical reasons shows hint text about alternatives.
    - Personal choice and other reasons show no hint text.
    - Check and confirm page shows refusal reason and discuss options value.
    - Appropriate confirmation message is shown based on follow-up selection.
    - Follow-up requested status is displayed on patient.
    """
    consent_url, _ = setup_session_for_mmr
    child = children[Programme.MMR_MMRV][0]
    schools = schools[Programme.MMR_MMRV]
    school = schools[0]

    page.goto(consent_url)
    StartPage(page).start()
    OnlineConsentWizardPage(page).fill_details(child, child.parents[0], schools)
    OnlineConsentWizardPage(page).dont_agree_to_vaccination()

    OnlineConsentWizardPage(page).select_consent_not_given_reason(
        reason=refusal_reason,
        details="Additional details for refusal"
        if refusal_reason.requires_details
        else None,
    )
    OnlineConsentWizardPage(page).verify_follow_up_hint_text(refusal_reason)
    OnlineConsentWizardPage(page).answer_follow_up_question(
        yes_to_follow_up_request=follow_up_requested
    )
    OnlineConsentWizardPage(page).verify_check_and_confirm_refusal_details(
        refusal_reason, follow_up_requested=follow_up_requested
    )

    OnlineConsentWizardPage(page).click_confirm()

    expected_text = (
        "You've asked for a follow-up" if follow_up_requested else "Consent refused"
    )
    OnlineConsentWizardPage(page).expect_confirmation_text(expected_text)

    DashboardPage(page).navigate()
    DashboardPage(page).click_sessions()
    SessionsSearchPage(page).click_session_for_programme_group(
        school, Programme.MMR_MMRV
    )
    SessionsChildrenPage(page).tabs.click_children_tab()

    if follow_up_requested:
        SessionsChildrenPage(page).search.select_needs_consent()
        SessionsChildrenPage(page).search.select_follow_up_requested()
        SessionsChildrenPage(page).search.click_on_update_results()
        SessionsChildrenPage(page).expect_child_programme_status(
            child, "MMR", "Needs consent", "Follow-up requested"
        )
    else:
        SessionsChildrenPage(page).expect_child_programme_status(
            child, "MMR", "Consent refused"
        )

    SessionsChildrenPage(page).click_child(child)

    status = (
        ConsentStatus.FOLLOW_UP_REQUESTED
        if follow_up_requested
        else ConsentStatus.REFUSED
    )
    SessionsPatientPage(page).expect_consent_status(status)

    SessionsPatientPage(page).click_session_activity_and_notes()

    if follow_up_requested:
        SessionsPatientSessionActivityPage(page).check_session_activity_entry(
            "Follow-up requested"
        )
    else:
        SessionsPatientSessionActivityPage(page).check_session_activity_entry(
            "Consent refused"
        )
    SessionsPatientSessionActivityPage(page).check_session_activity_entry(
        "Consent confirmation refused sent"
    )


def test_change_refusal_details_from_check_and_confirm(
    setup_session_for_mmr,
    page,
    schools,
    children,
):
    """
    Test: Change refusal details from check and confirm screen.
    Steps:
    1. Navigate to online consent form and submit refusal with follow-up request.
    2. On check and confirm, click Change next to "Discuss options".
    3. Change follow-up answer and verify return to check and confirm.
    4. Click Change next to "Reason for refusal".
    5. Change to a reason that doesn't qualify for follow-up (already vaccinated).
    6. Verify follow-up question is skipped and "Discuss options" not shown on
       check and confirm.
    Verification:
    - Change links work correctly and return to check and confirm.
    - Changing to non-qualifying refusal reason skips follow-up question.
    - Check and confirm page doesn't show "Discuss options" for non-qualifying reasons.
    """
    consent_url, _ = setup_session_for_mmr
    child = children[Programme.MMR_MMRV][0]
    schools = schools[Programme.MMR_MMRV]

    page.goto(consent_url)
    StartPage(page).start()
    OnlineConsentWizardPage(page).fill_details(child, child.parents[0], schools)
    OnlineConsentWizardPage(page).dont_agree_to_vaccination()
    OnlineConsentWizardPage(page).select_consent_not_given_reason(
        reason=ConsentRefusalReason.PERSONAL_CHOICE
    )
    OnlineConsentWizardPage(page).answer_follow_up_question(
        yes_to_follow_up_request=True
    )
    OnlineConsentWizardPage(page).verify_check_and_confirm_refusal_details(
        ConsentRefusalReason.PERSONAL_CHOICE, follow_up_requested=True
    )

    OnlineConsentWizardPage(page).click_change_discuss_options()
    OnlineConsentWizardPage(page).answer_follow_up_question(
        yes_to_follow_up_request=False
    )
    OnlineConsentWizardPage(page).verify_check_and_confirm_refusal_details(
        ConsentRefusalReason.PERSONAL_CHOICE, follow_up_requested=False
    )

    OnlineConsentWizardPage(page).click_change_refusal_reason()
    OnlineConsentWizardPage(page).select_consent_not_given_reason(
        reason=ConsentRefusalReason.VACCINE_ALREADY_RECEIVED
    )
    OnlineConsentWizardPage(page).verify_discuss_options_not_shown()


def test_follow_up_journey_decision_stands_confirm_refusal(
    give_online_consent_with_follow_up_request,
    page,
    schools,
    children,
):
    """
    Test: Nurse follow-up journey where parent's original decision stands -
    confirm refusal.
    Steps:
    1. Navigate to session patient page and verify follow-up requested status.
    2. Click through to consent response and access follow-up action.
    3. Select that original decision stands and confirm refusal.
    4. Verify consent status remains refused after confirmation.
    5. Verify child is no longer shown under follow-up requested filter.
    6. Verify child is shown under consent refused filter.
    Verification:
    - Follow-up requested status and message are displayed.
    - Follow-up action is available on consent response.
    - Success message shown after confirming refusal.
    - Consent status changes to "Consent refused".
    - Child not visible when filtering by follow-up requested.
    - Child visible when filtering by consent refused.
    """
    child = children[Programme.MMR_MMRV][0]
    school = schools[Programme.MMR_MMRV][0]
    parent = child.parents[0]

    DashboardPage(page).navigate()
    DashboardPage(page).click_sessions()
    SessionsSearchPage(page).click_session_for_programme_group(
        school, Programme.MMR_MMRV
    )
    SessionsChildrenPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).click_child(child)

    SessionsPatientPage(page).expect_consent_status(ConsentStatus.FOLLOW_UP_REQUESTED)

    SessionsPatientPage(page).click_response_from_parent(parent)
    ConsentResponseDetailsPage(page).expect_follow_up_available()
    ConsentResponseDetailsPage(page).click_follow_up()

    ConsentRefusalFollowUpPage(page).select_decision_stands(stands=True)
    ConsentRefusalFollowUpPage(page).click_continue()
    ConsentConfirmRefusalPage(page).complete_refusal_confirmation(
        notes="Discussed with parent, decision confirmed", confirm=True
    )
    ConsentConfirmRefusalPage(page).expect_refusal_confirmation_success()

    SessionsPatientPage(page).click_back()
    SessionsPatientPage(page).expect_consent_status(ConsentStatus.REFUSED)

    SessionsPatientPage(page).click_session_activity_and_notes()

    SessionsPatientSessionActivityPage(page).check_session_activity_entry(
        "Consent confirmation refused sent"
    )
    SessionsPatientSessionActivityPage(page).click_back_to_session(school)
    SessionsChildrenPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).search.select_needs_consent()
    SessionsChildrenPage(page).search.select_follow_up_requested()
    SessionsChildrenPage(page).search.click_on_update_results()
    SessionsChildrenPage(page).search.search_for_child_that_should_not_exist(child)

    SessionsChildrenPage(page).search.select_has_a_refusal()
    SessionsChildrenPage(page).search.select_consent_refused()
    SessionsChildrenPage(page).search.click_on_update_results()
    SessionsChildrenPage(page).expect_child_programme_status(
        child, "MMR", "Has a refusal", "Consent refused"
    )


def test_follow_up_journey_decision_changed_record_consent(
    give_online_consent_with_follow_up_request,
    page,
    schools,
    children,
):
    """
    Test: Nurse follow-up journey where parent changes decision - record new consent.
    Steps:
    1. Navigate to session patient page and access consent response.
    2. Start follow-up journey and select that decision does not stand.
    3. Record positive consent through consent wizard.
    4. Verify consent status changes to given.
    Verification:
    - Follow-up action is available on consent response.
    - Selecting "No" to decision standing redirects to consent wizard.
    - Consent recorded confirmation message is shown.
    - Original consent response is invalidated.
    - Consent status changes from refused to "Consent given".
    """
    child = children[Programme.MMR_MMRV][0]
    school = schools[Programme.MMR_MMRV][0]
    parent = child.parents[0]

    DashboardPage(page).navigate()
    DashboardPage(page).click_sessions()
    SessionsSearchPage(page).click_session_for_programme_group(
        school, Programme.MMR_MMRV
    )
    SessionsChildrenPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).click_child(child)

    SessionsPatientPage(page).click_response_from_parent(parent)
    ConsentResponseDetailsPage(page).expect_follow_up_available()
    ConsentResponseDetailsPage(page).click_follow_up()

    ConsentRefusalFollowUpPage(page).select_decision_stands(stands=False)
    ConsentRefusalFollowUpPage(page).click_continue()

    NurseConsentWizardPage(page).record_parent_given_consent(
        programme=Programme.MMR_MMRV,
        consent_option=ConsentOption.MMR_EITHER,
        yes_to_health_questions=False,
    )
    SessionsPatientPage(page).expect_consent_recorded_success()

    SessionsChildrenPage(page).click_child(child)
    SessionsPatientPage(page).expect_consent_status(ConsentStatus.GIVEN)

    SessionsPatientPage(page).verify_original_response_invalidated(
        parent, "Consent given in follow-up discussion."
    )

    SessionsPatientPage(page).click_session_activity_and_notes()

    SessionsPatientSessionActivityPage(page).check_session_activity_entry(
        "Consent confirmation given sent"
    )
    SessionsPatientSessionActivityPage(page).click_back_to_session(school)
    SessionsChildrenPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).search.select_needs_consent()
    SessionsChildrenPage(page).search.select_follow_up_requested()
    SessionsChildrenPage(page).search.click_on_update_results()
    SessionsChildrenPage(page).search.search_for_child_that_should_not_exist(child)

    SessionsChildrenPage(page).search.select_due_vaccination()
    SessionsChildrenPage(page).search.click_on_update_results()
    SessionsChildrenPage(page).expect_child_programme_status(
        child, "MMR", "Due 1st dose"
    )


def test_gillick_self_consent_overrides_follow_up_requested(
    give_online_consent_with_follow_up_request,
    page,
    schools,
    children,
):
    """
    Test: Gillick competent child self-consent overrides follow-up requested status.
    Steps:
    1. Navigate to session patient page and verify follow-up requested status.
    2. Assess child as Gillick competent.
    3. Record child self-consent.
    4. Verify consent status changes to "Consent given".
    Verification:
    - Initial status is "Follow-up requested".
    - After Gillick self-consent, status changes to "Consent given".
    """
    child = children[Programme.MMR_MMRV][0]
    school = schools[Programme.MMR_MMRV][0]

    DashboardPage(page).navigate()
    DashboardPage(page).click_sessions()
    SessionsSearchPage(page).click_session_for_programme_group(
        school, Programme.MMR_MMRV
    )
    SessionsOverviewPage(page).click_set_session_in_progress_for_today()
    SessionsChildrenPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).search.select_needs_consent()
    SessionsChildrenPage(page).search.select_follow_up_requested()
    SessionsChildrenPage(page).search.click_on_update_results()
    SessionsChildrenPage(page).click_child(child)

    SessionsPatientPage(page).expect_consent_status(ConsentStatus.FOLLOW_UP_REQUESTED)

    SessionsPatientPage(page).click_assess_gillick_competence()
    GillickCompetencePage(page).add_gillick_competence(is_competent=True)

    SessionsPatientPage(page).click_record_a_new_consent_response()
    NurseConsentWizardPage(page).select_gillick_competent_child()
    NurseConsentWizardPage(page).record_child_given_consent(
        programme=Programme.MMR_MMRV,
        consent_option=ConsentOption.MMR_EITHER,
        yes_to_health_questions=False,
    )
    expect_alert_text(page, f"Consent recorded for {child!s}")

    SessionsChildrenPage(page).search.select_due_vaccination()
    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).expect_consent_status(ConsentStatus.GIVEN)


@pytest.mark.parametrize(
    ("parent2_action", "expected_status"),
    [
        ("given", ConsentStatus.FOLLOW_UP_REQUESTED),
        ("refused", ConsentStatus.CONFLICTS),
        ("follow_up", ConsentStatus.FOLLOW_UP_REQUESTED),
    ],
    ids=[
        "parent_1_follow_up_parent_2_given",
        "parent_1_follow_up_parent_2_refused",
        "parent_1_follow_up_parent_2_follow_up",
    ],
)
def test_multiple_parents_with_follow_up_request(
    setup_session_for_mmr,
    page,
    schools,
    children,
    parent2_action,
    expected_status,
):
    """
    Test: Multiple parent responses where parent 1 requests follow-up.

    Scenarios:
    - Both follow-up: Both parents request follow-up → "Follow-up requested"
    - One follow-up, one given: P1 follow-up, P2 consent → "Follow-up requested"
    - One follow-up, one refused: P1 follow-up, P2 refuse → "Conflicting consent"

    Steps:
    1. Parent 1 submits online consent refusing with follow-up request.
    2. Parent 2 submits online consent (follow-up/given/refused based on scenario).
    3. Verify child consent status matches expected.
    4. Verify child appears in appropriate filter.
    """
    consent_url, _ = setup_session_for_mmr
    child = children[Programme.MMR_MMRV][0]
    schools_list = schools[Programme.MMR_MMRV]
    school = schools_list[0]

    page.goto(consent_url)
    StartPage(page).start()
    OnlineConsentWizardPage(page).fill_details(child, child.parents[0], schools_list)
    OnlineConsentWizardPage(page).submit_refusal(follow_up_requested=True)

    page.goto(consent_url)
    StartPage(page).start()
    OnlineConsentWizardPage(page).fill_details(child, child.parents[1], schools_list)

    if parent2_action == "follow_up":
        OnlineConsentWizardPage(page).submit_refusal(follow_up_requested=True)
    elif parent2_action == "given":
        OnlineConsentWizardPage(page).submit_positive_consent(
            child=child,
            programme=Programme.MMR_MMRV,
            consent_option=ConsentOption.MMR_EITHER,
        )
    else:
        OnlineConsentWizardPage(page).submit_refusal(follow_up_requested=False)

    DashboardPage(page).navigate()
    DashboardPage(page).click_sessions()
    SessionsSearchPage(page).click_session_for_programme_group(
        school, Programme.MMR_MMRV
    )
    SessionsChildrenPage(page).tabs.click_children_tab()

    if expected_status == ConsentStatus.CONFLICTS:
        SessionsChildrenPage(page).search.select_has_a_refusal()
        SessionsChildrenPage(page).search.select_conflicting_consent()
    else:
        SessionsChildrenPage(page).search.select_needs_consent()

    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).expect_consent_status(expected_status)

    if parent2_action != "follow_up":
        SessionsPatientPage(page).click_response_from_parent(child.parents[1])
        ConsentResponseDetailsPage(page).expect_follow_up_not_available()
        SessionsPatientPage(page).click_back()

    SessionsPatientPage(page).go_back_to_session_for_school(school)
    SessionsChildrenPage(page).tabs.click_children_tab()

    if expected_status == "Conflicting consent":
        SessionsChildrenPage(page).search.select_has_a_refusal()
        SessionsChildrenPage(page).search.select_conflicting_consent()
        SessionsChildrenPage(page).search.click_on_update_results()
        SessionsChildrenPage(page).expect_child_programme_status(
            child, "MMR", expected_status
        )
    else:
        SessionsChildrenPage(page).search.select_needs_consent()
        SessionsChildrenPage(page).search.select_follow_up_requested()
        SessionsChildrenPage(page).search.click_on_update_results()
        SessionsChildrenPage(page).expect_child_programme_status(
            child, "MMR", "Needs consent", expected_status
        )
