import pytest

from mavis.test.annotations import issue
from mavis.test.constants import (
    MAVIS_NOTE_LENGTH_LIMIT,
    ConsentMethod,
    DeliverySite,
    Programme,
    Vaccine,
)
from mavis.test.data import CohortsFileMapping
from mavis.test.helpers.accessibility_helper import AccessibilityHelper
from mavis.test.pages import (
    DashboardPage,
    GillickCompetencePage,
    ImportRecordsWizardPage,
    NurseConsentWizardPage,
    SchoolsChildrenPage,
    SchoolsSearchPage,
    SessionsChildrenPage,
    SessionsOverviewPage,
    SessionsPatientPage,
    SessionsPatientSessionActivityPage,
    SessionsRecordVaccinationsPage,
    SessionsSearchPage,
    SessionsVaccinationWizardPage,
    VaccinesPage,
)
from mavis.test.pages.utils import schedule_school_session_if_needed
from mavis.test.utils import expect_alert_text

pytestmark = pytest.mark.consent


@pytest.fixture
def setup_session_with_file_upload(
    log_in_as_nurse,
    schools,
    page,
    file_generator,
    year_groups,
):
    school = schools[Programme.HPV][0]
    year_group = year_groups[Programme.HPV]

    def _setup(class_list_file):
        DashboardPage(page).click_schools()
        SchoolsSearchPage(page).click_school(school)
        SchoolsChildrenPage(page).click_import_class_lists()
        ImportRecordsWizardPage(page, file_generator).import_class_list(
            class_list_file, year_group
        )
        schedule_school_session_if_needed(page, school, [Programme.HPV], [year_group])
        yield

    return _setup


@pytest.fixture
def setup_fixed_child(setup_session_with_file_upload):
    yield from setup_session_with_file_upload(CohortsFileMapping.FIXED_CHILD)


def test_gillick_competence(
    setup_fixed_child,
    page,
    children,
    schools,
):
    """
    Test: Add and edit Gillick competence assessment for a child.
    Steps:
    1. Open the session for the school and programme.
    2. Navigate to Gillick competence assessment for the child.
    3. Add a Gillick competence assessment as competent.
    4. Edit the assessment to mark as not competent.
    Verification:
    - Gillick competence status is updated and reflected for the child.
    """
    child = children[Programme.HPV][0]
    school = schools[Programme.HPV][0]

    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_programme_tab(Programme.HPV)
    SessionsPatientPage(page).click_assess_gillick_competence()

    GillickCompetencePage(page).add_gillick_competence(is_competent=True)

    SessionsChildrenPage(page).header.click_mavis_header()
    DashboardPage(page).click_sessions()
    SessionsSearchPage(page).click_session_for_programme_group(school, Programme.HPV)
    SessionsOverviewPage(page).verify_offline_sheet_gillick_competence(
        child, competent=True
    )

    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_programme_tab(Programme.HPV)
    SessionsPatientPage(page).click_edit_gillick_competence()
    GillickCompetencePage(page).edit_gillick_competence(is_competent=False)

    SessionsChildrenPage(page).header.click_mavis_header()
    DashboardPage(page).click_sessions()
    SessionsSearchPage(page).click_session_for_programme_group(school, Programme.HPV)
    SessionsOverviewPage(page).verify_offline_sheet_gillick_competence(
        child, competent=False
    )


@issue("MAV-955")
def test_gillick_competence_notes(
    setup_fixed_child,
    page,
    children,
):
    """
    Test: Validate Gillick competence assessment notes length and update.
    Steps:
    1. Open the session for the school and programme.
    2. Navigate to Gillick competence assessment for the child.
    3. Attempt to complete assessment with notes over 1000 characters (should error).
    4. Complete assessment with valid notes.
    5. Edit assessment and again try to update with notes over 1000
       characters (should error).
    Verification:
    - Error is shown for notes over 1000 characters.
    - Assessment can be completed and updated with valid notes.
    """
    child = children[Programme.HPV][0]

    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_programme_tab(Programme.HPV)
    SessionsPatientPage(page).click_assess_gillick_competence()

    GillickCompetencePage(page).answer_gillick_competence_questions(is_competent=True)
    GillickCompetencePage(page).fill_assessment_notes_with_string_of_length(
        MAVIS_NOTE_LENGTH_LIMIT + 1
    )
    GillickCompetencePage(page).click_complete_assessment()
    GillickCompetencePage(page).check_notes_length_error_appears()

    GillickCompetencePage(page).fill_assessment_notes("Gillick competent")
    GillickCompetencePage(page).click_complete_assessment()

    SessionsPatientPage(page).click_edit_gillick_competence()
    GillickCompetencePage(page).answer_gillick_competence_questions(is_competent=True)
    GillickCompetencePage(page).fill_assessment_notes_with_string_of_length(
        MAVIS_NOTE_LENGTH_LIMIT + 1
    )
    GillickCompetencePage(page).click_update_assessment()
    GillickCompetencePage(page).check_notes_length_error_appears()


@pytest.mark.bug
def test_invalid_consent(
    setup_fixed_child,
    page,
    children,
):
    """
    Test: Record invalid and refused consents and verify activity log entries.
    Steps:
    1. Open the session and consent tab for the child.
    2. Record a 'no response' verbal consent for parent 1.
    3. Record a refusal verbal consent for parent 2.
    4. Invalidate the refusal from parent 2.
    5. Check the session activity log for correct entries.
    Verification:
    - Activity log contains entries for invalidated consent, refusal, and no response.
    """
    child = children[Programme.HPV][0]

    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).search.select_needs_consent()
    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_programme_tab(Programme.HPV)
    SessionsPatientPage(page).click_record_a_new_consent_response()

    NurseConsentWizardPage(page).select_parent(child.parents[0])
    NurseConsentWizardPage(page).select_consent_method(ConsentMethod.IN_PERSON)
    NurseConsentWizardPage(page).record_parent_no_response()

    SessionsChildrenPage(page).search.select_needs_consent()

    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_programme_tab(Programme.HPV)
    SessionsPatientPage(page).click_record_a_new_consent_response()
    NurseConsentWizardPage(page).select_parent(child.parents[1])
    NurseConsentWizardPage(page).select_consent_method(ConsentMethod.IN_PERSON)
    NurseConsentWizardPage(page).record_parent_refuse_consent()

    SessionsChildrenPage(page).search.select_has_a_refusal()
    SessionsChildrenPage(page).search.select_parent_refused()
    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_programme_tab(Programme.HPV)
    SessionsPatientPage(page).invalidate_parent_refusal(child.parents[1])
    SessionsPatientPage(page).click_session_activity_and_notes()

    SessionsPatientSessionActivityPage(page).check_session_activity_entry(
        f"Consent from {child.parents[1].full_name} invalidated",
    )
    SessionsPatientSessionActivityPage(page).check_session_activity_entry(
        f"Consent refused by {child.parents[1].name_and_relationship}",
    )
    SessionsPatientSessionActivityPage(page).check_session_activity_entry(
        f"Consent not_provided by {child.parents[0].name_and_relationship}",
    )


@pytest.mark.bug
def test_parent_provides_consent_twice(
    setup_fixed_child,
    page,
    children,
):
    """
    Test: Record two consents from the same parent (positive then refusal)
       and verify activity log.
    Steps:
    1. Open the session and consent tab for the child.
    2. Record a written positive consent for parent 1.
    3. Record a triage outcome as safe to vaccinate.
    4. Record a verbal refusal for the same parent.
    5. Check the consent refused text and session activity log.
    Verification:
    - Consent refused text is shown for the parent.
    - Activity log contains entries for refusal, triage, and initial consent.
    """
    child = children[Programme.HPV][0]

    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).search.select_needs_consent()

    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_programme_tab(Programme.HPV)
    SessionsPatientPage(page).click_record_a_new_consent_response()
    NurseConsentWizardPage(page).select_parent(child.parents[0])
    NurseConsentWizardPage(page).select_consent_method(ConsentMethod.PAPER)
    NurseConsentWizardPage(page).record_parent_positive_consent(
        yes_to_health_questions=True
    )
    SessionsChildrenPage(page).search.select_due_vaccination()

    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_programme_tab(Programme.HPV)
    SessionsPatientPage(page).click_record_a_new_consent_response()
    NurseConsentWizardPage(page).select_parent(child.parents[0])
    NurseConsentWizardPage(page).select_consent_method(ConsentMethod.IN_PERSON)
    NurseConsentWizardPage(page).record_parent_refuse_consent()

    SessionsChildrenPage(page).search.select_has_a_refusal()
    SessionsChildrenPage(page).search.select_parent_refused()

    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_programme_tab(Programme.HPV)
    SessionsVaccinationWizardPage(page).expect_consent_refused_text(child.parents[0])
    SessionsPatientPage(page).click_session_activity_and_notes()
    SessionsPatientSessionActivityPage(page).check_session_activity_entry(
        f"Consent refused by {child.parents[0].name_and_relationship}",
    )
    SessionsPatientSessionActivityPage(page).check_session_activity_entry(
        "Triaged decision: Safe to vaccinate"
    )
    SessionsPatientSessionActivityPage(page).check_session_activity_entry(
        f"Consent given by {child.parents[0].name_and_relationship}",
    )


@pytest.mark.bug
def test_conflicting_consent_with_gillick_consent(
    setup_fixed_child,
    page,
    children,
):
    """
    Test: Record conflicting consents from parents, resolve with Gillick competence,
       and verify status.
    Steps:
    1. Open the session and consent tab for the child.
    2. Record a verbal positive consent for parent 1.
    3. Record a verbal refusal for parent 2, resulting in conflicting consent.
    4. Assess Gillick competence as competent.
    5. Record child verbal consent.
    6. Verify consent status and activity log.
    Verification:
    - Consent status updates to 'Conflicting consent', then 'Safe to vaccinate',
      then 'Consent given'.
    - Activity log contains entry for Gillick competent child consent.
    """
    child = children[Programme.HPV][0]

    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).search.select_needs_consent()
    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_programme_tab(Programme.HPV)
    SessionsPatientPage(page).click_record_a_new_consent_response()

    NurseConsentWizardPage(page).select_parent(child.parents[0])
    NurseConsentWizardPage(page).select_consent_method(ConsentMethod.IN_PERSON)
    NurseConsentWizardPage(page).record_parent_positive_consent()

    SessionsChildrenPage(page).search.select_due_vaccination()
    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_programme_tab(Programme.HPV)
    SessionsPatientPage(page).click_record_a_new_consent_response()

    NurseConsentWizardPage(page).select_parent(child.parents[1])
    NurseConsentWizardPage(page).select_consent_method(ConsentMethod.IN_PERSON)
    NurseConsentWizardPage(page).record_parent_refuse_consent()

    SessionsChildrenPage(page).search.select_has_a_refusal()
    SessionsChildrenPage(page).search.select_parent_refused()
    SessionsChildrenPage(page).search.select_conflicting_consent()

    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_programme_tab(Programme.HPV)
    SessionsPatientPage(page).expect_consent_status(
        Programme.HPV, "Conflicting consent"
    )
    SessionsPatientPage(page).expect_conflicting_consent_text()
    SessionsPatientPage(page).click_assess_gillick_competence()
    GillickCompetencePage(page).add_gillick_competence(is_competent=True)
    SessionsPatientPage(page).click_record_a_new_consent_response()

    NurseConsentWizardPage(page).select_gillick_competent_child()
    NurseConsentWizardPage(page).record_child_positive_consent()
    expect_alert_text(page, f"Consent recorded for {child!s}")

    SessionsChildrenPage(page).search.select_due_vaccination()
    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_programme_tab(Programme.HPV)
    SessionsPatientPage(page).expect_consent_status(Programme.HPV, "Consent given")
    SessionsPatientPage(page).click_session_activity_and_notes()
    SessionsPatientSessionActivityPage(page).check_session_activity_entry(
        f"Consent given by {child!s} (Child (Gillick competent))",
    )


@pytest.mark.accessibility
def test_accessibility(
    setup_fixed_child,
    add_vaccine_batch,
    page,
    schools,
    children,
):
    child = children[Programme.HPV][0]
    school = schools[Programme.HPV][0]
    batch_name = add_vaccine_batch(Vaccine.GARDASIL_9)

    VaccinesPage(page).header.click_mavis_header()
    DashboardPage(page).click_sessions()
    SessionsSearchPage(page).click_session_for_programme_group(school, Programme.HPV)
    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).search.select_needs_consent()

    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_programme_tab(Programme.HPV)
    SessionsPatientPage(page).click_record_a_new_consent_response()
    AccessibilityHelper(page).check_accessibility()

    NurseConsentWizardPage(page).click_radio_button(
        child.parents[0].name_and_relationship
    )
    NurseConsentWizardPage(page).click_continue()

    AccessibilityHelper(page).check_accessibility()
    NurseConsentWizardPage(page).click_continue()

    AccessibilityHelper(page).check_accessibility()

    NurseConsentWizardPage(page).select_consent_method(ConsentMethod.PAPER)
    AccessibilityHelper(page).check_accessibility()

    NurseConsentWizardPage(page).click_yes_they_agree()
    NurseConsentWizardPage(page).click_continue()
    AccessibilityHelper(page).check_accessibility()

    NurseConsentWizardPage(page).answer_all_health_questions(
        programme=Programme.HPV,
    )
    NurseConsentWizardPage(page).click_continue()
    AccessibilityHelper(page).check_accessibility()

    NurseConsentWizardPage(page).click_confirm()
    AccessibilityHelper(page).check_accessibility()

    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).register_child_as_attending(child)
    SessionsChildrenPage(page).tabs.click_record_vaccinations_tab()
    AccessibilityHelper(page).check_accessibility()

    SessionsRecordVaccinationsPage(page).search.search_and_click_child(child)
    AccessibilityHelper(page).check_accessibility()

    SessionsPatientPage(page).confirm_pre_screening_checks(Programme.HPV)
    SessionsPatientPage(page).select_identity_confirmed_by_child(child)
    SessionsPatientPage(page).select_ready_for_vaccination()
    SessionsPatientPage(page).select_delivery_site(DeliverySite.LEFT_ARM_UPPER)
    SessionsVaccinationWizardPage(page).click_continue_button()
    AccessibilityHelper(page).check_accessibility()

    SessionsVaccinationWizardPage(page).choose_batch(batch_name)
    AccessibilityHelper(page).check_accessibility()

    SessionsVaccinationWizardPage(page).click_confirm_button()
    AccessibilityHelper(page).check_accessibility()

    SessionsPatientPage(page).click_vaccination_details(school)
    AccessibilityHelper(page).check_accessibility()
