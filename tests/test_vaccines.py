import pytest
from playwright.sync_api import expect

from mavis.test.annotations import issue
from mavis.test.constants import Vaccine
from mavis.test.helpers.accessibility_helper import AccessibilityHelper
from mavis.test.pages import (
    AddBatchPage,
    ArchiveBatchPage,
    DashboardPage,
    EditBatchPage,
    VaccinesPage,
)
from mavis.test.utils import get_offset_date

pytestmark = pytest.mark.vaccines


@pytest.fixture(autouse=True)
def go_to_vaccines_page(log_in_as_nurse, page):
    DashboardPage(page).click_vaccines()


@pytest.mark.parametrize("vaccine", Vaccine)
def test_batch_add_change_archive(
    vaccine,
    page,
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

    VaccinesPage(page).click_add_batch(vaccine)
    AddBatchPage(page).fill_name(batch_name)
    AddBatchPage(page).date.fill_expiry_date(get_offset_date(1))
    AddBatchPage(page).confirm()
    expect(AddBatchPage(page).success_alert).to_be_visible()

    VaccinesPage(page).click_change_batch(vaccine, batch_name)
    EditBatchPage(page).date.fill_expiry_date(get_offset_date(2))
    EditBatchPage(page).confirm()
    expect(EditBatchPage(page).success_alert).to_be_visible()

    VaccinesPage(page).click_archive_batch(vaccine, batch_name)
    ArchiveBatchPage(page).confirm()
    expect(ArchiveBatchPage(page).success_alert).to_be_visible()


@issue("MAV-955")
@pytest.mark.parametrize("vaccine", Vaccine)
def test_batch_name_too_short(vaccine, page):
    """
    Test: Attempt to add a batch with a name that is too short and verify error message.
    Steps:
    1. Click to add a new batch for the given vaccine.
    2. Enter a batch name with only one character.
    3. Fill in expiry date and confirm.
    Verification:
    - Error message is shown indicating the batch name must be more than 2 characters.
    """
    VaccinesPage(page).click_add_batch(vaccine)
    AddBatchPage(page).fill_name("a")
    AddBatchPage(page).date.fill_expiry_date(get_offset_date(1))
    AddBatchPage(page).confirm()
    expect(
        AddBatchPage(page).error_listitem.filter(
            has_text="Enter a batch that is more than 2 characters long",
        ),
    ).to_be_visible()


@issue("MAV-955")
@pytest.mark.parametrize("vaccine", Vaccine)
def test_batch_name_too_long(vaccine, page):
    """
    Test: Attempt to add a batch with a name that is too long and verify error message.
    Steps:
    1. Click to add a new batch for the given vaccine.
    2. Enter a batch name with more than 100 characters.
    3. Fill in expiry date and confirm.
    Verification:
    - Error message is shown indicating the batch name must be less than 100 characters.
    """
    VaccinesPage(page).click_add_batch(vaccine)
    AddBatchPage(page).fill_name("a" * 101)
    AddBatchPage(page).date.fill_expiry_date(get_offset_date(1))
    AddBatchPage(page).confirm()
    expect(
        AddBatchPage(page).error_listitem.filter(
            has_text="Enter a batch that is less than 100 characters long",
        ),
    ).to_be_visible()


def test_verify_flu_not_available(onboarding, page):
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
    programmes = onboarding.programmes
    VaccinesPage(page).verify_flu_not_available(programmes)


@pytest.mark.accessibility
def test_accessibility(page):
    """
    Test: Verify that the vaccines page passes accessibility checks.
    Steps:
    1. Navigate to the vaccines page.
    2. Run accessibility checks using the accessibility helper.
    Verification:
    - No accessibility violations are found on the vaccines page.
    """

    batch_name = "ACCESS123"

    VaccinesPage(page).click_add_batch(Vaccine.GARDASIL_9)
    AccessibilityHelper(page).check_accessibility()

    AddBatchPage(page).fill_name(batch_name)
    AddBatchPage(page).date.fill_expiry_date(get_offset_date(1))
    AddBatchPage(page).confirm()
    AccessibilityHelper(page).check_accessibility()

    VaccinesPage(page).click_change_batch(Vaccine.GARDASIL_9, batch_name)
    AccessibilityHelper(page).check_accessibility()

    EditBatchPage(page).date.fill_expiry_date(get_offset_date(2))
    EditBatchPage(page).confirm()
    VaccinesPage(page).click_archive_batch(Vaccine.GARDASIL_9, batch_name)

    AccessibilityHelper(page).check_accessibility()
    ArchiveBatchPage(page).confirm()
