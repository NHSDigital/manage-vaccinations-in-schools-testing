import pytest

from mavis.test.models import ConsentOption, Programme, VaccinationRecord, Vaccine

pytestmark = pytest.mark.e2e


@pytest.fixture
def url_with_mmr_session_scheduled(schedule_mmr_session_and_get_consent_url, schools):
    yield from schedule_mmr_session_and_get_consent_url(
        schools[Programme.MMR.group][0],
        Programme.MMR,
    )


@pytest.fixture
def setup_session_for_mmr(setup_session_and_batches_with_fixed_child):
    return setup_session_and_batches_with_fixed_child(Programme.MMR)


def test_recording_mmr_vaccination_e2e(
    url_with_mmr_session_scheduled,
    setup_session_for_mmr,
    online_consent_page,
    sessions_page,
    start_page,
    schools,
    children,
    dashboard_page,
    log_in_page,
    nurse,
    team,
):
    """
    Test: End-to-end test for recording an MMR vaccination for a child.
    Steps:
    1. Setup: Log in as nurse, create session, import class list, and get batch name.
    2. Go to online consent URL and fill in child and parent details.
    3. Agree to MMR vaccination, fill address, answer health questions, and confirm.
    4. Log in as nurse, navigate to session, set session in progress,
       register child as attending.
    5. Record MMR vaccination for the child.
    Verification:
    - Final consent message is shown after online consent.
    - Vaccination is recorded for the child in the session.
    """
    child = children[Programme.MMR][0]
    schools = schools[Programme.MMR]
    mmr_batch_name = setup_session_for_mmr[Vaccine.PRIORIX]
    number_of_health_questions = len(
        Programme.health_questions(Programme.MMR, ConsentOption.MMR_EITHER)
    )

    online_consent_page.go_to_url(url_with_mmr_session_scheduled)
    start_page.start()

    online_consent_page.fill_details(child, child.parents[0], schools)
    online_consent_page.agree_to_mmr_vaccination(ConsentOption.MMR_EITHER)
    online_consent_page.fill_address_details(*child.address)
    online_consent_page.answer_health_questions(
        number_of_health_questions,
        yes_to_health_questions=True,
    )
    online_consent_page.click_confirm()
    online_consent_page.check_final_consent_message(
        child,
        programmes=[Programme.MMR],
        yes_to_health_questions=True,
    )

    log_in_page.navigate()
    log_in_page.log_in_and_choose_team_if_necessary(nurse, team)
    dashboard_page.click_sessions()

    # Triage step added for MMR
    sessions_page.click_session_for_programme_group(schools[0], Programme.MMR)
    sessions_page.triage_mmr_patient(child, ConsentOption.MMR_EITHER)
    dashboard_page.navigate()
    dashboard_page.click_sessions()

    sessions_page.click_session_for_programme_group(schools[0], Programme.MMR)
    sessions_page.click_set_session_in_progress_for_today()
    sessions_page.register_child_as_attending(str(child))
    sessions_page.record_vaccination_for_child(
        VaccinationRecord(child, Programme.MMR, mmr_batch_name)
    )

    dashboard_page.navigate()
    log_in_page.log_out()
