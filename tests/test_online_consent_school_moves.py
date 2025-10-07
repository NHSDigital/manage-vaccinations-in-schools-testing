import pytest

from mavis.test.data import CohortsFileMapping
from mavis.test.models import ConsentOption, Programme

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


def test_online_consent_school_moves_with_existing_patient(
    setup_session_with_file_upload,
    start_consent_with_session_scheduled,
    online_consent_page,
    schools,
    children,
    sessions_page,
    dashboard_page,
    school_moves_page,
    review_school_move_page,
):
    """
    Test: Submit online flu consent for an existing child and
    change schools to a school with no sessions scheduled.
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

    # First consent
    online_consent_page.fill_details(
        child, child.parents[0], schools, change_school=True
    )
    online_consent_page.agree_to_flu_vaccination(consent_option=ConsentOption.BOTH)
    online_consent_page.fill_address_details(*child.address)
    online_consent_page.answer_health_questions(
        online_consent_page.get_number_of_health_questions_for_flu(ConsentOption.BOTH),
        yes_to_health_questions=False,
    )
    online_consent_page.click_confirm()
    online_consent_page.check_final_consent_message(
        child,
        programmes=[Programme.FLU],
        yes_to_health_questions=False,
        consent_option=ConsentOption.BOTH,
    )

    # Verify in session
    dashboard_page.navigate()
    dashboard_page.click_school_moves()
    school_moves_page.click_child(*child.name)
    review_school_move_page.confirm()

    dashboard_page.navigate()
    dashboard_page.click_sessions()
    sessions_page.click_session_for_programme_group(schools[1], Programme.FLU)

    sessions_page.click_consent_tab()
    sessions_page.select_consent_given_for_nasal_spray()
    sessions_page.select_consent_given_for_injected_vaccine()
    sessions_page.search_for(str(child))
    sessions_page.verify_child_shows_correct_flu_consent_method(
        child, ConsentOption.BOTH
    )


def test_online_consent_school_moves_with_new_patient(
    start_consent_with_session_scheduled,
    online_consent_page,
    schools,
    children,
    sessions_page,
    dashboard_page,
    unmatched_consent_responses_page,
    consent_response_page,
    create_new_record_consent_response_page,
    log_in_page,
    nurse,
    team,
):
    """
    Test: Submit online flu consent for child not in mavis and change schools
    to a school with no sessions scheduled.
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

    online_consent_page.fill_details(
        child, child.parents[0], schools, change_school=True
    )
    online_consent_page.agree_to_flu_vaccination(consent_option=ConsentOption.BOTH)
    online_consent_page.fill_address_details(*child.address)
    online_consent_page.answer_health_questions(
        online_consent_page.get_number_of_health_questions_for_flu(ConsentOption.BOTH),
        yes_to_health_questions=False,
    )
    online_consent_page.click_confirm()
    online_consent_page.check_final_consent_message(
        child,
        programmes=[Programme.FLU],
        yes_to_health_questions=False,
        consent_option=ConsentOption.BOTH,
    )

    log_in_page.navigate()
    log_in_page.log_in_and_choose_team_if_necessary(nurse, team)

    dashboard_page.navigate()
    dashboard_page.click_unmatched_consent_responses()
    unmatched_consent_responses_page.click_parent_on_consent_record_for_child(child)

    consent_response_page.click_create_new_record()
    create_new_record_consent_response_page.create_new_record()

    dashboard_page.navigate()
    dashboard_page.click_sessions()
    sessions_page.click_session_for_programme_group(schools[1], Programme.FLU)

    sessions_page.click_consent_tab()
    sessions_page.select_consent_given_for_nasal_spray()
    sessions_page.select_consent_given_for_injected_vaccine()
    sessions_page.search_for(str(child))
    sessions_page.verify_child_shows_correct_flu_consent_method(
        child, ConsentOption.BOTH
    )

    log_in_page.log_out()


@pytest.mark.accessibility
def test_accessibility(
    start_consent_with_session_scheduled,
    online_consent_page,
    schools,
    children,
    accessibility_helper,
):
    """
    Test: Validate accessibility of online consent pages when changing schools.
    Steps:
    1. Go through submitting online consent, checking accessibility on each page.
    Verification:
    - No accessibility violations found.
    """
    child = children[Programme.FLU][0]
    schools = schools[Programme.FLU]

    online_consent_page.fill_child_name_details(*child.name)
    accessibility_helper.check_accessibility()

    online_consent_page.fill_child_date_of_birth(child.date_of_birth)
    accessibility_helper.check_accessibility()

    online_consent_page.click_no_they_go_to_a_different_school()
    accessibility_helper.check_accessibility()

    online_consent_page.fill_school_name(str(schools[1]))
    online_consent_page.click_continue()
    accessibility_helper.check_accessibility()

    online_consent_page.fill_parent_details(child.parents[0])

    accessibility_helper.check_accessibility()

    online_consent_page.agree_to_flu_vaccination(consent_option=ConsentOption.BOTH)
    accessibility_helper.check_accessibility()

    online_consent_page.fill_address_details(*child.address)
    accessibility_helper.check_accessibility()

    online_consent_page.answer_yes()
    accessibility_helper.check_accessibility()

    online_consent_page.answer_health_questions(
        online_consent_page.get_number_of_health_questions_for_flu(ConsentOption.BOTH)
        + 1,
        yes_to_health_questions=True,
    )
    accessibility_helper.check_accessibility()

    online_consent_page.click_confirm()
    accessibility_helper.check_accessibility()
