import pytest

from mavis.test.annotations import issue
from mavis.test.data import ClassFileMapping
from mavis.test.models import (
    ConsentMethod,
    ConsentOption,
    Programme,
    VaccinationRecord,
    Vaccine,
)
from mavis.test.pages import (
    DashboardPage,
    ImportRecordsWizardPage,
    NurseConsentWizardPage,
    SessionsChildrenPage,
    SessionsEditPage,
    SessionsOverviewPage,
    SessionsPatientPage,
    SessionsRegisterPage,
    SessionsSearchPage,
    SessionsVaccinationWizardPage,
)
from mavis.test.utils import (
    MAVIS_NOTE_LENGTH_LIMIT,
    generate_random_string,
    get_offset_date,
)


@pytest.fixture
def setup_all_programmes(
    log_in_as_nurse,
    add_vaccine_batch,
    schools,
    page,
    test_data,
    children,
):
    school = schools["doubles"][0]
    child = children["doubles"][0]
    batch_names = {
        Programme.HPV: add_vaccine_batch(Vaccine.GARDASIL_9),
        Programme.MENACWY: add_vaccine_batch(Vaccine.MENQUADFI),
        Programme.TD_IPV: add_vaccine_batch(Vaccine.REVAXIS),
        Programme.FLU: add_vaccine_batch(Vaccine.FLUENZ),
    }
    for programme_group in [Programme.HPV, "doubles", Programme.FLU]:
        DashboardPage(page).header.click_mavis_header()
        DashboardPage(page).click_sessions()
        SessionsSearchPage(page).click_session_for_programme_group(
            school, programme_group
        )
        if not SessionsOverviewPage(page).is_date_scheduled(get_offset_date(0)):
            SessionsOverviewPage(page).schedule_or_edit_session()
            SessionsEditPage(page).schedule_a_valid_session(
                offset_days=0, skip_weekends=False
            )
    SessionsOverviewPage(page).click_import_class_lists()
    ImportRecordsWizardPage(page, test_data).import_class_list(
        ClassFileMapping.FIXED_CHILD,
        child.year_group,
        "doubles",
    )
    return batch_names


@issue("MAV-965")
@issue("MAV-955")
@pytest.mark.rav
@pytest.mark.bug
def test_pre_screening_questions_prefilled_for_multiple_vaccinations(
    setup_all_programmes,
    schools,
    page,
    children,
):
    """
    Test: Verify pre-screening questions are pre-filled correctly when recording
       multiple vaccinations in the same session.
    Steps:
    1. Setup: Schedule sessions for HPV, doubles, and flu for the same school and
       import a fixed child class list.
    2. For each programme group (HPV, doubles, flu):
        a. Navigate to the session and register the child as attending.
        b. Go to the consent tab and search for the child.
        c. For each vaccine in the programme group:
            i. Record verbal consent for the child.
            ii. Record a vaccination for the child with a long notes field.
    Verification:
    - For each combination of vaccines, the correct pre-screening questions
      ("feeling well", "not pregnant") are pre-filled as described in the docstring.
    - Long notes (over 1000 characters) are accepted (MAV-955).
    """
    child = children["doubles"][0]
    school = schools["doubles"][0]
    batch_names = setup_all_programmes

    for programme_group in [Programme.HPV, "doubles", Programme.FLU]:
        DashboardPage(page).header.click_mavis_header()
        DashboardPage(page).click_sessions()
        SessionsSearchPage(page).click_session_for_programme_group(
            school, programme_group
        )
        if programme_group is Programme.HPV:
            SessionsOverviewPage(page).tabs.click_register_tab()
            SessionsRegisterPage(page).register_child_as_attending(child)
        SessionsRegisterPage(page).tabs.click_children_tab()
        SessionsChildrenPage(page).search.search_and_click_child(child)
        programmes = (
            [Programme.MENACWY, Programme.TD_IPV]
            if programme_group == "doubles"
            else [programme_group]
        )
        for programme in programmes:
            consent_option = (
                ConsentOption.NASAL_SPRAY_OR_INJECTION
                if programme is Programme.FLU
                else ConsentOption.INJECTION
            )

            SessionsPatientPage(page).click_programme_tab(programme)
            SessionsPatientPage(page).click_record_a_new_consent_response()
            NurseConsentWizardPage(page).select_parent(child.parents[0])
            NurseConsentWizardPage(page).select_consent_method(ConsentMethod.IN_PERSON)
            NurseConsentWizardPage(page).record_parent_positive_consent(
                programme=programme,
                consent_option=consent_option,
            )
            vaccination_record = VaccinationRecord(
                child, programme, batch_names[programme], consent_option
            )
            notes = generate_random_string(
                target_length=MAVIS_NOTE_LENGTH_LIMIT + 1,
                generate_spaced_words=True,
            )
            SessionsChildrenPage(page).search.search_and_click_child(child)
            SessionsPatientPage(page).set_up_vaccination(
                vaccination_record, notes=notes
            )
            SessionsVaccinationWizardPage(page).record_vaccination(
                vaccination_record, notes=notes
            )
