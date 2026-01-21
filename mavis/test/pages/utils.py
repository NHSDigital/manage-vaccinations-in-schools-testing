from playwright.sync_api import Page

from mavis.test.constants import (
    MAVIS_NOTE_LENGTH_LIMIT,
    ConsentMethod,
    Programme,
)
from mavis.test.data_models import Child, Clinic, School, VaccinationRecord
from mavis.test.pages import (
    AddSessionWizardPage,
    DashboardPage,
    NurseConsentWizardPage,
    SessionsChildrenPage,
    SessionsOverviewPage,
    SessionsPatientPage,
    SessionsSearchPage,
    SessionsVaccinationWizardPage,
)
from mavis.test.utils import generate_random_string


def schedule_school_session_if_needed(
    page: Page,
    school: School,
    programmes: list[Programme],
    year_groups: list[int],
    date_offset: int = 0,
) -> None:
    DashboardPage(page).header.click_mavis_header()
    DashboardPage(page).click_sessions()
    if not SessionsSearchPage(page).click_session_if_exists(
        school, programmes, year_groups, date_offset
    ):
        SessionsSearchPage(page).click_add_a_new_session()
        AddSessionWizardPage(page).schedule_school_session(
            school, programmes, year_groups, date_offset
        )


def schedule_community_clinic_session_if_needed(
    page: Page,
    programmes: list[Programme],
    date_offset: int = 0,
) -> None:
    DashboardPage(page).header.click_mavis_header()
    DashboardPage(page).click_sessions()
    if not SessionsSearchPage(page).click_session_if_exists(
        Clinic("community clinic"), programmes, [], date_offset
    ):
        SessionsSearchPage(page).click_add_a_new_session()
        AddSessionWizardPage(page).schedule_clinic_session(programmes, date_offset)


def prepare_child_for_vaccination(
    page: Page,
    school: School,
    programme_group: str,
    child: Child,
) -> None:
    DashboardPage(page).header.click_mavis_header()
    DashboardPage(page).click_sessions()
    SessionsSearchPage(page).click_session_for_programme_group(school, programme_group)
    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).register_child_as_attending(child)
    SessionsChildrenPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).search.search_and_click_child(child)


def record_nurse_consent_and_vaccination(
    page: Page,
    vaccination_record: VaccinationRecord,
    *,
    mmrv_eligibility: bool = False,
) -> None:
    child = vaccination_record.child
    programme = vaccination_record.programme
    consent_option = vaccination_record.consent_option

    SessionsPatientPage(page).click_programme_tab(programme)
    SessionsPatientPage(page).click_record_a_new_consent_response()
    NurseConsentWizardPage(page).select_parent(child.parents[0])
    NurseConsentWizardPage(page).select_consent_method(ConsentMethod.IN_PERSON)

    if mmrv_eligibility:
        NurseConsentWizardPage(page).select_mmrv_eligibility_for_child()

    NurseConsentWizardPage(page).record_parent_positive_consent(
        programme=programme,
        consent_option=consent_option,
        mmrv_eligibility=mmrv_eligibility,
    )
    notes = generate_random_string(
        target_length=MAVIS_NOTE_LENGTH_LIMIT + 1,
        generate_spaced_words=True,
    )
    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).set_up_vaccination(vaccination_record, notes=notes)
    SessionsVaccinationWizardPage(page).record_vaccination(
        vaccination_record, notes=notes
    )
