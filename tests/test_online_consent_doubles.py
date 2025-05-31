import pytest

from mavis.test.mavis_constants import Programme

pytestmark = pytest.mark.consent


@pytest.fixture
def url(get_online_consent_url):
    yield from get_online_consent_url(Programme.MENACWY, Programme.TD_IPV)


@pytest.fixture(autouse=True)
def start_consent(url, page, start_page):
    page.goto(url)
    start_page.start()


def test_refused(consent_page, faker, schools):
    consent_page.fill_child_name_details("ROSS", "HAYES", "AKAFirst", "AKALast")
    consent_page.fill_child_dob(10, 8, 2009)
    consent_page.select_child_school(schools[0])
    consent_page.fill_parent_details("Parent Full", "Dad", email=faker.email())
    consent_page.select_consent_for_double_vaccinations("none")
    consent_page.select_consent_not_given_reason(
        reason="Vaccine already received",
        notes="Vaccine already received in previous school",
    )
    consent_page.click_confirm_details()
    consent_page.verify_final_message("""
        Consent refused
        You’ve told us that you do not want ROSS HAYES to get the MenACWY and
        Td/IPV vaccinations at school
    """)


@pytest.mark.parametrize("consent_for", ("both", "menacwy", "td_ipv"))
@pytest.mark.parametrize("change_school", (False, True))
@pytest.mark.parametrize("health_question", (False, True))
def test_given(
    consent_page, faker, schools, consent_for, change_school, health_question
):
    consent_page.fill_child_name_details("ROSE", "VOSE")
    consent_page.fill_child_dob(12, 8, 2009)

    if change_school:
        consent_page.select_child_school(schools[1])
    else:
        consent_page.select_child_school(schools[0])

    consent_page.fill_parent_details("Parent Full", "Dad", email=faker.email())
    consent_page.select_consent_for_double_vaccinations(consent_for)
    consent_page.fill_address_details(
        "1 ROWSLEY AVENUE",
        "",
        "DERBY",
        "DE23 6JZ",
    )

    if consent_for == "both":
        number_of_health_questions = 6
    else:
        number_of_health_questions = 5

    for _ in range(number_of_health_questions):
        if health_question:
            consent_page.select_and_provide_details("More details")
        else:
            consent_page.select_and_provide_details(None)

    if consent_for != "both":
        consent_page.select_consent_not_given_reason(
            reason="Personal choice",
            notes="Personal choice",
        )

    consent_page.click_confirm_details()

    if consent_for == "menacwy":
        title = "Consent for the MenACWY vaccination confirmed"
    elif consent_for == "td_ipv":
        title = "Consent for the Td/IPV vaccination confirmed"
    else:
        title = "Consent confirmed"

    if health_question:
        if consent_for == "menacwy":
            body = "As you answered ‘yes’ to some of the health questions, we need to check the MenACWY vaccination is suitable for ROSE VOSE. We’ll review your answers and get in touch again soon."
        elif consent_for == "td_ipv":
            body = "As you answered ‘yes’ to some of the health questions, we need to check the Td/IPV vaccination is suitable for ROSE VOSE. We’ll review your answers and get in touch again soon."
        else:
            body = "As you answered ‘yes’ to some of the health questions, we need to check the MenACWY and Td/IPV vaccinations are suitable for ROSE VOSE. We’ll review your answers and get in touch again soon."
    else:
        if consent_for == "menacwy":
            body = "ROSE VOSE is due to get the MenACWY vaccination at school"
        elif consent_for == "td_ipv":
            body = "ROSE VOSE is due to get the Td/IPV vaccination at school"
        else:
            body = (
                "ROSE VOSE is due to get the MenACWY and Td/IPV vaccinations at school"
            )

    final_message = "".join([title, body])
    consent_page.verify_final_message(final_message)
