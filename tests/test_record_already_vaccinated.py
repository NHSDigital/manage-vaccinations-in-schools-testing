import pytest

from mavis.test.annotations import issue
from mavis.test.constants import Programme
from mavis.test.data import ChildFileMapping
from mavis.test.pages import (
    ChildProgrammePage,
    ChildRecordPage,
    ChildrenSearchPage,
    ImportRecordsWizardPage,
    ImportsPage,
    RecordVaccinationWizardPage,
    VaccinationRecordPage,
)
from mavis.test.utils import get_offset_date_compact_format


@issue("MAV-3905")
@pytest.mark.parametrize(
    "programme_and_doses",
    [
        (Programme.FLU, 1),
        (Programme.HPV, 1),
        (Programme.MENACWY, 1),
        (Programme.MMR, 2),
        (Programme.TD_IPV, 1),
    ],
    ids=lambda v: v[0],
)
def test_eligible(
    programme_and_doses: tuple[Programme, int],
    children,
    point_of_care_file_generator,
    page,
    log_in_as_nurse,
):
    """
    Test: Record a child as already vaccinated for a particular programme.

    Steps:
    1. Import a child that is eligible for the programme.
    2. Find the child's record.
    3. Click on "Record as already vaccinated".
    4. Fill in vaccination details (date, time, and notes).
    5. Repeat for the number of doses required for the programme.
    6. Check the child's status is shown as vaccinated.
    """

    programme = programme_and_doses[0]
    doses = programme_and_doses[1]
    child = children[programme.group][0]

    child_programme_page = ChildProgrammePage(page)
    child_record_page = ChildRecordPage(page)
    children_search_page = ChildrenSearchPage(page)
    import_records_wizard_page = ImportRecordsWizardPage(
        page, point_of_care_file_generator
    )
    imports_page = ImportsPage(page)
    record_vaccination_wizard_page = RecordVaccinationWizardPage(page)
    vaccination_record_page = VaccinationRecordPage(page)

    # Import a child that is eligible for the programme.
    imports_page.header.click_imports()
    imports_page.click_upload_records()
    import_records_wizard_page.navigate_to_child_record_import()
    import_records_wizard_page.upload_and_verify_output(
        ChildFileMapping.FIXED_CHILD, programme_group=programme.group
    )
    imports_page.header.click_children()

    # Find the child's record.
    children_search_page.search.search_for_a_child_name(str(child))
    children_search_page.search.click_child(child)

    for dose in range(1, doses + 1):
        # Click on "Record as already vaccinated".
        child_record_page.click_programme(programme)

        if doses == 1:
            child_programme_page.click_record_as_already_vaccinated()
        else:
            child_programme_page.click_record_as_already_vaccinated(dose_number=dose)

        # Fill in vaccination details (date, time, and notes).
        record_vaccination_wizard_page.confirm_mmrv_given_if_necessary()

        record_vaccination_wizard_page.fill_date_of_vaccination(
            get_offset_date_compact_format(dose * -31)
        )
        record_vaccination_wizard_page.fill_time_of_vaccination("00", "01")
        record_vaccination_wizard_page.click_continue_button()

        record_vaccination_wizard_page.choose_outcome_vaccinated()
        record_vaccination_wizard_page.click_continue_button()

        record_vaccination_wizard_page.fill_vaccination_notes("Test notes")
        record_vaccination_wizard_page.click_confirm_button()

        # Repeat for the number of doses required for the programme.
        vaccination_record_page.click_child_record(child)

    # Check the child's status is shown as vaccinated.
    child_record_page.click_programme(programme)
    child_programme_page.expect_programme_status("Vaccinated")
