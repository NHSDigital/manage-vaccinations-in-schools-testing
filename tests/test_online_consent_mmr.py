import pytest

from mavis.test.mavis_constants import ConsentOption, ConsentRefusalReason, Programme
from mavis.test.pages import (
    OnlineConsentWizardPage,
    StartPage,
)

pytestmark = pytest.mark.consent


@pytest.fixture
def url_with_mmr_session_scheduled(schedule_mmr_session_and_get_consent_url, schools):
    yield from schedule_mmr_session_and_get_consent_url(
        schools[Programme.MMR.group][0],
        Programme.MMR,
    )


@pytest.fixture
def start_consent_with_session_scheduled(
    url_with_mmr_session_scheduled,
    page,
):
    page.goto(url_with_mmr_session_scheduled)
    StartPage(page).start()


def test_consent_refused_for_mmr_vaccination(
    start_consent_with_session_scheduled, page, schools, children
):
    """
    Test: Submit an online consent form refusing MMR vaccination and
       verify confirmation.
    Steps:
    1. Fill in child and parent details on the consent page.
    2. Select 'do not agree' to vaccination.
    3. Choose refusal reason and provide details.
    4. Submit the consent form.
    Verification:
    - Confirmation text indicates consent was refused for MMR vaccination.
    """
    child = children[Programme.MMR][0]
    schools = schools[Programme.MMR]

    OnlineConsentWizardPage(page).fill_details(child, child.parents[0], schools)
    OnlineConsentWizardPage(page).dont_agree_to_vaccination()
    OnlineConsentWizardPage(page).select_consent_not_given_reason(
        reason=ConsentRefusalReason.VACCINE_ALREADY_RECEIVED,
        details="Vaccine already received in previous school",
    )
    OnlineConsentWizardPage(page).click_confirm()
    OnlineConsentWizardPage(page).expect_confirmation_text(
        f"Consent refusedYou’ve told us that you do not want"
        f" {child.first_name} {child.last_name} to get the MMR vaccination at school"
    )


@pytest.mark.parametrize(
    "yes_to_health_questions",
    [False, True],
    ids=lambda v: f"yes_to_health_questions: {v}",
)
@pytest.mark.parametrize(
    "consent_option",
    [ConsentOption.MMR_WITHOUT_GELATINE, ConsentOption.MMR_EITHER],
    ids=lambda v: f"consent_option: {v}",
)
def test_consent_given_for_mmr_vaccination(
    start_consent_with_session_scheduled,
    page,
    schools,
    yes_to_health_questions,
    consent_option,
    children,
):
    """
    Test: Submit an online consent form giving consent for MMR vaccination and
       verify confirmation.
    Steps:
    1. Fill in child and parent details on the consent page, optionally changing school.
    2. Agree to MMR vaccination.
    3. Fill in address details.
    4. Answer the required number of health questions, optionally marking one as 'yes'.
    5. Submit the consent form.
    Verification:
    - Confirmation message is shown for the correct child, vaccine, and
      health question status.
    """
    child = children[Programme.MMR][0]
    schools = schools[Programme.MMR]
    number_of_health_questions = len(
        Programme.health_questions(Programme.MMR, consent_option)
    )

    OnlineConsentWizardPage(page).fill_details(child, child.parents[0], schools)
    OnlineConsentWizardPage(page).agree_to_mmr_vaccination(consent_option)
    OnlineConsentWizardPage(page).fill_address_details(*child.address)
    OnlineConsentWizardPage(page).answer_health_questions(
        number_of_health_questions,
        yes_to_health_questions=yes_to_health_questions,
    )
    OnlineConsentWizardPage(page).click_confirm()
    OnlineConsentWizardPage(page).check_final_consent_message(
        child,
        programmes=[Programme.MMR],
        yes_to_health_questions=yes_to_health_questions,
    )
