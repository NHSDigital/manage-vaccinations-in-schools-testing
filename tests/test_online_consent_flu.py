import pytest

from mavis.test.models import ConsentRefusalReason, Programme, ConsentOption
from mavis.test.data import CohortsFileMapping
from mavis.test.annotations import issue

pytestmark = pytest.mark.consent


@pytest.fixture
def url(get_online_consent_url, schools):
    yield from get_online_consent_url(schools[Programme.FLU.group][0], Programme.FLU)


@pytest.fixture
def start_consent(url, page, start_page):
    page.goto(url)
    start_page.start()


@pytest.fixture
def setup_session_with_file_upload(
    url,
    log_in_as_nurse,
    schools,
    dashboard_page,
    sessions_page,
    import_records_page,
    year_groups,
):
    school = schools[Programme.FLU][0]
    year_group = year_groups[Programme.FLU]

    dashboard_page.click_mavis()
    dashboard_page.click_sessions()
    sessions_page.click_session_for_programme_group(school, Programme.FLU)
    sessions_page.click_import_class_lists()
    sessions_page.click_add_to_current_year()
    sessions_page.select_year_groups(year_group)
    import_records_page.upload_and_verify_output(
        CohortsFileMapping.FIXED_CHILD, programme_group=Programme.FLU.group
    )
    yield url


def test_refused(start_consent, consent_page, schools, children):
    child = children[Programme.FLU][0]
    schools = schools[Programme.FLU]

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


@pytest.mark.parametrize(
    "consent_option",
    (ConsentOption.NASAL_SPRAY, ConsentOption.INJECTION, ConsentOption.BOTH),
    ids=lambda v: f"consent_option: {v}",
)
@pytest.mark.parametrize(
    "health_question", (False, True), ids=lambda v: f"health_question: {v}"
)
def test_given(
    start_consent,
    consent_page,
    schools,
    consent_option,
    health_question,
    children,
):
    child = children[Programme.FLU][0]
    schools = schools[Programme.FLU]
    number_of_health_questions = {
        ConsentOption.BOTH: 11,
        ConsentOption.NASAL_SPRAY: 9,
        ConsentOption.INJECTION: 5,
    }

    consent_page.fill_details(child, child.parents[0], schools, False)
    consent_page.agree_to_flu_vaccination(consent_option=consent_option)
    consent_page.fill_address_details(*child.address)

    number_of_health_questions = number_of_health_questions[consent_option]
    if consent_option is not ConsentOption.INJECTION and health_question:
        consent_page.answer_yes()
        number_of_health_questions += 1

    consent_page.answer_health_questions(
        number_of_health_questions, health_question=health_question
    )

    consent_page.click_confirm()

    consent_page.check_final_consent_message(
        child,
        programmes=[Programme.FLU],
        health_question=health_question,
        consent_option=consent_option,
    )


@issue("MAV-1234")
@pytest.mark.parametrize(
    "consents",
    (
        (
            ConsentOption.NASAL_SPRAY,
            ConsentOption.NASAL_SPRAY,
            ConsentOption.NASAL_SPRAY,
        ),
        (ConsentOption.INJECTION, ConsentOption.INJECTION, ConsentOption.INJECTION),
        (ConsentOption.BOTH, ConsentOption.NASAL_SPRAY, ConsentOption.NASAL_SPRAY),
        (ConsentOption.BOTH, ConsentOption.INJECTION, ConsentOption.INJECTION),
        (ConsentOption.BOTH, ConsentOption.BOTH, ConsentOption.NASAL_SPRAY),
    ),
    ids=lambda v: f"consents: {v}",
)
def test_correct_method_shown(
    setup_session_with_file_upload,
    start_consent,
    consent_page,
    schools,
    children,
    consents,
    start_page,
    sessions_page,
    dashboard_page,
):
    child = children[Programme.FLU][0]
    schools = schools[Programme.FLU]
    url = setup_session_with_file_upload
    number_of_health_questions = {
        ConsentOption.BOTH: 11,
        ConsentOption.NASAL_SPRAY: 9,
        ConsentOption.INJECTION: 5,
    }

    consent_page.fill_details(child, child.parents[0], schools)
    consent_page.agree_to_flu_vaccination(consent_option=consents[0])
    consent_page.fill_address_details(*child.address)
    consent_page.answer_health_questions(
        number_of_health_questions[consents[0]], health_question=False
    )
    consent_page.click_confirm()
    consent_page.check_final_consent_message(
        child,
        programmes=[Programme.FLU],
        health_question=False,
        consent_option=consents[0],
    )

    consent_page.go_to_url(url)
    start_page.start()

    consent_page.fill_details(child, child.parents[1], schools)
    consent_page.agree_to_flu_vaccination(consent_option=consents[1])
    consent_page.fill_address_details(*child.address)
    consent_page.answer_health_questions(
        number_of_health_questions[consents[1]], health_question=False
    )
    consent_page.click_confirm()
    consent_page.check_final_consent_message(
        child,
        programmes=[Programme.FLU],
        health_question=False,
        consent_option=consents[1],
    )

    dashboard_page.navigate()
    dashboard_page.click_sessions()

    sessions_page.click_session_for_programme_group(schools[0], Programme.FLU)
    sessions_page.click_consent_tab()
    sessions_page.select_consent_given()
    sessions_page.search_for(str(child))
    sessions_page.verify_child_shows_correct_flu_consent_method(child, str(consents[2]))
