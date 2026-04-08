import pytest

from mavis.test.annotations import issue
from mavis.test.constants import MAVIS_NOTE_LENGTH_LIMIT, ConsentMethod, Programme
from mavis.test.data import ClassFileMapping
from mavis.test.pages import (
    DashboardPage,
    GillickCompetencePage,
    ImportRecordsWizardPage,
    NurseConsentWizardPage,
    SchoolChildrenPage,
    SchoolsSearchPage,
    SessionsChildrenPage,
    SessionsOverviewPage,
    SessionsPatientPage,
    SessionsPatientSessionActivityPage,
    SessionsSearchPage,
)
from mavis.test.pages.utils import schedule_school_session_if_needed
from mavis.test.utils import expect_alert_text


@pytest.fixture
def set_up_session_with_file_upload(
    log_in_as_nurse,
    schools,
    page,
    point_of_care_file_generator,
    year_groups,
):
    school = schools[Programme.HPV][0]
    year_group = year_groups[Programme.HPV]

    DashboardPage(page).click_schools()
    SchoolsSearchPage(page).click_school(school)
    SchoolChildrenPage(page).click_import_class_lists()
    ImportRecordsWizardPage(page, point_of_care_file_generator).import_class_list(
        ClassFileMapping.FIXED_CHILD, year_group
    )
    schedule_school_session_if_needed(page, school, [Programme.HPV], [year_group])


def test_gillick_competence(
    set_up_session_with_file_upload,
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

    Expectations:
    - Gillick competence status is updated and reflected for the child.
    """

    child = children[Programme.HPV][0]
    school = schools[Programme.HPV][0]

    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_programme_tab(Programme.HPV)
    SessionsPatientPage(page).click_assess_gillick_competence()

    GillickCompetencePage(page).add_gillick_competence(is_competent=True)

    SessionsChildrenPage(page).header.click_mavis()
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

    SessionsChildrenPage(page).header.click_mavis()
    DashboardPage(page).click_sessions()
    SessionsSearchPage(page).click_session_for_programme_group(school, Programme.HPV)
    SessionsOverviewPage(page).verify_offline_sheet_gillick_competence(
        child, competent=False
    )


@issue("MAV-955")
def test_gillick_competence_notes(
    set_up_session_with_file_upload,
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
    5. Edit assessment and again try to update with notes over 1000 characters (should
       error).

    Expectations:
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


def test_conflicting_consent_with_gillick_consent(
    set_up_session_with_file_upload,
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

    Expectations:
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
    SessionsChildrenPage(page).search.select_consent_refused()
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
