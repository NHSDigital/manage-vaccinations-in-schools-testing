import pytest
from playwright.sync_api import expect

from mavis.test.annotations import issue
from mavis.test.data import ClassFileMapping
from mavis.test.models import ConsentMethod, Programme, VaccinationRecord, Vaccine

pytestmark = pytest.mark.sessions


@pytest.fixture
def setup_tests(log_in_as_nurse, dashboard_page):
    dashboard_page.click_sessions()


@pytest.fixture
def setup_session_with_file_upload(
    setup_tests,
    schools,
    dashboard_page,
    sessions_page,
    import_records_page,
    year_groups,
):
    school = schools[Programme.HPV][0]
    year_group = year_groups[Programme.HPV]

    def _setup(class_list_file):
        try:
            sessions_page.ensure_session_scheduled_for_today(school, Programme.HPV)
            sessions_page.click_import_class_lists()
            import_records_page.import_class_list(class_list_file, year_group)
            dashboard_page.click_mavis()
            dashboard_page.click_sessions()
            sessions_page.click_session_for_programme_group(school, Programme.HPV)
            yield
        finally:
            dashboard_page.navigate()
            dashboard_page.click_mavis()
            dashboard_page.click_sessions()
            sessions_page.delete_all_sessions(school)

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


def test_session_lifecycle(setup_tests, schools, dashboard_page, sessions_page):
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

    sessions_page.click_session_for_programme_group(school, Programme.HPV)
    sessions_page.schedule_a_valid_session(offset_days=14)
    sessions_page.schedule_a_valid_session(offset_days=1)
    dashboard_page.click_mavis()
    dashboard_page.click_sessions()
    sessions_page.edit_a_session_to_today(school, Programme.HPV)
    dashboard_page.click_mavis()
    dashboard_page.click_sessions()
    sessions_page.delete_all_sessions(school)


def test_create_invalid_session(setup_tests, schools, sessions_page):
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
    sessions_page.create_invalid_session(school, Programme.HPV)

    sessions_page.create_session_in_previous_academic_year()

    sessions_page.create_session_in_next_academic_year()


@pytest.mark.bug
def test_attendance_filters_functionality(
    setup_positive_upload, sessions_page, year_groups
):
    """
    Test: Verify attendance filters on the register tab work as expected.
    Steps:
    1. Open the register tab in a session.
    2. Check and uncheck year group checkboxes and update results.
    3. Use advanced filters to include archived records.
    Verification:
    - Search summary updates correctly as filters are applied and removed.
    """
    year_group = year_groups[Programme.HPV]

    sessions_page.click_register_tab()
    search_summary = sessions_page.page.get_by_text("Showing 1 to")

    expect(search_summary).not_to_have_text("Showing 1 to 1 of 1 children")
    sessions_page.check_year_checkbox(year_group)
    sessions_page.click_on_update_results()
    expect(search_summary).to_contain_text("Showing 1 to")

    sessions_page.uncheck_year_checkbox(year_group)
    sessions_page.click_advanced_filters()
    sessions_page.check_archived_records_checkbox()
    sessions_page.click_on_update_results()
    expect(search_summary).not_to_be_visible()


@issue("MAV-1018")
@pytest.mark.bug
def test_session_search_functionality(setup_random_child, sessions_page):
    """
    Test: Verify the search functionality within a session.
    Steps:
    1. Open a session with a random child.
    2. Use the search feature to look for children.
    Verification:
    - Search returns expected results for the session.
    """
    sessions_page.verify_search()


@issue("MAV-1381")
@pytest.mark.bug
def test_consent_filters(
    setup_fixed_child,
    sessions_page,
    verbal_consent_page,
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
    sessions_page.review_child_with_no_response()
    sessions_page.click_child(child)
    sessions_page.click_record_a_new_consent_response()

    verbal_consent_page.select_parent(child.parents[0])
    verbal_consent_page.select_consent_method(ConsentMethod.PAPER)
    verbal_consent_page.record_parent_refuse_consent()

    sessions_page.click_overview_tab()
    sessions_page.click_consent_refused()
    sessions_page.expect_consent_refused_checkbox_to_be_checked()


@issue("MAV-1265")
def test_session_activity_notes_order(
    setup_fixed_child,
    dashboard_page,
    sessions_page,
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

    sessions_page.click_consent_tab()
    sessions_page.search_child(child)
    sessions_page.click_session_activity_and_notes()
    sessions_page.add_note(note_1)
    sessions_page.add_note(note_2)
    dashboard_page.click_mavis()
    dashboard_page.click_sessions()
    sessions_page.click_session_for_programme_group(school, Programme.HPV)
    sessions_page.click_consent_tab()
    sessions_page.search_for(str(child))
    sessions_page.check_note_appears_in_search(child, note_2)
    sessions_page.click_child(child)
    sessions_page.click_session_activity_and_notes()
    sessions_page.check_notes_appear_in_order([note_2, note_1])


@pytest.mark.rav
def test_triage_consent_given_and_triage_outcome(
    setup_fixed_child,
    schools,
    sessions_page,
    dashboard_page,
    verbal_consent_page,
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

    sessions_page.click_consent_tab()
    sessions_page.navigate_to_consent_response(child, Programme.HPV)

    verbal_consent_page.select_parent(child.parents[0])
    verbal_consent_page.select_consent_method(ConsentMethod.PHONE)
    verbal_consent_page.record_parent_positive_consent(yes_to_health_questions=True)

    dashboard_page.click_mavis()
    dashboard_page.click_sessions()

    sessions_page.click_session_for_programme_group(school, Programme.HPV)

    sessions_page.click_register_tab()
    sessions_page.navigate_to_update_triage_outcome(child, Programme.HPV)
    sessions_page.select_yes_safe_to_vaccinate()
    sessions_page.click_save_triage()
    sessions_page.verify_triage_updated_for_child()


@pytest.mark.rav
def test_consent_refused_and_activity_log(
    setup_fixed_child,
    sessions_page,
    verbal_consent_page,
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

    sessions_page.click_consent_tab()
    sessions_page.navigate_to_consent_response(child, Programme.HPV)

    verbal_consent_page.select_parent(child.parents[0])
    verbal_consent_page.select_consent_method(ConsentMethod.PAPER)
    verbal_consent_page.record_parent_refuse_consent()
    verbal_consent_page.expect_text_in_alert(str(child))

    sessions_page.select_consent_refused()
    sessions_page.click_child(child)
    sessions_page.click_session_activity_and_notes()
    sessions_page.check_session_activity_entry(
        f"Consent refused by {child.parents[0].name_and_relationship}",
    )


@pytest.mark.rav
@pytest.mark.bug
def test_verify_excel_export_and_clinic_invitation(
    setup_fixed_child,
    add_vaccine_batch,
    schools,
    clinics,
    children_search_page,
    child_record_page,
    sessions_page,
    dashboard_page,
    verbal_consent_page,
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

    dashboard_page.click_mavis()
    dashboard_page.click_sessions()
    sessions_page.ensure_session_scheduled_for_today(
        "Community clinic",
        Programme.HPV,
    )

    dashboard_page.click_mavis()
    dashboard_page.click_children()
    children_search_page.search_for_a_child_name(str(child))
    children_search_page.click_record_for_child(child)
    child_record_page.click_invite_to_community_clinic()
    child_record_page.click_session_for_programme(
        "Community clinic",
        Programme.HPV,
        check_date=True,
    )
    sessions_page.click_record_a_new_consent_response()
    verbal_consent_page.select_parent(child.parents[0])
    verbal_consent_page.select_consent_method(ConsentMethod.IN_PERSON)
    verbal_consent_page.record_parent_positive_consent()
    sessions_page.register_child_as_attending(child)
    sessions_page.record_vaccination_for_child(
        VaccinationRecord(child, Programme.HPV, batch_name),
        at_school=False,
    )
    sessions_page.check_location_radio(clinics[0])
    sessions_page.click_continue_button()
    sessions_page.click_confirm_button()
    sessions_page.expect_alert_text("Vaccination outcome recorded for HPV")
    dashboard_page.click_mavis()
    dashboard_page.click_sessions()
    sessions_page.click_session_for_programme_group(school, Programme.HPV)
    assert sessions_page.get_session_id_from_offline_excel()


@issue("MAV-2023")
def test_session_verify_consent_reminders_and_pdf_downloads(
    setup_fixed_child,
    sessions_page,
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

    sessions_page.click_send_reminders(school)
    sessions_page.download_consent_form(Programme.HPV)


def test_editing_session_programmes(setup_fixed_child, sessions_page, children):
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

    sessions_page.click_edit_session()
    sessions_page.click_change_programmes()
    sessions_page.add_programme(Programme.FLU)
    sessions_page.click_continue_button()
    sessions_page.expect_details("Programmes", "Flu HPV")
    sessions_page.click_save_changes()
    sessions_page.expect_session_to_have_programmes([Programme.FLU, Programme.HPV])
    sessions_page.click_consent_tab()
    sessions_page.click_child(child)
    sessions_page.click_programme_tab(Programme.FLU)


@pytest.mark.accessibility
def test_accessibility(
    setup_fixed_child,
    dashboard_page,
    accessibility_helper,
    sessions_page,
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

    dashboard_page.click_mavis()
    dashboard_page.click_sessions()
    accessibility_helper.check_accessibility()

    sessions_page.click_session_for_programme_group(school, Programme.HPV)
    accessibility_helper.check_accessibility()

    sessions_page.click_edit_session()
    accessibility_helper.check_accessibility()

    sessions_page.click_change_session_dates()
    accessibility_helper.check_accessibility()

    sessions_page.click_back()
    sessions_page.click_save_changes()

    sessions_page.click_children_tab()
    accessibility_helper.check_accessibility()

    sessions_page.click_consent_tab()
    accessibility_helper.check_accessibility()

    sessions_page.click_triage_tab()
    accessibility_helper.check_accessibility()

    sessions_page.click_register_tab()
    accessibility_helper.check_accessibility()

    sessions_page.click_child(child)
    accessibility_helper.check_accessibility()

    sessions_page.click_session_activity_and_notes()
    accessibility_helper.check_accessibility()
