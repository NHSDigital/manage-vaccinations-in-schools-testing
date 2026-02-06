import pytest

from mavis.test.annotations import issue
from mavis.test.constants import DeliverySite, Programme, Vaccine
from mavis.test.data_models import Clinic
from mavis.test.pages import (
    ChildRecordPage,
    ChildrenSearchPage,
    DashboardPage,
    EditVaccinationRecordPage,
    VaccinationRecordPage,
)
from mavis.test.pages.sessions.sessions_patient_page import SessionsPatientPage
from mavis.test.pages.utils import schedule_community_clinic_session_if_needed
from mavis.test.utils import expect_alert_text


@pytest.fixture
def setup_gardasil_batch(page, add_vaccine_batch):
    return add_vaccine_batch(Vaccine.GARDASIL_9)


@pytest.fixture
def upload_offline_vaccination_hpv(upload_offline_vaccination, add_vaccine_batch):
    yield from upload_offline_vaccination(Programme.HPV)


@pytest.fixture
def setup_session_for_mmr(setup_session_and_batches_with_fixed_child):
    return setup_session_and_batches_with_fixed_child(Programme.MMR)


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


@issue("MAV-3272")
def test_mmr_already_vaccinated_record_verification(
    log_in_as_nurse,
    setup_session_for_mmr,
    children,
    page,
):
    """
    Test: Verify child marked as vaccinated for MMR(V) doesn't show
    "Vaccination was not given".
    Steps:
    1. Upload a child record for MMR(V).
    2. Schedule a community clinic session and invite the child.
    3. Open the MMR tab and click "Record 1st dose as already given".
    4. Verify "Vaccination was not given" is not displayed.
    Verification:
    - "Vaccination was not given" text is not visible after marking as already given.
    """
    child = children[Programme.MMR][0]
    clinic = Clinic(name="Community clinic")

    schedule_community_clinic_session_if_needed(page, [Programme.MMR], date_offset=5)

    # Invite child to community clinic and open the clinic session
    DashboardPage(page).navigate()
    DashboardPage(page).click_children()
    ChildrenSearchPage(page).search.search_for_a_child_name(str(child))
    ChildrenSearchPage(page).search.click_child(child)
    ChildRecordPage(page).click_invite_to_community_clinic()
    ChildRecordPage(page).click_session_for_programme(
        clinic,
        Programme.MMR,
        check_date=False,
    )

    # Click on the MMR tab and mark dose as already given
    SessionsPatientPage(page).click_programme_tab(Programme.MMR)
    SessionsPatientPage(page).click_first_dose_already_given()

    # Verify "Vaccination was not given" is not displayed
    EditVaccinationRecordPage(page).expect_text_to_not_be_visible(
        "Vaccination was not given"
    )
