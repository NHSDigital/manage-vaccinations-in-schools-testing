import pytest

from mavis.test.models import Programme, Vaccine
from mavis.test.data import ClassFileMapping
from tests.helpers import imms_api


@pytest.fixture(scope="session")
def imms_api_helper(authenticate_api):
    yield imms_api.imms_api_helper(authenticate_api)


@pytest.fixture
def setup_recording_hpv(
    log_in_as_nurse,
    add_vaccine_batch,
    schools,
    dashboard_page,
    import_records_page,
    sessions_page,
    programmes_enabled,
):
    school = schools[Programme.HPV][0]
    batch_name = add_vaccine_batch(Vaccine.GARDASIL_9)
    dashboard_page.click_mavis()
    dashboard_page.click_sessions()
    sessions_page.schedule_a_valid_session(school, programmes_enabled, for_today=True)
    import_records_page.navigate_to_class_list_import()
    import_records_page.upload_and_verify_output(ClassFileMapping.FIXED_CHILD)
    sessions_page.click_location(school)
    sessions_page.click_consent_tab()
    yield batch_name


@pytest.fixture
def record_hpv(
    setup_recording_hpv,
    children_page,
    sessions_page,
    consent_page,
    children,
):
    child = children[Programme.HPV][0]
    batch_name = setup_recording_hpv

    children_page.search_for_a_child_name(str(child))
    sessions_page.navigate_to_consent_response(child, Programme.HPV)
    consent_page.parent_verbal_positive(parent=child.parents[0], change_phone=False)
    sessions_page.register_child_as_attending(child)
    sessions_page.record_vaccs_for_child(
        child=child,
        programme=Programme.HPV,
        batch_name=batch_name,
    )
    sessions_page.expect_main_to_contain_text("Vaccination outcome recorded for HPV")
    yield child


def test_imms_api_retrieval_hpv(record_hpv, imms_api_helper):
    child = record_hpv
    imms_api_helper.check_hpv_record_in_imms_api(child)
