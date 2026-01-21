import pytest

from mavis.test.constants import Programme
from mavis.test.pages import (
    EditVaccinationRecordPage,
    VaccinationRecordPage,
)
from mavis.test.utils import expect_alert_text


@pytest.fixture
def upload_offline_vaccination_hpv(upload_offline_vaccination):
    yield from upload_offline_vaccination(Programme.HPV)


@pytest.mark.rav
@pytest.mark.bug
def test_edit_vaccination_dose_to_not_given(
    log_in_as_nurse,
    upload_offline_vaccination_hpv,
    page,
):
    """
    Test: Edit a vaccination dose to 'not given' and verify outcome.
    Steps:
    1. Navigate to the child in the programme.
    2. Edit the vaccination record and change outcome to 'they refused it'.
    3. Save changes.
    Verification:
    - Alert confirms vaccination outcome recorded as refused.
    """
    VaccinationRecordPage(page).click_edit_vaccination_record()
    EditVaccinationRecordPage(page).click_change_outcome()
    EditVaccinationRecordPage(page).click_they_refused_it()
    EditVaccinationRecordPage(page).click_continue()
    EditVaccinationRecordPage(page).click_save_changes()
    expect_alert_text(page, "Vaccination outcome recorded for HPV")
