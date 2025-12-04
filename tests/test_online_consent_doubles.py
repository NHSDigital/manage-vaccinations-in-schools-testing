import pytest

from mavis.test.constants import ConsentRefusalReason, Programme
from mavis.test.pages import (
    OnlineConsentWizardPage,
    StartPage,
)

pytestmark = pytest.mark.consent


@pytest.fixture
def url_with_session_scheduled(schedule_session_and_get_consent_url, schools):
    yield from schedule_session_and_get_consent_url(
        schools["doubles"][0],
        Programme.MENACWY,
        Programme.TD_IPV,
    )


@pytest.fixture
def start_consent_with_session_scheduled(url_with_session_scheduled, page):
    page.goto(url_with_session_scheduled)
    StartPage(page).start()


def test_consent_refused_for_doubles_vaccination(
    start_consent_with_session_scheduled,
    page,
    schools,
    children,
):
    """
    Test: Submit an online consent form refusing doubles vaccination and
       verify confirmation.
    Steps:
    1. Fill in child and parent details on the consent page.
    2. Select 'do not agree' to vaccination.
    3. Choose refusal reason and provide details.
    4. Submit the consent form.
    Verification:
    - Confirmation text indicates consent was refused for MenACWY and Td/IPV.
    """
    child = children["doubles"][0]
    schools = schools["doubles"]

    OnlineConsentWizardPage(page).fill_details(child, child.parents[0], schools)
    OnlineConsentWizardPage(page).dont_agree_to_vaccination()
    OnlineConsentWizardPage(page).select_consent_not_given_reason(
        reason=ConsentRefusalReason.VACCINE_ALREADY_RECEIVED,
        details="Vaccine already received in previous school",
    )
    OnlineConsentWizardPage(page).click_confirm()
    OnlineConsentWizardPage(page).expect_confirmation_text(
        f"Consent refusedYou’ve told us that you do not want"
        f" {child.first_name} {child.last_name} to get the MenACWY and Td/IPV"
        " vaccinations at school",
    )


@pytest.mark.parametrize(
    "programmes",
    [[Programme.MENACWY, Programme.TD_IPV], [Programme.MENACWY], [Programme.TD_IPV]],
    ids=lambda v: f"programmes: {v}",
)
@pytest.mark.parametrize(
    "yes_to_health_questions",
    [False, True],
    ids=lambda v: f"yes_to_health_questions: {v}",
)
def test_consent_given_for_doubles_vaccination(
    start_consent_with_session_scheduled,
    page,
    schools,
    programmes,
    yes_to_health_questions,
    children,
):
    """
    Test: Submit an online consent form giving consent for one or both
       doubles vaccinations and verify confirmation.
    Steps:
    1. Fill in child and parent details on the consent page, optionally changing school.
    2. Agree to one or both doubles vaccinations as specified by parameter.
    3. Fill in address details.
    4. Answer the required number of health questions, optionally marking one as 'yes'.
    5. If not both vaccines, select a reason for not giving consent to the other.
    6. Submit the consent form.
    Verification:
    - Confirmation message is shown for the correct child, vaccines,
       and health question status.
    """
    child = children["doubles"][0]
    schools = schools["doubles"]

    OnlineConsentWizardPage(page).fill_details(child, child.parents[0], schools)
    OnlineConsentWizardPage(page).agree_to_doubles_vaccinations(*programmes)
    OnlineConsentWizardPage(page).fill_address_details(*child.address)

    number_of_health_questions = OnlineConsentWizardPage(
        page
    ).get_number_of_health_questions_for_programmes(programmes)

    OnlineConsentWizardPage(page).answer_health_questions(
        number_of_health_questions,
        yes_to_health_questions=yes_to_health_questions,
    )

    if programmes != [Programme.MENACWY, Programme.TD_IPV]:
        OnlineConsentWizardPage(page).select_consent_not_given_reason(
            ConsentRefusalReason.PERSONAL_CHOICE,
        )

    OnlineConsentWizardPage(page).click_confirm()

    OnlineConsentWizardPage(page).check_final_consent_message(
        child,
        programmes=programmes,
        yes_to_health_questions=yes_to_health_questions,
    )
