import pytest

from mavis.test.data import CohortsFileMapping
from mavis.test.models import Programme
from mavis.test.annotations import issue

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
            sessions_page.schedule_a_valid_session(
                school, Programme.HPV, for_today=True
            )
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
            dashboard_page.click_mavis()
            dashboard_page.click_sessions()
            sessions_page.delete_all_sessions(school)

    return _setup


@pytest.fixture
def setup_fixed_child(setup_session_with_file_upload):
    yield from setup_session_with_file_upload(CohortsFileMapping.FIXED_CHILD)


def test_gillick_competence(setup_fixed_child, schools, sessions_page, children):
    child = children[Programme.HPV][0]
    school = schools[Programme.HPV][0]

    sessions_page.click_session_for_programme_group(school, Programme.HPV)
    sessions_page.navigate_to_gillick_competence(child, Programme.HPV)

    sessions_page.add_gillick_competence(
        is_competent=True, competence_details="Gillick competent"
    )
    sessions_page.click_edit_gillick_competence()
    sessions_page.edit_gillick_competence(
        is_competent=False, competence_details="Not Gillick competent"
    )


@issue("MAV-955")
def test_gillick_competence_notes(setup_fixed_child, schools, sessions_page, children):
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
    setup_fixed_child, sessions_page, schools, consent_page, children
):
    child = children[Programme.HPV][0]
    school = schools[Programme.HPV][0]

    sessions_page.click_session_for_programme_group(school, Programme.HPV)
    sessions_page.click_consent_tab()
    sessions_page.select_no_response()
    sessions_page.navigate_to_consent_response(child, Programme.HPV)
    consent_page.parent_verbal_no_response(child.parents[0])
    sessions_page.select_no_response()

    sessions_page.navigate_to_consent_response(child, Programme.HPV)
    consent_page.parent_verbal_refuse_consent(child.parents[1])

    sessions_page.select_consent_refused()
    sessions_page.click_child(child)
    sessions_page.click_programme_tab(Programme.HPV)
    sessions_page.invalidate_parent_refusal(child.parents[1])
    sessions_page.click_session_activity_and_notes()

    sessions_page.expect_main_to_contain_text(
        f"Consent from {child.parents[1].full_name} invalidated"
    )
    sessions_page.expect_main_to_contain_text(
        f"Consent refused by {child.parents[1].name_and_relationship}"
    )
    sessions_page.expect_main_to_contain_text(
        f"Consent not_provided by {child.parents[0].name_and_relationship}"
    )


@pytest.mark.bug
def test_parent_provides_consent_twice(
    setup_fixed_child, sessions_page, schools, consent_page, children
):
    child = children[Programme.HPV][0]
    school = schools[Programme.HPV][0]

    sessions_page.click_session_for_programme_group(school, Programme.HPV)
    sessions_page.click_consent_tab()
    sessions_page.select_no_response()

    sessions_page.navigate_to_consent_response(child, Programme.HPV)
    consent_page.parent_written_positive(child.parents[0])
    sessions_page.select_consent_given()

    sessions_page.navigate_to_update_triage_outcome(child, Programme.HPV)
    consent_page.update_triage_outcome_positive()

    sessions_page.click_get_verbal_consent()
    consent_page.parent_verbal_refuse_consent(child.parents[0])
    sessions_page.select_consent_refused()

    sessions_page.click_child(child)
    sessions_page.click_programme_tab(Programme.HPV)
    sessions_page.expect_main_to_contain_text(
        f"{child.parents[0].relationship} refused to give consent."
    )
    sessions_page.click_session_activity_and_notes()
    sessions_page.expect_main_to_contain_text(
        f"Consent refused by {child.parents[0].name_and_relationship}"
    )
    sessions_page.expect_main_to_contain_text("Triaged decision: Safe to vaccinate")
    sessions_page.expect_main_to_contain_text(
        f"Consent given by {child.parents[0].name_and_relationship}"
    )


@pytest.mark.bug
def test_conflicting_consent_with_gillick_consent(
    setup_fixed_child, sessions_page, schools, consent_page, children
):
    child = children[Programme.HPV][0]
    school = schools[Programme.HPV][0]

    sessions_page.click_session_for_programme_group(school, Programme.HPV)
    sessions_page.click_consent_tab()
    sessions_page.select_no_response()
    sessions_page.navigate_to_consent_response(child, Programme.HPV)
    consent_page.parent_verbal_positive(parent=child.parents[0], change_phone=False)
    sessions_page.select_consent_given()

    sessions_page.navigate_to_consent_response(child, Programme.HPV)
    consent_page.parent_verbal_refuse_consent(child.parents[1])
    sessions_page.select_conflicting_consent()

    sessions_page.click_child(child)
    sessions_page.click_programme_tab(Programme.HPV)
    sessions_page.expect_main_to_contain_text("Conflicting consent")
    sessions_page.expect_main_to_contain_text(
        "You can only vaccinate if all respondents give consent."
    )
    sessions_page.click_assess_gillick_competence()
    sessions_page.add_gillick_competence(
        is_competent=True, competence_details="Gillick competent"
    )
    sessions_page.expect_main_to_contain_text("HPV: Safe to vaccinate")
    sessions_page.click_get_verbal_consent()
    consent_page.child_consent_verbal_positive()
    sessions_page.expect_main_to_contain_text(f"Consent recorded for {str(child)}")
    sessions_page.select_consent_given()
    sessions_page.click_child(child)
    sessions_page.click_programme_tab(Programme.HPV)
    sessions_page.expect_main_to_contain_text("HPV: Safe to vaccinate")
    sessions_page.expect_main_to_contain_text(
        f"NURSE, Nurse decided that {str(child)} is safe to vaccinate."
    )
    sessions_page.expect_main_to_contain_text("Consent given")
    sessions_page.click_session_activity_and_notes()
    sessions_page.expect_main_to_contain_text(
        f"Consent given by {str(child)} (Child (Gillick competent))"
    )
