import allure
import pytest

from mavis.test.data import CohortsFileMapping
from mavis.test.models import Programme

pytestmark = pytest.mark.consent


@pytest.fixture
def setup_session_with_file_upload(
    log_in_as_nurse, schools, dashboard_page, sessions_page, import_records_page
):
    def _setup(class_list_file):
        try:
            dashboard_page.click_sessions()
            sessions_page.schedule_a_valid_session(schools[0], for_today=True)
            dashboard_page.click_mavis()
            dashboard_page.click_sessions()
            sessions_page.click_location(schools[0])
            sessions_page.navigate_to_class_list_import()
            import_records_page.upload_and_verify_output(class_list_file)
            dashboard_page.click_mavis()
            dashboard_page.click_sessions()
            yield
        finally:
            dashboard_page.click_mavis()
            dashboard_page.click_sessions()
            sessions_page.delete_all_sessions(schools[0])

    return _setup


@pytest.fixture
def setup_fixed_child(setup_session_with_file_upload):
    yield from setup_session_with_file_upload(CohortsFileMapping.FIXED_CHILD_YEAR_9)


def test_gillick_competence(setup_fixed_child, schools, sessions_page, children):
    child_name = str(children[0])

    sessions_page.navigate_to_todays_sessions(schools[0])
    sessions_page.navigate_to_gillick_competence(child_name, Programme.HPV)

    sessions_page.add_gillick_competence(
        is_competent=True, competence_details="Gillick competent"
    )
    sessions_page.click_edit_gillick_competence()
    sessions_page.edit_gillick_competence(
        is_competent=False, competence_details="Not Gillick competent"
    )


@allure.issue("MAV-955")
def test_gillick_competence_notes(setup_fixed_child, schools, sessions_page, children):
    child_name = str(children[0])

    sessions_page.navigate_to_todays_sessions(schools[0])
    sessions_page.navigate_to_gillick_competence(child_name, Programme.HPV)

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


@allure.issue("MAVIS-1696")
@pytest.mark.bug
def test_invalid_consent(
    setup_fixed_child, sessions_page, schools, consent_page, children
):
    child_name = str(children[0])

    sessions_page.navigate_to_scheduled_sessions(schools[0])
    sessions_page.click_consent_tab()
    sessions_page.select_no_response()
    sessions_page.navigate_to_consent_response(child_name, Programme.HPV)
    consent_page.parent_verbal_no_response(children[0].parents[0])
    sessions_page.select_no_response()

    sessions_page.navigate_to_consent_response(child_name, Programme.HPV)
    consent_page.parent_verbal_refuse_consent(children[0].parents[1])

    sessions_page.click_child(child_name)
    sessions_page.click_programme_tab(Programme.HPV)
    sessions_page.invalidate_parent_refusal(children[0].parents[1])
    sessions_page.click_session_activity_and_notes()

    sessions_page.expect_main_to_contain_text(
        f"Consent from {children[0].parents[1].full_name} invalidated"
    )
    sessions_page.expect_main_to_contain_text(
        f"Consent refused by {children[0].parents[1].name_and_relationship}"
    )
    sessions_page.expect_main_to_contain_text(
        f"Consent not_provided by {children[0].parents[0].name_and_relationship}"
    )


@allure.issue("MAVIS-1864")
@pytest.mark.bug
def test_parent_provides_consent_twice(
    setup_fixed_child, sessions_page, schools, consent_page, children
):
    child_name = str(children[0])

    sessions_page.navigate_to_scheduled_sessions(schools[0])
    sessions_page.click_consent_tab()
    sessions_page.select_no_response()

    sessions_page.navigate_to_consent_response(child_name, Programme.HPV)
    consent_page.parent_written_positive(children[0].parents[0])
    sessions_page.select_consent_given()

    sessions_page.navigate_to_update_triage_outcome(child_name, Programme.HPV)
    consent_page.update_triage_outcome_positive()

    sessions_page.click_get_verbal_consent()
    consent_page.parent_verbal_refuse_consent(children[0].parents[0])
    sessions_page.select_consent_refused()

    sessions_page.click_child(child_name)
    sessions_page.click_programme_tab(Programme.HPV)
    sessions_page.expect_main_to_contain_text(
        f"{children[0].parents[0].relationship} refused to give consent."
    )
    sessions_page.click_session_activity_and_notes()
    sessions_page.expect_main_to_contain_text(
        f"Consent refused by {children[0].parents[0].name_and_relationship}"
    )
    sessions_page.expect_main_to_contain_text("Triaged decision: Safe to vaccinate")
    sessions_page.expect_main_to_contain_text(
        f"Consent given by {children[0].parents[0].name_and_relationship}"
    )


@allure.issue("MAVIS-1818")
@pytest.mark.bug
def test_conflicting_consent_with_gillick_consent(
    setup_fixed_child, sessions_page, schools, consent_page, children
):
    child_name = str(children[0])

    sessions_page.navigate_to_scheduled_sessions(schools[0])
    sessions_page.click_consent_tab()
    sessions_page.select_no_response()
    sessions_page.navigate_to_consent_response(child_name, Programme.HPV)
    consent_page.parent_verbal_positive(
        parent=children[0].parents[0], change_phone=False
    )
    sessions_page.select_consent_given()

    sessions_page.navigate_to_consent_response(child_name, Programme.HPV)
    consent_page.parent_verbal_refuse_consent(children[0].parents[1])
    sessions_page.select_conflicting_consent()

    sessions_page.click_child(child_name)
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
    sessions_page.expect_main_to_contain_text(f"Consent recorded for {child_name}")
    sessions_page.select_consent_given()
    sessions_page.click_child(child_name)
    sessions_page.click_programme_tab(Programme.HPV)
    sessions_page.expect_main_to_contain_text("HPV: Safe to vaccinate")
    sessions_page.expect_main_to_contain_text(
        f"NURSE, Nurse decided that {child_name} is safe to vaccinate."
    )
    sessions_page.expect_main_to_contain_text("Consent given")
    sessions_page.click_session_activity_and_notes()
    sessions_page.expect_main_to_contain_text(
        f"Consent given by {child_name} (Child (Gillick competent))"
    )
