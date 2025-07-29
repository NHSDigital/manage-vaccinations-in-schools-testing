import pytest

from mavis.test.data import ClassFileMapping
from mavis.test.models import Programme, Vaccine, ConsentOption
from mavis.test.wrappers import generate_random_string
from mavis.test.annotations import issue


@pytest.fixture
def setup_mav_965(
    log_in_as_nurse,
    add_vaccine_batch,
    schools,
    dashboard_page,
    import_records_page,
    sessions_page,
):
    school = schools["doubles"][0]

    batch_names = {
        Programme.HPV: add_vaccine_batch(Vaccine.GARDASIL_9),
        Programme.MENACWY: add_vaccine_batch(Vaccine.MENQUADFI),
        Programme.TD_IPV: add_vaccine_batch(Vaccine.REVAXIS),
        Programme.FLU: add_vaccine_batch(Vaccine.FLUENZ),
    }
    for programme_group in [Programme.HPV, "doubles", Programme.FLU]:
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.schedule_a_valid_session(school, programme_group, for_today=True)
    import_records_page.navigate_to_class_list_import()
    import_records_page.upload_and_verify_output(
        ClassFileMapping.FIXED_CHILD_YEAR_10, programme_group="doubles"
    )
    return batch_names


@issue("MAV-965")
@issue("MAV-955")
@pytest.mark.rav
@pytest.mark.bug
def test_programmes_rav_pre_screening_questions(
    setup_mav_965,
    schools,
    dashboard_page,
    sessions_page,
    consent_page,
    children,
):
    """
    Steps to reproduce:
    Patient setup: in a school session today, marked as attending, session has HPV and doubles, patients is eligible for all vaccines (has consent, correct year group, no history)
    Complete pre-screening questions and vaccinate the patient for any one vaccine (eg. HPV)
    Testing has confirmed the following:
    Two vaccinations in same session
    - If HPV is followed by MenACWY then "feeling well" is pre-filled
    - If HPV is followed by Td/IPV  then both "feeling well" and "not pregnant" are pre-populated
    - If MenACWY followed by Td/IPV then "feeling well" is pre-filled
    - If MenCAWY followed by HPV then "feeling well" is pre-filled
    - If Td/IPV followed by MenACWY  then "feeling well" is pre-filled
    - If Td/IPV is followed by HPV  then both "feeling well" and "not pregnant" are pre-populated
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
            sessions_page.click_get_verbal_consent()
            consent_page.parent_verbal_positive(
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
