import pytest

from mavis.test.constants import ConsentOption, Programme
from mavis.test.data import CohortsFileMapping
from mavis.test.helpers.accessibility_helper import AccessibilityHelper
from mavis.test.pages import (
    ConsentResponsePage,
    CreateNewRecordConsentResponsePage,
    DashboardPage,
    ImportRecordsWizardPage,
    LogInPage,
    OnlineConsentWizardPage,
    ReviewSchoolMovePage,
    SchoolMovesPage,
    SessionsChildrenPage,
    SessionsOverviewPage,
    SessionsSearchPage,
    StartPage,
    UnmatchedConsentResponsesPage,
)

pytestmark = pytest.mark.consent


@pytest.fixture
def url_with_session_scheduled(schedule_session_and_get_consent_url, schools):
    yield from schedule_session_and_get_consent_url(
        schools[Programme.FLU.group][0],
        Programme.FLU,
    )


@pytest.fixture
def start_consent_with_session_scheduled(url_with_session_scheduled, page):
    page.goto(url_with_session_scheduled)
    StartPage(page).start()


@pytest.fixture
def setup_session_with_file_upload(
    url_with_session_scheduled,
    log_in_as_nurse,
    schools,
    page,
    file_generator,
    year_groups,
):
    school = schools[Programme.FLU][0]
    year_group = year_groups[Programme.FLU]

    DashboardPage(page).click_sessions()
    SessionsSearchPage(page).click_session_for_programme_group(school, Programme.FLU)
    SessionsOverviewPage(page).click_import_class_lists()
    ImportRecordsWizardPage(page, file_generator).import_class_list(
        CohortsFileMapping.FIXED_CHILD,
        year_group,
        Programme.FLU.group,
    )
    return url_with_session_scheduled


def test_online_consent_school_moves_with_existing_patient(
    setup_session_with_file_upload,
    start_consent_with_session_scheduled,
    page,
    schools,
    children,
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
    OnlineConsentWizardPage(page).fill_details(
        child, child.parents[0], schools, change_school=True
    )
    OnlineConsentWizardPage(page).agree_to_flu_vaccination(
        consent_option=ConsentOption.NASAL_SPRAY_OR_INJECTION
    )
    OnlineConsentWizardPage(page).fill_address_details(*child.address)
    OnlineConsentWizardPage(page).answer_health_questions(
        OnlineConsentWizardPage(page).get_number_of_health_questions_for_flu(
            ConsentOption.NASAL_SPRAY_OR_INJECTION
        ),
        yes_to_health_questions=False,
    )
    OnlineConsentWizardPage(page).click_confirm()
    OnlineConsentWizardPage(page).check_final_consent_message(
        child,
        programmes=[Programme.FLU],
        yes_to_health_questions=False,
        consent_option=ConsentOption.NASAL_SPRAY_OR_INJECTION,
    )

    # Verify in session
    DashboardPage(page).navigate()
    DashboardPage(page).click_school_moves()
    SchoolMovesPage(page).click_child(child)
    ReviewSchoolMovePage(page).confirm()

    SchoolMovesPage(page).header.click_mavis_header()
    DashboardPage(page).click_sessions()
    SessionsSearchPage(page).click_session_for_programme_group(
        schools[1], Programme.FLU
    )

    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).select_due_vaccination()
    SessionsChildrenPage(page).search.search_for(str(child))
    SessionsChildrenPage(page).verify_child_shows_correct_flu_consent_method(
        child, ConsentOption.NASAL_SPRAY_OR_INJECTION
    )


def test_online_consent_school_moves_with_new_patient(
    start_consent_with_session_scheduled,
    page,
    schools,
    children,
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

    OnlineConsentWizardPage(page).fill_details(
        child, child.parents[0], schools, change_school=True
    )
    OnlineConsentWizardPage(page).agree_to_flu_vaccination(
        consent_option=ConsentOption.NASAL_SPRAY_OR_INJECTION
    )
    OnlineConsentWizardPage(page).fill_address_details(*child.address)
    OnlineConsentWizardPage(page).answer_health_questions(
        OnlineConsentWizardPage(page).get_number_of_health_questions_for_flu(
            ConsentOption.NASAL_SPRAY_OR_INJECTION
        ),
        yes_to_health_questions=False,
    )
    OnlineConsentWizardPage(page).click_confirm()
    OnlineConsentWizardPage(page).check_final_consent_message(
        child,
        programmes=[Programme.FLU],
        yes_to_health_questions=False,
        consent_option=ConsentOption.NASAL_SPRAY_OR_INJECTION,
    )

    LogInPage(page).navigate()
    LogInPage(page).log_in_and_choose_team_if_necessary(nurse, team)

    DashboardPage(page).navigate()
    DashboardPage(page).click_unmatched_consent_responses()
    UnmatchedConsentResponsesPage(page).click_parent_on_consent_record_for_child(child)

    ConsentResponsePage(page).click_create_new_record()
    CreateNewRecordConsentResponsePage(page).create_new_record()

    UnmatchedConsentResponsesPage(page).header.click_mavis_header()
    DashboardPage(page).click_sessions()
    SessionsSearchPage(page).click_session_for_programme_group(
        schools[1], Programme.FLU
    )

    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).select_due_vaccination()
    SessionsChildrenPage(page).search.search_for(str(child))
    SessionsChildrenPage(page).verify_child_shows_correct_flu_consent_method(
        child, ConsentOption.NASAL_SPRAY_OR_INJECTION
    )

    LogInPage(page).log_out()


@pytest.mark.accessibility
def test_accessibility(
    start_consent_with_session_scheduled,
    page,
    schools,
    children,
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

    OnlineConsentWizardPage(page).fill_child_name_details(*child.name)
    AccessibilityHelper(page).check_accessibility()

    OnlineConsentWizardPage(page).fill_child_date_of_birth(child.date_of_birth)
    AccessibilityHelper(page).check_accessibility()

    OnlineConsentWizardPage(page).click_no_they_go_to_a_different_school()
    AccessibilityHelper(page).check_accessibility()

    OnlineConsentWizardPage(page).fill_school_name(str(schools[1]))
    OnlineConsentWizardPage(page).click_continue()
    AccessibilityHelper(page).check_accessibility()

    OnlineConsentWizardPage(page).fill_parent_details(child.parents[0])

    AccessibilityHelper(page).check_accessibility()

    OnlineConsentWizardPage(page).agree_to_flu_vaccination(
        consent_option=ConsentOption.NASAL_SPRAY_OR_INJECTION
    )
    AccessibilityHelper(page).check_accessibility()

    OnlineConsentWizardPage(page).fill_address_details(*child.address)
    AccessibilityHelper(page).check_accessibility()

    OnlineConsentWizardPage(page).answer_yes()
    AccessibilityHelper(page).check_accessibility()

    OnlineConsentWizardPage(page).answer_health_questions(
        OnlineConsentWizardPage(page).get_number_of_health_questions_for_flu(
            ConsentOption.NASAL_SPRAY_OR_INJECTION
        )
        + 1,
        yes_to_health_questions=True,
    )
    AccessibilityHelper(page).check_accessibility()

    OnlineConsentWizardPage(page).click_confirm()
    AccessibilityHelper(page).check_accessibility()
