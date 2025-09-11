import random

import pytest
from playwright.sync_api import expect

from mavis.test.data import CohortsFileMapping
from mavis.test.data import pds as pds_test_data
from mavis.test.models import Child, Parent, Programme, Relationship

pytestmark = pytest.mark.consent_responses


@pytest.fixture
def online_consent_url(get_online_consent_url, schools):
    yield from get_online_consent_url(schools[Programme.HPV.group][0], Programme.HPV)


@pytest.fixture(autouse=True)
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


@pytest.fixture(autouse=True)
def go_to_unmatched_consent_responses(log_in_as_nurse, dashboard_page):
    dashboard_page.click_unmatched_consent_responses()


def test_archive_unmatched_consent_response_removes_from_list(
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
    children,
    children_page,
    consent_response_page,
    dashboard_page,
    match_consent_response_page,
    programmes_page,
    unmatched_consent_responses_page,
    import_records_page,
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
    programmes_page.navigate_to_cohort_import(Programme.HPV)
    import_records_page.import_class_list(CohortsFileMapping.FIXED_CHILD)

    dashboard_page.click_mavis()
    dashboard_page.click_unmatched_consent_responses()

    unmatched_consent_responses_page.click_parent_on_consent_record_for_child(child)

    consent_response_page.click_match()
    match_consent_response_page.match(child)

    expect(unmatched_consent_responses_page.matched_alert).to_be_visible()
    unmatched_consent_responses_page.check_response_for_child_not_visible(child)

    dashboard_page.click_mavis()
    dashboard_page.click_children()
    children_page.verify_activity_log_for_created_or_matched_child(child)


patient = random.choice(pds_test_data.child_patients_without_date_of_death)


@pytest.mark.parametrize(
    "children",
    [
        {
            Programme.HPV: [
                Child(
                    patient.given_name,
                    patient.family_name,
                    patient.nhs_number,
                    patient.address,
                    patient.date_of_birth,
                    9,
                    (Parent.get(Relationship.DAD), Parent.get(Relationship.MUM)),
                ),
            ],
        },
    ],
)
def test_create_child_record_from_consent_with_nhs_number(
    children,
    children_page,
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
    child = children[Programme.HPV][0]

    unmatched_consent_responses_page.click_parent_on_consent_record_for_child(child)

    consent_response_page.click_create_new_record()
    create_new_record_consent_response_page.create_new_record()

    expect(unmatched_consent_responses_page.created_alert).to_be_visible()
    unmatched_consent_responses_page.check_response_for_child_not_visible(child)

    dashboard_page.click_mavis()
    dashboard_page.click_children()
    children_page.verify_activity_log_for_created_or_matched_child(child)


def test_create_child_record_from_consent_without_nhs_number(
    children,
    children_page,
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
    children_page.verify_activity_log_for_created_or_matched_child(child)
