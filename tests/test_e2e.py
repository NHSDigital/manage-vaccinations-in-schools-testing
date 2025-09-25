import pytest

from mavis.test.annotations import issue
from mavis.test.data import ClassFileMapping
from mavis.test.models import ConsentOption, Programme, VaccinationRecord

pytestmark = pytest.mark.e2e


@pytest.fixture
def setup_session_with_file_upload(
    add_vaccine_batch,
    schools,
    dashboard_page,
    sessions_page,
    import_records_page,
    children,
    log_in_page,
    nurse,
    team,
):
    def _setup(programme_group):
        school = schools[programme_group][0]
        child = children[programme_group][0]

        try:
            log_in_page.navigate()
            log_in_page.log_in_and_choose_team_if_necessary(nurse, team)
            batch_names = [
                add_vaccine_batch(prog.vaccines[0])
                for prog in Programme
                if prog.group == programme_group
            ]
            dashboard_page.click_mavis()
            dashboard_page.click_sessions()
            sessions_page.click_session_for_programme_group(school, programme_group)
            sessions_page.click_import_class_lists()
            import_records_page.import_class_list(
                ClassFileMapping.FIXED_CHILD,
                child.year_group,
                programme_group,
            )
            return batch_names
        finally:
            dashboard_page.navigate()
            log_in_page.log_out()

    return _setup


@pytest.fixture
def hpv_consent_url(schedule_session_and_get_consent_url, schools):
    yield from schedule_session_and_get_consent_url(
        schools[Programme.HPV][0], Programme.HPV
    )


@pytest.fixture
def setup_session_for_hpv(setup_session_with_file_upload):
    return setup_session_with_file_upload(Programme.HPV)


def test_recording_hpv_vaccination_e2e(
    hpv_consent_url,
    setup_session_for_hpv,
    online_consent_page,
    sessions_page,
    start_page,
    schools,
    children,
    dashboard_page,
    log_in_page,
    nurse,
    team,
):
    """
    Test: End-to-end test for recording an HPV vaccination for a child.
    Steps:
    1. Setup: Log in as nurse, create session, import class list, and get batch name.
    2. Go to online consent URL and fill in child and parent details.
    3. Agree to HPV vaccination, fill address, answer health questions, and confirm.
    4. Log in as nurse, navigate to session, set session in progress,
       register child as attending.
    5. Record HPV vaccination for the child.
    Verification:
    - Final consent message is shown after online consent.
    - Vaccination is recorded for the child in the session.
    """
    child = children[Programme.HPV][0]
    schools = schools[Programme.HPV]
    gardasil_9_batch_name = setup_session_for_hpv[0]
    number_of_health_questions = len(Programme.health_questions(Programme.HPV))

    online_consent_page.go_to_url(hpv_consent_url)
    start_page.start()

    online_consent_page.fill_details(child, child.parents[0], schools)
    online_consent_page.agree_to_hpv_vaccination()
    online_consent_page.fill_address_details(*child.address)
    online_consent_page.answer_health_questions(
        number_of_health_questions,
        yes_to_health_questions=False,
    )
    online_consent_page.click_confirm()
    online_consent_page.check_final_consent_message(
        child,
        programmes=[Programme.HPV],
        yes_to_health_questions=False,
    )

    log_in_page.navigate()
    log_in_page.log_in_and_choose_team_if_necessary(nurse, team)
    dashboard_page.click_sessions()

    sessions_page.click_session_for_programme_group(schools[0], Programme.HPV)
    sessions_page.click_set_session_in_progress_for_today()
    sessions_page.register_child_as_attending(str(child))
    sessions_page.record_vaccination_for_child(
        VaccinationRecord(child, Programme.HPV, gardasil_9_batch_name)
    )

    dashboard_page.navigate()
    log_in_page.log_out()


@pytest.fixture
def doubles_consent_url(schedule_session_and_get_consent_url, schools):
    yield from schedule_session_and_get_consent_url(
        schools["doubles"][0],
        Programme.MENACWY,
        Programme.TD_IPV,
    )


@pytest.fixture
def setup_session_for_doubles(setup_session_with_file_upload):
    return setup_session_with_file_upload("doubles")


def test_recording_doubles_vaccination_e2e(
    doubles_consent_url,
    setup_session_for_doubles,
    online_consent_page,
    sessions_page,
    start_page,
    schools,
    children,
    dashboard_page,
    log_in_page,
    nurse,
    team,
):
    """
    Test: End-to-end test for recording MenACWY and Td/IPV ("doubles") vaccinations
    Steps:
    1. Setup: Log in as nurse, create session, import class list, and get batch names.
    2. Go to online consent URL and fill in child and parent details.
    3. Agree to both MenACWY and Td/IPV vaccinations, fill address,
       answer health questions
    4. Log in as nurse, navigate to session, set session in progress,
       register child as attending.
    5. Record MenACWY and Td/IPV vaccinations for the child.
    Verification:
    - Final consent message is shown after online consent.
    - Both vaccinations are recorded for the child in the session.
    """
    child = children["doubles"][0]
    schools = schools["doubles"]
    menquadfi_batch_name, revaxis_batch_name = setup_session_for_doubles
    number_of_health_questions = (
        online_consent_page.get_number_of_health_questions_for_programmes(
            [Programme.MENACWY, Programme.TD_IPV],
        )
    )

    online_consent_page.go_to_url(doubles_consent_url)
    start_page.start()

    online_consent_page.fill_details(child, child.parents[0], schools)
    online_consent_page.agree_to_doubles_vaccinations(
        Programme.MENACWY,
        Programme.TD_IPV,
    )
    online_consent_page.fill_address_details(*child.address)
    online_consent_page.answer_health_questions(
        number_of_health_questions,
        yes_to_health_questions=False,
    )
    online_consent_page.click_confirm()
    online_consent_page.check_final_consent_message(
        child,
        programmes=[Programme.MENACWY, Programme.TD_IPV],
        yes_to_health_questions=False,
    )

    log_in_page.navigate()
    log_in_page.log_in_and_choose_team_if_necessary(nurse, team)
    dashboard_page.click_sessions()

    sessions_page.click_session_for_programme_group(schools[0], "doubles")
    sessions_page.click_set_session_in_progress_for_today()
    sessions_page.register_child_as_attending(str(child))
    sessions_page.record_vaccination_for_child(
        VaccinationRecord(child, Programme.MENACWY, menquadfi_batch_name)
    )
    sessions_page.record_vaccination_for_child(
        VaccinationRecord(child, Programme.TD_IPV, revaxis_batch_name)
    )

    dashboard_page.navigate()
    log_in_page.log_out()


@pytest.fixture
def flu_consent_url(schedule_session_and_get_consent_url, schools):
    yield from schedule_session_and_get_consent_url(
        schools[Programme.FLU][0], Programme.FLU
    )


@pytest.fixture
def setup_session_for_flu(setup_session_with_file_upload):
    return setup_session_with_file_upload(Programme.FLU)


@issue("MAV-1831")
def test_recording_flu_vaccination_e2e(
    flu_consent_url,
    setup_session_for_flu,
    online_consent_page,
    sessions_page,
    children_page,
    programmes_page,
    start_page,
    schools,
    children,
    dashboard_page,
    log_in_page,
    nurse,
    team,
):
    """
    Test: End-to-end test for recording a flu vaccination for a child.
    Steps:
    1. Setup: Log in as nurse, create session, import class list, and get batch name.
    2. Go to online consent URL and fill in child and parent details.
    3. Agree to flu vaccination, fill address, answer health questions, and confirm.
    4. Log in as nurse, navigate to session, set session in progress,
       register child as attending.
    5. Record flu vaccination for the child.
    Verification:
    - Final consent message is shown after online consent.
    - Vaccination is recorded for the child in the session.
    """
    child = children[Programme.FLU][0]
    schools = schools[Programme.FLU]
    fluenz_batch_name = setup_session_for_flu[0]

    online_consent_page.go_to_url(flu_consent_url)
    start_page.start()

    online_consent_page.fill_details(child, child.parents[0], schools)
    online_consent_page.agree_to_flu_vaccination(consent_option=ConsentOption.BOTH)
    online_consent_page.fill_address_details(*child.address)
    online_consent_page.answer_health_questions(
        online_consent_page.get_number_of_health_questions_for_flu(ConsentOption.BOTH),
        yes_to_health_questions=False,
    )
    online_consent_page.click_confirm()
    online_consent_page.check_final_consent_message(
        child,
        programmes=[Programme.FLU],
        yes_to_health_questions=False,
        consent_option=ConsentOption.BOTH,
    )

    log_in_page.navigate()
    log_in_page.log_in_and_choose_team_if_necessary(nurse, team)
    dashboard_page.click_sessions()

    sessions_page.click_session_for_programme_group(schools[0], Programme.FLU)
    sessions_page.click_set_session_in_progress_for_today()
    sessions_page.register_child_as_attending(str(child))
    sessions_page.record_vaccination_for_child(
        VaccinationRecord(child, Programme.FLU, fluenz_batch_name, ConsentOption.BOTH)
    )

    # MAV-1831
    dashboard_page.navigate()
    dashboard_page.click_children()
    children_page.search_for_a_child_name(str(child))
    children_page.click_record_for_child(child)
    children_page.click_vaccination_details(schools[0])
    programmes_page.click_edit_vaccination_record()
    sessions_page.expect_text_to_not_be_visible("Incorrect vaccine given")

    dashboard_page.navigate()
    log_in_page.log_out()
