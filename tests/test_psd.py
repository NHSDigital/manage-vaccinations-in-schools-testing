import pytest

from mavis.test.data import ClassFileMapping
from mavis.test.models import (
    ConsentMethod,
    ConsentOption,
    Programme,
    VaccinationRecord,
    Vaccine,
)


@pytest.fixture
def setup_session_with_file_upload(
    log_in_as_prescriber,
    schools,
    dashboard_page,
    sessions_page,
    import_records_page,
    year_groups,
    add_vaccine_batch,
):
    def _factory(
        class_file_mapping: ClassFileMapping, *, schedule_session_for_today: bool = True
    ) -> str:
        school = schools[Programme.FLU][0]
        year_group = year_groups[Programme.FLU]
        try:
            batch_name = add_vaccine_batch(Vaccine.FLUENZ)
            dashboard_page.click_mavis()
            dashboard_page.click_sessions()
            if schedule_session_for_today:
                sessions_page.ensure_session_scheduled_for_today(school, Programme.FLU)
            dashboard_page.click_mavis()
            dashboard_page.click_sessions()
            sessions_page.click_session_for_programme_group(school, Programme.FLU)
            sessions_page.click_import_class_lists()
            import_records_page.import_class_list(
                class_file_mapping, year_group, Programme.FLU.group
            )
            dashboard_page.click_mavis()
            dashboard_page.click_sessions()
            return batch_name
        finally:
            dashboard_page.navigate()
            dashboard_page.click_mavis()
            dashboard_page.click_sessions()
            sessions_page.delete_all_sessions(school)

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
    sessions_page,
    schools,
    verbal_consent_page,
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

    sessions_page.click_session_for_programme_group(school, Programme.FLU)
    sessions_page.click_edit_session()
    sessions_page.click_change_psd()
    sessions_page.answer_whether_psd_should_be_enabled("Yes")
    sessions_page.click_continue_button()
    sessions_page.click_save_changes()

    sessions_page.click_consent_tab()
    sessions_page.search_child(child)
    sessions_page.click_programme_tab(Programme.FLU)
    sessions_page.click_record_a_new_consent_response()
    verbal_consent_page.select_parent(child.parents[0])
    verbal_consent_page.select_consent_method(ConsentMethod.IN_PERSON)
    verbal_consent_page.record_parent_positive_consent(
        programme=Programme.FLU,
        consent_option=ConsentOption.BOTH,
        psd_option=True,
        yes_to_health_questions=True,
    )
    sessions_page.click_psds_tab()
    sessions_page.search_for(str(child))
    sessions_page.check_child_has_psd(child)

    log_in_page.log_out()
    log_in_page.navigate()
    log_in_page.log_in_and_choose_team_if_necessary(healthcare_assistant, team)

    dashboard_page.click_mavis()
    dashboard_page.click_sessions()
    sessions_page.click_session_for_programme_group(school, Programme.FLU)
    sessions_page.register_child_as_attending(str(child))
    sessions_page.record_vaccination_for_child(
        VaccinationRecord(child, Programme.FLU, fluenz_batch_name, ConsentOption.BOTH),
        psd_option=True,
    )


def test_bulk_adding_psd(
    flu_consent_url,
    setup_session_with_two_children,
    sessions_page,
    schools,
    children,
    dashboard_page,
    online_consent_page,
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
        online_consent_page.go_to_url(flu_consent_url)
        start_page.start()

        online_consent_page.fill_details(
            child, child.parents[0], schools[Programme.FLU]
        )
        online_consent_page.agree_to_flu_vaccination(consent_option=ConsentOption.BOTH)
        online_consent_page.fill_address_details(*child.address)
        online_consent_page.answer_health_questions(
            online_consent_page.get_number_of_health_questions_for_flu(
                ConsentOption.BOTH
            ),
            yes_to_health_questions=False,
        )
        online_consent_page.click_confirm()
        online_consent_page.check_final_consent_message(
            child,
            programmes=[Programme.FLU],
            yes_to_health_questions=False,
            consent_option=ConsentOption.BOTH,
        )

    dashboard_page.navigate()
    dashboard_page.click_sessions()

    sessions_page.click_session_for_programme_group(school, Programme.FLU)
    sessions_page.click_edit_session()
    sessions_page.click_change_psd()
    sessions_page.answer_whether_psd_should_be_enabled("Yes")
    sessions_page.click_continue_button()
    sessions_page.click_save_changes()

    sessions_page.click_consent_tab()
    for child in children[Programme.FLU]:
        sessions_page.get_flu_consent_status_locator_from_search(child)

    sessions_page.click_psds_tab()
    for child in children[Programme.FLU]:
        sessions_page.search_for(str(child))
        sessions_page.check_child_does_not_have_psd(child)

    sessions_page.verify_psd_banner_has_patients(2)

    sessions_page.click_add_new_psds()
    sessions_page.click_yes_add_psds()

    sessions_page.verify_psd_banner_has_patients(0)

    for child in children[Programme.FLU]:
        sessions_page.search_for(str(child))
        sessions_page.check_child_has_psd(child)


@pytest.mark.accessibility
def test_accessibility(
    sessions_page,
    accessibility_helper,
    setup_session_with_one_child,
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

    sessions_page.click_session_for_programme_group(school, Programme.FLU)
    sessions_page.schedule_a_valid_session()
    sessions_page.click_edit_session()
    sessions_page.click_change_psd()
    accessibility_helper.check_accessibility()

    sessions_page.answer_whether_psd_should_be_enabled("Yes")
    sessions_page.click_continue_button()
    sessions_page.click_save_changes()
    sessions_page.click_psds_tab()
    accessibility_helper.check_accessibility()

    sessions_page.click_add_new_psds()
    accessibility_helper.check_accessibility()

    sessions_page.click_yes_add_psds()
    accessibility_helper.check_accessibility()
