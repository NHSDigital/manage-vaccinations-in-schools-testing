import random

import allure
import pytest
from playwright.sync_api import expect

from mavis.test.data import pds as pds_test_data, CohortsFileMapping
from mavis.test.models import Programme, Child

pytestmark = pytest.mark.consent_responses


@pytest.fixture
def online_consent_url(get_online_consent_url):
    yield from get_online_consent_url(Programme.HPV)


@pytest.fixture(autouse=True)
def give_online_consent(
    page,
    start_page,
    consent_page,
    online_consent_url,
    children,
    schools,
    faker,
):
    child = children[0]

    page.goto(online_consent_url)
    start_page.start()
    consent_page.fill_child_name_details(*child.name)
    consent_page.fill_child_date_of_birth(child.date_of_birth)
    consent_page.select_child_school(schools[0])
    consent_page.fill_parent_details("Parent Full", "Dad", email=faker.email())
    consent_page.agree_to_hpv_vaccination()
    consent_page.fill_address_details(*child.address)
    for _ in range(4):
        consent_page.answer_no()
    consent_page.click_confirm()


@pytest.fixture(autouse=True)
def go_to_unmatched_consent_responses(log_in_as_nurse, dashboard_page):
    dashboard_page.click_unmatched_consent_responses()


@allure.issue("MAVIS-1782")
def test_archive(
    archive_consent_response_page,
    children,
    consent_response_page,
    unmatched_consent_responses_page,
):
    unmatched_consent_responses_page.click_child(*children[0].name)

    consent_response_page.click_archive()
    archive_consent_response_page.archive(notes="Some notes.")

    expect(unmatched_consent_responses_page.archived_alert).to_be_visible()
    expect(unmatched_consent_responses_page.empty_paragraph).to_be_visible()


@allure.issue("MAVIS-1812")
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
    child_name = children[0].name
    dashboard_page.click_mavis()
    dashboard_page.click_programmes()
    programmes_page.navigate_to_cohort_import(Programme.HPV)
    import_records_page.upload_and_verify_output(CohortsFileMapping.UCR_MATCH)

    dashboard_page.click_mavis()
    dashboard_page.click_unmatched_consent_responses()

    unmatched_consent_responses_page.click_child(*child_name)

    consent_response_page.click_match()
    match_consent_response_page.match(*child_name)

    expect(unmatched_consent_responses_page.matched_alert).to_be_visible()
    expect(unmatched_consent_responses_page.empty_paragraph).to_be_visible()

    dashboard_page.click_mavis()
    dashboard_page.click_children()
    children_page.verify_activity_log_for_created_or_matched_child(
        str(children[0]), schools[0], is_created=False
    )


patient = random.choice(pds_test_data.child_patients_without_date_of_death)


@allure.issue("MAVIS-1812")
@pytest.mark.parametrize(
    "children",
    [
        [
            Child(
                patient.given_name,
                patient.family_name,
                patient.nhs_number,
                patient.address,
                patient.date_of_birth,
            )
        ]
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
    child_name = children[0].name
    unmatched_consent_responses_page.click_child(*child_name)

    consent_response_page.click_create_new_record()
    create_new_record_consent_response_page.create_new_record()

    expect(unmatched_consent_responses_page.created_alert).to_be_visible()
    expect(unmatched_consent_responses_page.empty_paragraph).to_be_visible()

    dashboard_page.click_mavis()
    dashboard_page.click_children()
    children_page.verify_activity_log_for_created_or_matched_child(
        f"{child_name[1]}, {child_name[0]}", schools[0], is_created=False
    )


@allure.issue("MAVIS-1781")
def test_create_with_no_nhs_number(
    children,
    children_page,
    consent_response_page,
    create_new_record_consent_response_page,
    dashboard_page,
    schools,
    unmatched_consent_responses_page,
):
    unmatched_consent_responses_page.click_child(*children[0].name)

    consent_response_page.click_create_new_record()
    create_new_record_consent_response_page.create_new_record()

    expect(unmatched_consent_responses_page.created_alert).to_be_visible()
    expect(unmatched_consent_responses_page.empty_paragraph).to_be_visible()

    dashboard_page.click_mavis()
    dashboard_page.click_children()
    children_page.verify_activity_log_for_created_or_matched_child(
        str(children[0]), schools[0], is_created=False
    )
