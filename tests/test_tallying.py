import pytest

from mavis.test.annotations import issue
from mavis.test.data import ClassFileMapping
from mavis.test.models import (
    ConsentMethod,
    ConsentOption,
    ConsentRefusalReason,
    Programme,
    TallyCategory,
    VaccinationRecord,
    Vaccine,
)
from mavis.test.utils import get_offset_date

pytestmark = pytest.mark.tallying


@pytest.fixture
def setup_tests(log_in_as_nurse, dashboard_page):
    dashboard_page.click_sessions()


@pytest.fixture
def setup_session_with_file_upload(
    setup_tests,
    add_vaccine_batch,
    schools,
    dashboard_page,
    sessions_edit_page,
    sessions_search_page,
    sessions_overview_page,
    import_records_wizard_page,
    year_groups,
):
    school = schools[Programme.FLU][0]
    year_group = year_groups[Programme.FLU]

    def _setup(class_list_file):
        batch_names = {
            vaccine: add_vaccine_batch(vaccine)
            for vaccine in [Vaccine.SEQUIRUS, Vaccine.FLUENZ]
        }
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_search_page.click_session_for_programme_group(
            school, Programme.FLU.group
        )
        if not sessions_overview_page.is_date_scheduled(get_offset_date(0)):
            sessions_overview_page.schedule_or_edit_session()
            sessions_edit_page.schedule_a_valid_session(
                offset_days=0, skip_weekends=False
            )
        sessions_overview_page.click_import_class_lists()
        import_records_wizard_page.import_class_list(
            class_list_file, year_group, Programme.FLU.group
        )
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_search_page.click_session_for_programme_group(school, Programme.FLU)
        yield batch_names

    return _setup


@pytest.fixture
def setup_fixed_child(setup_session_with_file_upload):
    yield from setup_session_with_file_upload(ClassFileMapping.FIXED_CHILD)


@issue("MAV-1669")
@pytest.mark.bug
def test_tallying(  # noqa: PLR0915
    setup_fixed_child,
    sessions_overview_page,
    sessions_patient_page,
    sessions_register_page,
    sessions_children_page,
    sessions_vaccination_wizard_page,
    sessions_record_vaccinations_page,
    nurse_consent_wizard_page,
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

    tally_totals = sessions_overview_page.get_all_totals(Programme.FLU)
    assert tally_totals[TallyCategory.NEEDS_CONSENT] > 0

    sessions_overview_page.click_children_tab()
    sessions_children_page.search_and_click_child(child)
    sessions_patient_page.click_programme_tab(Programme.FLU)
    sessions_patient_page.click_record_a_new_consent_response()
    nurse_consent_wizard_page.select_parent(child.parents[0])
    nurse_consent_wizard_page.select_consent_method(ConsentMethod.PHONE)
    nurse_consent_wizard_page.record_parent_positive_consent(
        yes_to_health_questions=False, programme=Programme.FLU
    )

    tally_totals[TallyCategory.NEEDS_CONSENT] -= 1
    tally_totals[TallyCategory.DUE_INJECTION] += 1
    sessions_overview_page.check_all_totals(tally_totals)

    sessions_overview_page.click_children_tab()
    sessions_children_page.search_and_click_child(child)
    sessions_patient_page.click_response_from_parent(child.parents[0])
    sessions_patient_page.click_withdraw_consent()
    nurse_consent_wizard_page.click_consent_refusal_reason(
        ConsentRefusalReason.PERSONAL_CHOICE
    )
    nurse_consent_wizard_page.give_withdraw_consent_notes("notes")
    nurse_consent_wizard_page.click_withdraw_consent()
    sessions_patient_page.click_back()
    sessions_patient_page.go_back_to_session_for_school(school)

    tally_totals[TallyCategory.DUE_INJECTION] -= 1
    tally_totals[TallyCategory.HAS_A_REFUSAL] += 1
    sessions_overview_page.check_all_totals(tally_totals)

    sessions_overview_page.click_children_tab()
    sessions_children_page.search_and_click_child(child)
    sessions_patient_page.invalidate_parent_refusal(child.parents[0])
    sessions_patient_page.go_back_to_session_for_school(school)

    tally_totals[TallyCategory.HAS_A_REFUSAL] -= 1
    tally_totals[TallyCategory.NEEDS_CONSENT] += 1
    sessions_overview_page.check_all_totals(tally_totals)

    sessions_overview_page.click_children_tab()
    sessions_children_page.search_and_click_child(child)
    sessions_patient_page.click_programme_tab(Programme.FLU)
    sessions_patient_page.click_record_a_new_consent_response()
    nurse_consent_wizard_page.select_parent(child.parents[1])
    nurse_consent_wizard_page.select_consent_method(ConsentMethod.PHONE)
    nurse_consent_wizard_page.record_parent_positive_consent(
        yes_to_health_questions=False,
        programme=Programme.FLU,
        consent_option=ConsentOption.NASAL_SPRAY,
    )

    tally_totals[TallyCategory.NEEDS_CONSENT] -= 1
    tally_totals[TallyCategory.DUE_NASAL_SPRAY] += 1
    sessions_overview_page.check_all_totals(tally_totals)

    sessions_overview_page.click_register_tab()
    sessions_register_page.register_child_as_attending(str(child))
    sessions_register_page.click_record_vaccinations_tab()
    sessions_record_vaccinations_page.search_and_click_child(child)

    vaccination_record = VaccinationRecord(
        child, Programme.FLU, batch_name, ConsentOption.NASAL_SPRAY
    )
    sessions_patient_page.set_up_vaccination(vaccination_record)
    sessions_vaccination_wizard_page.record_vaccination(vaccination_record)
    sessions_patient_page.go_back_to_session_for_school(school)

    tally_totals[TallyCategory.DUE_NASAL_SPRAY] -= 1
    tally_totals[TallyCategory.VACCINATED] += 1
    sessions_overview_page.check_all_totals(tally_totals)
