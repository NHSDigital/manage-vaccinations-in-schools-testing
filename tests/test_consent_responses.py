import pytest
from playwright.sync_api import expect

from mavis.test.annotations import issue
from mavis.test.data import ClassFileMapping, CohortsFileMapping, pds
from mavis.test.models import Programme

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
    start_page,
    online_consent_page,
    online_consent_url,
    children,
    schools,
):
    child = children[Programme.HPV][0]
    schools = schools[Programme.HPV]

    page.goto(online_consent_url)
    start_page.start()
    online_consent_page.fill_details(child, child.parents[0], schools)
    online_consent_page.agree_to_hpv_vaccination()
    online_consent_page.fill_address_details(*child.address)
    online_consent_page.answer_health_questions(4, yes_to_health_questions=False)
    online_consent_page.click_confirm()


@pytest.fixture
def give_online_consent_pds_child(
    page,
    start_page,
    online_consent_page,
    online_consent_url,
    pds_child,
    schools,
):
    child = pds_child
    schools = schools[Programme.HPV]

    page.goto(online_consent_url)
    start_page.start()
    online_consent_page.fill_details(child, child.parents[0], schools)
    online_consent_page.agree_to_hpv_vaccination()
    online_consent_page.fill_address_details(*child.address)
    online_consent_page.answer_health_questions(4, yes_to_health_questions=False)
    online_consent_page.click_confirm()


@pytest.fixture
def go_to_unmatched_consent_responses(log_in_as_nurse, dashboard_page):
    dashboard_page.click_unmatched_consent_responses()


def test_archive_unmatched_consent_response_removes_from_list(
    give_online_consent,
    go_to_unmatched_consent_responses,
    archive_consent_response_page,
    children,
    consent_response_page,
    unmatched_consent_responses_page,
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
    unmatched_consent_responses_page.click_parent_on_consent_record_for_child(child)

    consent_response_page.click_archive()
    archive_consent_response_page.archive(notes="Some notes.")

    expect(unmatched_consent_responses_page.archived_alert).to_be_visible()
    unmatched_consent_responses_page.check_response_for_child_not_visible(child)


def test_match_unmatched_consent_response_and_verify_activity_log(
    give_online_consent,
    go_to_unmatched_consent_responses,
    children,
    children_search_page,
    child_record_page,
    child_activity_log_page,
    consent_response_page,
    dashboard_page,
    match_consent_response_page,
    programmes_list_page,
    programme_overview_page,
    programme_children_page,
    unmatched_consent_responses_page,
    import_records_wizard_page,
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

    dashboard_page.click_mavis()
    dashboard_page.click_programmes()
    programmes_list_page.click_programme_for_current_year(Programme.HPV)
    programme_overview_page.click_children_tab()
    programme_children_page.click_import_child_records()
    import_records_wizard_page.import_class_list(CohortsFileMapping.FIXED_CHILD)

    dashboard_page.click_mavis()
    dashboard_page.click_unmatched_consent_responses()

    unmatched_consent_responses_page.click_parent_on_consent_record_for_child(child)

    consent_response_page.click_match()
    match_consent_response_page.match(child)

    expect(unmatched_consent_responses_page.matched_alert).to_be_visible()
    unmatched_consent_responses_page.check_response_for_child_not_visible(child)

    dashboard_page.click_mavis()
    dashboard_page.click_children()
    children_search_page.search_with_all_filters_for_child_name(str(child))
    children_search_page.click_record_for_child(child)
    child_record_page.click_activity_log()
    child_activity_log_page.verify_activity_log_for_created_or_matched_child()


def test_create_child_record_from_consent_with_nhs_number(
    give_online_consent_pds_child,
    go_to_unmatched_consent_responses,
    pds_child,
    children_search_page,
    child_record_page,
    child_activity_log_page,
    consent_response_page,
    create_new_record_consent_response_page,
    dashboard_page,
    unmatched_consent_responses_page,
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

    unmatched_consent_responses_page.click_parent_on_consent_record_for_child(child)

    consent_response_page.click_create_new_record()
    create_new_record_consent_response_page.create_new_record()

    expect(unmatched_consent_responses_page.created_alert).to_be_visible()
    unmatched_consent_responses_page.check_response_for_child_not_visible(child)

    dashboard_page.click_mavis()
    dashboard_page.click_children()
    children_search_page.search_with_all_filters_for_child_name(str(child))
    children_search_page.click_record_for_child(child)
    child_record_page.click_activity_log()
    child_activity_log_page.verify_activity_log_for_created_or_matched_child()


def test_create_child_record_from_consent_without_nhs_number(
    give_online_consent,
    go_to_unmatched_consent_responses,
    children,
    children_search_page,
    child_record_page,
    child_activity_log_page,
    consent_response_page,
    create_new_record_consent_response_page,
    dashboard_page,
    unmatched_consent_responses_page,
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
    unmatched_consent_responses_page.click_parent_on_consent_record_for_child(child)

    consent_response_page.click_create_new_record()
    create_new_record_consent_response_page.create_new_record()

    expect(unmatched_consent_responses_page.created_alert).to_be_visible()
    unmatched_consent_responses_page.check_response_for_child_not_visible(child)

    dashboard_page.click_mavis()
    dashboard_page.click_children()
    children_search_page.search_with_all_filters_for_child_name(str(child))
    children_search_page.click_record_for_child(child)
    child_record_page.click_activity_log()
    child_activity_log_page.verify_activity_log_for_created_or_matched_child()


@pytest.mark.accessibility
def test_accessibility(
    give_online_consent,
    go_to_unmatched_consent_responses,
    accessibility_helper,
    children,
    dashboard_page,
    programmes_list_page,
    programme_overview_page,
    programme_children_page,
    import_records_wizard_page,
    match_consent_response_page,
    consent_response_page,
    unmatched_consent_responses_page,
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

    dashboard_page.click_mavis()
    dashboard_page.click_programmes()
    programmes_list_page.click_programme_for_current_year(Programme.HPV)
    programme_overview_page.click_children_tab()
    programme_children_page.click_import_child_records()
    import_records_wizard_page.import_class_list(CohortsFileMapping.FIXED_CHILD)

    dashboard_page.click_mavis()
    dashboard_page.click_unmatched_consent_responses()
    accessibility_helper.check_accessibility()

    unmatched_consent_responses_page.click_parent_on_consent_record_for_child(child)
    accessibility_helper.check_accessibility()

    consent_response_page.click_match()
    accessibility_helper.check_accessibility()

    match_consent_response_page.search_for_child_with_all_filters(child)
    accessibility_helper.check_accessibility()


@issue("MAV-2681")
def test_match_consent_with_vaccination_record_no_service_error(
    give_online_consent,
    go_to_unmatched_consent_responses,
    upload_offline_vaccination,
    children,
    children_search_page,
    consent_response_page,
    dashboard_page,
    match_consent_response_page,
    programmes_list_page,
    programme_overview_page,
    programme_children_page,
    import_records_wizard_page,
    unmatched_consent_responses_page,
    service_error_page,
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
    dashboard_page.click_mavis()
    dashboard_page.click_programmes()
    programmes_list_page.click_programme_for_current_year(Programme.HPV)
    programme_overview_page.click_children_tab()
    programme_children_page.click_import_child_records()
    import_records_wizard_page.import_class_list(ClassFileMapping.TWO_FIXED_CHILDREN)

    # Step 3: Import a vaccination record for the different child to create a
    # patient with vaccination history
    list(upload_offline_vaccination(Programme.HPV))
    child_with_vaccination = children[Programme.HPV][1]

    # Navigate back to unmatched consent responses
    dashboard_page.click_mavis()
    dashboard_page.click_unmatched_consent_responses()

    # Step 4: Navigate to unmatched consent responses and attempt to search for
    # the patient who has vaccination record (this tests the edge case)
    unmatched_consent_responses_page.click_parent_on_consent_record_for_child(
        child_with_consent
    )
    consent_response_page.click_match()

    # Verify no service error when searching for different child with vaccination
    expect(service_error_page.page_heading).not_to_be_visible()

    # Search for child who has vaccination record - should not cause service error
    match_consent_response_page.search_for_child_with_all_filters(
        child_with_vaccination
    )

    # Final verification that no error pages appeared during the search process
    expect(service_error_page.page_heading).not_to_be_visible()
