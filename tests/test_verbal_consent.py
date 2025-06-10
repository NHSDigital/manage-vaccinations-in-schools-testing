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
def setup_gillick(setup_session_with_file_upload):
    yield from setup_session_with_file_upload(CohortsFileMapping.FULL_NAME)


@pytest.fixture
def setup_gillick_notes_length(setup_session_with_file_upload):
    yield from setup_session_with_file_upload(CohortsFileMapping.GILLICK_NOTES_LENGTH)


@pytest.fixture
def setup_mavis_1696(setup_session_with_file_upload):
    yield from setup_session_with_file_upload(CohortsFileMapping.CONFLICTING_CONSENT)


@pytest.fixture
def setup_mavis_1864(setup_session_with_file_upload):
    yield from setup_session_with_file_upload(CohortsFileMapping.CONSENT_TWICE)


@pytest.fixture
def setup_mavis_1818(setup_session_with_file_upload):
    yield from setup_session_with_file_upload(CohortsFileMapping.CONFLICTING_GILLICK)


def test_gillick_competence(setup_gillick, schools, sessions_page):
    full_name_child = "CLAST, CFirst"

    sessions_page.navigate_to_todays_sessions(schools[0])
    sessions_page.navigate_to_gillick_competence(full_name_child, Programme.HPV)

    sessions_page.add_gillick_competence(
        is_competent=True, competence_details="Gillick competent"
    )
    sessions_page.click_edit_gillick_competence()
    sessions_page.edit_gillick_competence(
        is_competent=False, competence_details="Not Gillick competent"
    )


@allure.issue("MAV-955")
def test_gillick_competence_notes(setup_gillick_notes_length, schools, sessions_page):
    gillick_competence_child = "GILLICK1, GILLICK1"

    sessions_page.navigate_to_todays_sessions(schools[0])
    sessions_page.navigate_to_gillick_competence(
        gillick_competence_child, Programme.HPV
    )

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
def test_invalid_consent(setup_mavis_1696, sessions_page, schools, consent_page):
    conflicting_consent_child = "CONFLICTINGCONSENT1, ConflictingConsent1"

    sessions_page.navigate_to_scheduled_sessions(schools[0])
    sessions_page.click_consent_tab()
    sessions_page.select_no_response()
    sessions_page.navigate_to_consent_response(conflicting_consent_child, Programme.HPV)
    consent_page.parent_1_verbal_no_response()
    sessions_page.select_no_response()

    sessions_page.navigate_to_consent_response(conflicting_consent_child, Programme.HPV)
    consent_page.parent_2_verbal_refuse_consent()

    sessions_page.click_child(conflicting_consent_child)
    sessions_page.click_programme_tab(Programme.HPV)
    sessions_page.invalidate_parent2_refusal()
    sessions_page.click_activity_log()
    # FIXME: Make the following generic
    sessions_page.expect_main_to_contain_text("Consent from Parent2 invalidated")
    sessions_page.expect_main_to_contain_text("Consent refused by Parent2 (Mum)")
    sessions_page.expect_main_to_contain_text("Consent not_provided by Parent1 (Dad)")


@allure.issue("MAVIS-1864")
@pytest.mark.bug
def test_parent_provides_consent_twice(
    setup_mavis_1864, sessions_page, schools, consent_page
):
    consent_twice_child = "TWICE1, Consent1"

    sessions_page.navigate_to_scheduled_sessions(schools[0])
    sessions_page.click_consent_tab()
    sessions_page.select_no_response()

    sessions_page.navigate_to_consent_response(consent_twice_child, Programme.HPV)
    consent_page.parent_1_written_positive()
    sessions_page.select_consent_given()

    sessions_page.navigate_to_update_triage_outcome(consent_twice_child, Programme.HPV)
    consent_page.update_triage_outcome_positive()

    sessions_page.click_consent_tab()
    sessions_page.navigate_to_consent_response(consent_twice_child, Programme.HPV)
    consent_page.parent_1_verbal_refuse_consent()
    sessions_page.select_consent_refused()

    sessions_page.click_child(consent_twice_child)
    sessions_page.click_programme_tab(Programme.HPV)
    sessions_page.expect_main_to_contain_text("Dad refused to give consent.")
    sessions_page.click_activity_log()
    sessions_page.expect_main_to_contain_text("Consent refused by Parent1 (Dad)")
    sessions_page.expect_main_to_contain_text("Triaged decision: Safe to vaccinate")
    sessions_page.expect_main_to_contain_text("Consent given by Parent1 (Dad)")


@allure.issue("MAVIS-1818")
@pytest.mark.bug
def test_conflicting_consent_with_gillick_consent(
    setup_mavis_1818, sessions_page, schools, consent_page
):
    conflicting_gillick_consent_child = "GILLICK1, Conflicting1"

    sessions_page.navigate_to_scheduled_sessions(schools[0])
    sessions_page.click_consent_tab()
    sessions_page.select_no_response()
    sessions_page.navigate_to_consent_response(
        conflicting_gillick_consent_child, Programme.HPV
    )
    consent_page.parent_1_verbal_positive(change_phone=False)
    sessions_page.select_consent_given()

    sessions_page.navigate_to_consent_response(
        conflicting_gillick_consent_child, Programme.HPV
    )
    consent_page.parent_2_verbal_refuse_consent()
    sessions_page.select_conflicting_consent()

    sessions_page.click_child(conflicting_gillick_consent_child)
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
    sessions_page.expect_main_to_contain_text(
        f"Consent recorded for {conflicting_gillick_consent_child}"
    )
    sessions_page.select_consent_given()
    sessions_page.click_child(conflicting_gillick_consent_child)
    sessions_page.click_programme_tab(Programme.HPV)
    sessions_page.expect_main_to_contain_text("HPV: Safe to vaccinate")
    sessions_page.expect_main_to_contain_text(
        f"NURSE, Nurse decided that {conflicting_gillick_consent_child} is safe to vaccinate."
    )
    sessions_page.expect_main_to_contain_text("Consent given")
    sessions_page.click_activity_log()
    sessions_page.expect_main_to_contain_text(
        f"Consent given by {conflicting_gillick_consent_child} (Child (Gillick competent))"
    )
