import pytest
from playwright.sync_api import expect

from mavis.test.annotations import issue
from mavis.test.constants import ConsentMethod, ConsentRefusalReason, Programme
from mavis.test.data import ChildFileMapping, ClassFileMapping
from mavis.test.helpers.accessibility_helper import AccessibilityHelper
from mavis.test.helpers.pds_api_helper import PdsApiHelper
from mavis.test.pages import (
    ArchiveConsentResponsePage,
    ChildProgrammePage,
    ChildRecordPage,
    ChildrenSearchPage,
    ConsentResponsePage,
    CreateNewRecordConsentResponsePage,
    DashboardPage,
    ImportRecordsWizardPage,
    ImportsPage,
    MatchConsentResponsePage,
    NurseConsentWizardPage,
    OnlineConsentWizardPage,
    SchoolChildrenPage,
    SchoolsSearchPage,
    ServiceErrorPage,
    SessionsChildrenPage,
    SessionsOverviewPage,
    SessionsPatientPage,
    SessionsSearchPage,
    StartPage,
    UnmatchedConsentResponsesPage,
)
from mavis.test.pages.utils import schedule_school_session_if_needed
from mavis.test.utils import expect_alert_text, expect_details, format_nhs_number


@pytest.fixture(scope="session")
def pds_api_helper(authenticate_api):
    return PdsApiHelper(authenticate_api)


@pytest.fixture
def pds_child(authenticate_api):
    pds_api_helper = PdsApiHelper(authenticate_api)
    return pds_api_helper.get_random_child_patient_without_date_of_death()


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
        len(Programme.health_questions(Programme.HPV)), yes_to_health_questions=False
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
        len(Programme.health_questions(Programme.HPV)), yes_to_health_questions=False
    )
    OnlineConsentWizardPage(page).click_confirm()


def test_archive_unmatched_consent_response_removes_from_list(
    give_online_consent,
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

    DashboardPage(page).navigate()
    DashboardPage(page).click_unmatched_consent_responses()

    UnmatchedConsentResponsesPage(page).click_parent_on_consent_record_for_child(child)

    ConsentResponsePage(page).click_archive()
    ArchiveConsentResponsePage(page).archive(notes="Some notes.")

    expect(UnmatchedConsentResponsesPage(page).archived_alert).to_be_visible()
    UnmatchedConsentResponsesPage(page).check_response_for_child_not_visible(child)


def test_match_unmatched_consent_response_and_verify_activity_log(
    give_online_consent,
    children,
    page,
    point_of_care_file_generator,
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

    DashboardPage(page).navigate()
    DashboardPage(page).click_imports()
    ImportsPage(page).click_upload_records()
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).navigate_to_child_record_import()
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_and_verify_output(ChildFileMapping.FIXED_CHILD)
    ImportsPage(page).header.click_mavis()
    DashboardPage(page).click_unmatched_consent_responses()

    UnmatchedConsentResponsesPage(page).click_parent_on_consent_record_for_child(child)

    ConsentResponsePage(page).click_match()
    MatchConsentResponsePage(page).match(child)

    expect(UnmatchedConsentResponsesPage(page).matched_alert).to_be_visible()
    UnmatchedConsentResponsesPage(page).check_response_for_child_not_visible(child)

    UnmatchedConsentResponsesPage(page).header.click_mavis()
    DashboardPage(page).click_children()
    ChildrenSearchPage(page).search.search_for_child_name_with_all_filters(str(child))
    ChildrenSearchPage(page).search.click_child(child)
    ChildRecordPage(page).click_programme(Programme.HPV)
    ChildProgrammePage(page).verify_activity_log_for_created_or_matched_child()


@pytest.mark.pds_api
def test_create_child_record_from_consent_with_nhs_number(
    give_online_consent_pds_child,
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
    - NHS number of child fetched from PDS is visible.
    - Activity log for the child shows the creation event.
    """
    child = pds_child

    DashboardPage(page).navigate()
    DashboardPage(page).click_unmatched_consent_responses()

    UnmatchedConsentResponsesPage(page).click_parent_on_consent_record_for_child(child)

    ConsentResponsePage(page).click_create_new_record()
    CreateNewRecordConsentResponsePage(page).create_new_record()

    expect(UnmatchedConsentResponsesPage(page).created_alert).to_be_visible()
    UnmatchedConsentResponsesPage(page).check_response_for_child_not_visible(child)

    UnmatchedConsentResponsesPage(page).header.click_mavis()
    DashboardPage(page).click_children()
    ChildrenSearchPage(page).search.search_for_child_name_with_all_filters(str(child))
    ChildrenSearchPage(page).search.click_child(child)
    expect_details(page, "NHS number", format_nhs_number(child.nhs_number))
    ChildRecordPage(page).click_programme(Programme.HPV)
    ChildProgrammePage(page).verify_activity_log_for_created_or_matched_child()


def test_create_child_record_from_consent_without_nhs_number(
    give_online_consent,
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

    DashboardPage(page).navigate()
    DashboardPage(page).click_unmatched_consent_responses()

    UnmatchedConsentResponsesPage(page).click_parent_on_consent_record_for_child(child)

    ConsentResponsePage(page).click_create_new_record()
    CreateNewRecordConsentResponsePage(page).create_new_record()

    expect(UnmatchedConsentResponsesPage(page).created_alert).to_be_visible()
    UnmatchedConsentResponsesPage(page).check_response_for_child_not_visible(child)

    UnmatchedConsentResponsesPage(page).header.click_mavis()
    DashboardPage(page).click_children()
    ChildrenSearchPage(page).search.search_for_child_name_with_all_filters(str(child))
    ChildrenSearchPage(page).search.click_child(child)
    ChildRecordPage(page).click_programme(Programme.HPV)
    ChildProgrammePage(page).verify_activity_log_for_created_or_matched_child()


@pytest.mark.accessibility
def test_accessibility(
    give_online_consent,
    children,
    page,
    point_of_care_file_generator,
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

    DashboardPage(page).navigate()
    DashboardPage(page).click_imports()
    ImportsPage(page).click_upload_records()
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).navigate_to_child_record_import()
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_and_verify_output(ChildFileMapping.FIXED_CHILD)
    ImportsPage(page).header.click_mavis()
    DashboardPage(page).click_unmatched_consent_responses()
    AccessibilityHelper(page).check_accessibility()

    UnmatchedConsentResponsesPage(page).click_parent_on_consent_record_for_child(child)
    AccessibilityHelper(page).check_accessibility()

    ConsentResponsePage(page).click_match()
    AccessibilityHelper(page).check_accessibility()

    MatchConsentResponsePage(page).search.search_for_child_name_with_all_filters(
        str(child)
    )
    MatchConsentResponsePage(page).search.click_child(child)
    AccessibilityHelper(page).check_accessibility()


@issue("MAV-2681")
def test_match_consent_with_vaccination_record_no_service_error(
    give_online_consent,
    upload_offline_vaccination,
    children,
    page,
    point_of_care_file_generator,
    schools,
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
    year_group = child_with_consent.year_group
    school = schools[Programme.HPV][0]

    # Step 2: Import a class list to create searchable child records for both children
    DashboardPage(page).navigate()
    DashboardPage(page).click_imports()
    ImportsPage(page).click_upload_records()
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).navigate_to_class_list_record_import(str(school), year_group)
    ImportRecordsWizardPage(page, point_of_care_file_generator).import_class_list(
        ClassFileMapping.TWO_FIXED_CHILDREN
    )

    # Step 3: Import a vaccination record for the different child to create a
    # patient with vaccination history
    list(upload_offline_vaccination(Programme.HPV))
    child_with_vaccination = children[Programme.HPV][1]

    # Navigate back to unmatched consent responses
    ImportsPage(page).header.click_mavis()
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
    MatchConsentResponsePage(page).search.search_for_child_name_with_all_filters(
        str(child_with_vaccination)
    )
    MatchConsentResponsePage(page).search.click_child(child_with_vaccination)

    # Final verification that no error pages appeared during the search process
    expect(ServiceErrorPage(page).page_heading).not_to_be_visible()


@pytest.fixture
def setup_flu_session_with_child(
    log_in_as_nurse,
    schools,
    page,
    point_of_care_file_generator,
    year_groups,
):
    """Sets up a FLU session with a fixed child imported and returns the consent URL."""
    school = schools[Programme.FLU][0]
    year_group = year_groups[Programme.FLU]

    DashboardPage(page).click_schools()
    SchoolsSearchPage(page).click_school(school)
    SchoolChildrenPage(page).click_import_class_lists()
    ImportRecordsWizardPage(page, point_of_care_file_generator).import_class_list(
        ClassFileMapping.FIXED_CHILD, year_group, programme_group=Programme.FLU.group
    )
    schedule_school_session_if_needed(
        page, school, [Programme.FLU], [year_group], date_offset=7
    )
    # Capture the consent URL while we're on the session overview page
    return SessionsOverviewPage(page).get_online_consent_url(Programme.FLU)


@issue("MAV-5309")
def test_withdraw_consent_link_on_summary_card(
    setup_flu_session_with_child,
    page,
    children,
):
    """
    Test: Verify that "Withdraw consent" link displays on summary card.
    Steps:
    1. Record consent with "given" status.
    2. Verify "Withdraw consent" link is visible.
    3. Click link, enter notes, and complete withdrawal.
    Verification:
    - "Withdraw consent" link is visible for consents with response "given"
    - Link navigates to withdraw consent page
    - Withdrawal action completes successfully
    """
    child = children[Programme.FLU][0]

    # Navigate to the patient session page
    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_programme_tab(Programme.FLU)

    # Record consent with "given" status
    SessionsPatientPage(page).click_record_a_new_consent_response()
    NurseConsentWizardPage(page).select_parent(child.parents[0])
    NurseConsentWizardPage(page).select_consent_method(ConsentMethod.PHONE)
    NurseConsentWizardPage(page).record_parent_positive_consent(
        yes_to_health_questions=False, programme=Programme.FLU
    )

    # Navigate back to patient page to see summary card
    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_programme_tab(Programme.FLU)

    # Verify "Withdraw consent" link is visible
    expect(SessionsPatientPage(page).withdraw_consent_link).to_be_visible()

    # Click link and complete withdrawal
    SessionsPatientPage(page).click_withdraw_consent()
    expect(page.get_by_role("heading", name="Withdraw consent")).to_be_visible()
    NurseConsentWizardPage(page).click_consent_refusal_reason(
        ConsentRefusalReason.PERSONAL_CHOICE
    )
    NurseConsentWizardPage(page).give_withdraw_consent_notes(
        "Withdrawing consent notes"
    )
    NurseConsentWizardPage(page).click_withdraw_consent()

    # Verify consent details page shows withdrawn status
    expect_details(page, "Response", "Withdrawn")
    expect_details(page, "Notes", "Withdrawing consent notes")

    # Navigate to child record and verify activity log
    SessionsPatientPage(page).header.click_mavis()
    DashboardPage(page).click_children()
    ChildrenSearchPage(page).search.search_for_child_name_with_all_filters(str(child))
    ChildrenSearchPage(page).search.click_child(child)
    ChildRecordPage(page).click_programme(Programme.FLU)
    ChildProgrammePage(page).expect_activity_log_entry(
        f"Consent from {child.parents[0].full_name} withdrawn"
    )


@issue("MAV-5309")
def test_mark_as_invalid_link_on_summary_card(
    setup_flu_session_with_child,
    page,
    children,
):
    """
    Test: Verify that "Mark as invalid" link displays on summary card.
    Steps:
    1. Record consent with "refused" status.
    2. Verify "Mark as invalid" link is visible.
    3. Click link, enter notes, and complete invalidation.
    Verification:
    - "Mark as invalid" link is visible for refused consents
    - Link navigates to invalidation page
    - Invalidation action completes and shows result
    """
    child = children[Programme.FLU][0]

    # Navigate to the patient session page
    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_programme_tab(Programme.FLU)

    # Record consent with "refused" status
    SessionsPatientPage(page).click_record_a_new_consent_response()
    NurseConsentWizardPage(page).select_parent(child.parents[0])
    NurseConsentWizardPage(page).select_consent_method(ConsentMethod.PAPER)
    NurseConsentWizardPage(page).record_parent_refuse_consent()

    # Navigate back to patient page to see summary card
    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_programme_tab(Programme.FLU)

    # Verify "Mark as invalid" link is visible
    expect(SessionsPatientPage(page).mark_as_invalid_link).to_be_visible()

    # Click link and complete invalidation
    SessionsPatientPage(page).mark_as_invalid_link.click()
    expect(SessionsPatientPage(page).notes_textbox).to_be_visible()
    expect(SessionsPatientPage(page).mark_as_invalid_button).to_be_visible()
    SessionsPatientPage(page).fill_notes("Marking as invalid notes")
    SessionsPatientPage(page).click_mark_as_invalid_button()

    # Verify redirected to consent details page showing invalid status
    expect(page.get_by_role("heading", name=child.parents[0].full_name)).to_be_visible()
    expect_details(page, "Response", "Invalid")
    expect_details(page, "Notes", "Marking as invalid notes")

    # Navigate to child record and verify activity log
    SessionsPatientPage(page).header.click_mavis()
    DashboardPage(page).click_children()
    ChildrenSearchPage(page).search.search_for_child_name_with_all_filters(str(child))
    ChildrenSearchPage(page).search.click_child(child)
    ChildRecordPage(page).click_programme(Programme.FLU)
    ChildProgrammePage(page).expect_activity_log_entry(
        f"Consent from {child.parents[0].full_name} invalidated"
    )


@issue("MAV-5309")
def test_follow_up_link_on_summary_card(
    setup_flu_session_with_child,
    page,
    children,
    schools,
):
    """
    Test: Verify that "Follow up" link displays on summary card and can be completed.
    Steps:
    1. Record online consent with follow-up request.
    2. Navigate to patient page.
    3. Verify "Follow up" link is visible.
    4. Click link, enter notes, and complete follow-up.
    Verification:
    - "Follow up" link is visible for consents with follow-up request
    - Link navigates to correct page and follow-up can be completed
    - Follow-up sent confirmation is displayed
    """
    consent_url = setup_flu_session_with_child
    child = children[Programme.FLU][0]
    school = schools[Programme.FLU][0]

    # Record online consent with follow-up request
    page.goto(consent_url)
    StartPage(page).start()
    OnlineConsentWizardPage(page).fill_child_name_details(
        child.first_name, child.last_name
    )
    OnlineConsentWizardPage(page).fill_child_date_of_birth(child.date_of_birth)
    OnlineConsentWizardPage(page).select_child_school(school)
    OnlineConsentWizardPage(page).fill_parent_details(child.parents[0])
    OnlineConsentWizardPage(page).dont_agree_to_vaccination()
    OnlineConsentWizardPage(page).select_consent_not_given_reason(
        ConsentRefusalReason.PERSONAL_CHOICE
    )
    OnlineConsentWizardPage(page).answer_follow_up_question(
        yes_to_follow_up_request=True
    )
    OnlineConsentWizardPage(page).click_confirm()

    # Navigate to patient page
    DashboardPage(page).navigate()
    DashboardPage(page).click_sessions()
    SessionsSearchPage(page).click_session_for_programme_group(school, Programme.FLU)
    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_programme_tab(Programme.FLU)

    # Verify "Follow up" link is visible
    expect(SessionsPatientPage(page).follow_up_link).to_be_visible()

    # Click link and complete follow-up
    SessionsPatientPage(page).follow_up_link.click()
    expect(page.get_by_role("heading", name="Follow up")).to_be_visible()
    # Complete by clicking continue (notes are optional)
    NurseConsentWizardPage(page).select_parent_consent_refusal_stands_no()
    NurseConsentWizardPage(page).click_continue()
    NurseConsentWizardPage(page).record_parent_positive_consent(
        yes_to_health_questions=False, programme=Programme.FLU
    )
    expect_alert_text(page, "Consent recorded for")
