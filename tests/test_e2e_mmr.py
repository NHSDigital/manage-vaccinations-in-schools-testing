import pytest

from mavis.test.constants import ConsentOption, Programme, Vaccine
from mavis.test.data_models import VaccinationRecord
from mavis.test.pages import (
    DashboardPage,
    OnlineConsentWizardPage,
    SessionsChildrenPage,
    SessionsOverviewPage,
    SessionsPatientPage,
    SessionsRecordVaccinationsPage,
    SessionsSearchPage,
    SessionsVaccinationWizardPage,
    StartPage,
)

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
    page,
    schools,
    children,
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

    OnlineConsentWizardPage(page).go_to_url(url_with_mmr_session_scheduled)
    StartPage(page).start()

    OnlineConsentWizardPage(page).fill_details(child, child.parents[0], schools)
    OnlineConsentWizardPage(page).agree_to_mmr_vaccination(ConsentOption.MMR_EITHER)
    OnlineConsentWizardPage(page).fill_address_details(*child.address)
    OnlineConsentWizardPage(page).answer_health_questions(
        number_of_health_questions,
        yes_to_health_questions=True,
    )
    OnlineConsentWizardPage(page).click_confirm()
    OnlineConsentWizardPage(page).check_final_consent_message(
        child,
        programmes=[Programme.MMR],
        yes_to_health_questions=True,
    )

    DashboardPage(page).navigate()
    DashboardPage(page).click_sessions()

    # Triage step added for MMR
    SessionsSearchPage(page).click_session_for_programme_group(
        schools[0], Programme.MMR
    )
    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_programme_tab(Programme.MMR)
    SessionsPatientPage(page).triage_mmr_patient(ConsentOption.MMR_EITHER)
    DashboardPage(page).navigate()
    DashboardPage(page).click_sessions()

    SessionsSearchPage(page).click_session_for_programme_group(
        schools[0], Programme.MMR
    )
    SessionsOverviewPage(page).click_set_session_in_progress_for_today()

    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).register_child_as_attending(child)
    SessionsChildrenPage(page).tabs.click_record_vaccinations_tab()
    SessionsRecordVaccinationsPage(page).search.search_and_click_child(child)

    vaccination_record = VaccinationRecord(child, Programme.MMR, mmr_batch_name)
    SessionsPatientPage(page).set_up_vaccination(vaccination_record)
    SessionsVaccinationWizardPage(page).record_vaccination(vaccination_record)


def test_verify_child_cannot_be_vaccinated_twice_for_mmr_on_same_day(
    url_with_mmr_session_scheduled,
    setup_session_for_mmr,
    page,
    schools,
    children,
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

    OnlineConsentWizardPage(page).go_to_url(url_with_mmr_session_scheduled)
    StartPage(page).start()

    OnlineConsentWizardPage(page).fill_details(child, child.parents[0], schools)
    OnlineConsentWizardPage(page).agree_to_mmr_vaccination(
        ConsentOption.MMR_WITHOUT_GELATINE
    )
    OnlineConsentWizardPage(page).fill_address_details(*child.address)
    OnlineConsentWizardPage(page).answer_health_questions(
        number_of_health_questions,
        yes_to_health_questions=False,
    )
    OnlineConsentWizardPage(page).click_confirm()
    OnlineConsentWizardPage(page).check_final_consent_message(
        child,
        programmes=[Programme.MMR],
        yes_to_health_questions=False,
    )

    DashboardPage(page).navigate()
    DashboardPage(page).click_sessions()

    # Dose 1 flow
    SessionsSearchPage(page).click_session_for_programme_group(
        schools[0], Programme.MMR
    )
    SessionsOverviewPage(page).click_set_session_in_progress_for_today()
    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).register_child_as_attending(child)
    SessionsChildrenPage(page).tabs.click_record_vaccinations_tab()
    SessionsRecordVaccinationsPage(page).search.search_and_click_child(child)

    vaccination_record = VaccinationRecord(child, Programme.MMR, mmr_batch_name)
    SessionsPatientPage(page).set_up_vaccination(vaccination_record)
    SessionsVaccinationWizardPage(page).record_vaccination(vaccination_record)

    # Attempt to record second dose on the same day
    SessionsPatientPage(page).header.click_mavis_header()
    DashboardPage(page).click_sessions()
    SessionsSearchPage(page).click_session_for_programme_group(
        schools[0], Programme.MMR
    )
    SessionsOverviewPage(page).tabs.click_record_vaccinations_tab()
    SessionsRecordVaccinationsPage(page).search.search_for_child_that_should_not_exist(
        child
    )


def test_recording_mmr_vaccination_e2e_with_imported_dose_one(
    url_with_mmr_session_scheduled,
    setup_session_for_mmr,
    page,
    schools,
    children,
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

    # Proceed with consent and vaccination process
    OnlineConsentWizardPage(page).go_to_url(url_with_mmr_session_scheduled)
    StartPage(page).start()

    OnlineConsentWizardPage(page).fill_details(child, child.parents[0], schools)
    OnlineConsentWizardPage(page).agree_to_mmr_vaccination(ConsentOption.MMR_EITHER)
    OnlineConsentWizardPage(page).fill_address_details(*child.address)
    OnlineConsentWizardPage(page).answer_health_questions(
        number_of_health_questions,
        yes_to_health_questions=True,
    )
    OnlineConsentWizardPage(page).click_confirm()
    OnlineConsentWizardPage(page).check_final_consent_message(
        child,
        programmes=[Programme.MMR],
        yes_to_health_questions=True,
    )

    DashboardPage(page).navigate()
    DashboardPage(page).click_sessions()

    # Triage step added for MMR
    SessionsSearchPage(page).click_session_for_programme_group(
        schools[0], Programme.MMR
    )
    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_programme_tab(Programme.MMR)
    SessionsPatientPage(page).triage_mmr_patient(ConsentOption.MMR_EITHER)
    SessionsPatientPage(page).header.click_mavis_header()
    DashboardPage(page).click_sessions()

    SessionsSearchPage(page).click_session_for_programme_group(
        schools[0], Programme.MMR
    )
    SessionsOverviewPage(page).click_set_session_in_progress_for_today()
    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).register_child_as_attending(child)
    SessionsChildrenPage(page).tabs.click_record_vaccinations_tab()
    SessionsRecordVaccinationsPage(page).search.search_and_click_child(child)

    vaccination_record = VaccinationRecord(child, Programme.MMR, mmr_batch_name)
    SessionsPatientPage(page).set_up_vaccination(vaccination_record)
    SessionsVaccinationWizardPage(page).record_vaccination(vaccination_record)
