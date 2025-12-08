import pytest
from playwright.sync_api import expect

from mavis.test.annotations import issue
from mavis.test.constants import Programme
from mavis.test.data import ClassFileMapping, CohortsFileMapping, pds
from mavis.test.helpers.accessibility_helper import AccessibilityHelper
from mavis.test.pages import (
    ArchiveConsentResponsePage,
    ChildActivityLogPage,
    ChildRecordPage,
    ChildrenSearchPage,
    ConsentResponsePage,
    CreateNewRecordConsentResponsePage,
    DashboardPage,
    ImportRecordsWizardPage,
    ImportsPage,
    MatchConsentResponsePage,
    OnlineConsentWizardPage,
    ProgrammeChildrenPage,
    ProgrammeOverviewPage,
    ProgrammesListPage,
    ServiceErrorPage,
    StartPage,
    UnmatchedConsentResponsesPage,
)

pytestmark = pytest.mark.consent_responses


@pytest.fixture
def pds_child():
    return pds.get_random_child_patient_without_date_of_death()


@pytest.fixture
def online_consent_url(schedule_session_and_get_consent_url, schools):
    yield from schedule_session_and_get_consent_url(
        schools[Programme.HPV.group][0], Programme.HPV
    )


@pytest.fixture
def give_online_consent(
    page,
    online_consent_url,
    children,
    schools,
):
    child = children[Programme.HPV][0]
    schools = schools[Programme.HPV]

    page.goto(online_consent_url)
    StartPage(page).start()
    OnlineConsentWizardPage(page).fill_details(child, child.parents[0], schools)
    OnlineConsentWizardPage(page).agree_to_hpv_vaccination()
    OnlineConsentWizardPage(page).fill_address_details(*child.address)
    OnlineConsentWizardPage(page).answer_health_questions(
        4, yes_to_health_questions=False
    )
    OnlineConsentWizardPage(page).click_confirm()


@pytest.fixture
def give_online_consent_pds_child(
    page,
    online_consent_url,
    pds_child,
    schools,
):
    child = pds_child
    schools = schools[Programme.HPV]

    page.goto(online_consent_url)
    StartPage(page).start()
    OnlineConsentWizardPage(page).fill_details(child, child.parents[0], schools)
    OnlineConsentWizardPage(page).agree_to_hpv_vaccination()
    OnlineConsentWizardPage(page).fill_address_details(*child.address)
    OnlineConsentWizardPage(page).answer_health_questions(
        4, yes_to_health_questions=False
    )
    OnlineConsentWizardPage(page).click_confirm()


@pytest.fixture
def go_to_unmatched_consent_responses(log_in_as_nurse, page):
    DashboardPage(page).click_unmatched_consent_responses()


def test_archive_unmatched_consent_response_removes_from_list(
    give_online_consent,
    go_to_unmatched_consent_responses,
    page,
    children,
):
    """
    Test: Archive an unmatched consent response and verify it is removed from the list.
    Steps:
    1. Select a child from the unmatched consent responses.
    2. Click the archive button and provide notes.
    Verification:
    - Archived alert is visible.
    - The consent response for the child is no longer visible in the unmatched list.
    """
    child = children[Programme.HPV][0]
    UnmatchedConsentResponsesPage(page).click_parent_on_consent_record_for_child(child)

    ConsentResponsePage(page).click_archive()
    ArchiveConsentResponsePage(page).archive(notes="Some notes.")

    expect(UnmatchedConsentResponsesPage(page).archived_alert).to_be_visible()
    UnmatchedConsentResponsesPage(page).check_response_for_child_not_visible(child)


def test_match_unmatched_consent_response_and_verify_activity_log(
    give_online_consent,
    log_in_as_nurse,
    children,
    page,
    test_data,
):
    """
    Test: Match an unmatched consent response to a child and verify activity log.
    Steps:
    1. Import a fixed child class list for the current year.
    2. Navigate to unmatched consent responses and select a child.
    3. Click match and complete the matching process.
    4. Verify the child is removed from unmatched responses.
    5. Go to children page and verify activity log for the matched child.
    Verification:
    - Matched alert is visible.
    - Consent response for the child is no longer visible in unmatched list.
    - Activity log for the child shows the match event.
    """
    child = children[Programme.HPV][0]

    DashboardPage(page).click_programmes()
    ProgrammesListPage(page).click_programme_for_current_year(Programme.HPV)
    ProgrammeOverviewPage(page).tabs.click_children_tab()
    ProgrammeChildrenPage(page).click_import_child_records()
    ImportRecordsWizardPage(page, test_data).import_class_list(
        CohortsFileMapping.FIXED_CHILD
    )
    ImportsPage(page).header.click_mavis_header()
    DashboardPage(page).click_unmatched_consent_responses()

    UnmatchedConsentResponsesPage(page).click_parent_on_consent_record_for_child(child)

    ConsentResponsePage(page).click_match()
    MatchConsentResponsePage(page).match(child)

    expect(UnmatchedConsentResponsesPage(page).matched_alert).to_be_visible()
    UnmatchedConsentResponsesPage(page).check_response_for_child_not_visible(child)

    UnmatchedConsentResponsesPage(page).header.click_mavis_header()
    DashboardPage(page).click_children()
    ChildrenSearchPage(page).search_with_all_filters_for_child_name(str(child))
    ChildrenSearchPage(page).click_record_for_child(child)
    ChildRecordPage(page).tabs.click_activity_log()
    ChildActivityLogPage(page).verify_activity_log_for_created_or_matched_child()


def test_create_child_record_from_consent_with_nhs_number(
    give_online_consent_pds_child,
    go_to_unmatched_consent_responses,
    pds_child,
    page,
):
    """
    Test: Create a new child record from an unmatched consent response with NHS number.
    Steps:
    1. Select a child from unmatched consent responses.
    2. Click to create a new record and complete the process.
    3. Verify the child is removed from unmatched responses.
    4. Go to children page and verify activity log for the created child.
    Verification:
    - Created alert is visible.
    - Consent response for the child is no longer visible in unmatched list.
    - Activity log for the child shows the creation event.
    """
    child = pds_child

    UnmatchedConsentResponsesPage(page).click_parent_on_consent_record_for_child(child)

    ConsentResponsePage(page).click_create_new_record()
    CreateNewRecordConsentResponsePage(page).create_new_record()

    expect(UnmatchedConsentResponsesPage(page).created_alert).to_be_visible()
    UnmatchedConsentResponsesPage(page).check_response_for_child_not_visible(child)

    UnmatchedConsentResponsesPage(page).header.click_mavis_header()
    DashboardPage(page).click_children()
    ChildrenSearchPage(page).search_with_all_filters_for_child_name(str(child))
    ChildrenSearchPage(page).click_record_for_child(child)
    ChildRecordPage(page).tabs.click_activity_log()
    ChildActivityLogPage(page).verify_activity_log_for_created_or_matched_child()


def test_create_child_record_from_consent_without_nhs_number(
    give_online_consent,
    go_to_unmatched_consent_responses,
    children,
    page,
):
    """
    Test: Create a new child record from an unmatched consent response
       without NHS number.
    Steps:
    1. Select a child from unmatched consent responses.
    2. Click to create a new record and complete the process.
    3. Verify the child is removed from unmatched responses.
    4. Go to children page and verify activity log for the created child.
    Verification:
    - Created alert is visible.
    - Consent response for the child is no longer visible in unmatched list.
    - Activity log for the child shows the creation event.
    """
    child = children[Programme.HPV][0]
    UnmatchedConsentResponsesPage(page).click_parent_on_consent_record_for_child(child)

    ConsentResponsePage(page).click_create_new_record()
    CreateNewRecordConsentResponsePage(page).create_new_record()

    expect(UnmatchedConsentResponsesPage(page).created_alert).to_be_visible()
    UnmatchedConsentResponsesPage(page).check_response_for_child_not_visible(child)

    UnmatchedConsentResponsesPage(page).header.click_mavis_header()
    DashboardPage(page).click_children()
    ChildrenSearchPage(page).search_with_all_filters_for_child_name(str(child))
    ChildrenSearchPage(page).click_record_for_child(child)
    ChildRecordPage(page).tabs.click_activity_log()
    ChildActivityLogPage(page).verify_activity_log_for_created_or_matched_child()


@pytest.mark.accessibility
def test_accessibility(
    give_online_consent,
    log_in_as_nurse,
    children,
    page,
    test_data,
):
    """
    Test: Check accessibility of consent response pages.
    Steps:
    1. Navigate to the consent response page.
    2. Verify each page passes accessibility checks.
    Verification:
    - Accessibility checks pass on all relevant pages.
    """
    child = children[Programme.HPV][0]

    DashboardPage(page).click_programmes()
    ProgrammesListPage(page).click_programme_for_current_year(Programme.HPV)
    ProgrammeOverviewPage(page).tabs.click_children_tab()
    ProgrammeChildrenPage(page).click_import_child_records()
    ImportRecordsWizardPage(page, test_data).import_class_list(
        CohortsFileMapping.FIXED_CHILD
    )
    ImportsPage(page).header.click_mavis_header()
    DashboardPage(page).click_unmatched_consent_responses()
    AccessibilityHelper(page).check_accessibility()

    UnmatchedConsentResponsesPage(page).click_parent_on_consent_record_for_child(child)
    AccessibilityHelper(page).check_accessibility()

    ConsentResponsePage(page).click_match()
    AccessibilityHelper(page).check_accessibility()

    MatchConsentResponsePage(page).search_for_child_with_all_filters(child)
    AccessibilityHelper(page).check_accessibility()


@issue("MAV-2681")
def test_match_consent_with_vaccination_record_no_service_error(
    give_online_consent,
    log_in_as_nurse,
    upload_offline_vaccination,
    children,
    page,
    test_data,
):
    """
    Test: Submit a consent form that won't match automatically, find a patient
    with a vaccination record, attempt to match the consent form with that patient,
    and verify that ServiceErrorPage is not displayed.
    Steps:
    1. Submit a consent form that won't match with a patient automatically
       (already done by give_online_consent).
    2. Import a class list to create searchable child records.
    3. Import a vaccination record for a different child to create a patient with
       vaccination history.
    4. Find the patient with vaccination record and attempt to match the consent
       form with that patient.
    5. Verify that the ServiceErrorPage is not displayed during the matching
       process.
    Verification:
    - No ServiceErrorPage or error page is displayed during consent matching.
    - The matching process completes without server errors.
    """
    child_with_consent = children[Programme.HPV][0]

    # Step 2: Import a class list to create searchable child records for both children
    DashboardPage(page).click_programmes()
    ProgrammesListPage(page).click_programme_for_current_year(Programme.HPV)
    ProgrammeOverviewPage(page).tabs.click_children_tab()
    ProgrammeChildrenPage(page).click_import_child_records()
    ImportRecordsWizardPage(page, test_data).import_class_list(
        ClassFileMapping.TWO_FIXED_CHILDREN
    )

    # Step 3: Import a vaccination record for the different child to create a
    # patient with vaccination history
    list(upload_offline_vaccination(Programme.HPV))
    child_with_vaccination = children[Programme.HPV][1]

    # Navigate back to unmatched consent responses
    ImportsPage(page).header.click_mavis_header()
    DashboardPage(page).click_unmatched_consent_responses()

    # Step 4: Navigate to unmatched consent responses and attempt to search for
    # the patient who has vaccination record (this tests the edge case)
    UnmatchedConsentResponsesPage(page).click_parent_on_consent_record_for_child(
        child_with_consent
    )
    ConsentResponsePage(page).click_match()

    # Verify no service error when searching for different child with vaccination
    expect(ServiceErrorPage(page).page_heading).not_to_be_visible()

    # Search for child who has vaccination record - should not cause service error
    MatchConsentResponsePage(page).search_for_child_with_all_filters(
        child_with_vaccination
    )

    # Final verification that no error pages appeared during the search process
    expect(ServiceErrorPage(page).page_heading).not_to_be_visible()
