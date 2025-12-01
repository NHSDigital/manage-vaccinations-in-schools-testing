import pytest

from mavis.test.models import Programme, VaccinationRecord, Vaccine

pytestmark = pytest.mark.e2e


@pytest.fixture
def hpv_consent_url(schedule_session_and_get_consent_url, schools):
    yield from schedule_session_and_get_consent_url(
        schools[Programme.HPV][0], Programme.HPV
    )


@pytest.fixture
def setup_session_for_hpv(setup_session_and_batches_with_fixed_child):
    return setup_session_and_batches_with_fixed_child(Programme.HPV)


def test_recording_hpv_vaccination_e2e(
    hpv_consent_url,
    setup_session_for_hpv,
    online_consent_wizard_page,
    sessions_search_page,
    sessions_overview_page,
    sessions_register_page,
    sessions_patient_page,
    sessions_vaccination_wizard_page,
    sessions_record_vaccinations_page,
    start_page,
    schools,
    children,
    dashboard_page,
    log_in_page,
    nurse,
    team,
):
    """
    Test: End-to-end test for recording an HPV vaccination for a child.
    Steps:
    1. Setup: Log in as nurse, create session, import class list, and get batch name.
    2. Go to online consent URL and fill in child and parent details.
    3. Agree to HPV vaccination, fill address, answer health questions, and confirm.
    4. Log in as nurse, navigate to session, set session in progress,
       register child as attending.
    5. Record HPV vaccination for the child.
    Verification:
    - Final consent message is shown after online consent.
    - Vaccination is recorded for the child in the session.
    """
    child = children[Programme.HPV][0]
    schools = schools[Programme.HPV]
    gardasil_9_batch_name = setup_session_for_hpv[Vaccine.GARDASIL_9]
    number_of_health_questions = len(Programme.health_questions(Programme.HPV))

    online_consent_wizard_page.go_to_url(hpv_consent_url)
    start_page.start()

    online_consent_wizard_page.fill_details(child, child.parents[0], schools)
    online_consent_wizard_page.agree_to_hpv_vaccination()
    online_consent_wizard_page.fill_address_details(*child.address)
    online_consent_wizard_page.answer_health_questions(
        number_of_health_questions,
        yes_to_health_questions=False,
    )
    online_consent_wizard_page.click_confirm()
    online_consent_wizard_page.check_final_consent_message(
        child,
        programmes=[Programme.HPV],
        yes_to_health_questions=False,
    )

    log_in_page.navigate()
    log_in_page.log_in_and_choose_team_if_necessary(nurse, team)
    dashboard_page.click_sessions()

    sessions_search_page.click_session_for_programme_group(schools[0], Programme.HPV)
    sessions_overview_page.click_set_session_in_progress_for_today()
    sessions_overview_page.tabs.click_register_tab()
    sessions_register_page.register_child_as_attending(str(child))
    sessions_register_page.tabs.click_record_vaccinations_tab()
    sessions_record_vaccinations_page.search.search_and_click_child(child)

    vaccination_record = VaccinationRecord(child, Programme.HPV, gardasil_9_batch_name)
    sessions_patient_page.set_up_vaccination(vaccination_record)
    sessions_vaccination_wizard_page.record_vaccination(vaccination_record)

    dashboard_page.navigate()
    log_in_page.log_out()
