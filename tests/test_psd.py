import pytest

from mavis.test.constants import ConsentMethod, ConsentOption, Programme, Vaccine
from mavis.test.data import ClassFileMapping
from mavis.test.data_models import VaccinationRecord
from mavis.test.helpers.accessibility_helper import AccessibilityHelper
from mavis.test.pages import (
    DashboardPage,
    ImportRecordsWizardPage,
    LogInPage,
    NurseConsentWizardPage,
    OnlineConsentWizardPage,
    SchoolsChildrenPage,
    SchoolsSearchPage,
    SessionsChildrenPage,
    SessionsEditPage,
    SessionsOverviewPage,
    SessionsPatientPage,
    SessionsPsdPage,
    SessionsRecordVaccinationsPage,
    SessionsSearchPage,
    SessionsVaccinationWizardPage,
    StartPage,
    VaccinesPage,
)
from mavis.test.pages.utils import schedule_school_session_if_needed


@pytest.fixture
def flu_consent_url(schedule_session_and_get_consent_url, schools):
    yield from schedule_session_and_get_consent_url(
        schools[Programme.FLU][0], Programme.FLU
    )


@pytest.fixture
def setup_session_with_file_upload(
    flu_consent_url,
    prescriber,
    team,
    schools,
    page,
    file_generator,
    year_groups,
    add_vaccine_batch,
):
    def _factory(
        class_file_mapping: ClassFileMapping, *, schedule_session_for_today: bool = True
    ):
        school = schools[Programme.FLU][0]
        year_group = year_groups[Programme.FLU]
        batch_name = add_vaccine_batch(Vaccine.FLUENZ)

        LogInPage(page).log_out()
        LogInPage(page).navigate()
        LogInPage(page).log_in_and_choose_team_if_necessary(prescriber, team)

        VaccinesPage(page).header.click_mavis_header()
        DashboardPage(page).click_schools()
        SchoolsSearchPage(page).click_school(school)
        SchoolsChildrenPage(page).click_import_class_lists()
        ImportRecordsWizardPage(page, file_generator).import_class_list(
            class_file_mapping, year_group, Programme.FLU.group
        )

        offset_days = 0 if schedule_session_for_today else 7
        schedule_school_session_if_needed(
            page, school, [Programme.FLU], [year_group], offset_days
        )
        return batch_name, flu_consent_url

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


def test_delivering_vaccination_after_psd(
    setup_session_with_one_child,
    page,
    schools,
    children,
    healthcare_assistant,
    team,
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
    fluenz_batch_name, _ = setup_session_with_one_child

    SessionsOverviewPage(page).click_edit_session()
    SessionsEditPage(page).click_change_psd()
    SessionsEditPage(page).answer_whether_psd_should_be_enabled("Yes")
    SessionsEditPage(page).click_continue_button()
    SessionsEditPage(page).click_save_changes()

    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).click_programme_tab(Programme.FLU)
    SessionsPatientPage(page).click_record_a_new_consent_response()
    NurseConsentWizardPage(page).select_parent(child.parents[0])
    NurseConsentWizardPage(page).select_consent_method(ConsentMethod.IN_PERSON)
    NurseConsentWizardPage(page).record_parent_positive_consent(
        programme=Programme.FLU,
        consent_option=ConsentOption.NASAL_SPRAY_OR_INJECTION,
        psd_option=True,
        yes_to_health_questions=True,
    )
    SessionsOverviewPage(page).tabs.click_psds_tab()
    SessionsPsdPage(page).search.search_for(str(child))
    SessionsPsdPage(page).check_child_has_psd(child)

    SessionsPsdPage(page).tabs.click_overview_tab()
    SessionsOverviewPage(page).verify_offline_sheet_psd(child)

    LogInPage(page).log_out()
    LogInPage(page).navigate()
    LogInPage(page).log_in_and_choose_team_if_necessary(healthcare_assistant, team)

    DashboardPage(page).click_sessions()
    SessionsSearchPage(page).click_session_for_programme_group(school, Programme.FLU)

    SessionsOverviewPage(page).click_edit_session()
    SessionsEditPage(page).click_change_psd()
    SessionsEditPage(page).answer_whether_psd_should_be_enabled("Yes")
    SessionsEditPage(page).click_continue_button()
    SessionsEditPage(page).click_save_changes()

    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).register_child_as_attending(child)
    SessionsChildrenPage(page).tabs.click_record_vaccinations_tab()
    SessionsRecordVaccinationsPage(page).search.search_and_click_child(child)

    vaccination_record = VaccinationRecord(
        child, Programme.FLU, fluenz_batch_name, ConsentOption.NASAL_SPRAY_OR_INJECTION
    )
    SessionsPatientPage(page).set_up_vaccination(vaccination_record)
    SessionsVaccinationWizardPage(page).record_vaccination(
        vaccination_record, psd_option=True
    )


def test_bulk_adding_psd(
    setup_session_with_two_children,
    page,
    schools,
    children,
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
    _, flu_consent_url = setup_session_with_two_children

    for child in children[Programme.FLU]:
        OnlineConsentWizardPage(page).go_to_url(flu_consent_url)
        StartPage(page).start()

        OnlineConsentWizardPage(page).fill_details(
            child, child.parents[0], schools[Programme.FLU]
        )
        OnlineConsentWizardPage(page).agree_to_flu_vaccination(
            consent_option=ConsentOption.NASAL_SPRAY_OR_INJECTION
        )
        OnlineConsentWizardPage(page).fill_address_details(*child.address)
        OnlineConsentWizardPage(page).answer_health_questions(
            len(
                Programme.health_questions(
                    Programme.FLU, ConsentOption.NASAL_SPRAY_OR_INJECTION
                )
            ),
            yes_to_health_questions=False,
        )
        OnlineConsentWizardPage(page).click_confirm()
        OnlineConsentWizardPage(page).check_final_consent_message(
            child,
            programmes=[Programme.FLU],
            yes_to_health_questions=False,
            consent_option=ConsentOption.NASAL_SPRAY_OR_INJECTION,
        )

    DashboardPage(page).navigate()
    DashboardPage(page).click_sessions()

    SessionsSearchPage(page).click_session_for_programme_group(school, Programme.FLU)
    SessionsOverviewPage(page).click_edit_session()
    SessionsEditPage(page).click_change_psd()
    SessionsEditPage(page).answer_whether_psd_should_be_enabled("Yes")
    SessionsEditPage(page).click_continue_button()
    SessionsEditPage(page).click_save_changes()

    SessionsOverviewPage(page).tabs.click_children_tab()
    for child in children[Programme.FLU]:
        SessionsChildrenPage(page).get_flu_consent_status_locator_from_search(child)

    SessionsChildrenPage(page).tabs.click_psds_tab()
    for child in children[Programme.FLU]:
        SessionsPsdPage(page).search.search_for(str(child))
        SessionsPsdPage(page).check_child_does_not_have_psd(child)

    SessionsPsdPage(page).verify_psd_banner_has_patients(2)

    SessionsPsdPage(page).click_add_new_psds()
    SessionsPsdPage(page).click_yes_add_psds()

    SessionsPsdPage(page).verify_psd_banner_has_patients(0)

    for child in children[Programme.FLU]:
        SessionsPsdPage(page).search.search_for(str(child))
        SessionsPsdPage(page).check_child_has_psd(child)


@pytest.mark.accessibility
def test_accessibility(
    setup_session_with_one_child,
    page,
):
    """
    Test: Check for accessibility violations in the PSD tab.
    Steps:
    1. Navigate to the sessions page.
    2. Use the accessibility helper to check for common accessibility issues.
    Verification:
    - No accessibility issues are found.
    """

    SessionsOverviewPage(page).click_edit_session()
    SessionsEditPage(page).click_change_psd()
    AccessibilityHelper(page).check_accessibility()

    SessionsEditPage(page).answer_whether_psd_should_be_enabled("Yes")
    SessionsEditPage(page).click_continue_button()
    SessionsEditPage(page).click_save_changes()
    SessionsOverviewPage(page).tabs.click_psds_tab()
    AccessibilityHelper(page).check_accessibility()

    SessionsPsdPage(page).click_add_new_psds()
    AccessibilityHelper(page).check_accessibility()

    SessionsPsdPage(page).click_yes_add_psds()
    AccessibilityHelper(page).check_accessibility()
