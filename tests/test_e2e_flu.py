import pytest

from mavis.test.annotations import issue
from mavis.test.models import ConsentOption, Programme, VaccinationRecord, Vaccine

pytestmark = pytest.mark.e2e


@pytest.fixture
def flu_consent_url(schedule_session_and_get_consent_url, schools):
    yield from schedule_session_and_get_consent_url(
        schools[Programme.FLU][0], Programme.FLU
    )


@pytest.fixture
def setup_session_for_flu(setup_session_and_batches_with_fixed_child):
    return setup_session_and_batches_with_fixed_child(Programme.FLU)


@issue("MAV-1831")
@pytest.mark.parametrize(
    "consent_option",
    [
        ConsentOption.NASAL_SPRAY_OR_INJECTION,
        ConsentOption.NASAL_SPRAY,
        ConsentOption.INJECTION,
    ],
    ids=lambda v: f"consent_option: {v}",
)
def test_recording_flu_vaccination_e2e(
    flu_consent_url,
    setup_session_for_flu,
    online_consent_page,
    sessions_search_page,
    sessions_overview_page,
    sessions_register_page,
    sessions_patient_page,
    sessions_vaccination_wizard_page,
    sessions_record_vaccinations_page,
    children_search_page,
    child_record_page,
    vaccination_record_page,
    start_page,
    schools,
    children,
    dashboard_page,
    log_in_page,
    nurse,
    team,
    consent_option,
    edit_vaccination_record_page,
):
    """
    Test: End-to-end test for recording a flu vaccination for a child.
    Steps:
    1. Setup: Log in as nurse, create session, import class list, and get batch name.
    2. Go to online consent URL and fill in child and parent details.
    3. Agree to flu vaccination, fill address, answer health questions, and confirm.
    4. Log in as nurse, navigate to session, set session in progress,
       register child as attending.
    5. Record flu vaccination for the child.
    Verification:
    - Final consent message is shown after online consent.
    - Vaccination is recorded for the child in the session.
    """
    child = children[Programme.FLU][0]
    schools = schools[Programme.FLU]

    batch_names = setup_session_for_flu
    batch_name = (
        batch_names[Vaccine.SEQUIRUS]
        if consent_option is ConsentOption.INJECTION
        else batch_names[Vaccine.FLUENZ]
    )

    online_consent_page.go_to_url(flu_consent_url)
    start_page.start()

    online_consent_page.fill_details(child, child.parents[0], schools)
    online_consent_page.agree_to_flu_vaccination(consent_option=consent_option)
    online_consent_page.fill_address_details(*child.address)
    online_consent_page.answer_health_questions(
        online_consent_page.get_number_of_health_questions_for_flu(consent_option),
        yes_to_health_questions=False,
    )
    online_consent_page.click_confirm()
    online_consent_page.check_final_consent_message(
        child,
        programmes=[Programme.FLU],
        yes_to_health_questions=False,
        consent_option=consent_option,
    )

    log_in_page.navigate()
    log_in_page.log_in_and_choose_team_if_necessary(nurse, team)
    dashboard_page.click_sessions()

    sessions_search_page.click_session_for_programme_group(schools[0], Programme.FLU)
    sessions_overview_page.click_set_session_in_progress_for_today()
    sessions_overview_page.click_register_tab()
    sessions_register_page.register_child_as_attending(str(child))
    sessions_register_page.click_record_vaccinations_tab()
    sessions_record_vaccinations_page.search_child(child)

    vaccination_record = VaccinationRecord(
        child, Programme.FLU, batch_name, consent_option
    )
    sessions_patient_page.set_up_vaccination(vaccination_record)
    sessions_vaccination_wizard_page.record_vaccination(vaccination_record)

    # MAV-1831
    dashboard_page.navigate()
    dashboard_page.click_children()
    children_search_page.search_for_a_child_name(str(child))
    children_search_page.click_record_for_child(child)
    child_record_page.click_vaccination_details(schools[0])
    vaccination_record_page.click_edit_vaccination_record()
    edit_vaccination_record_page.expect_text_to_not_be_visible(
        "Incorrect vaccine given"
    )

    dashboard_page.navigate()
    log_in_page.log_out()
