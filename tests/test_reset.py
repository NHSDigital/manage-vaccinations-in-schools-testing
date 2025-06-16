import allure
import pytest

from mavis.test.data import ClassFilePath
from mavis.test.models import Programme, Vaccine
from mavis.test.wrappers import generate_random_string


@pytest.fixture
def setup_mav_965(
    log_in_as_nurse,
    add_vaccine_batch,
    schools,
    dashboard_page,
    import_records_page,
    sessions_page,
):
    gardasil_9_batch_name = add_vaccine_batch(Vaccine.GARDASIL_9)
    menquadfi_batch_name = add_vaccine_batch(Vaccine.MENQUADFI)
    revaxis_batch_name = add_vaccine_batch(Vaccine.REVAXIS)
    dashboard_page.click_mavis()
    dashboard_page.click_sessions()
    sessions_page.schedule_a_valid_session(schools[0], for_today=True)
    import_records_page.navigate_to_class_list_import()
    import_records_page.upload_and_verify_output(ClassFilePath.MAV_965)
    dashboard_page.click_mavis()
    dashboard_page.click_sessions()
    return gardasil_9_batch_name, menquadfi_batch_name, revaxis_batch_name


@allure.issue("MAV-965")
@allure.issue("MAV-955")
@pytest.mark.rav
@pytest.mark.bug
def test_programmes_rav_pre_screening_questions(
    setup_mav_965, schools, programmes_page, dashboard_page, sessions_page, consent_page
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

    mav_965_child = "MAV_965, MAV_965"
    gardasil_9_batch_name, menquadfi_batch_name, revaxis_batch_name = setup_mav_965

    dashboard_page.click_mavis()
    dashboard_page.click_sessions()
    sessions_page.click_location(schools[0])
    sessions_page.click_consent_tab()
    sessions_page.search_child(child_name=mav_965_child)
    sessions_page.click_programme_tab(Programme.HPV)
    sessions_page.click_get_consent_response()
    consent_page.parent_1_verbal_positive(change_phone=False)
    sessions_page.search_child(child_name=mav_965_child)
    sessions_page.click_programme_tab(Programme.MENACWY)
    sessions_page.click_get_consent_response()
    consent_page.parent_1_verbal_positive(
        change_phone=False, programme=Programme.MENACWY
    )
    sessions_page.search_child(child_name=mav_965_child)
    sessions_page.click_programme_tab(Programme.TD_IPV)
    sessions_page.click_get_consent_response()
    consent_page.parent_1_verbal_positive(
        change_phone=False, programme=Programme.TD_IPV
    )
    sessions_page.register_child_as_attending(child_name=mav_965_child)
    sessions_page.record_vaccs_for_child(
        child_name=mav_965_child,
        programme=Programme.HPV,
        batch_name=gardasil_9_batch_name,
        notes=generate_random_string(target_length=1001, spaces=True),  # MAV-955
    )
    sessions_page.record_vaccs_for_child(
        child_name=mav_965_child,
        programme=Programme.MENACWY,
        batch_name=menquadfi_batch_name,
        notes=generate_random_string(target_length=1001, spaces=True),  # MAV-955
    )
    sessions_page.record_vaccs_for_child(
        child_name=mav_965_child,
        programme=Programme.TD_IPV,
        batch_name=revaxis_batch_name,
        notes=generate_random_string(target_length=1001, spaces=True),  # MAV-955
    )
