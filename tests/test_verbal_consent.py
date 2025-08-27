import pytest

from mavis.test.annotations import issue
from mavis.test.data import CohortsFileMapping
from mavis.test.models import Programme

pytestmark = pytest.mark.consent


@pytest.fixture
def setup_session_with_file_upload(
    log_in_as_nurse,
    schools,
    dashboard_page,
    sessions_page,
    import_records_page,
    year_groups,
):
    school = schools[Programme.HPV][0]
    year_group = year_groups[Programme.HPV]

    def _setup(class_list_file):
        try:
            dashboard_page.click_sessions()
            sessions_page.ensure_session_scheduled_for_today(school, Programme.HPV)
            dashboard_page.click_mavis()
            dashboard_page.click_sessions()
            sessions_page.click_session_for_programme_group(school, Programme.HPV)
            sessions_page.click_import_class_lists()
            import_records_page.import_class_list_for_current_year(
                class_list_file, year_group
            )
            dashboard_page.click_mavis()
            dashboard_page.click_sessions()
            yield
        finally:
            dashboard_page.navigate()
            dashboard_page.click_mavis()
            dashboard_page.click_sessions()
            sessions_page.delete_all_sessions(school)

    return _setup


@pytest.fixture
def setup_fixed_child(setup_session_with_file_upload):
    yield from setup_session_with_file_upload(CohortsFileMapping.FIXED_CHILD)


def test_gillick_competence(setup_fixed_child, schools, sessions_page, children):
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

    sessions_page.click_session_for_programme_group(school, Programme.HPV)
    sessions_page.navigate_to_gillick_competence(child, Programme.HPV)

    sessions_page.add_gillick_competence(is_competent=True)
    sessions_page.click_edit_gillick_competence()
    sessions_page.edit_gillick_competence(is_competent=False)


@issue("MAV-955")
def test_gillick_competence_notes(setup_fixed_child, schools, sessions_page, children):
    """
    Test: Validate Gillick competence assessment notes length and update.
    Steps:
    1. Open the session for the school and programme.
    2. Navigate to Gillick competence assessment for the child.
    3. Attempt to complete assessment with notes over 1000 characters (should error).
    4. Complete assessment with valid notes.
    5. Edit assessment and again try to update with notes over 1000 characters (should error).
    Verification:
    - Error is shown for notes over 1000 characters.
    - Assessment can be completed and updated with valid notes.
    """
    child = children[Programme.HPV][0]
    school = schools[Programme.HPV][0]

    sessions_page.click_session_for_programme_group(school, Programme.HPV)
    sessions_page.navigate_to_gillick_competence(child, Programme.HPV)

    sessions_page.answer_gillick_competence_questions(is_competent=True)
    sessions_page.fill_assessment_notes_with_string_of_length(1001)
    sessions_page.click_complete_assessment()
    sessions_page.check_notes_length_error_appears()

    sessions_page.fill_assessment_notes("Gillick competent")
    sessions_page.click_complete_assessment()

    sessions_page.click_edit_gillick_competence()
    sessions_page.answer_gillick_competence_questions(is_competent=True)
    sessions_page.fill_assessment_notes_with_string_of_length(1001)
    sessions_page.click_update_assessment()
    sessions_page.check_notes_length_error_appears()


@pytest.mark.bug
def test_invalid_consent(
    setup_fixed_child, sessions_page, schools, verbal_consent_page, children
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
    school = schools[Programme.HPV][0]

    sessions_page.click_session_for_programme_group(school, Programme.HPV)
    sessions_page.click_consent_tab()
    sessions_page.select_no_response()
    sessions_page.navigate_to_consent_response(child, Programme.HPV)
    verbal_consent_page.parent_verbal_no_response(child.parents[0])
    sessions_page.select_no_response()

    sessions_page.navigate_to_consent_response(child, Programme.HPV)
    verbal_consent_page.parent_verbal_refuse_consent(child.parents[1])

    sessions_page.select_consent_refused()
    sessions_page.click_child(child)
    sessions_page.click_programme_tab(Programme.HPV)
    sessions_page.invalidate_parent_refusal(child.parents[1])
    sessions_page.click_session_activity_and_notes()

    sessions_page.check_session_activity_entry(
        f"Consent from {child.parents[1].full_name} invalidated"
    )
    sessions_page.check_session_activity_entry(
        f"Consent refused by {child.parents[1].name_and_relationship}"
    )
    sessions_page.check_session_activity_entry(
        f"Consent not_provided by {child.parents[0].name_and_relationship}"
    )


@pytest.mark.bug
def test_parent_provides_consent_twice(
    setup_fixed_child, sessions_page, schools, verbal_consent_page, children
):
    """
    Test: Record two consents from the same parent (positive then refusal) and verify activity log.
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
    school = schools[Programme.HPV][0]

    sessions_page.click_session_for_programme_group(school, Programme.HPV)
    sessions_page.click_consent_tab()
    sessions_page.select_no_response()

    sessions_page.navigate_to_consent_response(child, Programme.HPV)
    verbal_consent_page.parent_written_positive(child.parents[0])
    sessions_page.select_consent_given()

    sessions_page.navigate_to_update_triage_outcome(child, Programme.HPV)
    verbal_consent_page.update_triage_outcome_positive()

    sessions_page.click_record_a_new_consent_response()
    verbal_consent_page.parent_verbal_refuse_consent(child.parents[0])
    sessions_page.select_consent_refused()

    sessions_page.click_child(child)
    sessions_page.click_programme_tab(Programme.HPV)
    sessions_page.expect_consent_refused_text(child.parents[0])
    sessions_page.click_session_activity_and_notes()
    sessions_page.check_session_activity_entry(
        f"Consent refused by {child.parents[0].name_and_relationship}"
    )
    sessions_page.check_session_activity_entry("Triaged decision: Safe to vaccinate")
    sessions_page.check_session_activity_entry(
        f"Consent given by {child.parents[0].name_and_relationship}"
    )


@pytest.mark.bug
def test_conflicting_consent_with_gillick_consent(
    setup_fixed_child, sessions_page, schools, verbal_consent_page, children
):
    """
    Test: Record conflicting consents from parents, resolve with Gillick competence, and verify status.
    Steps:
    1. Open the session and consent tab for the child.
    2. Record a verbal positive consent for parent 1.
    3. Record a verbal refusal for parent 2, resulting in conflicting consent.
    4. Assess Gillick competence as competent.
    5. Record child verbal consent.
    6. Verify consent status and activity log.
    Verification:
    - Consent status updates to 'Conflicting consent', then 'Safe to vaccinate', then 'Consent given'.
    - Activity log contains entry for Gillick competent child consent.
    """
    child = children[Programme.HPV][0]
    school = schools[Programme.HPV][0]

    sessions_page.click_session_for_programme_group(school, Programme.HPV)
    sessions_page.click_consent_tab()
    sessions_page.select_no_response()
    sessions_page.navigate_to_consent_response(child, Programme.HPV)
    verbal_consent_page.parent_verbal_positive(
        parent=child.parents[0], change_phone=False
    )
    sessions_page.select_consent_given()

    sessions_page.navigate_to_consent_response(child, Programme.HPV)
    verbal_consent_page.parent_verbal_refuse_consent(child.parents[1])
    sessions_page.select_conflicting_consent()

    sessions_page.click_child(child)
    sessions_page.click_programme_tab(Programme.HPV)
    sessions_page.expect_consent_status(Programme.HPV, "Conflicting consent")
    sessions_page.expect_conflicting_consent_text()
    sessions_page.click_assess_gillick_competence()
    sessions_page.add_gillick_competence(is_competent=True)
    sessions_page.expect_consent_status(Programme.HPV, "Safe to vaccinate")
    sessions_page.click_record_a_new_consent_response()
    verbal_consent_page.child_consent_verbal_positive()
    sessions_page.expect_alert_text(f"Consent recorded for {str(child)}")
    sessions_page.select_consent_given()
    sessions_page.click_child(child)
    sessions_page.click_programme_tab(Programme.HPV)
    sessions_page.expect_consent_status(Programme.HPV, "Safe to vaccinate")
    sessions_page.expect_child_safe_to_vaccinate(child)
    sessions_page.expect_consent_status(Programme.HPV, "Consent given")
    sessions_page.click_session_activity_and_notes()
    sessions_page.check_session_activity_entry(
        f"Consent given by {str(child)} (Child (Gillick competent))"
    )
