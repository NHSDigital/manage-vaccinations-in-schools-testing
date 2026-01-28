import pytest

from mavis.test.constants import DeliverySite, Programme, Vaccine
from mavis.test.pages import (
    EditVaccinationRecordPage,
    VaccinationRecordPage,
)
from mavis.test.pages.sessions.sessions_patient_page import SessionsPatientPage
from mavis.test.utils import expect_alert_text


@pytest.fixture
def setup_gardasil_batch(page, add_vaccine_batch):
    return add_vaccine_batch(Vaccine.GARDASIL_9)


@pytest.fixture
def upload_offline_vaccination_hpv(upload_offline_vaccination, add_vaccine_batch):
    yield from upload_offline_vaccination(Programme.HPV)


@pytest.mark.rav
@pytest.mark.bug
def test_edit_vaccination_dose_to_not_given_and_bac(
    log_in_as_nurse,
    setup_gardasil_batch,
    upload_offline_vaccination_hpv,
    schools,
    page,
):
    """
    Test: Edit a vaccination dose to 'not given' and verify outcome. Then
    change it back to 'given' with batch and site, and verify outcome.
    Steps:
    1. Navigate to the child in the programme.
    2. Edit the vaccination record and change outcome to 'they refused it'.
    3. Save changes.
    4. Verify alert confirms vaccination outcome recorded as refused.
    5. Edit the vaccination record again and change outcome back to 'vaccinated'.
    6. Add batch and site information.
    7. Update time of delivery.
    8. Save changes.
    Verification:
    - Alert confirms vaccination outcome recorded as refused.
    """
    school = schools[Programme.HPV][0]
    batch_name = setup_gardasil_batch

    VaccinationRecordPage(page).click_edit_vaccination_record()
    EditVaccinationRecordPage(page).click_change_outcome()
    EditVaccinationRecordPage(page).click_they_refused_it()
    EditVaccinationRecordPage(page).click_continue()
    EditVaccinationRecordPage(page).click_save_changes()
    expect_alert_text(page, "Vaccination outcome recorded for HPV")

    SessionsPatientPage(page).click_vaccination_details(school)
    VaccinationRecordPage(page).click_edit_vaccination_record()
    EditVaccinationRecordPage(page).click_change_outcome()
    EditVaccinationRecordPage(page).click_vaccinated()
    EditVaccinationRecordPage(page).click_continue()
    EditVaccinationRecordPage(page).add_batch(batch_name)
    EditVaccinationRecordPage(page).add_method_and_site(DeliverySite.LEFT_ARM_UPPER)
    EditVaccinationRecordPage(page).update_time_of_delivery()
    EditVaccinationRecordPage(page).click_save_changes()
    expect_alert_text(page, "Vaccination outcome recorded for HPV")
