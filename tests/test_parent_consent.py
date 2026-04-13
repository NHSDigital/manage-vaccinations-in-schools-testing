import pytest

from mavis.test.constants import (
    ConsentMethod,
    ConsentRefusalReason,
    ConsentStatus,
    DeliverySite,
    Programme,
    Vaccine,
)
from mavis.test.data import ClassFileMapping
from mavis.test.helpers.accessibility_helper import AccessibilityHelper
from mavis.test.pages import (
    DashboardPage,
    ImportRecordsWizardPage,
    NurseConsentWizardPage,
    RecordVaccinationWizardPage,
    SchoolChildrenPage,
    SchoolsSearchPage,
    SessionsChildrenPage,
    SessionsOverviewPage,
    SessionsPatientPage,
    SessionsPatientSessionActivityPage,
    SessionsRecordVaccinationsPage,
    SessionsSearchPage,
    VaccinesPage,
)
from mavis.test.pages.utils import schedule_school_session_if_needed


@pytest.fixture
def set_up_session_with_file_upload(
    log_in_as_nurse,
    schools,
    page,
    point_of_care_file_generator,
    year_groups,
):
    school = schools[Programme.HPV][0]
    year_group = year_groups[Programme.HPV]

    DashboardPage(page).click_schools()
    SchoolsSearchPage(page).click_school(school)
    SchoolChildrenPage(page).click_import_class_lists()
    ImportRecordsWizardPage(page, point_of_care_file_generator).import_class_list(
        ClassFileMapping.FIXED_CHILD, year_group
    )
    schedule_school_session_if_needed(page, school, [Programme.HPV], [year_group])


def test_invalid_consent(
    set_up_session_with_file_upload,
    page,
    children,
):
    """
    Test: Record invalid and refused consents and verify activity log entries.

    Steps:
    1. Open the session and consent tab for the child.
    2. Record a 'no response' verbal consent for parent 1.
    3. Record a refusal verbal consent for parent 2.
    4. Invalidate the refusal from parent 2.
    5. Check the session activity log for correct entries.

    Expectations:
    - Activity log contains entries for invalidated consent, refusal, and no response.
    """

    child = children[Programme.HPV][0]

    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).search.select_needs_consent()
    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_programme_tab(Programme.HPV)
    SessionsPatientPage(page).click_record_a_new_consent_response()

    NurseConsentWizardPage(page).select_parent(child.parents[0])
    NurseConsentWizardPage(page).select_consent_method(ConsentMethod.IN_PERSON)
    NurseConsentWizardPage(page).record_parent_no_response()

    SessionsChildrenPage(page).search.select_needs_consent()

    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_programme_tab(Programme.HPV)
    SessionsPatientPage(page).click_record_a_new_consent_response()
    NurseConsentWizardPage(page).select_parent(child.parents[1])
    NurseConsentWizardPage(page).select_consent_method(ConsentMethod.IN_PERSON)
    NurseConsentWizardPage(page).record_parent_refuse_consent()

    SessionsChildrenPage(page).search.select_has_a_refusal()
    SessionsChildrenPage(page).search.select_consent_refused()
    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_programme_tab(Programme.HPV)
    SessionsPatientPage(page).invalidate_parent_refusal(child.parents[1])
    SessionsPatientPage(page).click_session_activity_and_notes()

    SessionsPatientSessionActivityPage(page).check_session_activity_entry(
        f"Consent from {child.parents[1].full_name} invalidated",
    )
    SessionsPatientSessionActivityPage(page).check_session_activity_entry(
        f"Consent refused by {child.parents[1].name_and_relationship}",
    )
    SessionsPatientSessionActivityPage(page).check_session_activity_entry(
        f"Consent not provided by {child.parents[0].name_and_relationship}",
    )


def test_parent_provides_consent_twice(
    set_up_session_with_file_upload,
    page,
    children,
):
    """
    Test: Record two consents from the same parent (positive then refusal) and verify
      activity log.

    Steps:
    1. Open the session and consent tab for the child.
    2. Record a written positive consent for parent 1.
    3. Record a triage outcome as safe to vaccinate.
    4. Record a verbal refusal for the same parent.
    5. Check the consent refused text and session activity log.

    Expectations:
    - Consent refused text is shown for the parent.
    - Activity log contains entries for refusal, triage, and initial consent.
    """

    child = children[Programme.HPV][0]

    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).search.select_needs_consent()

    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_programme_tab(Programme.HPV)
    SessionsPatientPage(page).click_record_a_new_consent_response()
    NurseConsentWizardPage(page).select_parent(child.parents[0])
    NurseConsentWizardPage(page).select_consent_method(ConsentMethod.PAPER)
    NurseConsentWizardPage(page).record_parent_given_consent(
        yes_to_health_questions=True
    )
    SessionsChildrenPage(page).search.select_due_vaccination()

    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_programme_tab(Programme.HPV)
    SessionsPatientPage(page).click_record_a_new_consent_response()
    NurseConsentWizardPage(page).select_parent(child.parents[0])
    NurseConsentWizardPage(page).select_consent_method(ConsentMethod.IN_PERSON)
    NurseConsentWizardPage(page).record_parent_refuse_consent()

    SessionsChildrenPage(page).search.select_has_a_refusal()
    SessionsChildrenPage(page).search.select_consent_refused()

    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_programme_tab(Programme.HPV)
    RecordVaccinationWizardPage(page).expect_consent_refused_text(child.parents[0])
    SessionsPatientPage(page).click_session_activity_and_notes()
    SessionsPatientSessionActivityPage(page).check_session_activity_entry(
        f"Consent refused by {child.parents[0].name_and_relationship}",
    )
    SessionsPatientSessionActivityPage(page).check_session_activity_entry(
        "Triaged decision: Safe to vaccinate"
    )
    SessionsPatientSessionActivityPage(page).check_session_activity_entry(
        f"Consent given by {child.parents[0].name_and_relationship}",
    )


def test_consent_refusal_do_not_want_vaccination_at_school(
    set_up_session_with_file_upload,
    page,
    children,
):
    """
    Test: Record a refusal consent with reason 'Do not want vaccination at school'.
    Steps:
    1. Open the session and navigate to child.
    2. Record a verbal refusal consent with the relevant refusal reason.
    3. Verify the consent status is "Consent refused".
    Verification:
    - Consent status shows "Consent refused".
    - Refusal reason is correctly recorded.
    """
    child = children[Programme.HPV][0]

    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).search.select_needs_consent()
    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_programme_tab(Programme.HPV)
    SessionsPatientPage(page).click_record_a_new_consent_response()

    NurseConsentWizardPage(page).select_parent(child.parents[0])
    NurseConsentWizardPage(page).select_consent_method(ConsentMethod.IN_PERSON)
    NurseConsentWizardPage(page).click_no_they_do_not_agree()
    NurseConsentWizardPage(page).click_continue()
    NurseConsentWizardPage(page).click_consent_refusal_reason(
        ConsentRefusalReason.DO_NOT_WANT_VACCINATION_AT_SCHOOL
    )
    NurseConsentWizardPage(page).click_continue()
    NurseConsentWizardPage(page).click_confirm()

    SessionsChildrenPage(page).search.select_has_a_refusal()
    SessionsChildrenPage(page).search.select_consent_refused()
    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_programme_tab(Programme.HPV)
    SessionsPatientPage(page).expect_consent_status(ConsentStatus.REFUSED)


@pytest.mark.accessibility
def test_accessibility(
    set_up_session_with_file_upload,
    add_vaccine_batch,
    page,
    schools,
    children,
):
    child = children[Programme.HPV][0]
    school = schools[Programme.HPV][0]
    batch_name = add_vaccine_batch(Vaccine.GARDASIL_9)

    VaccinesPage(page).header.click_mavis()
    DashboardPage(page).click_sessions()
    SessionsSearchPage(page).click_session_for_programme_group(school, Programme.HPV)
    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).search.select_needs_consent()

    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_programme_tab(Programme.HPV)
    SessionsPatientPage(page).click_record_a_new_consent_response()
    AccessibilityHelper(page).check_accessibility()

    NurseConsentWizardPage(page).click_radio_button(
        child.parents[0].name_and_relationship
    )
    NurseConsentWizardPage(page).click_continue()

    AccessibilityHelper(page).check_accessibility()
    NurseConsentWizardPage(page).click_continue()

    AccessibilityHelper(page).check_accessibility()

    NurseConsentWizardPage(page).select_consent_method(ConsentMethod.PAPER)
    AccessibilityHelper(page).check_accessibility()

    NurseConsentWizardPage(page).click_yes_they_agree()
    NurseConsentWizardPage(page).click_continue()
    AccessibilityHelper(page).check_accessibility()

    NurseConsentWizardPage(page).answer_all_health_questions(
        programme=Programme.HPV,
    )
    NurseConsentWizardPage(page).click_continue()
    AccessibilityHelper(page).check_accessibility()

    NurseConsentWizardPage(page).click_confirm()
    AccessibilityHelper(page).check_accessibility()

    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).register_child_as_attending(child)
    SessionsChildrenPage(page).tabs.click_record_vaccinations_tab()
    AccessibilityHelper(page).check_accessibility()

    SessionsRecordVaccinationsPage(page).search.search_and_click_child(child)
    AccessibilityHelper(page).check_accessibility()

    SessionsPatientPage(page).confirm_pre_screening_checks(Programme.HPV)
    SessionsPatientPage(page).select_identity_confirmed_by_child(child)
    SessionsPatientPage(page).select_ready_for_vaccination()
    SessionsPatientPage(page).select_delivery_site(DeliverySite.LEFT_ARM_UPPER)
    RecordVaccinationWizardPage(page).click_continue_button()
    AccessibilityHelper(page).check_accessibility()

    RecordVaccinationWizardPage(page).choose_batch(batch_name)
    AccessibilityHelper(page).check_accessibility()

    RecordVaccinationWizardPage(page).click_confirm_button()
    AccessibilityHelper(page).check_accessibility()

    SessionsPatientPage(page).click_vaccination_details()
    AccessibilityHelper(page).check_accessibility()
