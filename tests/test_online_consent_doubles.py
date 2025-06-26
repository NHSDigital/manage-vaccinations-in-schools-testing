import pytest

from mavis.test.models import ConsentRefusalReason, Programme

pytestmark = pytest.mark.consent


@pytest.fixture
def url(get_online_consent_url):
    yield from get_online_consent_url(Programme.MENACWY, Programme.TD_IPV)


@pytest.fixture(autouse=True)
def start_consent(url, page, start_page):
    page.goto(url)
    start_page.start()


def test_refused(consent_page, faker, schools, children, date_of_birth_for_year):
    child = children[0]

    consent_page.fill_child_name_details(*child.name, "AKAFirst", "AKALast")
    consent_page.fill_child_date_of_birth(date_of_birth_for_year(10))
    consent_page.select_child_school(schools[0])
    consent_page.fill_parent_details("Parent Full", "Dad", email=faker.email())
    consent_page.dont_agree_to_vaccination()
    consent_page.select_consent_not_given_reason(
        reason=ConsentRefusalReason.VACCINE_ALREADY_RECEIVED,
        details="Vaccine already received in previous school",
    )
    consent_page.click_confirm()
    consent_page.expect_text_in_main(
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
def test_given(
    consent_page,
    faker,
    schools,
    programmes,
    change_school,
    health_question,
    children,
    date_of_birth_for_year,
):
    child = children[0]

    consent_page.fill_child_name_details(*child.name)
    consent_page.fill_child_date_of_birth(date_of_birth_for_year(10))

    if change_school:
        consent_page.select_child_school(schools[1])
    else:
        consent_page.select_child_school(schools[0])

    consent_page.fill_parent_details("Parent Full", "Dad", email=faker.email())
    consent_page.agree_to_doubles_vaccinations(*programmes)
    consent_page.fill_address_details(*child.address)

    if programmes == [Programme.MENACWY, Programme.TD_IPV]:
        number_of_health_questions = 6
    else:
        number_of_health_questions = 5

    for _ in range(number_of_health_questions):
        if health_question:
            consent_page.answer_yes("More details")
        else:
            consent_page.answer_no()

    if programmes != [Programme.MENACWY, Programme.TD_IPV]:
        consent_page.select_consent_not_given_reason(
            ConsentRefusalReason.PERSONAL_CHOICE
        )

    consent_page.click_confirm()

    if programmes == [Programme.MENACWY]:
        title = "Consent for the MenACWY vaccination confirmed"
    elif programmes == [Programme.TD_IPV]:
        title = "Consent for the Td/IPV vaccination confirmed"
    else:
        title = "Consent confirmed"

    if health_question:
        if programmes == [Programme.MENACWY]:
            body = f" As you answered ‘yes’ to some of the health questions, we need to check the MenACWY vaccination is suitable for {child.first_name} {child.last_name}. We’ll review your answers and get in touch again soon."
        elif programmes == [Programme.TD_IPV]:
            body = f" As you answered ‘yes’ to some of the health questions, we need to check the Td/IPV vaccination is suitable for {child.first_name} {child.last_name}. We’ll review your answers and get in touch again soon."
        else:
            body = f" As you answered ‘yes’ to some of the health questions, we need to check the MenACWY and Td/IPV vaccinations are suitable for {child.first_name} {child.last_name}. We’ll review your answers and get in touch again soon."
    else:
        if programmes == [Programme.MENACWY]:
            body = f"{child.first_name} {child.last_name} is due to get the MenACWY vaccination at school"
        elif programmes == [Programme.TD_IPV]:
            body = f"{child.first_name} {child.last_name} is due to get the Td/IPV vaccination at school"
        else:
            body = f"{child.first_name} {child.last_name} is due to get the MenACWY and Td/IPV vaccinations at school"

    final_message = "".join([title, body])
    consent_page.expect_text_in_main(final_message)
