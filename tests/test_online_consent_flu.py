from datetime import date
import pytest

from mavis.test.models import Programme, ConsentRefusalReason

pytestmark = pytest.mark.consent


@pytest.fixture
def url(get_online_consent_url):
    yield from get_online_consent_url(Programme.FLU)


@pytest.fixture(autouse=True)
def start_consent(url, page, start_page):
    page.goto(url)
    start_page.start()


def test_refused(consent_page, faker, schools):
    consent_page.fill_child_name_details("LIEN", "MAH", "AKAFirst", "AKALast")
    consent_page.fill_child_date_of_birth(date(2011, 1, 3))
    consent_page.select_child_school(schools[0])
    consent_page.fill_parent_details("Parent Full", "Dad", email=faker.email())
    consent_page.dont_agree_to_vaccination()
    consent_page.select_consent_not_given_reason(
        reason=ConsentRefusalReason.VACCINE_ALREADY_RECEIVED,
        details="Vaccine already received in previous school",
    )
    consent_page.click_confirm()
    consent_page.expect_text_in_main(
        "Consent refusedYou’ve told us that you do not want LIEN MAH to get the nasal flu vaccination at school"
    )


@pytest.mark.parametrize("change_school", (False, True))
@pytest.mark.parametrize("injection", (False, True))
@pytest.mark.parametrize("health_question", (False, True))
def test_given(consent_page, faker, schools, change_school, injection, health_question):
    consent_page.fill_child_name_details("ROSE", "VOSE")
    consent_page.fill_child_date_of_birth(date(2009, 8, 12))

    if change_school:
        consent_page.select_child_school(schools[1])
    else:
        consent_page.select_child_school(schools[0])

    consent_page.fill_parent_details("Parent Full", "Dad", email=faker.email())
    consent_page.agree_to_flu_vaccination(injection=injection)
    consent_page.fill_address_details(
        "1 ROWSLEY AVENUE",
        "",
        "DERBY",
        "DE23 6JZ",
    )

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
        body = " As you answered ‘yes’ to some of the health questions, we need to check the nasal flu vaccination is suitable for ROSE VOSE. We’ll review your answers and get in touch again soon."
    else:
        body = "ROSE VOSE is due to get the nasal flu vaccination at school"

    final_message = "".join([title, body])
    consent_page.expect_text_in_main(final_message)
