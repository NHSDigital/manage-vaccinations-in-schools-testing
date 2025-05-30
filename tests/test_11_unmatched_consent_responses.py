import allure
import pytest

from mavis.test.mavis_constants import test_data_file_paths, Programme

pytestmark = pytest.mark.unmatched_consent_responses


@pytest.fixture
def online_consent_url(get_online_consent_url):
    yield from get_online_consent_url(Programme.HPV)


@pytest.fixture
def child_name(faker):
    return faker.first_name(), faker.last_name()


@pytest.fixture
def child_date_of_birth():
    return 12, 8, 2009


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
    consent_page.fill_child_dob(*child_date_of_birth)
    consent_page.select_child_school(schools[0])
    consent_page.fill_parent_details("Parent Full", "Dad", email=faker.email())
    consent_page.select_consent_for_hpv_vaccination(True)
    consent_page.fill_address_details(*child_address)
    for _ in range(4):
        consent_page.select_and_provide_details(None)
    consent_page.click_confirm_details()


@pytest.fixture(autouse=True)
def go_to_unmatched_consent_responses(log_in_as_nurse, dashboard_page):
    dashboard_page.click_unmatched_consent_responses()


@pytest.mark.order(1002)
@allure.issue("MAVIS-1782")
def test_archive_record(unmatched_page, child_name):
    unmatched_page.archive_record(*child_name)


@pytest.mark.order(1004)
@allure.issue("MAVIS-1812")
@pytest.mark.parametrize("child_name", [("CMatch1", "CMatch1")])
def test_match_record(
    dashboard_page, programmes_page, unmatched_page, schools, child_name
):
    dashboard_page.click_mavis()
    dashboard_page.click_programmes()
    programmes_page.upload_cohorts(file_paths=test_data_file_paths.COHORTS_UCR_MATCH)
    dashboard_page.click_mavis()
    dashboard_page.click_unmatched_consent_responses()

    unmatched_page.match_with_record(schools[0], "CMatch1", "CMatch1")


@pytest.mark.order(1003)
@allure.issue("MAVIS-1812")
@pytest.mark.parametrize("child_name", [("Helena", "Hoyte")])
@pytest.mark.parametrize("child_date_of_birth", [(20, 8, 2011)])
@pytest.mark.parametrize(
    "child_address", [("1 WEST PARK PLACE", "RETFORD", "NOTTS", "DN22 7PP")]
)
def test_create_record_with_nhs_number(unmatched_page, schools, child_name):
    unmatched_page.create_record(schools[0], *child_name)


@pytest.mark.order(1005)
@allure.issue("MAVIS-1781")
def test_create_record_with_no_nhs_number(unmatched_page, schools, child_name):
    unmatched_page.create_record_with_no_nhs_number(schools[0], *child_name)
