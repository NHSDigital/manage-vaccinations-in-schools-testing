import pytest

from mavis.test.annotations import issue
from mavis.test.constants import ConsentOption, Programme, Vaccine
from mavis.test.data_models import VaccinationRecord
from mavis.test.pages import (
    ChildRecordPage,
    ChildrenSearchPage,
    DashboardPage,
    EditVaccinationRecordPage,
    LogInPage,
    OnlineConsentWizardPage,
    SessionsChildrenPage,
    SessionsOverviewPage,
    SessionsPatientPage,
    SessionsRecordVaccinationsPage,
    SessionsSearchPage,
    SessionsVaccinationWizardPage,
    StartPage,
    VaccinationRecordPage,
)

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
    page,
    schools,
    children,
    nurse,
    team,
    consent_option,
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

    OnlineConsentWizardPage(page).go_to_url(flu_consent_url)
    StartPage(page).start()

    OnlineConsentWizardPage(page).fill_details(child, child.parents[0], schools)
    OnlineConsentWizardPage(page).agree_to_flu_vaccination(
        consent_option=consent_option
    )
    OnlineConsentWizardPage(page).fill_address_details(*child.address)
    OnlineConsentWizardPage(page).answer_health_questions(
        OnlineConsentWizardPage(page).get_number_of_health_questions_for_flu(
            consent_option
        ),
        yes_to_health_questions=False,
    )
    OnlineConsentWizardPage(page).click_confirm()
    OnlineConsentWizardPage(page).check_final_consent_message(
        child,
        programmes=[Programme.FLU],
        yes_to_health_questions=False,
        consent_option=consent_option,
    )

    LogInPage(page).navigate()
    LogInPage(page).log_in_and_choose_team_if_necessary(nurse, team)
    DashboardPage(page).click_sessions()

    SessionsSearchPage(page).click_session_for_programme_group(
        schools[0], Programme.FLU
    )
    SessionsOverviewPage(page).click_set_session_in_progress_for_today()
    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).register_child_as_attending(child)
    SessionsChildrenPage(page).tabs.click_record_vaccinations_tab()
    SessionsRecordVaccinationsPage(page).search.search_and_click_child(child)

    vaccination_record = VaccinationRecord(
        child, Programme.FLU, batch_name, consent_option
    )
    SessionsPatientPage(page).set_up_vaccination(vaccination_record)
    SessionsVaccinationWizardPage(page).record_vaccination(vaccination_record)

    # MAV-1831
    SessionsPatientPage(page).header.click_mavis_header()
    DashboardPage(page).click_children()
    ChildrenSearchPage(page).search_for_a_child_name(str(child))
    ChildrenSearchPage(page).click_record_for_child(child)
    ChildRecordPage(page).click_vaccination_details(schools[0])
    VaccinationRecordPage(page).click_edit_vaccination_record()
    EditVaccinationRecordPage(page).expect_text_to_not_be_visible(
        "Incorrect vaccine given"
    )

    DashboardPage(page).navigate()
    LogInPage(page).log_out()
