from datetime import date
import random

import allure
from playwright.sync_api import expect
import pytest

from mavis.test.data import pds as pds_test_data
from mavis.test.mavis_constants import test_data_file_paths, Programme

pytestmark = pytest.mark.consent_responses


@pytest.fixture
def online_consent_url(get_online_consent_url):
    yield from get_online_consent_url(Programme.HPV)


@pytest.fixture
def child_name(faker):
    return faker.first_name(), faker.last_name()


@pytest.fixture
def child_date_of_birth():
    return date(2009, 8, 12)


@pytest.fixture
def child_address():
    return (
        "1 ROWSLEY AVENUE",
        "",
        "DERBY",
        "DE23 6JZ",
    )


@pytest.fixture(autouse=True)
def give_online_consent(
    page,
    start_page,
    consent_page,
    online_consent_url,
    child_name,
    child_date_of_birth,
    child_address,
    schools,
    faker,
):
    page.goto(online_consent_url)
    start_page.start()
    consent_page.fill_child_name_details(*child_name)
    consent_page.fill_child_date_of_birth(child_date_of_birth)
    consent_page.select_child_school(schools[0])
    consent_page.fill_parent_details("Parent Full", "Dad", email=faker.email())
    consent_page.select_consent_for_programmes([Programme.HPV])
    consent_page.fill_address_details(*child_address)
    for _ in range(4):
        consent_page.select_and_provide_details(None)
    consent_page.click_confirm()


@pytest.fixture(autouse=True)
def go_to_unmatched_consent_responses(log_in_as_nurse, dashboard_page):
    dashboard_page.click_unmatched_consent_responses()


@allure.issue("MAVIS-1782")
def test_archive(
    archive_consent_response_page,
    child_name,
    consent_response_page,
    unmatched_consent_responses_page,
):
    unmatched_consent_responses_page.click_child(*child_name)

    consent_response_page.click_archive()
    archive_consent_response_page.archive(notes="Some notes.")

    expect(unmatched_consent_responses_page.archived_alert).to_be_visible()
    expect(unmatched_consent_responses_page.empty_paragraph).to_be_visible()


@allure.issue("MAVIS-1812")
@pytest.mark.parametrize("child_name", [("CMatch1", "CMatch1")])
def test_match(
    child_name,
    children_page,
    consent_response_page,
    dashboard_page,
    match_consent_response_page,
    programmes_page,
    schools,
    unmatched_consent_responses_page,
):
    dashboard_page.click_mavis()
    dashboard_page.click_programmes()
    programmes_page.upload_cohorts(file_paths=test_data_file_paths.COHORTS_UCR_MATCH)
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
        f"{child_name[1]}, {child_name[0]}", schools[0], is_created=False
    )


patient = random.choice(pds_test_data.patients)


@allure.issue("MAVIS-1812")
@pytest.mark.parametrize("child_name", [patient.full_name])
@pytest.mark.parametrize("child_date_of_birth", [patient.date_of_birth])
@pytest.mark.parametrize("child_address", [patient.address])
def test_create_with_nhs_number(
    child_name,
    children_page,
    consent_response_page,
    create_new_record_consent_response_page,
    dashboard_page,
    schools,
    unmatched_consent_responses_page,
):
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
    child_name,
    children_page,
    consent_response_page,
    create_new_record_consent_response_page,
    dashboard_page,
    schools,
    unmatched_consent_responses_page,
):
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
