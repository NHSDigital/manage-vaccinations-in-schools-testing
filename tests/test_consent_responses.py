import random

import pytest
from playwright.sync_api import expect

from mavis.test.data import pds as pds_test_data, CohortsFileMapping
from mavis.test.models import Programme, Child, Parent, Relationship

pytestmark = pytest.mark.consent_responses


@pytest.fixture
def online_consent_url(get_online_consent_url, schools):
    yield from get_online_consent_url(schools[Programme.HPV.group][0], Programme.HPV)


@pytest.fixture(autouse=True)
def give_online_consent(
    page,
    start_page,
    consent_page,
    online_consent_url,
    children,
    schools,
):
    child = children[Programme.HPV][0]
    school = schools[Programme.HPV][0]

    page.goto(online_consent_url)
    start_page.start()
    consent_page.fill_details(child, child.parents[0], school)
    consent_page.agree_to_hpv_vaccination()
    consent_page.fill_address_details(*child.address)
    consent_page.answer_health_questions(4, health_question=False)
    consent_page.click_confirm()


@pytest.fixture(autouse=True)
def go_to_unmatched_consent_responses(log_in_as_nurse, dashboard_page):
    dashboard_page.click_unmatched_consent_responses()


def test_archive(
    archive_consent_response_page,
    children,
    consent_response_page,
    unmatched_consent_responses_page,
):
    child = children[Programme.HPV][0]
    unmatched_consent_responses_page.click_child(child)

    consent_response_page.click_archive()
    archive_consent_response_page.archive(notes="Some notes.")

    expect(unmatched_consent_responses_page.archived_alert).to_be_visible()
    expect(unmatched_consent_responses_page.empty_paragraph).to_be_visible()


def test_match(
    children,
    children_page,
    consent_response_page,
    dashboard_page,
    match_consent_response_page,
    programmes_page,
    schools,
    unmatched_consent_responses_page,
    import_records_page,
):
    child = children[Programme.HPV][0]
    school = schools[Programme.HPV][0]

    dashboard_page.click_mavis()
    dashboard_page.click_programmes()
    programmes_page.navigate_to_cohort_import(Programme.HPV)
    import_records_page.import_class_list_for_current_year(
        CohortsFileMapping.FIXED_CHILD
    )

    dashboard_page.click_mavis()
    dashboard_page.click_unmatched_consent_responses()

    unmatched_consent_responses_page.click_child(child)

    consent_response_page.click_match()
    match_consent_response_page.match(child)

    expect(unmatched_consent_responses_page.matched_alert).to_be_visible()
    expect(unmatched_consent_responses_page.empty_paragraph).to_be_visible()

    dashboard_page.click_mavis()
    dashboard_page.click_children()
    children_page.verify_activity_log_for_created_or_matched_child(child, school)


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
                )
            ]
        }
    ],
)
def test_create_with_nhs_number(
    children,
    children_page,
    consent_response_page,
    create_new_record_consent_response_page,
    dashboard_page,
    schools,
    unmatched_consent_responses_page,
):
    child = children[Programme.HPV][0]
    school = schools[Programme.HPV][0]

    unmatched_consent_responses_page.click_child(child)

    consent_response_page.click_create_new_record()
    create_new_record_consent_response_page.create_new_record()

    expect(unmatched_consent_responses_page.created_alert).to_be_visible()
    expect(unmatched_consent_responses_page.empty_paragraph).to_be_visible()

    dashboard_page.click_mavis()
    dashboard_page.click_children()
    children_page.verify_activity_log_for_created_or_matched_child(
        child, school, use_all_filters=True
    )


def test_create_with_no_nhs_number(
    children,
    children_page,
    consent_response_page,
    create_new_record_consent_response_page,
    dashboard_page,
    schools,
    unmatched_consent_responses_page,
):
    child = children[Programme.HPV][0]
    school = schools[Programme.HPV][0]
    unmatched_consent_responses_page.click_child(child)

    consent_response_page.click_create_new_record()
    create_new_record_consent_response_page.create_new_record()

    expect(unmatched_consent_responses_page.created_alert).to_be_visible()
    expect(unmatched_consent_responses_page.empty_paragraph).to_be_visible()

    dashboard_page.click_mavis()
    dashboard_page.click_children()
    children_page.verify_activity_log_for_created_or_matched_child(child, school)
