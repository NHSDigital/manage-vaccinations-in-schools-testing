import pytest

from mavis.test.annotations import issue
from mavis.test.constants import (
    MAVIS_NOTE_LENGTH_LIMIT,
    ConsentMethod,
    ConsentOption,
    Programme,
)
from mavis.test.data import ClassFileMapping
from mavis.test.pages import (
    DashboardPage,
    GillickCompetencePage,
    ImportRecordsWizardPage,
    NurseConsentWizardPage,
    SchoolChildrenPage,
    SchoolsSearchPage,
    SessionsChildrenPage,
    SessionsOverviewPage,
    SessionsPatientPage,
    SessionsPatientSessionActivityPage,
    SessionsSearchPage,
)
from mavis.test.pages.utils import schedule_school_session_if_needed
from mavis.test.utils import expect_alert_text


@pytest.fixture
def session_with_child_for_programme(
    request,
    schools,
    year_groups,
    point_of_care_file_generator,
    page,
    log_in_as_nurse,
):
    programme, consent_option = request.param
    school = schools[programme.group][0]
    year_group = year_groups[programme.group]

    DashboardPage(page).click_schools()
    SchoolsSearchPage(page).click_school(school)
    SchoolChildrenPage(page).click_import_class_lists()
    ImportRecordsWizardPage(page, point_of_care_file_generator).import_class_list(
        ClassFileMapping.FIXED_CHILD, year_group, programme.group
    )
    schedule_school_session_if_needed(page, school, [programme], [year_group])

    return programme, consent_option


programmes_and_consent_options = [
    (Programme.FLU, ConsentOption.INJECTION),
    (Programme.FLU, ConsentOption.NASAL_SPRAY_OR_INJECTION),
    (Programme.HPV, ConsentOption.INJECTION),
    (Programme.MENACWY, ConsentOption.INJECTION),
    # TODO: Enable these once we have a way of working with children that are either
    #  MMR or MMRV, and `expect_programme_status` is able to accept the MMR or MMRV
    #  variant.
    # (Programme.MMR, ConsentOption.MMR_EITHER), # noqa: ERA001
    # (Programme.MMR, ConsentOption.MMR_WITHOUT_GELATINE), # noqa: ERA001
    (Programme.TD_IPV, ConsentOption.INJECTION),
]


@pytest.mark.parametrize(
    "session_with_child_for_programme",
    programmes_and_consent_options,
    indirect=True,
    ids=lambda v: f"{v[0]}-{v[1]}",
)
def test_gillick(session_with_child_for_programme, children, schools, page):
    """
    Test: Add and edit Gillick competence assessment for a child.

    Steps:
    1. Open the session for the school and programme.
    2. Navigate to Gillick competence assessment for the child.
    3. Add a Gillick competence assessment as competent.
    4. Edit the assessment to mark as not competent.

    Expectations:
    - Gillick competence status is updated and reflected for the child.
    """

    programme, _ = session_with_child_for_programme
    child = children[programme.group][0]
    school = schools[programme.group][0]

    dashboard_page = DashboardPage(page)
    gillick_competence_page = GillickCompetencePage(page)
    sessions_children_page = SessionsChildrenPage(page)
    sessions_overview_page = SessionsOverviewPage(page)
    sessions_patient_page = SessionsPatientPage(page)
    sessions_search_page = SessionsSearchPage(page)

    sessions_overview_page.tabs.click_children_tab()
    sessions_children_page.search.search_and_click_child(child)
    sessions_patient_page.click_programme_tab(programme)
    sessions_patient_page.click_assess_gillick_competence()
    gillick_competence_page.add_gillick_competence(is_competent=True)
    # TODO: Ensure that you cannot give consent prior to Gillick assessment

    sessions_children_page.header.click_mavis()
    dashboard_page.click_sessions()
    sessions_search_page.click_session_for_programmes(school, [programme])
    sessions_overview_page.verify_offline_sheet_gillick_competence(
        child, competent=True
    )

    sessions_overview_page.tabs.click_children_tab()
    sessions_children_page.search.search_and_click_child(child)
    sessions_patient_page.click_programme_tab(programme)
    sessions_patient_page.click_edit_gillick_competence()
    gillick_competence_page.edit_gillick_competence(is_competent=False)

    sessions_children_page.header.click_mavis()
    dashboard_page.click_sessions()
    sessions_search_page.click_session_for_programmes(school, [programme])
    sessions_overview_page.verify_offline_sheet_gillick_competence(
        child, competent=False
    )


@pytest.mark.parametrize(
    "session_with_child_for_programme",
    programmes_and_consent_options,
    indirect=True,
    ids=lambda v: f"{v[0]}-{v[1]}",
)
def test_16_plus_without_gillick(
    session_with_child_for_programme, children, schools, page
): ...  # TODO: Implement


@issue("MAV-955")
@pytest.mark.parametrize(
    "session_with_child_for_programme",
    programmes_and_consent_options,
    indirect=True,
    ids=lambda v: f"{v[0]}-{v[1]}",
)
def test_gillick_with_notes(session_with_child_for_programme, children, page):
    """
    Test: Validate Gillick competence assessment notes length and update.

    Steps:
    1. Open the session for the school and programme.
    2. Navigate to Gillick competence assessment for the child.
    3. Attempt to complete assessment with notes over 1000 characters (should error).
    4. Complete assessment with valid notes.
    5. Edit assessment and again try to update with notes over 1000 characters (should
       error).

    Expectations:
    - Error is shown for notes over 1000 characters.
    - Assessment can be completed and updated with valid notes.
    """

    # TODO: Merge this with `test_gillick`.

    programme, _ = session_with_child_for_programme
    child = children[programme.group][0]

    gillick_competence_page = GillickCompetencePage(page)
    sessions_children_page = SessionsChildrenPage(page)
    sessions_overview_page = SessionsOverviewPage(page)
    sessions_patient_page = SessionsPatientPage(page)

    sessions_overview_page.tabs.click_children_tab()
    sessions_children_page.search.search_and_click_child(child)
    sessions_patient_page.click_programme_tab(programme)
    sessions_patient_page.click_assess_gillick_competence()

    gillick_competence_page.answer_gillick_competence_questions(is_competent=True)
    gillick_competence_page.fill_assessment_notes_with_string_of_length(
        MAVIS_NOTE_LENGTH_LIMIT + 1
    )
    gillick_competence_page.click_complete_assessment()
    gillick_competence_page.check_notes_length_error_appears()

    gillick_competence_page.fill_assessment_notes("Gillick competent")
    gillick_competence_page.click_complete_assessment()

    sessions_patient_page.click_edit_gillick_competence()
    gillick_competence_page.answer_gillick_competence_questions(is_competent=True)
    gillick_competence_page.fill_assessment_notes_with_string_of_length(
        MAVIS_NOTE_LENGTH_LIMIT + 1
    )
    gillick_competence_page.click_update_assessment()
    gillick_competence_page.check_notes_length_error_appears()


@pytest.mark.parametrize(
    "session_with_child_for_programme",
    programmes_and_consent_options,
    indirect=True,
    ids=lambda v: f"{v[0]}-{v[1]}",
)
def test_gillick_override_conflicting_from_parent(
    session_with_child_for_programme, children, page
):
    """
    Test: Record conflicting consents from parents, resolve with Gillick competence,
       and verify status.

    Steps:
    1. Open the session and consent tab for the child.
    2. Record a verbal positive consent for parent 1.
    3. Record a verbal refusal for parent 2, resulting in conflicting consent.
    4. Assess Gillick competence as competent.
    5. Record child verbal consent.
    6. Verify consent status and activity log.

    Expectations:
    - Consent status updates to 'Conflicting consent', then 'Safe to vaccinate',
      then 'Consent given'.
    - Activity log contains entry for Gillick competent child consent.
    """

    # TODO: Test this with Gillick and non-Gillick.

    programme, consent_option = session_with_child_for_programme
    child = children[programme.group][0]

    gillick_competence_page = GillickCompetencePage(page)
    nurse_consent_wizard_page = NurseConsentWizardPage(page)
    sessions_children_page = SessionsChildrenPage(page)
    sessions_overview_page = SessionsOverviewPage(page)
    sessions_patient_page = SessionsPatientPage(page)
    sessions_patient_session_activity_page = SessionsPatientSessionActivityPage(page)

    sessions_overview_page.tabs.click_children_tab()
    sessions_children_page.search.select_needs_consent()
    sessions_children_page.search.search_and_click_child(child)
    sessions_patient_page.click_programme_tab(programme)
    sessions_patient_page.click_record_a_new_consent_response()

    nurse_consent_wizard_page.select_parent(child.parents[0])
    nurse_consent_wizard_page.select_consent_method(ConsentMethod.IN_PERSON)
    nurse_consent_wizard_page.record_parent_given_consent(programme, consent_option)

    sessions_children_page.search.select_due_vaccination()
    sessions_children_page.search.search_and_click_child(child)
    sessions_patient_page.click_programme_tab(programme)
    sessions_patient_page.click_record_a_new_consent_response()

    nurse_consent_wizard_page.select_parent(child.parents[1])
    nurse_consent_wizard_page.select_consent_method(ConsentMethod.IN_PERSON)
    nurse_consent_wizard_page.record_parent_refuse_consent()

    sessions_children_page.search.select_has_a_refusal()
    sessions_children_page.search.select_consent_refused()
    sessions_children_page.search.select_conflicting_consent()

    sessions_children_page.search.search_and_click_child(child)
    sessions_patient_page.click_programme_tab(programme)
    sessions_patient_page.expect_consent_status(programme, "Conflicting consent")
    sessions_patient_page.expect_conflicting_consent_text()
    sessions_patient_page.click_assess_gillick_competence()
    gillick_competence_page.add_gillick_competence(is_competent=True)
    sessions_patient_page.click_record_a_new_consent_response()

    nurse_consent_wizard_page.select_gillick_competent_child()
    nurse_consent_wizard_page.record_child_given_consent(programme, consent_option)
    expect_alert_text(page, f"Consent recorded for {child!s}")

    sessions_children_page.search.select_due_vaccination()
    sessions_children_page.search.search_and_click_child(child)
    sessions_patient_page.click_programme_tab(programme)

    if consent_option == ConsentOption.NASAL_SPRAY_OR_INJECTION:
        consent_status = "Consent given for nasal spray"
    elif consent_option == ConsentOption.MMR_WITHOUT_GELATINE:
        consent_status = "Consent given for gelatine-free injection"
    else:
        consent_status = "Consent given"
    sessions_patient_page.expect_consent_status(programme, consent_status)

    sessions_patient_page.click_session_activity_and_notes()
    sessions_patient_session_activity_page.check_session_activity_entry(
        f"Consent given by {child!s} (Child (Gillick competent))",
    )
