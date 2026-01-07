import pytest

from mavis.test.constants import Programme, Vaccine
from mavis.test.data_models import VaccinationRecord
from mavis.test.pages import (
    DashboardPage,
    LogInPage,
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
    page,
    schools,
    children,
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

    number_of_health_questions = OnlineConsentWizardPage(
        page
    ).get_number_of_health_questions_for_programmes(
        [Programme.MENACWY, Programme.TD_IPV],
    )

    OnlineConsentWizardPage(page).go_to_url(doubles_consent_url)
    StartPage(page).start()

    OnlineConsentWizardPage(page).fill_details(child, child.parents[0], schools)
    OnlineConsentWizardPage(page).agree_to_doubles_vaccinations(
        Programme.MENACWY,
        Programme.TD_IPV,
    )
    OnlineConsentWizardPage(page).fill_address_details(*child.address)
    OnlineConsentWizardPage(page).answer_health_questions(
        number_of_health_questions,
        yes_to_health_questions=False,
    )
    OnlineConsentWizardPage(page).click_confirm()
    OnlineConsentWizardPage(page).check_final_consent_message(
        child,
        programmes=[Programme.MENACWY, Programme.TD_IPV],
        yes_to_health_questions=False,
    )

    LogInPage(page).navigate()
    LogInPage(page).log_in_and_choose_team_if_necessary(nurse, team)
    DashboardPage(page).click_sessions()

    SessionsSearchPage(page).click_session_for_programme_group(schools[0], "doubles")
    SessionsOverviewPage(page).click_set_session_in_progress_for_today()
    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).register_child_as_attending(child)
    SessionsChildrenPage(page).tabs.click_record_vaccinations_tab()
    SessionsRecordVaccinationsPage(page).search.search_and_click_child(child)

    menacwy_vaccination_record = VaccinationRecord(
        child, Programme.MENACWY, menquadfi_batch_name
    )
    SessionsPatientPage(page).set_up_vaccination(menacwy_vaccination_record)
    SessionsVaccinationWizardPage(page).record_vaccination(menacwy_vaccination_record)

    td_ipv_vaccination_record = VaccinationRecord(
        child, Programme.TD_IPV, revaxis_batch_name
    )
    SessionsPatientPage(page).set_up_vaccination(td_ipv_vaccination_record)
    SessionsVaccinationWizardPage(page).record_vaccination(td_ipv_vaccination_record)

    SessionsChildrenPage(page).header.click_mavis_header()
    DashboardPage(page).click_sessions()
    SessionsSearchPage(page).click_session_for_programme_group(schools[0], "doubles")
    SessionsOverviewPage(page).verify_offline_sheet_vaccination_row(
        menacwy_vaccination_record,
        Vaccine.MENQUADFI,
        nurse,
        schools[0],
    )
    SessionsOverviewPage(page).verify_offline_sheet_vaccination_row(
        td_ipv_vaccination_record,
        Vaccine.REVAXIS,
        nurse,
        schools[0],
    )
