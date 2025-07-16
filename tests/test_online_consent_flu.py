import pytest

from mavis.test.models import ConsentRefusalReason, Programme
from mavis.test.data import CohortsFileMapping
from mavis.test.annotations import issue

pytestmark = pytest.mark.consent


@pytest.fixture
def url(get_online_consent_url):
    yield from get_online_consent_url(Programme.FLU)


@pytest.fixture
def start_consent(url, page, start_page):
    page.goto(url)
    start_page.start()


@pytest.fixture
def setup_session_with_file_upload(
    url, log_in_as_nurse, schools, dashboard_page, sessions_page, import_records_page
):
    dashboard_page.click_mavis()
    dashboard_page.click_sessions()
    sessions_page.click_scheduled()
    sessions_page.click_location(schools[0])
    sessions_page.navigate_to_class_list_import()
    import_records_page.upload_and_verify_output(CohortsFileMapping.FIXED_CHILD_YEAR_9)
    yield url


def test_refused(start_consent, consent_page, schools, children):
    child = children[0]
    consent_page.fill_details(child, child.parents[0], schools)
    consent_page.dont_agree_to_vaccination()
    consent_page.select_consent_not_given_reason(
        reason=ConsentRefusalReason.VACCINE_ALREADY_RECEIVED,
        details="Vaccine already received in previous school",
    )
    consent_page.click_confirm()
    consent_page.expect_text_in_main(
        f"Consent refusedYou’ve told us that you do not want {child.first_name} {child.last_name} to get the flu vaccination at school"
    )


@pytest.mark.parametrize("injection", (False, True), ids=lambda v: f"injection: {v}")
@pytest.mark.parametrize(
    "health_question", (False, True), ids=lambda v: f"health_question: {v}"
)
def test_given(
    start_consent,
    consent_page,
    schools,
    injection,
    health_question,
    children,
):
    child = children[0]

    consent_page.fill_details(child, child.parents[0], schools, False)
    consent_page.agree_to_flu_vaccination(injection=injection)
    # If consenting to nasal spray, a question is asked about injection as an alternative
    if not injection:
        consent_page.answer_yes()
    consent_page.fill_address_details(*child.address)

    if injection:
        consent_page.answer_health_questions(5, health_question=health_question)
    else:
        if health_question:
            consent_page.answer_yes()
        consent_page.answer_health_questions(
            10 if health_question else 9, health_question=health_question
        )

    consent_page.click_confirm()

    consent_page.check_final_consent_message(
        child,
        programmes=[Programme.FLU],
        health_question=health_question,
        injection=injection,
    )


INJECTION = "Injection"
NASAL = "Nasal spray"
BOTH = "Nasal spray (or injection)"


@issue("MAV-1234")
@pytest.mark.parametrize(
    "consents",
    (
        (NASAL, NASAL, NASAL),
        (INJECTION, INJECTION, INJECTION),
        (BOTH, NASAL, NASAL),
        (BOTH, INJECTION, INJECTION),
        (BOTH, BOTH, BOTH),
    ),
    ids=lambda v: f"consents: {v}",
)
def test_correct_method_shown(
    setup_session_with_file_upload,
    consent_page,
    schools,
    children,
    consents,
    start_page,
    sessions_page,
):
    child = children[0]
    url = setup_session_with_file_upload

    consent_page.go_to_url(url)
    start_page.start()

    consent_page.fill_details(child, child.parents[0], schools)
    consent_page.agree_to_flu_vaccination(injection=(consents[0] == INJECTION))
    if consents[0] == BOTH:
        consent_page.answer_yes()
    elif consents[0] == NASAL:
        consent_page.answer_no()
    consent_page.fill_address_details(*child.address)
    consent_page.answer_health_questions(
        5 if (consents[0] == INJECTION) else 9, health_question=False
    )
    consent_page.click_confirm()
    consent_page.check_final_consent_message(
        child,
        programmes=[Programme.FLU],
        health_question=False,
        injection=(consents[0] == INJECTION),
    )

    consent_page.go_to_url(url)
    start_page.start()

    consent_page.fill_details(child, child.parents[1], schools)
    consent_page.agree_to_flu_vaccination(injection=(consents[1] == INJECTION))
    if consents[1] == BOTH:
        consent_page.answer_yes()
    elif consents[1] == NASAL:
        consent_page.answer_no()
    consent_page.fill_address_details(*child.address)
    consent_page.answer_health_questions(
        5 if (consents[1] == INJECTION) else 9, health_question=False
    )
    consent_page.click_confirm()
    consent_page.check_final_consent_message(
        child,
        programmes=[Programme.FLU],
        health_question=False,
        injection=(consents[1] == INJECTION),
    )

    consent_page.click_sessions()

    sessions_page.navigate_to_scheduled_sessions(schools[0])
    sessions_page.click_consent_tab()
    sessions_page.select_consent_given()
    sessions_page.search_for(str(child))
    sessions_page.verify_child_shows_correct_flu_consent_method(child, str(consents[2]))
