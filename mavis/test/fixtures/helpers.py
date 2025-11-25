import os
import re

import pytest
from playwright.sync_api import Page

from mavis.test.accessibility import AccessibilityHelper
from mavis.test.data import ClassFileMapping, TestData, VaccsFileMapping
from mavis.test.models import ConsentOption, Programme, School, Vaccine
from mavis.test.utils import get_offset_date


@pytest.fixture
def set_feature_flags(flipper_page):
    set_check_feature_flags = os.getenv("SET_FEATURE_FLAGS", "false").lower() == "true"

    if set_check_feature_flags:
        flipper_page.navigate()
        flipper_page.set_feature_flags()

    yield

    if set_check_feature_flags:
        flipper_page.navigate()
        flipper_page.set_feature_flags(check_only=True)


@pytest.fixture
def add_vaccine_batch(add_batch_page, vaccines_page):
    def wrapper(vaccine: Vaccine, batch_name: str = "ABC123"):
        vaccines_page.navigate()
        vaccines_page.click_add_batch(vaccine)
        add_batch_page.fill_name(batch_name)
        add_batch_page.fill_expiry_date(get_offset_date(1))
        add_batch_page.confirm()
        return batch_name

    return wrapper


@pytest.fixture
def schedule_session_and_get_consent_url(
    set_feature_flags,
    nurse,
    team,
    dashboard_page,
    log_in_page,
    sessions_edit_page,
    sessions_search_page,
    sessions_overview_page,
):
    def wrapper(school: School, *programmes: Programme):
        log_in_page.navigate()
        log_in_page.log_in_and_choose_team_if_necessary(nurse, team)
        dashboard_page.click_sessions()
        sessions_search_page.click_session_for_programme_group(
            school, programmes[0].group
        )
        if not sessions_overview_page.is_date_scheduled(get_offset_date(7)):
            sessions_overview_page.schedule_or_edit_session()
            sessions_edit_page.schedule_a_valid_session(
                offset_days=7, skip_weekends=False
            )
        url = sessions_overview_page.get_online_consent_url(*programmes)
        log_in_page.log_out()
        yield url

    return wrapper


@pytest.fixture
def schedule_mmr_session_and_get_consent_url(
    set_feature_flags,
    nurse,
    team,
    dashboard_page,
    log_in_page,
    sessions_edit_page,
    sessions_search_page,
    sessions_overview_page,
):
    def wrapper(school: School, *programmes: Programme):
        try:
            log_in_page.navigate()
            log_in_page.log_in_and_choose_team_if_necessary(nurse, team)
            dashboard_page.click_sessions()
            sessions_search_page.click_session_for_programme_group(
                school, programmes[0].group
            )
            sessions_overview_page.schedule_or_edit_session()
            sessions_edit_page.schedule_a_valid_mmr_session()
            url = sessions_overview_page.get_online_consent_url(*programmes)
            log_in_page.log_out()
            yield url
        finally:
            log_in_page.log_out()

    return wrapper


@pytest.fixture
def log_in_as_medical_secretary(
    set_feature_flags,
    medical_secretary,
    team,
    log_in_page,
):
    log_in_page.navigate()
    log_in_page.log_in_and_choose_team_if_necessary(medical_secretary, team)
    yield
    log_in_page.log_out()


@pytest.fixture
def log_in_as_nurse(set_feature_flags, nurse, team, log_in_page):
    log_in_page.navigate()
    log_in_page.log_in_and_choose_team_if_necessary(nurse, team)
    yield
    log_in_page.log_out()


@pytest.fixture
def log_in_as_prescriber(set_feature_flags, prescriber, team, log_in_page):
    log_in_page.navigate()
    log_in_page.log_in_and_choose_team_if_necessary(prescriber, team)
    yield
    log_in_page.log_out()


@pytest.fixture
def upload_offline_vaccination(
    log_in_as_nurse,
    schools,
    dashboard_page,
    import_records_wizard_page,
    sessions_edit_page,
    sessions_search_page,
    sessions_overview_page,
    programmes_list_page,
    programme_children_page,
    programme_overview_page,
    child_record_page,
    children,
    imports_page,
):
    def wrapper(
        programme: Programme, consent_option: ConsentOption = ConsentOption.INJECTION
    ):
        child = children[programme][0]
        school = schools[programme][0]

        if programme is Programme.HPV:
            vaccs_file = VaccsFileMapping.HPV_DOSE_TWO
        elif programme is Programme.FLU:
            vaccs_file = (
                VaccsFileMapping.FLU_INJECTED
                if consent_option is ConsentOption.INJECTION
                else VaccsFileMapping.FLU_NASAL
            )
        elif programme is Programme.MMR:
            vaccs_file = VaccsFileMapping.MMR_DOSE_ONE
        else:
            msg = "Update upload_offline_vaccination to handle programme"
            raise ValueError(msg)

        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_search_page.click_session_for_programme_group(school, programme.group)
        if not sessions_overview_page.is_date_scheduled(get_offset_date(0)):
            sessions_overview_page.schedule_or_edit_session()
            sessions_edit_page.schedule_a_valid_session(
                offset_days=0, skip_weekends=False
            )
        sessions_overview_page.click_import_class_lists()
        import_records_wizard_page.import_class_list(
            ClassFileMapping.FIXED_CHILD,
            child.year_group,
            programme.group,
        )
        dashboard_page.click_mavis()
        dashboard_page.click_sessions()
        sessions_search_page.click_session_for_programme_group(school, programme)
        session_id = sessions_overview_page.get_session_id_from_offline_excel()
        dashboard_page.click_mavis()
        dashboard_page.click_imports()
        imports_page.click_upload_records()
        import_records_wizard_page.navigate_to_vaccination_records_import()
        import_records_wizard_page.upload_and_verify_output(
            file_mapping=vaccs_file,
            session_id=session_id,
            programme_group=programme.group,
        )
        dashboard_page.click_mavis()
        dashboard_page.click_programmes()
        programmes_list_page.click_programme_for_current_year(programme)
        programme_overview_page.click_children_tab()
        programme_children_page.search_for_child(child)
        programme_children_page.click_child(child)
        child_record_page.click_vaccination_details(programme)
        yield

    return wrapper


@pytest.fixture
def setup_session_and_batches_with_fixed_child(
    add_vaccine_batch,
    schools,
    dashboard_page,
    sessions_search_page,
    sessions_overview_page,
    import_records_wizard_page,
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
            batch_names = {
                vaccine: add_vaccine_batch(vaccine, re.sub(r"\W+", "", vaccine) + "123")
                for vaccine in Vaccine
                if vaccine.programme.group == programme_group
            }
            dashboard_page.click_mavis()
            dashboard_page.click_sessions()
            sessions_search_page.click_session_for_programme_group(
                school, programme_group
            )
            sessions_overview_page.click_import_class_lists()
            import_records_wizard_page.import_class_list(
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
def test_data(organisation, schools, nurse, children, clinics, year_groups):
    return TestData(organisation, schools, nurse, children, clinics, year_groups)


@pytest.fixture
def accessibility_helper(page: Page) -> AccessibilityHelper:
    return AccessibilityHelper(page)
