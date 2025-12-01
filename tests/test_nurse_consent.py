import pytest

from mavis.test.annotations import issue
from mavis.test.data import CohortsFileMapping
from mavis.test.models import ConsentMethod, DeliverySite, Programme, Vaccine
from mavis.test.utils import MAVIS_NOTE_LENGTH_LIMIT, expect_alert_text, get_offset_date

pytestmark = pytest.mark.consent


@pytest.fixture
def setup_session_with_file_upload(
    log_in_as_nurse,
    schools,
    dashboard_page,
    sessions_search_page,
    sessions_overview_page,
    sessions_edit_page,
    import_records_wizard_page,
    year_groups,
    imports_page,
):
    school = schools[Programme.HPV][0]
    year_group = year_groups[Programme.HPV]

    def _setup(class_list_file):
        dashboard_page.click_sessions()
        sessions_search_page.click_session_for_programme_group(
            school, Programme.HPV.group
        )
        if not sessions_overview_page.is_date_scheduled(get_offset_date(0)):
            sessions_overview_page.schedule_or_edit_session()
            sessions_edit_page.schedule_a_valid_session(
                offset_days=0, skip_weekends=False
            )
        sessions_overview_page.click_import_class_lists()
        import_records_wizard_page.import_class_list(class_list_file, year_group)
        imports_page.header.click_sessions_header()
        yield

    return _setup


@pytest.fixture
def setup_fixed_child(setup_session_with_file_upload):
    yield from setup_session_with_file_upload(CohortsFileMapping.FIXED_CHILD)


def test_gillick_competence(
    setup_fixed_child,
    schools,
    sessions_search_page,
    gillick_competence_page,
    children,
    sessions_overview_page,
    sessions_children_page,
    sessions_patient_page,
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

    sessions_search_page.click_session_for_programme_group(school, Programme.HPV)
    sessions_overview_page.tabs.click_children_tab()
    sessions_children_page.search.search_and_click_child(child)
    sessions_patient_page.click_programme_tab(Programme.HPV)
    sessions_patient_page.click_assess_gillick_competence()

    gillick_competence_page.add_gillick_competence(is_competent=True)
    sessions_patient_page.click_edit_gillick_competence()
    gillick_competence_page.edit_gillick_competence(is_competent=False)


@issue("MAV-955")
def test_gillick_competence_notes(
    setup_fixed_child,
    schools,
    gillick_competence_page,
    children,
    sessions_search_page,
    sessions_overview_page,
    sessions_children_page,
    sessions_patient_page,
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
    school = schools[Programme.HPV][0]

    sessions_search_page.click_session_for_programme_group(school, Programme.HPV)
    sessions_overview_page.tabs.click_children_tab()
    sessions_children_page.search.search_and_click_child(child)
    sessions_patient_page.click_programme_tab(Programme.HPV)
    sessions_patient_page.click_assess_gillick_competence()

    gillick_competence_page.answer_gillick_competence_questions(is_competent=True)
    gillick_competence_page.fill_assessment_notes_with_string_of_length(
        MAVIS_NOTE_LENGTH_LIMIT + 1
    )
    gillick_competence_page.click_complete_assessment()
    gillick_competence_page.check_notes_length_error_appears()

    gillick_competence_page.fill_assessment_notes("Gillick competent")
    gillick_competence_page.click_complete_assessment()

    sessions_patient_page.click_edit_gillick_competence()
    gillick_competence_page.answer_gillick_competence_questions(is_competent=True)
    gillick_competence_page.fill_assessment_notes_with_string_of_length(
        MAVIS_NOTE_LENGTH_LIMIT + 1
    )
    gillick_competence_page.click_update_assessment()
    gillick_competence_page.check_notes_length_error_appears()


@pytest.mark.bug
def test_invalid_consent(
    setup_fixed_child,
    sessions_search_page,
    sessions_overview_page,
    sessions_children_page,
    sessions_patient_page,
    sessions_patient_session_activity_page,
    schools,
    nurse_consent_wizard_page,
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
    school = schools[Programme.HPV][0]

    sessions_search_page.click_session_for_programme_group(school, Programme.HPV)
    sessions_overview_page.tabs.click_children_tab()
    sessions_children_page.select_needs_consent()
    sessions_children_page.search.search_and_click_child(child)
    sessions_patient_page.click_programme_tab(Programme.HPV)
    sessions_patient_page.click_record_a_new_consent_response()

    nurse_consent_wizard_page.select_parent(child.parents[0])
    nurse_consent_wizard_page.select_consent_method(ConsentMethod.IN_PERSON)
    nurse_consent_wizard_page.record_parent_no_response()

    sessions_children_page.select_needs_consent()

    sessions_children_page.search.search_and_click_child(child)
    sessions_patient_page.click_programme_tab(Programme.HPV)
    sessions_patient_page.click_record_a_new_consent_response()
    nurse_consent_wizard_page.select_parent(child.parents[1])
    nurse_consent_wizard_page.select_consent_method(ConsentMethod.IN_PERSON)
    nurse_consent_wizard_page.record_parent_refuse_consent()

    sessions_children_page.select_has_a_refusal()
    sessions_children_page.select_parent_refused()
    sessions_children_page.search.search_and_click_child(child)
    sessions_patient_page.click_programme_tab(Programme.HPV)
    sessions_patient_page.invalidate_parent_refusal(child.parents[1])
    sessions_patient_page.click_session_activity_and_notes()

    sessions_patient_session_activity_page.check_session_activity_entry(
        f"Consent from {child.parents[1].full_name} invalidated",
    )
    sessions_patient_session_activity_page.check_session_activity_entry(
        f"Consent refused by {child.parents[1].name_and_relationship}",
    )
    sessions_patient_session_activity_page.check_session_activity_entry(
        f"Consent not_provided by {child.parents[0].name_and_relationship}",
    )


@pytest.mark.bug
def test_parent_provides_consent_twice(
    setup_fixed_child,
    sessions_search_page,
    sessions_overview_page,
    sessions_children_page,
    sessions_patient_page,
    sessions_patient_session_activity_page,
    sessions_vaccination_wizard_page,
    schools,
    nurse_consent_wizard_page,
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
    school = schools[Programme.HPV][0]

    sessions_search_page.click_session_for_programme_group(school, Programme.HPV)
    sessions_overview_page.tabs.click_children_tab()
    sessions_children_page.select_needs_consent()

    sessions_children_page.search.search_and_click_child(child)
    sessions_patient_page.click_programme_tab(Programme.HPV)
    sessions_patient_page.click_record_a_new_consent_response()
    nurse_consent_wizard_page.select_parent(child.parents[0])
    nurse_consent_wizard_page.select_consent_method(ConsentMethod.PAPER)
    nurse_consent_wizard_page.record_parent_positive_consent(
        yes_to_health_questions=True
    )
    sessions_children_page.select_due_vaccination()

    sessions_children_page.search.search_and_click_child(child)
    sessions_patient_page.click_programme_tab(Programme.HPV)
    sessions_patient_page.click_record_a_new_consent_response()
    nurse_consent_wizard_page.select_parent(child.parents[0])
    nurse_consent_wizard_page.select_consent_method(ConsentMethod.IN_PERSON)
    nurse_consent_wizard_page.record_parent_refuse_consent()

    sessions_children_page.select_has_a_refusal()
    sessions_children_page.select_parent_refused()

    sessions_children_page.search.search_and_click_child(child)
    sessions_patient_page.click_programme_tab(Programme.HPV)
    sessions_vaccination_wizard_page.expect_consent_refused_text(child.parents[0])
    sessions_patient_page.click_session_activity_and_notes()
    sessions_patient_session_activity_page.check_session_activity_entry(
        f"Consent refused by {child.parents[0].name_and_relationship}",
    )
    sessions_patient_session_activity_page.check_session_activity_entry(
        "Triaged decision: Safe to vaccinate"
    )
    sessions_patient_session_activity_page.check_session_activity_entry(
        f"Consent given by {child.parents[0].name_and_relationship}",
    )


@pytest.mark.bug
def test_conflicting_consent_with_gillick_consent(
    setup_fixed_child,
    sessions_search_page,
    sessions_overview_page,
    sessions_children_page,
    sessions_patient_page,
    sessions_patient_session_activity_page,
    schools,
    nurse_consent_wizard_page,
    gillick_competence_page,
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
    school = schools[Programme.HPV][0]

    sessions_search_page.click_session_for_programme_group(school, Programme.HPV)
    sessions_overview_page.tabs.click_children_tab()
    sessions_children_page.select_needs_consent()
    sessions_children_page.search.search_and_click_child(child)
    sessions_patient_page.click_programme_tab(Programme.HPV)
    sessions_patient_page.click_record_a_new_consent_response()

    nurse_consent_wizard_page.select_parent(child.parents[0])
    nurse_consent_wizard_page.select_consent_method(ConsentMethod.IN_PERSON)
    nurse_consent_wizard_page.record_parent_positive_consent()

    sessions_children_page.select_due_vaccination()
    sessions_children_page.search.search_and_click_child(child)
    sessions_patient_page.click_programme_tab(Programme.HPV)
    sessions_patient_page.click_record_a_new_consent_response()

    nurse_consent_wizard_page.select_parent(child.parents[1])
    nurse_consent_wizard_page.select_consent_method(ConsentMethod.IN_PERSON)
    nurse_consent_wizard_page.record_parent_refuse_consent()

    sessions_children_page.select_has_a_refusal()
    sessions_children_page.select_parent_refused()
    sessions_children_page.select_conflicting_consent()

    sessions_children_page.search.search_and_click_child(child)
    sessions_patient_page.click_programme_tab(Programme.HPV)
    sessions_patient_page.expect_consent_status(Programme.HPV, "Conflicting consent")
    sessions_patient_page.expect_conflicting_consent_text()
    sessions_patient_page.click_assess_gillick_competence()
    gillick_competence_page.add_gillick_competence(is_competent=True)
    sessions_patient_page.click_record_a_new_consent_response()

    nurse_consent_wizard_page.select_gillick_competent_child()
    nurse_consent_wizard_page.record_child_positive_consent()
    expect_alert_text(nurse_consent_wizard_page.page, f"Consent recorded for {child!s}")

    sessions_children_page.select_due_vaccination()
    sessions_children_page.search.search_and_click_child(child)
    sessions_patient_page.click_programme_tab(Programme.HPV)
    sessions_patient_page.expect_consent_status(Programme.HPV, "Consent given")
    sessions_patient_page.click_session_activity_and_notes()
    sessions_patient_session_activity_page.check_session_activity_entry(
        f"Consent given by {child!s} (Child (Gillick competent))",
    )


@pytest.mark.accessibility
def test_accessibility(
    setup_fixed_child,
    add_vaccine_batch,
    sessions_search_page,
    sessions_overview_page,
    sessions_children_page,
    sessions_patient_page,
    sessions_register_page,
    sessions_record_vaccinations_page,
    sessions_vaccination_wizard_page,
    schools,
    nurse_consent_wizard_page,
    children,
    accessibility_helper,
    dashboard_page,
):
    child = children[Programme.HPV][0]
    school = schools[Programme.HPV][0]
    batch_name = add_vaccine_batch(Vaccine.GARDASIL_9)

    dashboard_page.navigate()
    dashboard_page.click_sessions()
    sessions_search_page.click_session_for_programme_group(school, Programme.HPV)
    sessions_overview_page.tabs.click_children_tab()
    sessions_children_page.select_needs_consent()

    sessions_children_page.search.search_and_click_child(child)
    sessions_patient_page.click_programme_tab(Programme.HPV)
    sessions_patient_page.click_record_a_new_consent_response()
    accessibility_helper.check_accessibility()

    nurse_consent_wizard_page.click_radio_button(child.parents[0].name_and_relationship)
    nurse_consent_wizard_page.click_continue()

    accessibility_helper.check_accessibility()
    nurse_consent_wizard_page.click_continue()

    accessibility_helper.check_accessibility()

    nurse_consent_wizard_page.select_consent_method(ConsentMethod.PAPER)
    accessibility_helper.check_accessibility()

    nurse_consent_wizard_page.click_yes_they_agree()
    nurse_consent_wizard_page.click_continue()
    accessibility_helper.check_accessibility()

    nurse_consent_wizard_page.answer_all_health_questions(
        programme=Programme.HPV,
    )
    nurse_consent_wizard_page.click_continue()
    accessibility_helper.check_accessibility()

    nurse_consent_wizard_page.click_confirm()
    accessibility_helper.check_accessibility()

    sessions_overview_page.tabs.click_register_tab()
    sessions_register_page.register_child_as_attending(str(child))
    sessions_register_page.tabs.click_record_vaccinations_tab()
    accessibility_helper.check_accessibility()

    sessions_record_vaccinations_page.search.search_and_click_child(child)
    accessibility_helper.check_accessibility()

    sessions_patient_page.confirm_pre_screening_checks(Programme.HPV)
    sessions_patient_page.select_identity_confirmed_by_child(child)
    sessions_patient_page.select_ready_for_vaccination()
    sessions_patient_page.select_delivery_site(DeliverySite.LEFT_ARM_UPPER)
    sessions_vaccination_wizard_page.click_continue_button()
    accessibility_helper.check_accessibility()

    sessions_vaccination_wizard_page.choose_batch(batch_name)
    accessibility_helper.check_accessibility()

    sessions_vaccination_wizard_page.click_confirm_button()
    accessibility_helper.check_accessibility()

    sessions_patient_page.click_vaccination_details(school)
    accessibility_helper.check_accessibility()
