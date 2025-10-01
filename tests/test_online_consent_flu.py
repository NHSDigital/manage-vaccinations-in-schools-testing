import pytest

from mavis.test.annotations import issue
from mavis.test.data import CohortsFileMapping
from mavis.test.models import ConsentOption, ConsentRefusalReason, Programme

pytestmark = pytest.mark.consent


@pytest.fixture
def url_with_session_scheduled(schedule_session_and_get_consent_url, schools):
    yield from schedule_session_and_get_consent_url(
        schools[Programme.FLU.group][0],
        Programme.FLU,
    )


@pytest.fixture
def start_consent_with_session_scheduled(url_with_session_scheduled, page, start_page):
    page.goto(url_with_session_scheduled)
    start_page.start()


@pytest.fixture
def setup_session_with_file_upload(
    url_with_session_scheduled,
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
    import_records_page.import_class_list(
        CohortsFileMapping.FIXED_CHILD,
        year_group,
        Programme.FLU.group,
    )
    return url_with_session_scheduled


def test_consent_refused_for_flu_vaccination(
    start_consent_with_session_scheduled,
    online_consent_page,
    schools,
    children,
):
    """
    Test: Submit an online consent form refusing flu vaccination and
       verify confirmation.
    Steps:
    1. Fill in child and parent details on the consent page.
    2. Select 'do not agree' to vaccination.
    3. Choose refusal reason and provide details.
    4. Submit the consent form.
    Verification:
    - Confirmation text indicates consent was refused for flu vaccination.
    """
    child = children[Programme.FLU][0]
    schools = schools[Programme.FLU]

    online_consent_page.fill_details(child, child.parents[0], schools)
    online_consent_page.dont_agree_to_vaccination()
    online_consent_page.select_consent_not_given_reason(
        reason=ConsentRefusalReason.VACCINE_ALREADY_RECEIVED,
        details="Vaccine already received in previous school",
    )
    online_consent_page.click_confirm()
    online_consent_page.expect_confirmation_text(
        f"Consent refusedYou’ve told us that you do not want"
        f" {child.first_name} {child.last_name} to get the flu vaccination at school",
    )


@pytest.mark.parametrize(
    "consent_option",
    [ConsentOption.NASAL_SPRAY, ConsentOption.INJECTION, ConsentOption.BOTH],
    ids=lambda v: f"consent_option: {v}",
)
@pytest.mark.parametrize(
    "yes_to_health_questions",
    [False, True],
    ids=lambda v: f"yes_to_health_questions: {v}",
)
def test_consent_given_for_flu_vaccination(
    start_consent_with_session_scheduled,
    online_consent_page,
    schools,
    consent_option,
    yes_to_health_questions,
    children,
):
    """
    Test: Submit an online consent form giving consent for flu vaccination
       (nasal spray, injection, or both) and verify confirmation.
    Steps:
    1. Fill in child and parent details on the consent page.
    2. Agree to flu vaccination, selecting the consent option
       (nasal spray, injection, or both).
    3. Fill in address details.
    4. Answer the required number of health questions, optionally marking one as 'yes'.
    5. Submit the consent form.
    Verification:
    - Confirmation message is shown for the correct child, consent option,
      and health question status.
    """
    child = children[Programme.FLU][0]
    schools = schools[Programme.FLU]
    number_of_health_questions = {
        ConsentOption.BOTH: 11,
        ConsentOption.NASAL_SPRAY: 9,
        ConsentOption.INJECTION: 5,
    }

    online_consent_page.fill_details(child, child.parents[0], schools)
    online_consent_page.agree_to_flu_vaccination(consent_option=consent_option)
    online_consent_page.fill_address_details(*child.address)

    num_questions = number_of_health_questions[consent_option]
    if consent_option is not ConsentOption.INJECTION and yes_to_health_questions:
        online_consent_page.answer_yes()
        num_questions += 1

    online_consent_page.answer_health_questions(
        num_questions,
        yes_to_health_questions=yes_to_health_questions,
    )

    online_consent_page.click_confirm()

    online_consent_page.check_final_consent_message(
        child,
        programmes=[Programme.FLU],
        yes_to_health_questions=yes_to_health_questions,
        consent_option=consent_option,
    )


@issue("MAV-1234")
@issue("MAV-2025")
@pytest.mark.parametrize(
    "consents",
    [
        (
            ConsentOption.NASAL_SPRAY,
            ConsentOption.NASAL_SPRAY,
            ConsentOption.NASAL_SPRAY,
        ),
        (ConsentOption.INJECTION, ConsentOption.INJECTION, ConsentOption.INJECTION),
        (ConsentOption.BOTH, ConsentOption.NASAL_SPRAY, ConsentOption.NASAL_SPRAY),
        (ConsentOption.BOTH, ConsentOption.INJECTION, ConsentOption.INJECTION),
        (ConsentOption.BOTH, ConsentOption.BOTH, ConsentOption.NASAL_SPRAY),
    ],
    ids=lambda v: f"consents: {v}",
)
def test_flu_consent_method_displayed_correctly(
    setup_session_with_file_upload,
    start_consent_with_session_scheduled,
    online_consent_page,
    schools,
    children,
    consents,
    start_page,
    sessions_page,
    dashboard_page,
):
    """
    Test: Submit multiple online flu consent forms with different methods and
       verify the correct method is displayed in the session.
    Steps:
    1. Fill in child and parent details and submit consent with the first method.
    2. Submit a second consent for the same child with the
       second method (different parent).
    3. Navigate to the session and consent tab.
    4. Search for the child and verify the correct consent method is shown.
    Verification:
    - The consent method displayed in the session matches the expected method
      from the last consent.
    """
    child = children[Programme.FLU][0]
    schools = schools[Programme.FLU]
    url = setup_session_with_file_upload

    # First consent
    online_consent_page.fill_details(child, child.parents[0], schools)
    online_consent_page.agree_to_flu_vaccination(consent_option=consents[0])
    online_consent_page.fill_address_details(*child.address)
    online_consent_page.answer_health_questions(
        online_consent_page.get_number_of_health_questions_for_flu(consents[0]),
        yes_to_health_questions=False,
    )
    online_consent_page.click_confirm()
    online_consent_page.check_final_consent_message(
        child,
        programmes=[Programme.FLU],
        yes_to_health_questions=False,
        consent_option=consents[0],
    )

    # Second consent (different parent)
    online_consent_page.go_to_url(url)
    start_page.start()

    online_consent_page.fill_details(child, child.parents[1], schools)
    online_consent_page.agree_to_flu_vaccination(consent_option=consents[1])
    online_consent_page.fill_address_details(*child.address)
    online_consent_page.answer_health_questions(
        online_consent_page.get_number_of_health_questions_for_flu(consents[1]),
        yes_to_health_questions=False,
    )
    online_consent_page.click_confirm()
    online_consent_page.check_final_consent_message(
        child,
        programmes=[Programme.FLU],
        yes_to_health_questions=False,
        consent_option=consents[1],
    )

    # Verify in session
    dashboard_page.navigate()
    dashboard_page.click_sessions()

    sessions_page.click_session_for_programme_group(schools[0], Programme.FLU)
    sessions_page.click_consent_tab()
    sessions_page.select_consent_given_for_nasal_spray()
    sessions_page.select_consent_given_for_injected_vaccine()

    sessions_page.search_for(str(child))
    sessions_page.verify_child_shows_correct_flu_consent_method(child, consents[2])

    # Verify in session download
    dashboard_page.navigate()
    dashboard_page.click_sessions()
    sessions_page.click_session_for_programme_group(schools[0], Programme.FLU)
    sessions_page.verify_consent_message_in_excel()
