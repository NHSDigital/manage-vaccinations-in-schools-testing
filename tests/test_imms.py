import pytest

from mavis.test.data import ClassFileMapping
from mavis.test.imms_api import ImmsApiHelper
from mavis.test.models import DeliverySite, Programme, Vaccine


@pytest.fixture(scope="session")
def imms_api_helper(authenticate_api):
    yield ImmsApiHelper(authenticate_api)


@pytest.fixture
def setup_recording_hpv(
    log_in_as_nurse,
    add_vaccine_batch,
    schools,
    dashboard_page,
    import_records_page,
    sessions_page,
):
    school = schools[Programme.HPV][0]
    batch_name = add_vaccine_batch(Vaccine.GARDASIL_9)
    dashboard_page.click_mavis()
    dashboard_page.click_sessions()
    sessions_page.schedule_a_valid_session(school, Programme.HPV, for_today=True)
    sessions_page.click_import_class_lists()
    sessions_page.select_year_groups_for_programme(Programme.HPV)
    import_records_page.upload_and_verify_output(ClassFileMapping.FIXED_CHILD)
    dashboard_page.click_mavis()
    dashboard_page.click_sessions()
    sessions_page.click_session_for_programme_group(school, Programme.HPV)
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
    vaccination_time = sessions_page.record_vaccs_for_child(
        child=child,
        programme=Programme.HPV,
        batch_name=batch_name,
        delivery_site=DeliverySite.LEFT_ARM_UPPER,
    )
    yield child, vaccination_time


def test_create_edit_delete(
    record_hpv, schools, imms_api_helper, sessions_page, programmes_page
):
    child, vaccination_time = record_hpv
    school = schools[Programme.HPV][0]

    imms_api_helper.check_hpv_record_in_imms_api(
        child, school, DeliverySite.LEFT_ARM_UPPER, vaccination_time
    )

    sessions_page.click_vaccination_details(school)
    programmes_page.click_edit_vaccination_record()
    programmes_page.click_change_site()
    programmes_page.click_delivery_site(DeliverySite.RIGHT_ARM_LOWER)
    programmes_page.click_continue()
    programmes_page.click_save_changes()

    imms_api_helper.check_hpv_record_in_imms_api(
        child, school, DeliverySite.RIGHT_ARM_UPPER, vaccination_time
    )

    sessions_page.click_vaccination_details(school)
    programmes_page.click_edit_vaccination_record()
    programmes_page.click_change_outcome()
    programmes_page.click_they_refused_it()
    programmes_page.click_continue()
    programmes_page.click_save_changes()

    imms_api_helper.check_hpv_record_is_not_in_imms_api(child)
