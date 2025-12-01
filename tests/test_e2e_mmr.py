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


def test_recording_mmr_vaccination_e2e_with_triage(
    url_with_mmr_session_scheduled,
    setup_session_for_mmr,
    online_consent_wizard_page,
    sessions_search_page,
    sessions_overview_page,
    sessions_register_page,
    sessions_children_page,
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
    Test: End-to-end test for recording an MMR vaccination for a child.
    Steps:
    1. Setup: Log in as nurse, create session, import class list, and get batch name.
    2. Go to online consent URL and fill in child and parent details.
    3. Agree to MMR vaccination, fill address, answer health questions, and confirm.
    4. Log in as nurse, navigate to session, set session in progress,
       register child as attending, triage (set as safe to vaccinate).
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

    online_consent_wizard_page.go_to_url(url_with_mmr_session_scheduled)
    start_page.start()

    online_consent_wizard_page.fill_details(child, child.parents[0], schools)
    online_consent_wizard_page.agree_to_mmr_vaccination(ConsentOption.MMR_EITHER)
    online_consent_wizard_page.fill_address_details(*child.address)
    online_consent_wizard_page.answer_health_questions(
        number_of_health_questions,
        yes_to_health_questions=True,
    )
    online_consent_wizard_page.click_confirm()
    online_consent_wizard_page.check_final_consent_message(
        child,
        programmes=[Programme.MMR],
        yes_to_health_questions=True,
    )

    log_in_page.navigate()
    log_in_page.log_in_and_choose_team_if_necessary(nurse, team)
    dashboard_page.click_sessions()

    # Triage step added for MMR
    sessions_search_page.click_session_for_programme_group(schools[0], Programme.MMR)
    sessions_overview_page.tabs.click_children_tab()
    sessions_children_page.search.search_and_click_child(child)
    sessions_patient_page.click_programme_tab(Programme.MMR)
    sessions_patient_page.triage_mmr_patient(ConsentOption.MMR_EITHER)
    dashboard_page.navigate()
    dashboard_page.click_sessions()

    sessions_search_page.click_session_for_programme_group(schools[0], Programme.MMR)
    sessions_overview_page.click_set_session_in_progress_for_today()

    sessions_overview_page.tabs.click_register_tab()
    sessions_register_page.register_child_as_attending(str(child))
    sessions_register_page.tabs.click_record_vaccinations_tab()
    sessions_record_vaccinations_page.search.search_and_click_child(child)

    vaccination_record = VaccinationRecord(child, Programme.MMR, mmr_batch_name)
    sessions_patient_page.set_up_vaccination(vaccination_record)
    sessions_vaccination_wizard_page.record_vaccination(vaccination_record)

    dashboard_page.navigate()
    log_in_page.log_out()


def test_verify_child_cannot_be_vaccinated_twice_for_mmr_on_same_day(
    url_with_mmr_session_scheduled,
    setup_session_for_mmr,
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
    Test: End-to-end test for recording an MMR vaccination for a child.
    Steps:
    1. Setup: Log in as nurse, create session, import class list, and get batch name.
    2. Go to online consent URL and fill in child and parent details.
    3. Agree to MMR vaccination, fill address, answer health questions, and confirm.
    4. Log in as nurse, navigate to session, set session in progress,
       register child as attending.
    5. Record MMR vaccination for the child.
    6. Attempt to record second dose on the same day and verify child cannot be found.
    Verification:
    - Final consent message is shown after online consent.
    - Vaccination is recorded for the child in the session on the first attempt.
    - Child cannot be found when attempting to record a second dose on the same day.
    """
    child = children[Programme.MMR][0]
    schools = schools[Programme.MMR]
    mmr_batch_name = setup_session_for_mmr[Vaccine.PRIORIX]
    number_of_health_questions = len(
        Programme.health_questions(Programme.MMR, ConsentOption.MMR_WITHOUT_GELATINE)
    )

    online_consent_wizard_page.go_to_url(url_with_mmr_session_scheduled)
    start_page.start()

    online_consent_wizard_page.fill_details(child, child.parents[0], schools)
    online_consent_wizard_page.agree_to_mmr_vaccination(
        ConsentOption.MMR_WITHOUT_GELATINE
    )
    online_consent_wizard_page.fill_address_details(*child.address)
    online_consent_wizard_page.answer_health_questions(
        number_of_health_questions,
        yes_to_health_questions=False,
    )
    online_consent_wizard_page.click_confirm()
    online_consent_wizard_page.check_final_consent_message(
        child,
        programmes=[Programme.MMR],
        yes_to_health_questions=False,
    )

    log_in_page.navigate()
    log_in_page.log_in_and_choose_team_if_necessary(nurse, team)
    dashboard_page.click_sessions()

    # Dose 1 flow
    sessions_search_page.click_session_for_programme_group(schools[0], Programme.MMR)
    sessions_overview_page.click_set_session_in_progress_for_today()
    sessions_overview_page.tabs.click_register_tab()
    sessions_register_page.register_child_as_attending(str(child))
    sessions_register_page.tabs.click_record_vaccinations_tab()
    sessions_record_vaccinations_page.search.search_and_click_child(child)

    vaccination_record = VaccinationRecord(child, Programme.MMR, mmr_batch_name)
    sessions_patient_page.set_up_vaccination(vaccination_record)
    sessions_vaccination_wizard_page.record_vaccination(vaccination_record)

    # Attempt to record second dose on the same day
    sessions_patient_page.header.click_sessions_header()
    sessions_search_page.click_session_for_programme_group(schools[0], Programme.MMR)
    sessions_overview_page.tabs.click_record_vaccinations_tab()
    sessions_record_vaccinations_page.search.search_for_child_that_should_not_exist(
        child
    )

    dashboard_page.navigate()
    log_in_page.log_out()


def test_recording_mmr_vaccination_e2e_with_imported_dose_one(
    url_with_mmr_session_scheduled,
    setup_session_for_mmr,
    online_consent_wizard_page,
    sessions_search_page,
    sessions_overview_page,
    sessions_register_page,
    sessions_children_page,
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
    upload_offline_vaccination,
):
    """
    Test: End-to-end test for recording a second MMR vaccination for a child with a
    previously imported dose 1.
    Steps:
    1. Import a historical vaccination file containing MMR dose 1 for the child.
    2. Setup: Log in as nurse, create session, create batch and import child again.
    3. Go to online consent URL and fill in child and parent details.
    4. Consent to MMR vaccination, fill address, answer health questions, and confirm.
    5. Log in as nurse, navigate to session, set session in progress,
       register child as attending, triage (set as safe to vaccinate).
    6. Record MMR vaccination for the child (dose 2).
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

    # Import vaccination file with MMR dose 1
    list(upload_offline_vaccination(Programme.MMR))
    log_in_page.log_out()

    # Proceed with consent and vaccination process
    online_consent_wizard_page.go_to_url(url_with_mmr_session_scheduled)
    start_page.start()

    online_consent_wizard_page.fill_details(child, child.parents[0], schools)
    online_consent_wizard_page.agree_to_mmr_vaccination(ConsentOption.MMR_EITHER)
    online_consent_wizard_page.fill_address_details(*child.address)
    online_consent_wizard_page.answer_health_questions(
        number_of_health_questions,
        yes_to_health_questions=True,
    )
    online_consent_wizard_page.click_confirm()
    online_consent_wizard_page.check_final_consent_message(
        child,
        programmes=[Programme.MMR],
        yes_to_health_questions=True,
    )

    log_in_page.navigate()
    log_in_page.log_in_and_choose_team_if_necessary(nurse, team)
    dashboard_page.click_sessions()

    # Triage step added for MMR
    sessions_search_page.click_session_for_programme_group(schools[0], Programme.MMR)
    sessions_overview_page.tabs.click_children_tab()
    sessions_children_page.search.search_and_click_child(child)
    sessions_patient_page.click_programme_tab(Programme.MMR)
    sessions_patient_page.triage_mmr_patient(ConsentOption.MMR_EITHER)
    sessions_patient_page.header.click_sessions_header()

    sessions_search_page.click_session_for_programme_group(schools[0], Programme.MMR)
    sessions_overview_page.click_set_session_in_progress_for_today()
    sessions_overview_page.tabs.click_register_tab()
    sessions_register_page.register_child_as_attending(str(child))
    sessions_register_page.tabs.click_record_vaccinations_tab()
    sessions_record_vaccinations_page.search.search_and_click_child(child)

    vaccination_record = VaccinationRecord(child, Programme.MMR, mmr_batch_name)
    sessions_patient_page.set_up_vaccination(vaccination_record)
    sessions_vaccination_wizard_page.record_vaccination(vaccination_record)

    dashboard_page.navigate()
    log_in_page.log_out()
