import pytest
from playwright.sync_api import expect

from mavis.test.constants import DeliverySite, Programme
from mavis.test.data import ChildFileMapping, ClassFileMapping, VaccsFileMapping
from mavis.test.data.file_mappings import ImportFormatDetails
from mavis.test.data.file_utils import (
    read_child_names_from_file,
    set_field_for_key,
)
from mavis.test.pages import (
    ChildRecordPage,
    ChildrenSearchPage,
    DashboardPage,
    ImportIssuesPage,
    ImportRecordsWizardPage,
    ImportsPage,
    SchoolChildrenPage,
    SchoolsSearchPage,
    SessionsOverviewPage,
)
from mavis.test.pages.utils import schedule_school_session_if_needed
from mavis.test.utils import expect_details


@pytest.mark.childlist
def test_child_file_upload_close_match(
    log_in_as_nurse,
    page,
    point_of_care_file_generator,
):
    """
    Test: Upload a valid child, then upload a nearly identical child and handle import
    issues.
    Steps:
    1. Upload a valid child list file with a single child.
    2. Modify the child list file by changing the first name of the child.
    3. Upload the modified child list file.
    4. Resolve the close match issue by keeping the more recently uploaded record.
    5. Inspect uploaded child record.
    6. Search for the uploaded child.
    Verification:
    - Output indicates successful import of initial child.
    - Output indicates successful import of modified child.
    - Output indicates successful detection of issue upon upload of the modified child.
    - Output indicates successful issue resolution.
    - Uploaded child record displays correct name.
    - Imported child can successfully be found in Children search.
    """
    DashboardPage(page).click_imports()
    ImportsPage(page).click_upload_records()
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).navigate_to_child_record_import()
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).read_and_verify_import_format_details(ImportFormatDetails.CHILD)
    input_file_path, output_file_path = ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_and_verify_output(ChildFileMapping.RANDOM_CHILD_WITHOUT_NHS_NUMBER)

    file_with_different_first_name = set_field_for_key(
        input_file_path, "CHILD_FIRST_NAME", "Test"
    )

    ImportRecordsWizardPage(page, point_of_care_file_generator).header.click_mavis()
    DashboardPage(page).click_imports()
    ImportsPage(page).click_upload_records()
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).navigate_to_child_record_import()
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_and_verify_output_for_input_output_files(
        file_with_different_first_name, output_file_path
    )

    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).navigate_to_close_match_issue()
    ImportIssuesPage(page).resolve_duplicate(ImportIssuesPage.RecordToKeep.UPLOADED)
    expect(
        ImportRecordsWizardPage(page, point_of_care_file_generator).success_alert
    ).to_contain_text("Record updated")

    (first_name, last_name) = read_child_names_from_file(
        file_with_different_first_name
    )[0]

    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).navigate_to_imported_record()
    expect_details(page, "Full name", f"{last_name}, {first_name}")

    ChildRecordPage(page).header.click_mavis()
    DashboardPage(page).click_children()
    ChildrenSearchPage(page).search.search_for_a_child_name(
        f"{last_name}, {first_name}"
    )


@pytest.fixture
def setup_vaccination_import(
    log_in_as_nurse,
    page,
    point_of_care_file_generator,
    schools,
    year_groups,
):
    school = schools[Programme.HPV][0]
    year_group = year_groups[Programme.HPV]

    DashboardPage(page).click_schools()
    SchoolsSearchPage(page).click_school(school)
    SchoolChildrenPage(page).click_import_class_lists()
    ImportRecordsWizardPage(page, point_of_care_file_generator).import_class_list(
        ClassFileMapping.RANDOM_CHILD, year_group
    )
    schedule_school_session_if_needed(page, school, [Programme.HPV], [year_group])
    session_id = SessionsOverviewPage(page).get_session_id_from_offline_excel()
    SessionsOverviewPage(page).header.click_mavis()
    return session_id


@pytest.mark.vaccinations
def test_vaccination_file_upload_close_match(
    setup_vaccination_import, page, point_of_care_file_generator
):
    """
    Test: Upload a valid vaccination record, then upload a nearly identical vaccination
    record and handle import issues.
    Steps:
    1. Upload a valid vaccination record list file with a single vaccination record.
    2. Modify the vaccination record list file by changing the anatomical site of the
    vaccination.
    3. Upload the modified vaccination record list file.
    4. Resolve the close match issue by keeping the more recently uploaded record.
    5. Inspect uploaded vaccination record.
    Verification:
    - Output indicates successful import of initial vaccination record.
    - Output indicates successful import of modified vaccination record.
    - Output indicates successful detection of issue upon upload of the modified
    vaccination record.
    - Output indicates successful issue resolution.
    - Uploaded vaccination record record displays correct anatomical site.
    """
    DashboardPage(page).click_imports()
    ImportsPage(page).click_upload_records()
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).navigate_to_vaccination_records_import()
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).read_and_verify_import_format_details(ImportFormatDetails.VACCS)
    input_file_path, output_file_path = ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_and_verify_output(
        file_mapping=VaccsFileMapping.FLU_INJECTED,
        session_id=setup_vaccination_import,
    )

    file_with_different_anatomical_site = set_field_for_key(
        input_file_path, "ANATOMICAL_SITE", DeliverySite.LEFT_ARM_LOWER
    )

    ImportRecordsWizardPage(page, point_of_care_file_generator).header.click_mavis()
    DashboardPage(page).click_imports()
    ImportsPage(page).click_upload_records()
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).navigate_to_vaccination_records_import()
    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).upload_and_verify_output_for_input_output_files(
        file_with_different_anatomical_site, output_file_path
    )

    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).navigate_to_close_match_issue()
    ImportIssuesPage(page).resolve_duplicate(ImportIssuesPage.RecordToKeep.UPLOADED)
    expect(
        ImportRecordsWizardPage(page, point_of_care_file_generator).success_alert
    ).to_contain_text("Record updated")

    ImportRecordsWizardPage(
        page, point_of_care_file_generator
    ).navigate_to_imported_record()
    expect_details(page, "Site", DeliverySite.LEFT_ARM_LOWER)
