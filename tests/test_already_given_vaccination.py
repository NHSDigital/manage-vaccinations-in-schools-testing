import pytest

from mavis.test.constants import MMRV_ELIGIBILITY_CUTOFF_DOB, Programme
from mavis.test.data import ClassFileMapping
from mavis.test.pages import (
    DashboardPage,
    ImportRecordsWizardPage,
    SchoolsChildrenPage,
    SchoolsSearchPage,
    SessionsChildrenPage,
    SessionsOverviewPage,
    SessionsPatientPage,
    SessionsVaccinationWizardPage,
)
from mavis.test.pages.sessions.sessions_search_page import SessionsSearchPage
from mavis.test.pages.utils import (
    schedule_school_session_if_needed,
)
from mavis.test.pages.vaccination_record.vaccination_record_page import (
    VaccinationRecordPage,
)
from mavis.test.utils import (
    get_formatted_date_for_session_dates,
    get_offset_date,
    get_offset_date_compact_format,
)

pytestmark = pytest.mark.sessions


@pytest.fixture
def setup_fixed_child_session(
    log_in_as_nurse,
    schools,
    page,
    point_of_care_file_generator,
    year_groups,
    request,
):
    programme = request.param
    school = schools[programme.group][0]
    year_group = year_groups[programme.group]

    DashboardPage(page).click_schools()
    SchoolsSearchPage(page).click_school(school)
    SchoolsChildrenPage(page).click_import_class_lists()
    ImportRecordsWizardPage(page, point_of_care_file_generator).import_class_list(
        ClassFileMapping.FIXED_CHILD, year_group, programme.group
    )
    schedule_school_session_if_needed(
        page, school, [programme], [year_group], date_offset=7
    )
    return programme


@pytest.mark.parametrize(
    "setup_fixed_child_session",
    [Programme.FLU, Programme.HPV, Programme.MENACWY, Programme.TD_IPV],
    indirect=True,
)
def test_one_dose_vaccinations_already_given(
    setup_fixed_child_session,
    children,
    page,
):
    """
    Test: Record a one-dose vaccination as already given and
          verify the details are displayed correctly.
    Steps:
    1. Open a session with a fixed child for a
       one-dose programme (FLU, HPV, MENACWY, or TD_IPV).
    2. Record the child as already vaccinated.
    3. Fill in vaccination details (date, time, and notes).
    4. Confirm the vaccination record.
    Verification:
    - The vaccination record page displays the correct time, notes, and date.
    """
    programme = setup_fixed_child_session
    child = children[programme.group][0]

    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).record_as_already_vaccinated()
    SessionsVaccinationWizardPage(page).fill_date_of_vaccination(
        get_offset_date_compact_format(0)
    )
    SessionsVaccinationWizardPage(page).fill_time_of_vaccination("00", "01")
    SessionsVaccinationWizardPage(page).click_continue_button()
    SessionsVaccinationWizardPage(page).fill_vaccination_notes("Test notes")
    SessionsVaccinationWizardPage(page).click_confirm_button()

    VaccinationRecordPage(page).expect_vaccination_details("Time", "12:01am")
    VaccinationRecordPage(page).expect_vaccination_details("Notes", "Test notes")
    VaccinationRecordPage(page).expect_vaccination_details(
        "Date", get_formatted_date_for_session_dates(get_offset_date(0))
    )


@pytest.mark.parametrize(
    "setup_fixed_child_session",
    [Programme.MMR],
    indirect=True,
)
def test_mmrv_already_given(
    setup_fixed_child_session,
    children,
    schools,
    page,
):
    """
    Test: Record MMR dose 1 as already given, modify the vaccination details,
          and verify correct display.
    Steps:
    1. Open an MMR session with a fixed child.
    2. Record dose 1 as already given (confirm MMRV if child is eligible).
    3. Fill in vaccination details (date as today, time as 00:01).
    4. Change the date to 45 days ago and time to 00:02.
    5. Add vaccination notes and confirm the record.
    Verification:
    - The vaccination record page displays the updated date (45 days ago),
      time (12:02am), and notes.
    """
    programme = setup_fixed_child_session
    child = children[programme.group][0]
    eligible_for_mmrv = child.date_of_birth >= MMRV_ELIGIBILITY_CUTOFF_DOB
    date_offset = -45

    SessionsOverviewPage(page).tabs.click_children_tab()
    SessionsChildrenPage(page).search.search_and_click_child(child)
    SessionsPatientPage(page).record_dose_as_already_given(1)
    if eligible_for_mmrv:
        SessionsVaccinationWizardPage(page).confirm_mmrv_given()

    SessionsVaccinationWizardPage(page).fill_date_of_vaccination(
        get_offset_date_compact_format(0)
    )
    SessionsVaccinationWizardPage(page).fill_time_of_vaccination("00", "01")
    SessionsVaccinationWizardPage(page).click_continue_button()

    SessionsVaccinationWizardPage(page).click_change_date_link()
    SessionsVaccinationWizardPage(page).fill_date_of_vaccination(
        get_offset_date_compact_format(date_offset)
    )
    SessionsVaccinationWizardPage(page).fill_time_of_vaccination("00", "02")
    SessionsVaccinationWizardPage(page).click_continue_button()

    SessionsVaccinationWizardPage(page).fill_vaccination_notes("Test notes")
    SessionsVaccinationWizardPage(page).click_confirm_button()

    VaccinationRecordPage(page).expect_vaccination_details(
        "Date", get_formatted_date_for_session_dates(get_offset_date(date_offset))
    )
    VaccinationRecordPage(page).expect_vaccination_details("Time", "12:02am")
    VaccinationRecordPage(page).expect_vaccination_details("Notes", "Test notes")
