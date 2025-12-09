import pytest
from playwright.sync_api import expect

from mavis.test.annotations import issue
from mavis.test.constants import ConsentMethod, Programme, Vaccine
from mavis.test.data import ClassFileMapping
from mavis.test.data_models import Clinic, VaccinationRecord
from mavis.test.helpers.accessibility_helper import AccessibilityHelper
from mavis.test.pages import (
    ChildRecordPage,
    ChildrenSearchPage,
    DashboardPage,
    ImportRecordsWizardPage,
    ImportsPage,
    NurseConsentWizardPage,
    SchoolsChildrenPage,
    SchoolsSearchPage,
    SessionsChildrenPage,
    SessionsEditPage,
    SessionsOverviewPage,
    SessionsPatientPage,
    SessionsPatientSessionActivityPage,
    SessionsRecordVaccinationsPage,
    SessionsSearchPage,
    SessionsVaccinationWizardPage,
)
from mavis.test.utils import expect_alert_text, expect_details, get_offset_date

pytestmark = pytest.mark.sessions


@pytest.fixture
def go_to_sessions(log_in_as_nurse, page):
    DashboardPage(page).click_sessions()


@pytest.fixture
def setup_session_with_file_upload(
    log_in_as_nurse,
    schools,
    page,
    test_data,
    year_groups,
):
    school = schools[Programme.HPV][0]
    year_group = year_groups[Programme.HPV]

    def _setup(class_list_file):
        DashboardPage(page).click_schools()
        SchoolsSearchPage(page).click_school(school)
        SchoolsChildrenPage(page).click_import_class_lists()
        ImportRecordsWizardPage(page, test_data).import_class_list(
            class_list_file, year_group
        )
        ImportsPage(page).header.click_mavis_header()
        DashboardPage(page).click_sessions()
        SessionsSearchPage(page).click_session_for_programme_group(
            school, Programme.HPV
        )
        if not SessionsOverviewPage(page).is_date_scheduled(get_offset_date(0)):
            SessionsOverviewPage(page).schedule_or_edit_session()
            SessionsEditPage(page).schedule_a_valid_session(
                offset_days=0, skip_weekends=False
            )
        yield

    return _setup


@pytest.fixture
def setup_positive_upload(setup_session_with_file_upload):
    yield from setup_session_with_file_upload(ClassFileMapping.POSITIVE)


@pytest.fixture
def setup_random_child(setup_session_with_file_upload):
    yield from setup_session_with_file_upload(ClassFileMapping.RANDOM_CHILD)


@pytest.fixture
def setup_fixed_child(setup_session_with_file_upload):
    yield from setup_session_with_file_upload(ClassFileMapping.FIXED_CHILD)


def test_session_lifecycle(
    go_to_sessions,
    schools,
    page,
):
    """
    Test: Create, edit, and delete a session for a school and verify lifecycle actions.
    Steps:
    1. Navigate to sessions page.
    2. Create a new session for the school and programme.
    3. Edit the session to set the date to today.
    4. Delete all sessions for the school.
    Verification:
    - Session is created, edited, and deleted without errors.
    """
    school = schools[Programme.HPV][0]

    SessionsSearchPage(page).click_session_for_programme_group(school, Programme.HPV)
    SessionsOverviewPage(page).schedule_or_edit_session()
    SessionsEditPage(page).schedule_a_valid_session(offset_days=14)
    SessionsOverviewPage(page).schedule_or_edit_session()
    SessionsEditPage(page).schedule_a_valid_session(offset_days=1)
    SessionsOverviewPage(page).click_edit_session()
    SessionsEditPage(page).edit_a_session_to_today()


def test_create_invalid_session(
    go_to_sessions,
    schools,
    page,
):
    """
    Test: Attempt to create an invalid session and verify error handling.
    Steps:
    1. Navigate to sessions page.
    2. Attempt to create a session with invalid data for the school and programme.
    3. Attempt to create sessions in previous and next academic years.
    Verification:
    - Error is shown or invalid session is not created.
    """
    school = schools[Programme.HPV][0]
    SessionsSearchPage(page).click_session_for_programme_group(school, Programme.HPV)
    SessionsOverviewPage(page).schedule_or_edit_session()

    SessionsEditPage(page).create_invalid_session()

    SessionsEditPage(page).create_session_in_previous_academic_year()

    SessionsEditPage(page).create_session_in_next_academic_year()


@pytest.mark.bug
def test_attendance_filters_functionality(
    setup_positive_upload,
    page,
    year_groups,
):
    """
    Test: Verify attendance filters on the register tab work as expected.
    Steps:
    1. Open the children tab in a session.
    2. Check and uncheck year group checkboxes and update results.
    3. Use advanced filters to include archived records.
    Verification:
    - Search summary updates correctly as filters are applied and removed.
    """
    year_group = year_groups[Programme.HPV]

    SessionsOverviewPage(page).tabs.click_children_tab()
    search_summary = SessionsChildrenPage(page).page.get_by_text("Showing 1 to")

    expect(search_summary).not_to_have_text("Showing 1 to 1 of 1 children")
    SessionsChildrenPage(page).search.check_year_checkbox(year_group)
    SessionsChildrenPage(page).search.click_on_update_results()
    expect(search_summary).to_contain_text("Showing 1 to")

    SessionsChildrenPage(page).search.uncheck_year_checkbox(year_group)
    SessionsChildrenPage(page).search.click_advanced_filters()
    SessionsChildrenPage(page).search.check_archived_records_checkbox()
    SessionsChildrenPage(page).search.click_on_update_results()
    expect(search_summary).not_to_be_visible()


@issue("MAV-1018")
@pytest.mark.bug
def test_session_search_functionality(
    setup_random_child,
    page,
):
    """
    Test: Verify the search functionality within a session.
    Steps:
    1. Open a session with a random child.
    2. Use the search feature to look for children.
    Verification:
    - Search returns expected results for the session.
    """
    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).search.verify_search()


@issue("MAV-1381")
@pytest.mark.bug
def test_consent_filters(
    setup_fixed_child,
    page,
    children,
):
    """
    Test: Record a paper refusal and verify the consent refused checkbox is checked.
    Steps:
    1. Open a session with a fixed child.
    2. Review a child with no response and record a paper refusal.
    3. Go to the overview tab and review consent refused.
    Verification:
    - Consent refused checkbox is checked for the child.
    """
    child = children[Programme.HPV][0]
    SessionsOverviewPage(page).review_child_with_no_response()
    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_record_a_new_consent_response()

    NurseConsentWizardPage(page).select_parent(child.parents[0])
    NurseConsentWizardPage(page).select_consent_method(ConsentMethod.PAPER)
    NurseConsentWizardPage(page).record_parent_refuse_consent()

    SessionsChildrenPage(page).tabs.click_overview_tab()
    SessionsOverviewPage(page).click_has_a_refusal()
    SessionsChildrenPage(page).expect_has_a_refusal_to_be_selected()


@issue("MAV-1265")
def test_session_activity_notes_order(
    setup_fixed_child,
    page,
    schools,
    children,
):
    """
    Test: Add multiple notes to a session and verify their order in the activity log.
    Steps:
    1. Open a session with a fixed child.
    2. Add two notes in sequence.
    3. Refresh and search for the child in the session.
    4. Verify the most recent note appears first in the list.
    Verification:
    - Notes appear in reverse chronological order in the activity log.
    """
    child = children[Programme.HPV][0]
    school = schools[Programme.HPV][0]
    note_1 = "Note 1"
    note_2 = "Note 2"

    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_session_activity_and_notes()
    SessionsPatientSessionActivityPage(page).add_note(note_1)
    SessionsPatientSessionActivityPage(page).add_note(note_2)
    SessionsPatientSessionActivityPage(page).header.click_mavis_header()
    DashboardPage(page).click_sessions()
    SessionsSearchPage(page).click_session_for_programme_group(school, Programme.HPV)
    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).search.search_for(str(child))
    SessionsChildrenPage(page).search.check_note_appears_in_search(child, note_2)
    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_session_activity_and_notes()
    SessionsPatientSessionActivityPage(page).check_notes_appear_in_order(
        [note_2, note_1]
    )


@pytest.mark.rav
def test_triage_consent_given_and_triage_outcome(
    setup_fixed_child,
    schools,
    page,
    children,
):
    """
    Test: Record verbal consent and triage outcome for a child in a session.
    Steps:
    1. Schedule session and import class list.
    2. Record verbal consent for the child.
    3. Update triage outcome to 'safe to vaccinate'.
    Verification:
    - Triage outcome is updated and reflected for the child.
    """
    child = children[Programme.HPV][0]
    school = schools[Programme.HPV][0]

    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_programme_tab(Programme.HPV)
    SessionsPatientPage(page).click_record_a_new_consent_response()

    NurseConsentWizardPage(page).select_parent(child.parents[0])
    NurseConsentWizardPage(page).select_consent_method(ConsentMethod.PHONE)
    NurseConsentWizardPage(page).record_parent_positive_consent(
        yes_to_health_questions=True
    )

    SessionsPatientPage(page).header.click_mavis_header()
    DashboardPage(page).click_sessions()

    SessionsSearchPage(page).click_session_for_programme_group(school, Programme.HPV)

    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_programme_tab(Programme.HPV)
    SessionsPatientPage(page).click_update_triage_outcome()
    SessionsPatientPage(page).select_yes_safe_to_vaccinate()
    SessionsPatientPage(page).click_save_triage()
    SessionsPatientPage(page).verify_triage_updated_for_child()


@pytest.mark.rav
def test_consent_refused_and_activity_log(
    setup_fixed_child,
    page,
    children,
):
    """
    Test: Record verbal refusal of consent and verify activity log entry.
    Steps:
    1. Schedule session and import class list.
    2. Record verbal refusal for the child.
    3. Select 'consent refused' in session and check activity log.
    Verification:
    - Activity log contains entry for consent refusal by the parent.
    """
    child = children[Programme.HPV][0]

    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_programme_tab(Programme.HPV)
    SessionsPatientPage(page).click_record_a_new_consent_response()

    NurseConsentWizardPage(page).select_parent(child.parents[0])
    NurseConsentWizardPage(page).select_consent_method(ConsentMethod.PAPER)
    NurseConsentWizardPage(page).record_parent_refuse_consent()
    expect_alert_text(page, str(child))

    SessionsChildrenPage(page).select_has_a_refusal()
    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_session_activity_and_notes()
    SessionsPatientSessionActivityPage(page).check_session_activity_entry(
        f"Consent refused by {child.parents[0].name_and_relationship}",
    )


@pytest.mark.rav
@pytest.mark.bug
def test_verify_excel_export_and_clinic_invitation(
    setup_fixed_child,
    add_vaccine_batch,
    schools,
    page,
    clinics,
    children,
):
    """
    Test: Export session data to Excel and send clinic invitations,
       then verify vaccination record.
    Steps:
    1. Schedule session, import class list, and send clinic invitations.
    2. Record verbal consent and register child as attending.
    3. Record vaccination for the child at the clinic.
    4. Verify vaccination outcome and Excel export.
    Verification:
    - Vaccination outcome is recorded and session Excel export is available.
    """
    child = children[Programme.HPV][0]
    school = schools[Programme.HPV][0]
    batch_name = add_vaccine_batch(Vaccine.GARDASIL_9)
    generic_clinic = Clinic(name="Community clinic")

    SessionsOverviewPage(page).header.click_mavis_header()
    DashboardPage(page).click_sessions()
    SessionsSearchPage(page).click_session_for_programme_group(
        generic_clinic, Programme.HPV.group
    )
    if not SessionsOverviewPage(page).is_date_scheduled(get_offset_date(0)):
        SessionsOverviewPage(page).schedule_or_edit_session()
        SessionsEditPage(page).schedule_a_valid_session(
            offset_days=0, skip_weekends=False
        )

    SessionsOverviewPage(page).header.click_mavis_header()
    DashboardPage(page).click_children()
    ChildrenSearchPage(page).search_for_a_child_name(str(child))
    ChildrenSearchPage(page).click_record_for_child(child)
    ChildRecordPage(page).click_invite_to_community_clinic()
    ChildRecordPage(page).click_session_for_programme(
        generic_clinic,
        Programme.HPV,
        check_date=True,
    )
    SessionsPatientPage(page).click_record_a_new_consent_response()
    NurseConsentWizardPage(page).select_parent(child.parents[0])
    NurseConsentWizardPage(page).select_consent_method(ConsentMethod.IN_PERSON)
    NurseConsentWizardPage(page).record_parent_positive_consent()
    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).register_child_as_attending(child)
    SessionsChildrenPage(page).tabs.click_record_vaccinations_tab()
    SessionsRecordVaccinationsPage(page).search.search_and_click_child(child)
    vaccination_record = VaccinationRecord(child, Programme.HPV, batch_name)
    SessionsPatientPage(page).set_up_vaccination(vaccination_record)
    SessionsVaccinationWizardPage(page).record_vaccination(
        vaccination_record, at_school=False
    )

    SessionsVaccinationWizardPage(page).check_location_radio(clinics[0])
    SessionsVaccinationWizardPage(page).click_continue_button()
    SessionsVaccinationWizardPage(page).click_confirm_button()
    expect_alert_text(page, "Vaccination outcome recorded for HPV")
    SessionsPatientPage(page).header.click_mavis_header()
    DashboardPage(page).click_sessions()
    SessionsSearchPage(page).click_session_for_programme_group(school, Programme.HPV)
    assert SessionsOverviewPage(page).get_session_id_from_offline_excel()


@issue("MAV-2023")
def test_session_verify_consent_reminders_and_pdf_downloads(
    setup_fixed_child,
    page,
    schools,
):
    """
    Test: Click the 'Send reminders' link and PDF download links in sessions and
    verify there are no errors.
    Steps:
    1. Open a session with a fixed child.
    2. Click 'Send reminders' link and verify no errors.
    3. Attempt to download consent PDFs and verify no errors.
    Verification:
    - No errors occur when sending reminders or downloading PDFs.
    """
    school = schools[Programme.HPV][0]

    SessionsOverviewPage(page).click_send_reminders(school)
    SessionsOverviewPage(page).download_consent_form(Programme.HPV)


def test_editing_session_programmes(
    setup_fixed_child,
    children,
    page,
):
    """
    Test: Edit the programmes of an existing session and verify changes.
    Steps:
    1. Open a session with a fixed child.
    2. Edit the session to change its programmes.
    3. Save changes and verify the updated programmes are reflected.
    4. Verify the Flu tab appears for a child in the session.
    Verification:
    - Session programmes are updated correctly without errors.
    """
    child = children[Programme.HPV][0]

    SessionsOverviewPage(page).click_edit_session()
    SessionsEditPage(page).click_change_programmes()
    SessionsEditPage(page).add_programme(Programme.FLU)
    SessionsEditPage(page).click_continue_button()
    expect_details(page, "Programmes", "Flu HPV")
    SessionsEditPage(page).click_save_changes()
    SessionsEditPage(page).expect_session_to_have_programmes(
        [Programme.FLU, Programme.HPV]
    )
    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_programme_tab(Programme.FLU)


@pytest.mark.accessibility
def test_accessibility(
    setup_fixed_child,
    page,
    schools,
    children,
):
    """
    Test: Validate accessibility of the sessions page.
    Steps:
    1. Navigate to sessions page.
    2. Run accessibility checks on the page.
    Verification:
    - No accessibility violations found.
    """
    school = schools[Programme.HPV][0]
    child = children[Programme.HPV][0]

    SessionsOverviewPage(page).header.click_mavis_header()
    DashboardPage(page).click_sessions()
    AccessibilityHelper(page).check_accessibility()

    SessionsSearchPage(page).click_session_for_programme_group(school, Programme.HPV)
    AccessibilityHelper(page).check_accessibility()

    SessionsOverviewPage(page).click_edit_session()
    AccessibilityHelper(page).check_accessibility()

    SessionsEditPage(page).click_change_session_dates()
    AccessibilityHelper(page).check_accessibility()

    SessionsEditPage(page).click_back()
    SessionsEditPage(page).click_save_changes()

    SessionsOverviewPage(page).tabs.click_children_tab()
    AccessibilityHelper(page).check_accessibility()

    SessionsChildrenPage(page).search.search_and_click_child(child)
    AccessibilityHelper(page).check_accessibility()

    SessionsPatientPage(page).click_session_activity_and_notes()
    AccessibilityHelper(page).check_accessibility()
