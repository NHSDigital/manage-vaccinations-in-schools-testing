import pytest

from mavis.test.annotations import issue
from mavis.test.data import ClassFileMapping
from mavis.test.models import ConsentOption, Programme, Vaccine
from mavis.test.wrappers import generate_random_string


@pytest.fixture
def setup_mav_965(
    log_in_as_nurse,
    add_vaccine_batch,
    schools,
    dashboard_page,
    import_records_page,
    sessions_page,
    children,
):
    school = schools["doubles"][0]
    child = children["doubles"][0]
    try:
        batch_names = {
            Programme.HPV: add_vaccine_batch(Vaccine.GARDASIL_9),
            Programme.MENACWY: add_vaccine_batch(Vaccine.MENQUADFI),
            Programme.TD_IPV: add_vaccine_batch(Vaccine.REVAXIS),
            Programme.FLU: add_vaccine_batch(Vaccine.FLUENZ),
        }
        for programme_group in [Programme.HPV, "doubles", Programme.FLU]:
            dashboard_page.click_mavis()
            dashboard_page.click_sessions()
            sessions_page.ensure_session_scheduled_for_today(school, programme_group)
        sessions_page.click_import_class_lists()
        import_records_page.import_class_list_for_current_year(
            ClassFileMapping.FIXED_CHILD, child.year_group, "doubles"
        )
        yield batch_names
    finally:
        dashboard_page.navigate()
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.delete_all_sessions(school)


@issue("MAV-965")
@issue("MAV-955")
@pytest.mark.rav
@pytest.mark.bug
def test_pre_screening_questions_prefilled_for_multiple_vaccinations(
    setup_mav_965,
    schools,
    dashboard_page,
    sessions_page,
    verbal_consent_page,
    children,
):
    """
    Test: Verify pre-screening questions are pre-filled correctly when recording multiple vaccinations in the same session.
    Steps:
    1. Setup: Schedule sessions for HPV, doubles, and flu for the same school and import a fixed child class list.
    2. For each programme group (HPV, doubles, flu):
        a. Navigate to the session and register the child as attending.
        b. Go to the consent tab and search for the child.
        c. For each vaccine in the programme group:
            i. Record verbal consent for the child.
            ii. Record a vaccination for the child with a long notes field.
    Verification:
    - For each combination of vaccines, the correct pre-screening questions ("feeling well", "not pregnant") are pre-filled as described in the docstring.
    - Long notes (over 1000 characters) are accepted (MAV-955).
    """
    child = children["doubles"][0]
    school = schools["doubles"][0]
    batch_names = setup_mav_965

    for programme_group in [Programme.HPV, "doubles", Programme.FLU]:
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.click_session_for_programme_group(school, programme_group)
        sessions_page.register_child_as_attending(str(child))
        sessions_page.click_consent_tab()
        sessions_page.search_child(child)
        programmes = (
            [Programme.MENACWY, Programme.TD_IPV]
            if programme_group == "doubles"
            else [programme_group]
        )
        for programme in programmes:
            consent_option = (
                ConsentOption.BOTH
                if programme is Programme.FLU
                else ConsentOption.INJECTION
            )

            sessions_page.click_programme_tab(programme)
            sessions_page.click_record_a_new_consent_response()
            verbal_consent_page.parent_verbal_positive(
                parent=child.parents[0],
                change_phone=False,
                programme=programme,
                consent_option=consent_option,
            )
            sessions_page.record_vaccs_for_child(
                child=child,
                programme=programme,
                batch_name=batch_names[programme],
                notes=generate_random_string(
                    target_length=1001, spaces=True
                ),  # MAV-955
                consent_option=consent_option,
            )
