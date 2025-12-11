import os
import re

import pytest

from mavis.test.constants import ConsentOption, Programme, Vaccine
from mavis.test.data import ClassFileMapping, VaccsFileMapping
from mavis.test.data_models import School
from mavis.test.pages import (
    AddBatchPage,
    ChildRecordPage,
    DashboardPage,
    FlipperPage,
    ImportRecordsWizardPage,
    ImportsPage,
    LogInPage,
    ProgrammeChildrenPage,
    ProgrammeOverviewPage,
    ProgrammesListPage,
    SchoolsChildrenPage,
    SchoolsSearchPage,
    SessionsEditPage,
    SessionsOverviewPage,
    SessionsSearchPage,
    VaccinesPage,
)
from mavis.test.utils import get_offset_date


@pytest.fixture
def set_feature_flags(page):
    set_check_feature_flags = os.getenv("SET_FEATURE_FLAGS", "false").lower() == "true"

    if set_check_feature_flags:
        FlipperPage(page).navigate()
        FlipperPage(page).set_feature_flags()

    yield

    if set_check_feature_flags:
        FlipperPage(page).navigate()
        FlipperPage(page).set_feature_flags(check_only=True)


@pytest.fixture
def add_vaccine_batch(page):
    def wrapper(vaccine: Vaccine, batch_name: str = "ABC123"):
        VaccinesPage(page).navigate()
        VaccinesPage(page).click_add_batch(vaccine)
        AddBatchPage(page).fill_name(batch_name)
        AddBatchPage(page).date.fill_expiry_date(get_offset_date(1))
        AddBatchPage(page).confirm()
        return batch_name

    return wrapper


@pytest.fixture
def schedule_session_and_get_consent_url(
    set_feature_flags,
    nurse,
    team,
    page,
):
    def wrapper(school: School, *programmes: Programme):
        LogInPage(page).navigate()
        LogInPage(page).log_in_and_choose_team_if_necessary(nurse, team)
        DashboardPage(page).click_sessions()
        SessionsSearchPage(page).click_session_for_programme_group(
            school, programmes[0].group
        )
        if not SessionsOverviewPage(page).is_date_scheduled(get_offset_date(7)):
            SessionsOverviewPage(page).schedule_or_edit_session()
            SessionsEditPage(page).schedule_a_valid_session(
                offset_days=7, skip_weekends=False
            )
        url = SessionsOverviewPage(page).get_online_consent_url(*programmes)
        LogInPage(page).log_out()
        yield url

    return wrapper


@pytest.fixture
def schedule_mmr_session_and_get_consent_url(
    set_feature_flags,
    nurse,
    team,
    page,
):
    def wrapper(school: School, *programmes: Programme):
        try:
            LogInPage(page).navigate()
            LogInPage(page).log_in_and_choose_team_if_necessary(nurse, team)
            DashboardPage(page).click_sessions()
            SessionsSearchPage(page).click_session_for_programme_group(
                school, programmes[0].group
            )
            SessionsOverviewPage(page).schedule_or_edit_session()
            SessionsEditPage(page).schedule_a_valid_mmr_session()
            url = SessionsOverviewPage(page).get_online_consent_url(*programmes)
            LogInPage(page).log_out()
            yield url
        finally:
            LogInPage(page).log_out()

    return wrapper


@pytest.fixture
def log_in_as_medical_secretary(
    set_feature_flags,
    medical_secretary,
    team,
    page,
):
    LogInPage(page).navigate()
    LogInPage(page).log_in_and_choose_team_if_necessary(medical_secretary, team)
    yield
    LogInPage(page).log_out()


@pytest.fixture
def log_in_as_nurse(set_feature_flags, nurse, team, page):
    LogInPage(page).navigate()
    LogInPage(page).log_in_and_choose_team_if_necessary(nurse, team)
    yield
    LogInPage(page).log_out()


@pytest.fixture
def log_in_as_prescriber(set_feature_flags, prescriber, team, page):
    LogInPage(page).navigate()
    LogInPage(page).log_in_and_choose_team_if_necessary(prescriber, team)
    yield
    LogInPage(page).log_out()


@pytest.fixture
def upload_offline_vaccination(
    log_in_as_nurse,
    schools,
    page,
    children,
    file_generator,
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

        DashboardPage(page).navigate()
        DashboardPage(page).click_schools()
        SchoolsSearchPage(page).click_school(school)
        SchoolsChildrenPage(page).click_import_class_lists()
        ImportRecordsWizardPage(page, file_generator).import_class_list(
            ClassFileMapping.FIXED_CHILD,
            child.year_group,
            programme.group,
        )
        ImportsPage(page).header.click_mavis_header()
        DashboardPage(page).click_sessions()
        SessionsSearchPage(page).click_session_for_programme_group(school, programme)
        if not SessionsOverviewPage(page).is_date_scheduled(get_offset_date(0)):
            SessionsOverviewPage(page).schedule_or_edit_session()
            SessionsEditPage(page).schedule_a_valid_session(
                offset_days=0, skip_weekends=False
            )
        session_id = SessionsOverviewPage(page).get_session_id_from_offline_excel()
        SessionsOverviewPage(page).header.click_mavis_header()
        DashboardPage(page).click_imports()
        ImportsPage(page).click_upload_records()
        ImportRecordsWizardPage(
            page, file_generator
        ).navigate_to_vaccination_records_import()
        ImportRecordsWizardPage(page, file_generator).upload_and_verify_output(
            file_mapping=vaccs_file,
            session_id=session_id,
            programme_group=programme.group,
        )
        ImportsPage(page).header.click_mavis_header()
        DashboardPage(page).click_programmes()
        ProgrammesListPage(page).click_programme_for_current_year(programme)
        ProgrammeOverviewPage(page).tabs.click_children_tab()
        ProgrammeChildrenPage(page).search.search_and_click_child(child)
        ChildRecordPage(page).click_vaccination_details(school)
        yield

    return wrapper


@pytest.fixture
def setup_session_and_batches_with_fixed_child(
    add_vaccine_batch,
    schools,
    children,
    page,
    file_generator,
    nurse,
    team,
):
    def _setup(programme_group):
        school = schools[programme_group][0]
        child = children[programme_group][0]

        try:
            LogInPage(page).navigate()
            LogInPage(page).log_in_and_choose_team_if_necessary(nurse, team)
            batch_names = {
                vaccine: add_vaccine_batch(vaccine, re.sub(r"\W+", "", vaccine) + "123")
                for vaccine in Vaccine
                if vaccine.programme.group == programme_group
            }
            VaccinesPage(page).header.click_mavis_header()
            DashboardPage(page).click_schools()
            SchoolsSearchPage(page).click_school(school)
            SchoolsChildrenPage(page).click_import_class_lists()
            ImportRecordsWizardPage(page, file_generator).import_class_list(
                ClassFileMapping.FIXED_CHILD,
                child.year_group,
                programme_group,
            )
            return batch_names
        finally:
            DashboardPage(page).navigate()
            LogInPage(page).log_out()

    return _setup
