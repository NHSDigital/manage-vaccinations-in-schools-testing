import pytest
from playwright.sync_api import expect

from mavis.test.annotations import issue
from mavis.test.models import Vaccine
from mavis.test.utils import get_offset_date

pytestmark = pytest.mark.vaccines


@pytest.fixture(autouse=True)
def go_to_vaccines_page(log_in_as_nurse, dashboard_page):
    dashboard_page.click_vaccines()


@pytest.mark.parametrize("vaccine", Vaccine)
def test_batch_add_change_archive(
    vaccine,
    add_batch_page,
    archive_batch_page,
    edit_batch_page,
    vaccines_page,
):
    """
    Test: Add, edit, and archive a vaccine batch and verify success alerts.
    Steps:
    1. Click to add a new batch for the given vaccine.
    2. Fill in batch name and expiry date, then confirm.
    3. Edit the batch expiry date and confirm.
    4. Archive the batch and confirm.
    Verification:
    - Success alerts are visible after each operation (add, edit, archive).
    """
    batch_name = "ABC123"

    vaccines_page.click_add_batch(vaccine)
    add_batch_page.fill_name(batch_name)
    add_batch_page.fill_expiry_date(get_offset_date(1))
    add_batch_page.confirm()
    expect(add_batch_page.success_alert).to_be_visible()

    vaccines_page.click_change_batch(vaccine, batch_name)
    edit_batch_page.fill_expiry_date(get_offset_date(2))
    edit_batch_page.confirm()
    expect(edit_batch_page.success_alert).to_be_visible()

    vaccines_page.click_archive_batch(vaccine, batch_name)
    archive_batch_page.confirm()
    expect(archive_batch_page.success_alert).to_be_visible()


@issue("MAV-955")
@pytest.mark.parametrize("vaccine", Vaccine)
def test_batch_name_too_short(vaccine, add_batch_page, vaccines_page):
    """
    Test: Attempt to add a batch with a name that is too short and verify error message.
    Steps:
    1. Click to add a new batch for the given vaccine.
    2. Enter a batch name with only one character.
    3. Fill in expiry date and confirm.
    Verification:
    - Error message is shown indicating the batch name must be more than 2 characters.
    """
    vaccines_page.click_add_batch(vaccine)
    add_batch_page.fill_name("a")
    add_batch_page.fill_expiry_date(get_offset_date(1))
    add_batch_page.confirm()
    expect(
        add_batch_page.error_listitem.filter(
            has_text="Enter a batch that is more than 2 characters long",
        ),
    ).to_be_visible()


@issue("MAV-955")
@pytest.mark.parametrize("vaccine", Vaccine)
def test_batch_name_too_long(vaccine, add_batch_page, vaccines_page):
    """
    Test: Attempt to add a batch with a name that is too long and verify error message.
    Steps:
    1. Click to add a new batch for the given vaccine.
    2. Enter a batch name with more than 100 characters.
    3. Fill in expiry date and confirm.
    Verification:
    - Error message is shown indicating the batch name must be less than 100 characters.
    """
    vaccines_page.click_add_batch(vaccine)
    add_batch_page.fill_name("a" * 101)
    add_batch_page.fill_expiry_date(get_offset_date(1))
    add_batch_page.confirm()
    expect(
        add_batch_page.error_listitem.filter(
            has_text="Enter a batch that is less than 100 characters long",
        ),
    ).to_be_visible()


def test_verify_flu_not_available(onboarding, vaccines_page):
    """
    Test: Verify that the flu vaccine is not available for selection if not enabled
       in onboarding.
    Steps:
    1. Retrieve the list of enabled programmes from onboarding.
    2. Check the vaccines page for flu vaccine availability.
    Verification:
    - Flu vaccine is not available for selection if not present in the
      enabled programmes.
    """
    programmes = onboarding.get("programmes")
    vaccines_page.verify_flu_not_available(programmes)
