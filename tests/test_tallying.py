import pytest

from mavis.test.annotations import issue
from mavis.test.constants import (
    ConsentMethod,
    ConsentOption,
    ConsentRefusalReason,
    Programme,
    TallyCategory,
    Vaccine,
)
from mavis.test.data import ClassFileMapping
from mavis.test.data_models import VaccinationRecord
from mavis.test.pages import (
    DashboardPage,
    ImportRecordsWizardPage,
    NurseConsentWizardPage,
    SchoolsChildrenPage,
    SchoolsSearchPage,
    SessionsChildrenPage,
    SessionsOverviewPage,
    SessionsPatientPage,
    SessionsRecordVaccinationsPage,
    SessionsVaccinationWizardPage,
    VaccinesPage,
)
from mavis.test.pages.utils import schedule_school_session_if_needed

pytestmark = pytest.mark.tallying


@pytest.fixture
def setup_tests(log_in_as_nurse, page):
    DashboardPage(page).click_sessions()


@pytest.fixture
def setup_session_with_file_upload(
    setup_tests,
    add_vaccine_batch,
    schools,
    page,
    file_generator,
    year_groups,
):
    school = schools[Programme.FLU][0]
    year_group = year_groups[Programme.FLU]

    def _setup(class_list_file):
        batch_names = {
            vaccine: add_vaccine_batch(vaccine)
            for vaccine in [Vaccine.SEQUIRUS, Vaccine.FLUENZ]
        }
        VaccinesPage(page).header.click_mavis_header()
        DashboardPage(page).click_schools()
        SchoolsSearchPage(page).click_school(school)
        SchoolsChildrenPage(page).click_import_class_lists()
        ImportRecordsWizardPage(page, file_generator).import_class_list(
            class_list_file, year_group, Programme.FLU.group
        )
        schedule_school_session_if_needed(page, school, [Programme.FLU], [year_group])
        yield batch_names

    return _setup


@pytest.fixture
def setup_fixed_child(setup_session_with_file_upload):
    yield from setup_session_with_file_upload(ClassFileMapping.FIXED_CHILD)


@issue("MAV-1669")
@pytest.mark.bug
def test_tallying(  # noqa: PLR0915
    setup_fixed_child,
    page,
    children,
    schools,
):
    """
    Test: Check the tallying feature counts as expected
    Steps:
    1. Record consent for injection, withdraw it, invalidate it,
       provide nasal spray consent and vaccinate.
    2. Verify the tally updates correctly after each action.
    Verification:
    - Tally counts match expected values after each step.
    """
    child = children[Programme.FLU][0]
    batch_name = setup_fixed_child[Vaccine.FLUENZ]
    school = schools[Programme.FLU][0]

    tally_totals = SessionsOverviewPage(page).get_all_totals(Programme.FLU)
    assert tally_totals[TallyCategory.NEEDS_CONSENT] > 0

    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_programme_tab(Programme.FLU)
    SessionsPatientPage(page).click_record_a_new_consent_response()
    NurseConsentWizardPage(page).select_parent(child.parents[0])
    NurseConsentWizardPage(page).select_consent_method(ConsentMethod.PHONE)
    NurseConsentWizardPage(page).record_parent_positive_consent(
        yes_to_health_questions=False, programme=Programme.FLU
    )

    tally_totals[TallyCategory.NEEDS_CONSENT] -= 1
    tally_totals[TallyCategory.DUE_INJECTION] += 1
    SessionsOverviewPage(page).check_all_totals(tally_totals)

    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_response_from_parent(child.parents[0])
    SessionsPatientPage(page).click_withdraw_consent()
    NurseConsentWizardPage(page).click_consent_refusal_reason(
        ConsentRefusalReason.PERSONAL_CHOICE
    )
    NurseConsentWizardPage(page).give_withdraw_consent_notes("notes")
    NurseConsentWizardPage(page).click_withdraw_consent()
    SessionsPatientPage(page).click_back()
    SessionsPatientPage(page).go_back_to_session_for_school(school)

    tally_totals[TallyCategory.DUE_INJECTION] -= 1
    tally_totals[TallyCategory.HAS_A_REFUSAL] += 1
    SessionsOverviewPage(page).check_all_totals(tally_totals)

    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).invalidate_parent_refusal(child.parents[0])
    SessionsPatientPage(page).go_back_to_session_for_school(school)

    tally_totals[TallyCategory.HAS_A_REFUSAL] -= 1
    tally_totals[TallyCategory.NEEDS_CONSENT] += 1
    SessionsOverviewPage(page).check_all_totals(tally_totals)

    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_programme_tab(Programme.FLU)
    SessionsPatientPage(page).click_record_a_new_consent_response()
    NurseConsentWizardPage(page).select_parent(child.parents[1])
    NurseConsentWizardPage(page).select_consent_method(ConsentMethod.PHONE)
    NurseConsentWizardPage(page).record_parent_positive_consent(
        yes_to_health_questions=False,
        programme=Programme.FLU,
        consent_option=ConsentOption.NASAL_SPRAY,
    )

    tally_totals[TallyCategory.NEEDS_CONSENT] -= 1
    tally_totals[TallyCategory.DUE_NASAL_SPRAY] += 1
    SessionsOverviewPage(page).check_all_totals(tally_totals)

    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).register_child_as_attending(child)
    SessionsChildrenPage(page).tabs.click_record_vaccinations_tab()
    SessionsRecordVaccinationsPage(page).search.search_and_click_child(child)

    vaccination_record = VaccinationRecord(
        child, Programme.FLU, batch_name, ConsentOption.NASAL_SPRAY
    )
    SessionsPatientPage(page).set_up_vaccination(vaccination_record)
    SessionsVaccinationWizardPage(page).record_vaccination(vaccination_record)
    SessionsPatientPage(page).go_back_to_session_for_school(school)

    tally_totals[TallyCategory.DUE_NASAL_SPRAY] -= 1
    tally_totals[TallyCategory.VACCINATED] += 1
    SessionsOverviewPage(page).check_all_totals(tally_totals)


@issue("MAV-2689")
@pytest.mark.parametrize(
    "programme", list(Programme), ids=lambda p: f"Programme: {p.value}"
)
def test_tallying_totals_match_eligible_patients(
    setup_fixed_child,
    page,
    programme,
):
    """
    Test: Verify that tallying totals match the number of eligible patients.
    Steps:
    1. Navigate to a session with eligible patients for the given programme.
    2. Compare the sum of the tally boxes with the count of eligible patients.
    Verification:
    - Sum of tally totals should equal the number of eligible children shown
      on the children tab.
    """
    # Get tally totals for the programme
    tally_totals = SessionsOverviewPage(page).get_all_totals(programme)
    sum_of_tally_totals = sum(tally_totals.values())

    # Navigate to children tab to count eligible children
    SessionsOverviewPage(page).tabs.click_children_tab()

    # Count all children cards displayed (these are the eligible children)
    children_cards = SessionsChildrenPage(page).page.locator(
        "div.nhsuk-card.app-card.app-card--compact:has(h4)"
    )
    eligible_children_count = children_cards.count()

    # Verify that the sum of tally totals equals the number of eligible children
    assert sum_of_tally_totals == eligible_children_count, (
        f"Sum of tally totals ({sum_of_tally_totals}) does not match "
        f"eligible children count ({eligible_children_count}) for {programme}"
    )
