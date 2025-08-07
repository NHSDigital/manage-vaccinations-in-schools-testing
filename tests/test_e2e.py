import pytest

from mavis.test.data import ClassFileMapping
from mavis.test.models import Programme, ConsentOption

pytestmark = pytest.mark.e2e


@pytest.fixture
def setup_session_with_file_upload(
    log_in_as_nurse,
    add_vaccine_batch,
    schools,
    dashboard_page,
    sessions_page,
    import_records_page,
    children,
):
    def _setup(programme_group):
        school = schools[programme_group][0]
        child = children[programme_group][0]

        batch_names = [
            add_vaccine_batch(prog.vaccines[0])
            for prog in Programme
            if prog.group == programme_group
        ]
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_page.click_session_for_programme_group(school, programme_group)
        sessions_page.click_import_class_lists()
        import_records_page.import_class_list_for_current_year(
            ClassFileMapping.FIXED_CHILD, child.year_group, programme_group
        )
        return batch_names

    return _setup


@pytest.fixture
def hpv_consent_url(get_online_consent_url_without_cleanup, schools):
    yield from get_online_consent_url_without_cleanup(
        schools[Programme.HPV][0], Programme.HPV
    )


@pytest.fixture
def setup_session_for_hpv(setup_session_with_file_upload):
    return setup_session_with_file_upload(Programme.HPV)


def test_recording_hpv_vaccination(
    hpv_consent_url,
    setup_session_for_hpv,
    consent_page,
    sessions_page,
    start_page,
    schools,
    children,
    dashboard_page,
):
    child = children[Programme.HPV][0]
    schools = schools[Programme.HPV]
    gardasil_9_batch_name = setup_session_for_hpv[0]

    consent_page.go_to_url(hpv_consent_url)
    start_page.start()

    consent_page.fill_details(child, child.parents[0], schools)
    consent_page.agree_to_hpv_vaccination()
    consent_page.fill_address_details(*child.address)
    consent_page.answer_health_questions(4, health_question=False)
    consent_page.click_confirm()
    consent_page.check_final_consent_message(
        child, programmes=[Programme.HPV], health_question=False
    )

    dashboard_page.navigate()
    dashboard_page.click_sessions()

    sessions_page.click_session_for_programme_group(schools[0], Programme.HPV)
    sessions_page.click_set_session_in_progress_for_today()
    sessions_page.register_child_as_attending(str(child))
    sessions_page.record_vaccs_for_child(child, Programme.HPV, gardasil_9_batch_name)


@pytest.fixture
def doubles_consent_url(get_online_consent_url_without_cleanup, schools):
    yield from get_online_consent_url_without_cleanup(
        schools["doubles"][0], Programme.MENACWY, Programme.TD_IPV
    )


@pytest.fixture
def setup_session_for_doubles(setup_session_with_file_upload):
    return setup_session_with_file_upload("doubles")


def test_recording_doubles_vaccination(
    doubles_consent_url,
    setup_session_for_doubles,
    consent_page,
    sessions_page,
    start_page,
    schools,
    children,
    dashboard_page,
):
    child = children["doubles"][0]
    schools = schools["doubles"]
    menquadfi_batch_name, revaxis_batch_name = setup_session_for_doubles

    consent_page.go_to_url(doubles_consent_url)
    start_page.start()

    consent_page.fill_details(child, child.parents[0], schools)
    consent_page.agree_to_doubles_vaccinations(Programme.MENACWY, Programme.TD_IPV)
    consent_page.fill_address_details(*child.address)
    consent_page.answer_health_questions(6, health_question=False)
    consent_page.click_confirm()
    consent_page.check_final_consent_message(
        child, programmes=[Programme.MENACWY, Programme.TD_IPV], health_question=False
    )

    dashboard_page.navigate()
    dashboard_page.click_sessions()

    sessions_page.click_session_for_programme_group(schools[0], "doubles")
    sessions_page.click_set_session_in_progress_for_today()
    sessions_page.register_child_as_attending(str(child))
    sessions_page.record_vaccs_for_child(child, Programme.MENACWY, menquadfi_batch_name)
    sessions_page.record_vaccs_for_child(child, Programme.TD_IPV, revaxis_batch_name)


@pytest.fixture
def flu_consent_url(get_online_consent_url_without_cleanup, schools):
    yield from get_online_consent_url_without_cleanup(
        schools[Programme.FLU][0], Programme.FLU
    )


@pytest.fixture
def setup_session_for_flu(setup_session_with_file_upload):
    return setup_session_with_file_upload(Programme.FLU)


def test_recording_flu_vaccination(
    flu_consent_url,
    setup_session_for_flu,
    consent_page,
    sessions_page,
    start_page,
    schools,
    children,
    dashboard_page,
):
    child = children[Programme.FLU][0]
    schools = schools[Programme.FLU]
    fluenz_batch_name = setup_session_for_flu[0]

    consent_page.go_to_url(flu_consent_url)
    start_page.start()

    consent_page.fill_details(child, child.parents[0], schools)
    consent_page.agree_to_flu_vaccination(consent_option=ConsentOption.BOTH)
    consent_page.fill_address_details(*child.address)
    consent_page.answer_health_questions(11, health_question=False)
    consent_page.click_confirm()
    consent_page.check_final_consent_message(
        child,
        programmes=[Programme.FLU],
        health_question=False,
        consent_option=ConsentOption.BOTH,
    )

    dashboard_page.navigate()
    dashboard_page.click_sessions()

    sessions_page.click_session_for_programme_group(schools[0], Programme.FLU)
    sessions_page.click_set_session_in_progress_for_today()
    sessions_page.register_child_as_attending(str(child))
    sessions_page.record_vaccs_for_child(
        child,
        Programme.FLU,
        fluenz_batch_name,
        ConsentOption.BOTH,
    )
