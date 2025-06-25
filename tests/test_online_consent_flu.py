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


def test_refused(consent_page, faker, schools, children):
    child = children[0]
    consent_page.fill_child_name_details(*child.name, "AKAFirst", "AKALast")
    consent_page.fill_child_date_of_birth(child.date_of_birth)
    consent_page.select_child_school(schools[0])
    consent_page.fill_parent_details("Parent Full", "Dad", email=faker.email())
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
    faker,
    schools,
    change_school,
    injection,
    health_question,
    children,
):
    child = children[0]

    consent_page.fill_child_name_details(*child.name)
    consent_page.fill_child_date_of_birth(child.date_of_birth)

    if change_school:
        consent_page.select_child_school(schools[1])
    else:
        consent_page.select_child_school(schools[0])

    consent_page.fill_parent_details("Parent Full", "Dad", email=faker.email())
    consent_page.agree_to_flu_vaccination(injection=injection)
    consent_page.fill_address_details(*child.address)

    if health_question:
        # Asthma question doesn't have "More details"
        consent_page.answer_yes()

        # Asthma follow-up questions are only shown if answering "Yes"
        for _ in range(10):
            consent_page.answer_yes("More details")
    else:
        for _ in range(9):
            consent_page.answer_no()

    # If consenting to nasal spray, a question is asked about injection as an alternative
    if not injection:
        consent_page.answer_yes()

    consent_page.click_confirm()

    title = "Consent confirmed"

    if health_question:
        body = f" As you answered ‘yes’ to some of the health questions, we need to check the nasal flu vaccination is suitable for {child.first_name} {child.last_name}. We’ll review your answers and get in touch again soon."
    else:
        body = f"{child.first_name} {child.last_name} is due to get the nasal flu vaccination at school"

    final_message = "".join([title, body])
    consent_page.expect_text_in_main(final_message)
