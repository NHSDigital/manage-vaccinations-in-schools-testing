import pytest

from mavis.test.models import ConsentRefusalReason, Programme

pytestmark = pytest.mark.consent


@pytest.fixture
def url(get_online_consent_url, schools):
    yield from get_online_consent_url(
        schools["doubles"][0], Programme.MENACWY, Programme.TD_IPV
    )


@pytest.fixture(autouse=True)
def start_consent(url, page, start_page):
    page.goto(url)
    start_page.start()


def test_consent_refused_for_doubles_vaccination(
    online_consent_page, schools, children
):
    """
    Test: Submit an online consent form refusing doubles vaccination and verify confirmation.
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

    online_consent_page.fill_details(child, child.parents[0], schools)
    online_consent_page.dont_agree_to_vaccination()
    online_consent_page.select_consent_not_given_reason(
        reason=ConsentRefusalReason.VACCINE_ALREADY_RECEIVED,
        details="Vaccine already received in previous school",
    )
    online_consent_page.click_confirm()
    online_consent_page.expect_confirmation_text(
        f"Consent refusedYou’ve told us that you do not want {child.first_name} {child.last_name} to get the MenACWY and Td/IPV vaccinations at school"
    )


@pytest.mark.parametrize(
    "programmes",
    ([Programme.MENACWY, Programme.TD_IPV], [Programme.MENACWY], [Programme.TD_IPV]),
    ids=lambda v: f"programmes: {v}",
)
@pytest.mark.parametrize(
    "change_school", (False, True), ids=lambda v: f"change_school: {v}"
)
@pytest.mark.parametrize(
    "health_question", (False, True), ids=lambda v: f"health_question: {v}"
)
def test_consent_given_for_doubles_vaccination(
    online_consent_page,
    schools,
    programmes,
    change_school,
    health_question,
    children,
):
    """
    Test: Submit an online consent form giving consent for one or both doubles vaccinations and verify confirmation.
    Steps:
    1. Fill in child and parent details on the consent page, optionally changing school.
    2. Agree to one or both doubles vaccinations as specified by parameter.
    3. Fill in address details.
    4. Answer the required number of health questions, optionally marking one as 'yes'.
    5. If not both vaccines, select a reason for not giving consent to the other.
    6. Submit the consent form.
    Verification:
    - Confirmation message is shown for the correct child, vaccines, and health question status.
    """
    child = children["doubles"][0]
    schools = schools["doubles"]

    online_consent_page.fill_details(child, child.parents[0], schools, change_school)
    online_consent_page.agree_to_doubles_vaccinations(*programmes)
    online_consent_page.fill_address_details(*child.address)

    number_of_health_questions = (
        online_consent_page.get_number_of_health_questions_for_programmes(programmes)
    )

    online_consent_page.answer_health_questions(
        number_of_health_questions, health_question=health_question
    )

    if programmes != [Programme.MENACWY, Programme.TD_IPV]:
        online_consent_page.select_consent_not_given_reason(
            ConsentRefusalReason.PERSONAL_CHOICE
        )

    online_consent_page.click_confirm()

    online_consent_page.check_final_consent_message(
        child,
        programmes=programmes,
        health_question=health_question,
    )
