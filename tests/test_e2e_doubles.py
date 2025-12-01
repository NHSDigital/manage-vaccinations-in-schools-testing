import pytest

from mavis.test.models import Programme, VaccinationRecord, Vaccine

pytestmark = pytest.mark.e2e


@pytest.fixture
def doubles_consent_url(schedule_session_and_get_consent_url, schools):
    yield from schedule_session_and_get_consent_url(
        schools["doubles"][0],
        Programme.MENACWY,
        Programme.TD_IPV,
    )


@pytest.fixture
def setup_session_for_doubles(setup_session_and_batches_with_fixed_child):
    return setup_session_and_batches_with_fixed_child("doubles")


def test_recording_doubles_vaccination_e2e(
    doubles_consent_url,
    setup_session_for_doubles,
    online_consent_wizard_page,
    sessions_search_page,
    sessions_overview_page,
    sessions_register_page,
    sessions_record_vaccinations_page,
    sessions_patient_page,
    sessions_vaccination_wizard_page,
    start_page,
    schools,
    children,
    dashboard_page,
    log_in_page,
    nurse,
    team,
):
    """
    Test: End-to-end test for recording MenACWY and Td/IPV ("doubles") vaccinations
    Steps:
    1. Setup: Log in as nurse, create session, import class list, and get batch names.
    2. Go to online consent URL and fill in child and parent details.
    3. Agree to both MenACWY and Td/IPV vaccinations, fill address,
       answer health questions
    4. Log in as nurse, navigate to session, set session in progress,
       register child as attending.
    5. Record MenACWY and Td/IPV vaccinations for the child.
    Verification:
    - Final consent message is shown after online consent.
    - Both vaccinations are recorded for the child in the session.
    """
    child = children["doubles"][0]
    schools = schools["doubles"]
    menquadfi_batch_name = setup_session_for_doubles[Vaccine.MENQUADFI]
    revaxis_batch_name = setup_session_for_doubles[Vaccine.REVAXIS]

    number_of_health_questions = (
        online_consent_wizard_page.get_number_of_health_questions_for_programmes(
            [Programme.MENACWY, Programme.TD_IPV],
        )
    )

    online_consent_wizard_page.go_to_url(doubles_consent_url)
    start_page.start()

    online_consent_wizard_page.fill_details(child, child.parents[0], schools)
    online_consent_wizard_page.agree_to_doubles_vaccinations(
        Programme.MENACWY,
        Programme.TD_IPV,
    )
    online_consent_wizard_page.fill_address_details(*child.address)
    online_consent_wizard_page.answer_health_questions(
        number_of_health_questions,
        yes_to_health_questions=False,
    )
    online_consent_wizard_page.click_confirm()
    online_consent_wizard_page.check_final_consent_message(
        child,
        programmes=[Programme.MENACWY, Programme.TD_IPV],
        yes_to_health_questions=False,
    )

    log_in_page.navigate()
    log_in_page.log_in_and_choose_team_if_necessary(nurse, team)
    dashboard_page.click_sessions()

    sessions_search_page.click_session_for_programme_group(schools[0], "doubles")
    sessions_overview_page.click_set_session_in_progress_for_today()
    sessions_overview_page.tabs.click_register_tab()
    sessions_register_page.register_child_as_attending(str(child))
    sessions_register_page.tabs.click_record_vaccinations_tab()
    sessions_record_vaccinations_page.search.search_and_click_child(child)

    vaccination_record = VaccinationRecord(
        child, Programme.MENACWY, menquadfi_batch_name
    )
    sessions_patient_page.set_up_vaccination(vaccination_record)
    sessions_vaccination_wizard_page.record_vaccination(vaccination_record)

    vaccination_record = VaccinationRecord(child, Programme.TD_IPV, revaxis_batch_name)
    sessions_patient_page.set_up_vaccination(vaccination_record)
    sessions_vaccination_wizard_page.record_vaccination(vaccination_record)

    dashboard_page.navigate()
    log_in_page.log_out()
