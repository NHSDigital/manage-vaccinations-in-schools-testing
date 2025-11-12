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
    sessions_page,
    import_records_wizard_page,
    year_groups,
):
    school = schools[Programme.FLU][0]
    year_group = year_groups[Programme.FLU]

    def _setup(class_list_file):
        try:
            batch_names = {
                vaccine: add_vaccine_batch(vaccine)
                for vaccine in [Vaccine.SEQUIRUS, Vaccine.FLUENZ]
            }
            dashboard_page.click_mavis()
            dashboard_page.click_sessions()
            sessions_page.ensure_session_scheduled_for_today(school, Programme.FLU)
            sessions_page.click_import_class_lists()
            import_records_wizard_page.import_class_list(
                class_list_file, year_group, Programme.FLU.group
            )
            dashboard_page.click_mavis()
            dashboard_page.click_sessions()
            sessions_page.click_session_for_programme_group(school, Programme.FLU)
            yield batch_names
        finally:
            dashboard_page.navigate()
            dashboard_page.click_mavis()
            dashboard_page.click_sessions()
            sessions_page.delete_all_sessions(school)

    return _setup


@pytest.fixture
def setup_fixed_child(setup_session_with_file_upload):
    yield from setup_session_with_file_upload(ClassFileMapping.FIXED_CHILD)


@issue("MAV-1669")
@pytest.mark.bug
def test_tallying(
    setup_fixed_child,
    sessions_page,
    verbal_consent_page,
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

    tally_totals = sessions_page.get_all_totals(Programme.FLU)
    assert tally_totals[TallyCategory.NO_RESPONSE] > 0

    sessions_page.click_consent_tab()
    sessions_page.navigate_to_consent_response(child, Programme.FLU)
    verbal_consent_page.select_parent(child.parents[0])
    verbal_consent_page.select_consent_method(ConsentMethod.PHONE)
    verbal_consent_page.record_parent_positive_consent(
        yes_to_health_questions=False, programme=Programme.FLU
    )

    tally_totals[TallyCategory.NO_RESPONSE] -= 1
    tally_totals[TallyCategory.CONSENT_GIVEN_FOR_INJECTION] += 1
    sessions_page.check_all_totals(tally_totals)

    sessions_page.click_consent_tab()
    sessions_page.click_child(child)
    sessions_page.click_response_from_parent(child.parents[0])
    sessions_page.click_withdraw_consent()
    verbal_consent_page.click_consent_refusal_reason(
        ConsentRefusalReason.PERSONAL_CHOICE
    )
    verbal_consent_page.give_withdraw_consent_notes("notes")
    verbal_consent_page.click_withdraw_consent()
    sessions_page.click_back()
    sessions_page.go_back_to_session_for_school(school)

    tally_totals[TallyCategory.CONSENT_GIVEN_FOR_INJECTION] -= 1
    tally_totals[TallyCategory.CONSENT_REFUSED] += 1
    sessions_page.check_all_totals(tally_totals)

    sessions_page.click_consent_tab()
    sessions_page.click_child(child)
    sessions_page.invalidate_parent_refusal(child.parents[0])
    sessions_page.go_back_to_session_for_school(school)

    tally_totals[TallyCategory.CONSENT_REFUSED] -= 1
    tally_totals[TallyCategory.NO_RESPONSE] += 1
    sessions_page.check_all_totals(tally_totals)

    sessions_page.click_consent_tab()
    sessions_page.navigate_to_consent_response(child, Programme.FLU)
    verbal_consent_page.select_parent(child.parents[1])
    verbal_consent_page.select_consent_method(ConsentMethod.PHONE)
    verbal_consent_page.record_parent_positive_consent(
        yes_to_health_questions=False,
        programme=Programme.FLU,
        consent_option=ConsentOption.NASAL_SPRAY,
    )

    tally_totals[TallyCategory.NO_RESPONSE] -= 1
    tally_totals[TallyCategory.CONSENT_GIVEN_FOR_NASAL_SPRAY] += 1
    sessions_page.check_all_totals(tally_totals)

    sessions_page.register_child_as_attending(str(child))
    sessions_page.record_vaccination_for_child(
        VaccinationRecord(
            child, Programme.FLU, batch_name, ConsentOption.NASAL_SPRAY_OR_INJECTION
        )
    )
    sessions_page.go_back_to_session_for_school(school)

    tally_totals[TallyCategory.CONSENT_GIVEN_FOR_NASAL_SPRAY] -= 1
    tally_totals[TallyCategory.VACCINATED] += 1
    sessions_page.check_all_totals(tally_totals)
