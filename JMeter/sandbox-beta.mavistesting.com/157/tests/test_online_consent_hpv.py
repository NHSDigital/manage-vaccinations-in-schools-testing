import pytest

from mavis.test.models import ConsentRefusalReason, Programme

pytestmark = pytest.mark.consent


@pytest.fixture
def url_with_session_scheduled(schedule_session_and_get_consent_url, schools):
    yield from schedule_session_and_get_consent_url(
        schools[Programme.HPV.group][0],
        Programme.HPV,
    )


@pytest.fixture
def start_consent_with_session_scheduled(url_with_session_scheduled, page, start_page):
    page.goto(url_with_session_scheduled)
    start_page.start()


def test_consent_refused_for_hpv_vaccination(
    start_consent_with_session_scheduled, online_consent_page, schools, children
):
    """
    Test: Submit an online consent form refusing HPV vaccination and
       verify confirmation.
    Steps:
    1. Fill in child and parent details on the consent page.
    2. Select 'do not agree' to vaccination.
    3. Choose refusal reason and provide details.
    4. Submit the consent form.
    Verification:
    - Confirmation text indicates consent was refused for HPV vaccination.
    """
    child = children[Programme.HPV][0]
    schools = schools[Programme.HPV]

    online_consent_page.fill_details(child, child.parents[0], schools)
    online_consent_page.dont_agree_to_vaccination()
    online_consent_page.select_consent_not_given_reason(
        reason=ConsentRefusalReason.VACCINE_ALREADY_RECEIVED,
        details="Vaccine already received in previous school",
    )
    online_consent_page.click_confirm()
    online_consent_page.expect_confirmation_text(
        f"Consent refusedYou’ve told us that you do not want"
        f" {child.first_name} {child.last_name} to get the HPV vaccination at school"
    )


@pytest.mark.parametrize(
    "yes_to_health_questions",
    [False, True],
    ids=lambda v: f"yes_to_health_questions: {v}",
)
def test_consent_given_for_hpv_vaccination(
    start_consent_with_session_scheduled,
    online_consent_page,
    schools,
    yes_to_health_questions,
    children,
):
    """
    Test: Submit an online consent form giving consent for HPV vaccination and
       verify confirmation.
    Steps:
    1. Fill in child and parent details on the consent page, optionally changing school.
    2. Agree to HPV vaccination.
    3. Fill in address details.
    4. Answer the required number of health questions, optionally marking one as 'yes'.
    5. Submit the consent form.
    Verification:
    - Confirmation message is shown for the correct child, vaccine, and
      health question status.
    """
    child = children[Programme.HPV][0]
    schools = schools[Programme.HPV]
    number_of_health_questions = len(Programme.health_questions(Programme.HPV))

    online_consent_page.fill_details(child, child.parents[0], schools)
    online_consent_page.agree_to_hpv_vaccination()
    online_consent_page.fill_address_details(*child.address)
    online_consent_page.answer_health_questions(
        number_of_health_questions,
        yes_to_health_questions=yes_to_health_questions,
    )
    online_consent_page.click_confirm()
    online_consent_page.check_final_consent_message(
        child,
        programmes=[Programme.HPV],
        yes_to_health_questions=yes_to_health_questions,
    )
