import os
import re

import pytest

from mavis.test.constants import ConsentOption, Programme, Vaccine
from mavis.test.data import ClassFileMapping, VaccsFileMapping
from mavis.test.data_models import School
from mavis.test.pages import (
    AddBatchPage,
    ChildProgrammePage,
    ChildRecordPage,
    ChildrenSearchPage,
    DashboardPage,
    FlipperPage,
    ImportRecordsWizardPage,
    ImportsPage,
    LogInPage,
    SchoolChildrenPage,
    SchoolsSearchPage,
    SessionsOverviewPage,
    SessionsSearchPage,
    VaccinesPage,
)
from mavis.test.pages.utils import schedule_school_session_if_needed
from mavis.test.utils import get_current_datetime, get_offset_date


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
        AddBatchPage(page).date.fill_expiry_date(get_offset_date(14))
        AddBatchPage(page).confirm()
        AddBatchPage(page).verify_batch_added(batch_name)
        return batch_name

    return wrapper


@pytest.fixture
def schedule_session_and_get_consent_url(
    set_feature_flags, point_of_care_nurse, point_of_care_team, page, year_groups
):
    def wrapper(school: School, *programmes: Programme):
        year_group = year_groups[programmes[0].group]

        LogInPage(page).navigate()
        LogInPage(page).log_in_and_choose_team_if_necessary(
            point_of_care_nurse, point_of_care_team
        )

        schedule_school_session_if_needed(
            page, school, list(programmes), [year_group], date_offset=7
        )
        url = SessionsOverviewPage(page).get_online_consent_url(*programmes)
        yield url

    return wrapper


@pytest.fixture
def schedule_mmr_session_and_get_consent_url(
    set_feature_flags, point_of_care_nurse, point_of_care_team, page, year_groups
):
    def wrapper(school: School, *programmes: Programme):
        year_group = year_groups[programmes[0].group]

        LogInPage(page).navigate()
        LogInPage(page).log_in_and_choose_team_if_necessary(
            point_of_care_nurse, point_of_care_team
        )
        schedule_school_session_if_needed(
            page, school, list(programmes), [year_group], date_offset=7
        )
        url = SessionsOverviewPage(page).get_online_consent_url(*programmes)
        yield url

    return wrapper


@pytest.fixture
def schedule_mmrv_session_and_get_consent_url(
    set_feature_flags, point_of_care_nurse, point_of_care_team, page, year_groups
):
    """Get consent URL for MMRV-eligible children (uses the MMRV link)."""

    def wrapper(school: School, *programmes: Programme):
        year_group = year_groups[programmes[0].group]

        LogInPage(page).navigate()
        LogInPage(page).log_in_and_choose_team_if_necessary(
            point_of_care_nurse, point_of_care_team
        )
        schedule_school_session_if_needed(
            page, school, list(programmes), [year_group], date_offset=7
        )
        url = SessionsOverviewPage(page).get_online_consent_url(
            *programmes, prefer_mmrv=True
        )
        yield url

    return wrapper


@pytest.fixture
def log_in_as_medical_secretary(
    set_feature_flags,
    point_of_care_medical_secretary,
    point_of_care_team,
    page,
):
    LogInPage(page).navigate()
    LogInPage(page).log_in_and_choose_team_if_necessary(
        point_of_care_medical_secretary, point_of_care_team
    )


@pytest.fixture
def log_in_as_nurse(set_feature_flags, point_of_care_nurse, point_of_care_team, page):
    LogInPage(page).navigate()
    LogInPage(page).log_in_and_choose_team_if_necessary(
        point_of_care_nurse, point_of_care_team
    )


@pytest.fixture
def log_in_as_prescriber(
    set_feature_flags, point_of_care_prescriber, point_of_care_team, page
):
    LogInPage(page).navigate()
    LogInPage(page).log_in_and_choose_team_if_necessary(
        point_of_care_prescriber, point_of_care_team
    )


@pytest.fixture
def upload_offline_vaccination(
    schools,
    page,
    children,
    point_of_care_file_generator,
):
    def wrapper(
        programme: Programme, consent_option: ConsentOption = ConsentOption.INJECTION
    ):
        child = children[programme][0]
        school = schools[programme][0]

        if programme is Programme.HPV:
            vaccs_file = VaccsFileMapping.HPV_DOSE_TWO
            vaccs_date = get_current_datetime()
        elif programme is Programme.FLU:
            vaccs_file = (
                VaccsFileMapping.FLU_INJECTED
                if consent_option is ConsentOption.INJECTION
                else VaccsFileMapping.FLU_NASAL
            )
            vaccs_date = get_current_datetime()
        elif programme is Programme.MMR_MMRV:
            vaccs_file = VaccsFileMapping.MMR_DOSE_ONE
            vaccs_date = get_current_datetime().replace(
                year=get_current_datetime().year - 2
            )
        else:
            msg = "Update upload_offline_vaccination to handle programme"
            raise ValueError(msg)

        DashboardPage(page).navigate()
        DashboardPage(page).click_schools()
        SchoolsSearchPage(page).click_school(school)
        SchoolChildrenPage(page).click_import_class_lists()
        ImportRecordsWizardPage(page, point_of_care_file_generator).import_class_list(
            ClassFileMapping.FIXED_CHILD,
            child.year_group,
            programme.group,
        )
        schedule_school_session_if_needed(page, school, [programme], [child.year_group])
        session_id = SessionsOverviewPage(page).get_session_id_from_offline_excel()
        SessionsOverviewPage(page).header.click_mavis()
        DashboardPage(page).click_manage_data()
        ImportsPage(page).click_upload_records()
        ImportRecordsWizardPage(
            page, point_of_care_file_generator
        ).navigate_to_vaccination_records_import()
        ImportRecordsWizardPage(
            page, point_of_care_file_generator
        ).upload_and_verify_output(
            file_mapping=vaccs_file,
            session_id=session_id,
            programme_group=programme.group,
        )
        ImportsPage(page).header.click_mavis()
        DashboardPage(page).click_children()
        ChildrenSearchPage(page).search.search_and_click_child(child)
        ChildRecordPage(page).click_programme(programme)
        ChildProgrammePage(page).click_vaccination_record(vaccs_date)
        yield

    return wrapper


@pytest.fixture
def setup_session_and_batches_with_fixed_child(
    add_vaccine_batch,
    schools,
    children,
    page,
    point_of_care_file_generator,
):
    def _setup(programme_group):
        school = schools[programme_group][0]
        child = children[programme_group][0]

        DashboardPage(page).navigate()
        batch_names = {
            vaccine: add_vaccine_batch(vaccine, re.sub(r"\W+", "", vaccine) + "123")
            for vaccine in Vaccine
            if vaccine.programme.group == programme_group
        }
        VaccinesPage(page).header.click_mavis()
        DashboardPage(page).click_sessions()
        session_programmes = [
            programme for programme in Programme if programme.group == programme_group
        ]
        schedule_school_session_if_needed(
            page, school, session_programmes, [child.year_group]
        )
        SessionsOverviewPage(page).header.click_mavis()
        DashboardPage(page).click_schools()
        SchoolsSearchPage(page).click_school(school)
        SchoolChildrenPage(page).click_import_class_lists()
        ImportRecordsWizardPage(page, point_of_care_file_generator).import_class_list(
            ClassFileMapping.FIXED_CHILD,
            child.year_group,
            programme_group,
        )
        return batch_names

    return _setup


@pytest.fixture
def setup_logged_in_session_with_file_upload_for_programme(
    schools,
    page,
    point_of_care_file_generator,
    year_groups,
):
    def _setup(programme: Programme):
        school = schools[programme.group][0]
        year_group = year_groups[programme.group]

        DashboardPage(page).navigate()
        DashboardPage(page).click_schools()
        SchoolsSearchPage(page).click_school(school)
        SchoolChildrenPage(page).click_import_class_lists()
        ImportRecordsWizardPage(page, point_of_care_file_generator).import_class_list(
            ClassFileMapping.FIXED_CHILD,
            year_group,
            programme.group,
        )

        # Navigate to the session
        DashboardPage(page).navigate()
        DashboardPage(page).click_sessions()
        SessionsSearchPage(page).click_session_for_programme_group(school, programme)

        return school

    return _setup


@pytest.fixture
def setup_national_reporting_import(
    page,
    national_reporting_nurse,
    national_reporting_team,
):
    """Fixture to set up national reporting import page."""
    LogInPage(page).navigate()
    LogInPage(page).log_in_and_choose_team_if_necessary(
        national_reporting_nurse, national_reporting_team
    )
    DashboardPage(page).click_manage_data()
    ImportsPage(page).click_upload_records()
