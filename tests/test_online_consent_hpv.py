import pytest

from mavis.test.models import ConsentRefusalReason, Programme, Vaccine
from mavis.test.data import CohortsFileMapping

pytestmark = pytest.mark.consent


@pytest.fixture
def url(get_online_consent_url, schools):
    yield from get_online_consent_url(schools[Programme.HPV.group][0], Programme.HPV)


@pytest.fixture
def start_consent(url, page, start_page):
    page.goto(url)
    start_page.start()


@pytest.fixture
def setup_session_with_file_upload(
    url,
    log_in_as_nurse,
    add_vaccine_batch,
    schools,
    dashboard_page,
    sessions_page,
    import_records_page,
    children,
):
    school = schools[Programme.HPV][0]
    child = children[Programme.HPV][0]

    gardasil_9_batch_name = add_vaccine_batch(Vaccine.GARDASIL_9)
    dashboard_page.click_mavis()
    dashboard_page.click_sessions()
    sessions_page.click_scheduled()
    sessions_page.click_location(school)
    sessions_page.navigate_to_class_list_import(child.year_group)
    import_records_page.upload_and_verify_output(
        CohortsFileMapping.FIXED_CHILD, programme_group=Programme.HPV.group
    )
    yield gardasil_9_batch_name, url


def test_refused(start_consent, consent_page, schools, children):
    child = children[Programme.HPV][0]
    schools = schools[Programme.HPV]

    consent_page.fill_details(child, child.parents[0], schools)
    consent_page.dont_agree_to_vaccination()
    consent_page.select_consent_not_given_reason(
        reason=ConsentRefusalReason.VACCINE_ALREADY_RECEIVED,
        details="Vaccine already received in previous school",
    )
    consent_page.click_confirm()
    consent_page.expect_text_in_main(
        f"Consent refusedYou’ve told us that you do not want {child.first_name} {child.last_name} to get the HPV vaccination at school"
    )


@pytest.mark.parametrize(
    "change_school", (False, True), ids=lambda v: f"change_school: {v}"
)
@pytest.mark.parametrize(
    "health_question", (False, True), ids=lambda v: f"health_question: {v}"
)
def test_given(
    start_consent,
    consent_page,
    schools,
    change_school,
    health_question,
    children,
):
    child = children[Programme.HPV][0]
    schools = schools[Programme.HPV]

    consent_page.fill_details(child, child.parents[0], schools, change_school)
    consent_page.agree_to_hpv_vaccination()
    consent_page.fill_address_details(*child.address)
    consent_page.answer_health_questions(4, health_question=health_question)
    consent_page.click_confirm()
    consent_page.check_final_consent_message(
        child, programmes=[Programme.HPV], health_question=health_question
    )
    