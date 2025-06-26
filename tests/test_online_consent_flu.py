import pytest

from mavis.test.models import ConsentRefusalReason, Programme

pytestmark = pytest.mark.consent


@pytest.fixture
def url(get_online_consent_url):
    yield from get_online_consent_url(Programme.FLU)


@pytest.fixture(autouse=True)
def start_consent(url, page, start_page):
    page.goto(url)
    start_page.start()


def test_refused(consent_page, schools, children):
    child = children[0]
    consent_page.fill_details(child, child.parents[0], schools)
    consent_page.dont_agree_to_vaccination()
    consent_page.select_consent_not_given_reason(
        reason=ConsentRefusalReason.VACCINE_ALREADY_RECEIVED,
        details="Vaccine already received in previous school",
    )
    consent_page.click_confirm()
    consent_page.expect_text_in_main(
        f"Consent refusedYou’ve told us that you do not want {child.first_name} {child.last_name} to get the nasal flu vaccination at school"
    )


@pytest.mark.parametrize(
    "change_school", (False, True), ids=lambda v: f"change_school: {v}"
)
@pytest.mark.parametrize("injection", (False, True), ids=lambda v: f"injection: {v}")
@pytest.mark.parametrize(
    "health_question", (False, True), ids=lambda v: f"health_question: {v}"
)
def test_given(
    consent_page,
    schools,
    change_school,
    injection,
    health_question,
    children,
):
    child = children[0]

    consent_page.fill_details(child, child.parents[0], schools, change_school)
    consent_page.agree_to_flu_vaccination(injection=injection)
    consent_page.fill_address_details(*child.address)

    if health_question:
        # Asthma question doesn't have "More details"
        consent_page.answer_yes()

    consent_page.answer_health_questions(
        10 if health_question else 9, health_question=health_question
    )

    # If consenting to nasal spray, a question is asked about injection as an alternative
    if not injection:
        consent_page.answer_yes()

    consent_page.click_confirm()

    consent_page.check_final_consent_message(
        child, programmes=[Programme.FLU], health_question=health_question
    )
