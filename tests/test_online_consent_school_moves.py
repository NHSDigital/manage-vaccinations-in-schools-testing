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
    sessions_search_page,
    sessions_overview_page,
    import_records_wizard_page,
    year_groups,
):
    school = schools[Programme.FLU][0]
    year_group = year_groups[Programme.FLU]

    dashboard_page.click_sessions()
    sessions_search_page.click_session_for_programme_group(school, Programme.FLU)
    sessions_overview_page.click_import_class_lists()
    import_records_wizard_page.import_class_list(
        CohortsFileMapping.FIXED_CHILD,
        year_group,
        Programme.FLU.group,
    )
    return url_with_session_scheduled


def test_online_consent_school_moves_with_existing_patient(
    setup_session_with_file_upload,
    start_consent_with_session_scheduled,
    online_consent_wizard_page,
    schools,
    children,
    sessions_search_page,
    sessions_overview_page,
    sessions_children_page,
    dashboard_page,
    school_moves_page,
    review_school_move_page,
):
    """
    Test: Submit online flu consent for an existing child and
    change schools.
    Steps:
    1. Fill in child and parent details and change schools.
    2. Verify the school move is created in Mavis and confirm it.
    3. Navigate to the session at the new school and go to consent tab.
    4. Search for the child and verify the correct consent appears.
    Verification:
    - The consent method displayed in the session matches the expected method.
    """
    child = children[Programme.FLU][0]
    schools = schools[Programme.FLU]

    # First consent
    online_consent_wizard_page.fill_details(
        child, child.parents[0], schools, change_school=True
    )
    online_consent_wizard_page.agree_to_flu_vaccination(
        consent_option=ConsentOption.NASAL_SPRAY_OR_INJECTION
    )
    online_consent_wizard_page.fill_address_details(*child.address)
    online_consent_wizard_page.answer_health_questions(
        online_consent_wizard_page.get_number_of_health_questions_for_flu(
            ConsentOption.NASAL_SPRAY_OR_INJECTION
        ),
        yes_to_health_questions=False,
    )
    online_consent_wizard_page.click_confirm()
    online_consent_wizard_page.check_final_consent_message(
        child,
        programmes=[Programme.FLU],
        yes_to_health_questions=False,
        consent_option=ConsentOption.NASAL_SPRAY_OR_INJECTION,
    )

    # Verify in session
    dashboard_page.navigate()
    dashboard_page.click_school_moves()
    school_moves_page.click_child(child)
    review_school_move_page.confirm()

    school_moves_page.header.click_sessions_header()
    sessions_search_page.click_session_for_programme_group(schools[1], Programme.FLU)

    sessions_overview_page.tabs.click_children_tab()
    sessions_children_page.select_due_vaccination()
    sessions_children_page.search.search_for(str(child))
    sessions_children_page.verify_child_shows_correct_flu_consent_method(
        child, ConsentOption.NASAL_SPRAY_OR_INJECTION
    )


def test_online_consent_school_moves_with_new_patient(
    start_consent_with_session_scheduled,
    online_consent_wizard_page,
    schools,
    children,
    sessions_search_page,
    sessions_overview_page,
    sessions_children_page,
    dashboard_page,
    unmatched_consent_responses_page,
    consent_response_page,
    create_new_record_consent_response_page,
    log_in_page,
    nurse,
    team,
):
    """
    Test: Submit online flu consent for a new child and
    change schools.
    Steps:
    1. Fill in child and parent details and change schools.
    2. Verify the school move is created in Mavis and confirm it.
    3. Navigate to the session at the new school and go to consent tab.
    4. Search for the child and verify the correct consent appears.
    Verification:
    - The consent method displayed in the session matches the expected method.
    """
    child = children[Programme.FLU][0]
    schools = schools[Programme.FLU]

    online_consent_wizard_page.fill_details(
        child, child.parents[0], schools, change_school=True
    )
    online_consent_wizard_page.agree_to_flu_vaccination(
        consent_option=ConsentOption.NASAL_SPRAY_OR_INJECTION
    )
    online_consent_wizard_page.fill_address_details(*child.address)
    online_consent_wizard_page.answer_health_questions(
        online_consent_wizard_page.get_number_of_health_questions_for_flu(
            ConsentOption.NASAL_SPRAY_OR_INJECTION
        ),
        yes_to_health_questions=False,
    )
    online_consent_wizard_page.click_confirm()
    online_consent_wizard_page.check_final_consent_message(
        child,
        programmes=[Programme.FLU],
        yes_to_health_questions=False,
        consent_option=ConsentOption.NASAL_SPRAY_OR_INJECTION,
    )

    log_in_page.navigate()
    log_in_page.log_in_and_choose_team_if_necessary(nurse, team)

    dashboard_page.navigate()
    dashboard_page.click_unmatched_consent_responses()
    unmatched_consent_responses_page.click_parent_on_consent_record_for_child(child)

    consent_response_page.click_create_new_record()
    create_new_record_consent_response_page.create_new_record()

    unmatched_consent_responses_page.header.click_sessions_header()
    sessions_search_page.click_session_for_programme_group(schools[1], Programme.FLU)

    sessions_overview_page.tabs.click_children_tab()
    sessions_children_page.select_due_vaccination()
    sessions_children_page.search.search_for(str(child))
    sessions_children_page.verify_child_shows_correct_flu_consent_method(
        child, ConsentOption.NASAL_SPRAY_OR_INJECTION
    )

    log_in_page.log_out()


@pytest.mark.accessibility
def test_accessibility(
    start_consent_with_session_scheduled,
    online_consent_wizard_page,
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

    online_consent_wizard_page.fill_child_name_details(*child.name)
    accessibility_helper.check_accessibility()

    online_consent_wizard_page.fill_child_date_of_birth(child.date_of_birth)
    accessibility_helper.check_accessibility()

    online_consent_wizard_page.click_no_they_go_to_a_different_school()
    accessibility_helper.check_accessibility()

    online_consent_wizard_page.fill_school_name(str(schools[1]))
    online_consent_wizard_page.click_continue()
    accessibility_helper.check_accessibility()

    online_consent_wizard_page.fill_parent_details(child.parents[0])

    accessibility_helper.check_accessibility()

    online_consent_wizard_page.agree_to_flu_vaccination(
        consent_option=ConsentOption.NASAL_SPRAY_OR_INJECTION
    )
    accessibility_helper.check_accessibility()

    online_consent_wizard_page.fill_address_details(*child.address)
    accessibility_helper.check_accessibility()

    online_consent_wizard_page.answer_yes()
    accessibility_helper.check_accessibility()

    online_consent_wizard_page.answer_health_questions(
        online_consent_wizard_page.get_number_of_health_questions_for_flu(
            ConsentOption.NASAL_SPRAY_OR_INJECTION
        )
        + 1,
        yes_to_health_questions=True,
    )
    accessibility_helper.check_accessibility()

    online_consent_wizard_page.click_confirm()
    accessibility_helper.check_accessibility()
