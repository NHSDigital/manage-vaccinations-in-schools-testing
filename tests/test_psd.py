import pytest

from mavis.test.data import ClassFileMapping
from mavis.test.models import (
    ConsentMethod,
    ConsentOption,
    Programme,
    VaccinationRecord,
    Vaccine,
)
from mavis.test.utils import get_offset_date


@pytest.fixture
def setup_session_with_file_upload(
    log_in_as_prescriber,
    schools,
    dashboard_page,
    sessions_search_page,
    sessions_overview_page,
    sessions_edit_page,
    import_records_wizard_page,
    year_groups,
    add_vaccine_batch,
):
    def _factory(
        class_file_mapping: ClassFileMapping, *, schedule_session_for_today: bool = True
    ) -> str:
        school = schools[Programme.FLU][0]
        year_group = year_groups[Programme.FLU]
        batch_name = add_vaccine_batch(Vaccine.FLUENZ)
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        if schedule_session_for_today:
            sessions_search_page.click_session_for_programme_group(
                school, Programme.FLU.group
            )
            if not sessions_overview_page.is_date_scheduled(get_offset_date(0)):
                sessions_overview_page.schedule_or_edit_session()
                sessions_edit_page.schedule_a_valid_session(
                    offset_days=0, skip_weekends=False
                )
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_search_page.click_session_for_programme_group(school, Programme.FLU)
        sessions_overview_page.click_import_class_lists()
        import_records_wizard_page.import_class_list(
            class_file_mapping, year_group, Programme.FLU.group
        )
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        return batch_name

    return _factory


@pytest.fixture
def setup_session_with_one_child(
    setup_session_with_file_upload,
):
    return setup_session_with_file_upload(ClassFileMapping.FIXED_CHILD)


@pytest.fixture
def setup_session_with_two_children(
    setup_session_with_file_upload,
):
    return setup_session_with_file_upload(
        ClassFileMapping.TWO_FIXED_CHILDREN, schedule_session_for_today=False
    )


@pytest.fixture
def flu_consent_url(schedule_session_and_get_consent_url, schools):
    yield from schedule_session_and_get_consent_url(
        schools[Programme.FLU][0], Programme.FLU
    )


def test_delivering_vaccination_after_psd(
    setup_session_with_one_child,
    sessions_search_page,
    sessions_overview_page,
    sessions_edit_page,
    sessions_children_page,
    sessions_psd_page,
    sessions_patient_page,
    sessions_register_page,
    sessions_vaccination_wizard_page,
    sessions_record_vaccinations_page,
    schools,
    nurse_consent_wizard_page,
    children,
    log_in_page,
    healthcare_assistant,
    team,
    dashboard_page,
):
    """
    Test: A PSD can be created for a child and the vaccination can be
       administered by a healthcare assistant.
    Steps:
    1. Import child records and set up a session with PSD enabled.
    2. Record verbal consent with PSD option for the child.
    3. Verify the PSD is created.
    4. Log in as a healthcare assistant and administer the vaccination.
    Verification:
    - The PSD is correctly created and the vaccination is recorded without errors.
    """
    child = children[Programme.FLU][0]
    school = schools[Programme.FLU][0]
    fluenz_batch_name = setup_session_with_one_child

    sessions_search_page.click_session_for_programme_group(school, Programme.FLU)
    sessions_overview_page.click_edit_session()
    sessions_edit_page.click_change_psd()
    sessions_edit_page.answer_whether_psd_should_be_enabled("Yes")
    sessions_edit_page.click_continue_button()
    sessions_edit_page.click_save_changes()

    sessions_overview_page.tabs.click_children_tab()
    sessions_children_page.search.search_and_click_child(child)
    sessions_patient_page.click_programme_tab(Programme.FLU)
    sessions_patient_page.click_record_a_new_consent_response()
    nurse_consent_wizard_page.select_parent(child.parents[0])
    nurse_consent_wizard_page.select_consent_method(ConsentMethod.IN_PERSON)
    nurse_consent_wizard_page.record_parent_positive_consent(
        programme=Programme.FLU,
        consent_option=ConsentOption.NASAL_SPRAY_OR_INJECTION,
        psd_option=True,
        yes_to_health_questions=True,
    )
    sessions_overview_page.tabs.click_psds_tab()
    sessions_psd_page.search.search_for(str(child))
    sessions_psd_page.check_child_has_psd(child)

    log_in_page.log_out()
    log_in_page.navigate()
    log_in_page.log_in_and_choose_team_if_necessary(healthcare_assistant, team)

    dashboard_page.click_mavis()
    dashboard_page.click_sessions()
    sessions_search_page.click_session_for_programme_group(school, Programme.FLU)
    sessions_overview_page.tabs.click_register_tab()
    sessions_register_page.register_child_as_attending(str(child))
    sessions_register_page.tabs.click_record_vaccinations_tab()
    sessions_record_vaccinations_page.search.search_and_click_child(child)

    vaccination_record = VaccinationRecord(
        child, Programme.FLU, fluenz_batch_name, ConsentOption.NASAL_SPRAY_OR_INJECTION
    )
    sessions_patient_page.set_up_vaccination(vaccination_record)
    sessions_vaccination_wizard_page.record_vaccination(
        vaccination_record, psd_option=True
    )


def test_bulk_adding_psd(
    flu_consent_url,
    setup_session_with_two_children,
    sessions_search_page,
    sessions_overview_page,
    sessions_edit_page,
    sessions_children_page,
    sessions_psd_page,
    schools,
    children,
    dashboard_page,
    online_consent_wizard_page,
    start_page,
):
    """
    Test: PSDS can be bulk added for children in a session.
    Steps:
    1. Import two children into a session.
    2. Record online consent for the two children.
    3. Add PSDs in the session to all eligible children.
    Verification:
    - The PSDs appear for each child.
    """
    school = schools[Programme.FLU][0]

    for child in children[Programme.FLU]:
        online_consent_wizard_page.go_to_url(flu_consent_url)
        start_page.start()

        online_consent_wizard_page.fill_details(
            child, child.parents[0], schools[Programme.FLU]
        )
        online_consent_wizard_page.agree_to_flu_vaccination(
            consent_option=ConsentOption.NASAL_SPRAY_OR_INJECTION
        )
        online_consent_wizard_page.fill_address_details(*child.address)
        online_consent_wizard_page.answer_health_questions(
            online_consent_wizard_page.get_number_of_health_questions_for_flu(
                ConsentOption.NASAL_SPRAY_OR_INJECTION
            ),
            yes_to_health_questions=False,
        )
        online_consent_wizard_page.click_confirm()
        online_consent_wizard_page.check_final_consent_message(
            child,
            programmes=[Programme.FLU],
            yes_to_health_questions=False,
            consent_option=ConsentOption.NASAL_SPRAY_OR_INJECTION,
        )

    dashboard_page.navigate()
    dashboard_page.click_sessions()

    sessions_search_page.click_session_for_programme_group(school, Programme.FLU)
    sessions_overview_page.click_edit_session()
    sessions_edit_page.click_change_psd()
    sessions_edit_page.answer_whether_psd_should_be_enabled("Yes")
    sessions_edit_page.click_continue_button()
    sessions_edit_page.click_save_changes()

    sessions_overview_page.tabs.click_children_tab()
    for child in children[Programme.FLU]:
        sessions_children_page.get_flu_consent_status_locator_from_search(child)

    sessions_children_page.tabs.click_psds_tab()
    for child in children[Programme.FLU]:
        sessions_psd_page.search.search_for(str(child))
        sessions_psd_page.check_child_does_not_have_psd(child)

    sessions_psd_page.verify_psd_banner_has_patients(2)

    sessions_psd_page.click_add_new_psds()
    sessions_psd_page.click_yes_add_psds()

    sessions_psd_page.verify_psd_banner_has_patients(0)

    for child in children[Programme.FLU]:
        sessions_psd_page.search.search_for(str(child))
        sessions_psd_page.check_child_has_psd(child)


@pytest.mark.accessibility
def test_accessibility(
    setup_session_with_one_child,
    sessions_search_page,
    sessions_overview_page,
    sessions_edit_page,
    sessions_psd_page,
    accessibility_helper,
    dashboard_page,
    schools,
):
    """
    Test: Check for accessibility violations in the PSD tab.
    Steps:
    1. Navigate to the sessions page.
    2. Use the accessibility helper to check for common accessibility issues.
    Verification:
    - No accessibility issues are found.
    """
    school = schools[Programme.HPV][0]

    dashboard_page.navigate()
    dashboard_page.click_sessions()

    sessions_search_page.click_session_for_programme_group(school, Programme.HPV.group)
    if not sessions_overview_page.is_date_scheduled(get_offset_date(7)):
        sessions_overview_page.schedule_or_edit_session()
        sessions_edit_page.schedule_a_valid_session(offset_days=7, skip_weekends=False)
    sessions_overview_page.click_edit_session()
    sessions_edit_page.click_change_psd()
    accessibility_helper.check_accessibility()

    sessions_edit_page.answer_whether_psd_should_be_enabled("Yes")
    sessions_edit_page.click_continue_button()
    sessions_edit_page.click_save_changes()
    sessions_overview_page.tabs.click_psds_tab()
    accessibility_helper.check_accessibility()

    sessions_psd_page.click_add_new_psds()
    accessibility_helper.check_accessibility()

    sessions_psd_page.click_yes_add_psds()
    accessibility_helper.check_accessibility()
