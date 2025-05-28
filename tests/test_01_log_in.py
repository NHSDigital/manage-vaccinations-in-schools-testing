from playwright.sync_api import expect
import pytest

from libs.mavis_constants import test_data_values


organisation = test_data_values.ORG_CODE


@pytest.fixture(autouse=True)
def go_to_log_in_page(start_page):
    start_page.navigate_and_start()


@pytest.mark.log_in
@pytest.mark.order(101)
@pytest.mark.parametrize("username", ("", "invalid"))
@pytest.mark.parametrize("password", ("", "invalid"))
def test_invalid(username, password, log_in_page):
    log_in_page.log_in(username, password)
    expect(log_in_page.error_message).to_be_visible()


@pytest.mark.log_in
@pytest.mark.order(102)
def test_valid_admin(admin, log_in_page, dashboard_page):
    log_in_page.log_in(**admin)
    log_in_page.expect_success()
    log_in_page.select_role(organisation)
    dashboard_page.verify_all_expected_links_for_admin()
    log_in_page.log_out()


@pytest.mark.log_in
@pytest.mark.order(103)
def test_valid_nurse(nurse, log_in_page, dashboard_page):
    log_in_page.log_in(**nurse)
    log_in_page.expect_success()
    log_in_page.select_role(organisation)
    dashboard_page.verify_all_expected_links_for_nurse()
    log_in_page.log_out()


@pytest.mark.log_in
@pytest.mark.order(104)
def test_valid_superuser(superuser, log_in_page, dashboard_page):
    log_in_page.log_in(**superuser)
    log_in_page.expect_success()
    log_in_page.select_role(organisation)
    dashboard_page.verify_all_expected_links_for_superuser()
    log_in_page.log_out()
