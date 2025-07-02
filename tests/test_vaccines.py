from datetime import date, timedelta

import allure
import pytest
from playwright.sync_api import expect

from mavis.test.models import Vaccine

pytestmark = pytest.mark.vaccines


@pytest.fixture(autouse=True)
def go_to_vaccines_page(log_in_as_nurse, dashboard_page):
    dashboard_page.click_vaccines()


@pytest.mark.parametrize("vaccine", Vaccine)
def test_batch_add_change_archive(
    vaccine, add_batch_page, archive_batch_page, edit_batch_page, vaccines_page
):
    batch_name = "ABC123"

    vaccines_page.click_add_batch(vaccine)
    add_batch_page.fill_name(batch_name)
    add_batch_page.fill_expiry_date(date.today() + timedelta(days=1))
    add_batch_page.confirm()
    expect(add_batch_page.success_alert).to_be_visible()

    vaccines_page.click_change_batch(vaccine, batch_name)
    edit_batch_page.fill_expiry_date(date.today() + timedelta(days=2))
    edit_batch_page.confirm()
    expect(edit_batch_page.success_alert).to_be_visible()

    vaccines_page.click_archive_batch(vaccine, batch_name)
    archive_batch_page.confirm()
    expect(archive_batch_page.success_alert).to_be_visible()


@allure.issue("MAV-955")
@pytest.mark.parametrize("vaccine", Vaccine)
def test_batch_name_too_short(vaccine, add_batch_page, vaccines_page):
    vaccines_page.click_add_batch(vaccine)
    add_batch_page.fill_name("a")
    add_batch_page.fill_expiry_date(date.today() + timedelta(days=1))
    add_batch_page.confirm()
    expect(
        add_batch_page.error_listitem.filter(
            has_text="Enter a batch that is more than 2 characters long"
        )
    ).to_be_visible()


@allure.issue("MAV-955")
@pytest.mark.parametrize("vaccine", Vaccine)
def test_batch_name_too_long(vaccine, add_batch_page, vaccines_page):
    vaccines_page.click_add_batch(vaccine)
    add_batch_page.fill_name("a" * 101)
    add_batch_page.fill_expiry_date(date.today() + timedelta(days=1))
    add_batch_page.confirm()
    expect(
        add_batch_page.error_listitem.filter(
            has_text="Enter a batch that is less than 100 characters long"
        )
    ).to_be_visible()


def test_verify_flu_not_available(onboarding, vaccines_page):
    programmes = onboarding.get("programmes")
    vaccines_page.verify_flu_not_available(programmes)
