import pytest
from playwright.sync_api import expect

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
    vaccine = (
        Vaccine.SEQUIRUS
        if consent_option is ConsentOption.INJECTION
        else Vaccine.FLUENZ
    )

    batch_names = setup_session_for_flu
    batch_name = batch_names[vaccine]

    OnlineConsentWizardPage(page).go_to_url(flu_consent_url)
    StartPage(page).start()

    OnlineConsentWizardPage(page).fill_details(child, child.parents[0], schools)
    OnlineConsentWizardPage(page).agree_to_flu_vaccination(
        consent_option=consent_option
    )
    OnlineConsentWizardPage(page).fill_address_details(*child.address)
    OnlineConsentWizardPage(page).answer_health_questions(
        len(Programme.health_questions(Programme.FLU, consent_option)),
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
    ChildrenSearchPage(page).search.search_and_click_child(child)
    ChildRecordPage(page).click_vaccination_details(schools[0])
    VaccinationRecordPage(page).click_edit_vaccination_record()
    EditVaccinationRecordPage(page).expect_text_to_not_be_visible(
        "Incorrect vaccine given"
    )

    SessionsChildrenPage(page).header.click_mavis_header()
    DashboardPage(page).click_sessions()
    SessionsSearchPage(page).click_session_for_programme_group(
        schools[0], Programme.FLU
    )
    SessionsOverviewPage(page).verify_offline_sheet_vaccination_row(
        vaccination_record,
        vaccine,
        nurse,
        schools[0],
    )


@issue("MAV-2976")
def test_cannot_mark_vaccinated_child_as_absent(
    flu_consent_url,
    setup_session_for_flu,
    page,
    schools,
    children,
    nurse,
    team,
):
    """
    Test: End-to-end test to verify that a child cannot be marked as absent
    after being vaccinated with flu.
    Steps:
    1. Setup: Log in as nurse, create session, import class list, and get batch name.
    2. Go to online consent URL and fill in child and parent details.
    3. Agree to flu vaccination, fill address, answer health questions, and confirm.
    4. Log in as nurse, navigate to session, set it in progress.
    5. Register child as attending the session.
    6. Record flu vaccination for the child.
    7. Attempt to mark the child as absent from the session.
    8. Verify that the system prevents marking a vaccinated child as absent.
    9. Check activity log tab for correct status entries.
    Verification:
    - Child cannot be marked as absent after vaccination.
    - Activity log shows correct status progression.
    """
    child = children[Programme.FLU][0]
    schools = schools[Programme.FLU]
    vaccine = Vaccine.FLUENZ
    consent_option = ConsentOption.NASAL_SPRAY

    batch_names = setup_session_for_flu
    batch_name = batch_names[vaccine]

    OnlineConsentWizardPage(page).go_to_url(flu_consent_url)
    StartPage(page).start()

    OnlineConsentWizardPage(page).fill_details(child, child.parents[0], schools)
    OnlineConsentWizardPage(page).agree_to_flu_vaccination(
        consent_option=consent_option
    )
    OnlineConsentWizardPage(page).fill_address_details(*child.address)
    OnlineConsentWizardPage(page).answer_health_questions(
        len(Programme.health_questions(Programme.FLU, consent_option)),
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

    SessionsPatientPage(page).header.click_mavis_header()
    DashboardPage(page).click_sessions()
    SessionsSearchPage(page).click_session_for_programme_group(
        schools[0], Programme.FLU
    )
    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).search.search_for(str(child))
    child_card = SessionsChildrenPage(page).search.get_patient_card_locator(child)
    expect(
        child_card.get_by_role("strong").filter(has_text="Vaccinated")
    ).to_be_visible()
    expect(child_card.get_by_role("button", name="Attending")).not_to_be_visible()
    SessionsChildrenPage(page).search.click_child(child)
    SessionsPatientPage(page).click_session_activity_and_notes()
    expect(
        SessionsPatientPage(page).page.get_by_text(f"Attended session at {schools[0]}")
    ).to_be_visible()
    expect(
        SessionsPatientPage(page).page.get_by_text(f"Vaccinated with {vaccine.name}")
    ).to_be_visible()
