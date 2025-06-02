import pytest

from mavis.test.mavis_constants import Programme, test_data_file_paths, Vaccine



@pytest.fixture
def setup_mav_965(
    log_in_as_nurse,
    schools,
    dashboard_page,
    import_records_page,
    sessions_page,
    vaccines_page,
):
    dashboard_page.click_vaccines()
    vaccines_page.add_batch(vaccine=Vaccine.GARDASIL_9)
    vaccines_page.add_batch(vaccine=Vaccine.MENQUADFI)
    vaccines_page.add_batch(vaccine=Vaccine.REVAXIS)
    dashboard_page.click_mavis()
    dashboard_page.click_sessions()
    sessions_page.schedule_a_valid_session(schools[0], for_today=True)
    import_records_page.import_class_list_records_from_school_session(
        file_paths=test_data_file_paths.CLASS_MAV_965
    )
    dashboard_page.click_mavis()
    dashboard_page.click_sessions()


@pytest.mark.rav
@pytest.mark.bug
def test_programmes_rav_prescreening_questions(
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
        child_name=mav_965_child, programme=Programme.HPV
    )
    sessions_page.record_vaccs_for_child(
        child_name=mav_965_child, programme=Programme.MENACWY
    )
    sessions_page.record_vaccs_for_child(
        child_name=mav_965_child, programme=Programme.TD_IPV
    )
