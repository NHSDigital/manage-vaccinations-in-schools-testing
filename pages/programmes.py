from typing import Final

import pandas as pd

from libs import testdata_ops
from libs.generic_constants import actions, properties, wait_time
from libs.mavis_constants import report_headers, test_data_file_paths, Programme
from libs.playwright_ops import PlaywrightOperations
from libs.wrappers import get_current_datetime, get_link_formatted_date_time

from .children import ChildrenPage
from .consent_doubles import ConsentDoublesPage
from .consent_hpv import ConsentHPVPage
from .dashboard import DashboardPage
from .import_records import ImportRecordsPage
from .sessions import SessionsPage


class ProgrammesPage:
    tdo = testdata_ops.testdata_operations()

    LNK_DOSE2_CHILD: Final[str] = "DOSE2, Dose2"
    LNK_MAV_854_CHILD: Final[str] = "MAV_854, MAV_854"
    LNK_MAV_965_CHILD: Final[str] = "MAV_965, MAV_965"
    LNK_MAV_909_CHILD: Final[str] = "MAV_909, MAV_909"

    LNK_IMPORTS: Final[str] = "Imports"
    LNK_VACCINATIONS: Final[str] = "Vaccinations"
    LNK_COHORTS: Final[str] = "Cohorts"
    LNK_IMPORT_CHILD_RECORDS: Final[str] = "Import child records"
    LNK_IMPORT_RECORDS: Final[str] = "Import records"
    RDO_CHILD_RECORDS: Final[str] = "Child records"
    RDO_VACCINATION_RECORDS: Final[str] = "Vaccination records"
    BTN_CONTINUE: Final[str] = "Continue"
    LBL_CHOOSE_VACCS_FILE: Final[str] = "Import vaccination records"
    LBL_CHOOSE_COHORT_FILE: Final[str] = "Import child records"
    LBL_UPLOAD_COHORT_FILE: Final[str] = "Upload file"
    LBL_IMPORT_STARTED: Final[str] = "Import processing started"
    LBL_PARAGRAPH: Final[str] = "paragraph"
    LBL_MAIN: Final[str] = "main"
    LNK_CHANGE_OUTCOME: Final[str] = "Change   outcome"
    RDO_THEY_REFUSED_IT: Final[str] = "They refused it"
    BTN_EDIT_VACCINATION_RECORD: Final[str] = "Edit vaccination record"
    BTN_SAVE_CHANGES: Final[str] = "Save changes"
    LNK_COMMUNITY_CLINIC_HPV: Final[str] = "Community clinics"
    BTN_DOWNLOAD_REPORT: Final[str] = "Download vaccination report"
    RDO_REPORT_CAREPLUS: Final[str] = "CarePlus"
    RDO_REPORT_CSV: Final[str] = "CSV"
    RDO_REPORT_SYSTMONE: Final[str] = "SystmOne"
    LBL_DUPLICATE_REVIEW_MESSAGE: Final[str] = "1 duplicate record needs review"
    LNK_REVIEW: Final[str] = "Review"
    RDO_USE_DUPLICATE: Final[str] = "Use duplicate record"
    RDO_KEEP_EXISTING: Final[str] = "Keep previously uploaded record"
    RDO_KEEP_BOTH: Final[str] = "Keep both records"
    BTN_RESOLVE_DUPLICATE: Final[str] = "Resolve duplicate"
    LBL_RECORD_UPDATED: Final[str] = "Record updated"

    def __init__(self, playwright_operations: PlaywrightOperations):
        self.po = playwright_operations
        self.sessions_page = SessionsPage(playwright_operations)
        self.dashboard_page = DashboardPage(playwright_operations)
        self.children_page = ChildrenPage(playwright_operations)
        self.consent_hpv = ConsentHPVPage(playwright_operations)
        self.consent_doubles = ConsentDoublesPage(playwright_operations)
        self.import_records_page = ImportRecordsPage(playwright_operations)

    def click_programme(self, programme: Programme):
        self.po.act(locator=programme, action=actions.CLICK_LINK)

    def click_imports(self):
        self.po.act(locator=self.LNK_IMPORTS, action=actions.CLICK_LINK)

    def click_vaccinations(self):
        self.po.act(
            locator=self.LNK_VACCINATIONS, action=actions.CLICK_LINK, exact=True
        )

    def click_cohorts(self):
        self.po.act(locator=self.LNK_COHORTS, action=actions.CLICK_LINK)

    def click_edit_vaccination_record(self):
        self.po.act(
            locator=self.BTN_EDIT_VACCINATION_RECORD, action=actions.CLICK_BUTTON
        )

    def click_import_records(self):
        self.po.act(locator=self.LNK_IMPORT_RECORDS, action=actions.CLICK_LINK)

    def click_import_cohort_records(self):
        self.po.act(locator=self.LNK_IMPORT_CHILD_RECORDS, action=actions.CLICK_LINK)

    def select_child_records(self):
        self.po.act(locator=self.RDO_CHILD_RECORDS, action=actions.RADIO_BUTTON_SELECT)

    def select_vaccination_records(self):
        self.po.act(
            locator=self.RDO_VACCINATION_RECORDS, action=actions.RADIO_BUTTON_SELECT
        )

    def click_continue(self):
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def click_choose_file_child_records(self):
        self.po.act(locator=self.LBL_CHOOSE_COHORT_FILE, action=actions.CLICK_LABEL)

    def choose_file_child_records(self, file_path: str):
        self.po.act(
            locator=self.LBL_UPLOAD_COHORT_FILE,
            action=actions.SELECT_FILE,
            value=file_path,
        )

    def click_choose_file_vaccination_records(self):
        self.po.act(locator=self.LBL_CHOOSE_COHORT_FILE, action=actions.CLICK_LABEL)

    def choose_file_vaccination_records(self, file_path: str):
        self.po.act(
            locator=self.LBL_CHOOSE_VACCS_FILE,
            action=actions.SELECT_FILE,
            value=file_path,
        )

    def verify_import_processing_started(self):
        self.po.verify(
            locator=self.LBL_PARAGRAPH,
            property=properties.TEXT,
            expected_value=self.LBL_IMPORT_STARTED,
        )

    def click_uploaded_file_datetime(self, truncated: bool = False):
        _link_time = self.upload_time[3:] if truncated else self.upload_time
        self.po.act(locator=_link_time, action=actions.CLICK_LINK)

    def record_upload_time(self):
        self.upload_time = get_link_formatted_date_time()

    def click_dose2_child(self):
        self.po.act(locator=self.LNK_DOSE2_CHILD, action=actions.CLICK_LINK)

    def verify_upload_output(self, file_path: str):
        _expected_errors = self.tdo.get_expected_errors(file_path=file_path)
        if _expected_errors is not None:
            for _msg in _expected_errors:
                self.po.verify(
                    locator=self.LBL_MAIN,
                    property=properties.TEXT,
                    expected_value=_msg,
                    exact=False,
                )

    def upload_hpv_child_records(self, file_paths: str):
        _input_file_path, _output_file_path = self.tdo.get_file_paths(
            file_paths=file_paths
        )
        self.choose_file_child_records(file_path=_input_file_path)
        self.click_continue()
        self.record_upload_time()

        if self.import_records_page.is_processing_in_background():
            self.po.act(locator=None, action=actions.WAIT, value=wait_time.MED)
            self.click_uploaded_file_datetime(truncated=True)

        self.verify_upload_output(file_path=_output_file_path)

    def upload_cohorts(self, file_paths: str, wait_long: bool = False):
        _input_file_path, _output_file_path = self.tdo.get_file_paths(
            file_paths=file_paths
        )
        self.click_programme(Programme.HPV)
        self.click_cohorts()
        self.click_import_cohort_records()
        self.choose_file_child_records(file_path=_input_file_path)
        self.click_continue()
        self.record_upload_time()

        if self.import_records_page.is_processing_in_background():
            if wait_long:
                self.po.act(locator=None, action=actions.WAIT, value="14m")
            else:
                self.po.act(locator=None, action=actions.WAIT, value=wait_time.MED)
            self.click_uploaded_file_datetime()

        self.verify_upload_output(file_path=_output_file_path)

    def edit_dose_to_not_given(self):
        self.click_programme(Programme.HPV)
        self.click_vaccinations()
        self.click_dose2_child()
        self.click_edit_vaccination_record()
        self.po.act(locator=self.LNK_CHANGE_OUTCOME, action=actions.CLICK_LINK)
        self.po.act(
            locator=self.RDO_THEY_REFUSED_IT, action=actions.RADIO_BUTTON_SELECT
        )
        self.click_continue()
        self.po.act(locator=self.BTN_SAVE_CHANGES, action=actions.CLICK_BUTTON)
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value="!Sorry, there’s a problem with the service",
            exact=False,
        )

    def verify_mav_854(self):
        """
        1. Find a child who is in an HPV school session
        2. Ensure there is a clinic session date for today
        3. Navigate to the clinic, find the child, record a vaccination against that child
        4. Navigate to that child's school
        5. Download offline spreadsheet
        6. Expected: offline spreadsheet downloaded
        Actual: crash
        """
        self.children_page.search_for_a_child(child_name=self.LNK_MAV_854_CHILD)
        self.po.act(locator=self.LNK_MAV_854_CHILD, action=actions.CLICK_LINK)
        self.po.act(locator=self.LNK_COMMUNITY_CLINIC_HPV, action=actions.CLICK_LINK)
        self.sessions_page._vaccinate_child_mav_854()
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.click_scheduled()
        self.sessions_page.click_school1()
        assert self.sessions_page.get_session_id_from_offline_excel()

    def verify_careplus_report_format(self, programme: Programme):
        self.po.act(locator=programme, action=actions.CLICK_LINK)
        self.po.act(locator=self.BTN_DOWNLOAD_REPORT, action=actions.CLICK_BUTTON)
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.act(
            locator=self.RDO_REPORT_CAREPLUS, action=actions.RADIO_BUTTON_SELECT
        )
        self._download_and_verify_report_headers(
            expected_headers=report_headers.CAREPLUS
        )

    def verify_csv_report_format(self, programme: Programme):
        self.po.act(locator=programme, action=actions.CLICK_LINK)
        self.po.act(locator=self.BTN_DOWNLOAD_REPORT, action=actions.CLICK_BUTTON)
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.act(locator=self.RDO_REPORT_CSV, action=actions.RADIO_BUTTON_SELECT)
        self._download_and_verify_report_headers(expected_headers=report_headers.CSV)

    def verify_systmone_report_format(self, programme: Programme):
        self.po.act(locator=programme, action=actions.CLICK_LINK)
        self.po.act(locator=self.BTN_DOWNLOAD_REPORT, action=actions.CLICK_BUTTON)
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.act(
            locator=self.RDO_REPORT_SYSTMONE, action=actions.RADIO_BUTTON_SELECT
        )
        self._download_and_verify_report_headers(
            expected_headers=report_headers.SYSTMONE
        )

    def _download_and_verify_report_headers(self, expected_headers: str):
        _file_path = f"working/rpt_{get_current_datetime()}.csv"
        self.po.act(
            locator=self.BTN_CONTINUE,
            action=actions.DOWNLOAD_FILE_USING_BUTTON,
            value=_file_path,
        )
        _actual_df = pd.read_csv(_file_path)
        actual_headers = ",".join(_actual_df.columns.tolist())
        _e_not_a = [
            h for h in expected_headers.split(",") if h not in actual_headers.split(",")
        ]
        _a_not_e = [
            h for h in actual_headers.split(",") if h not in expected_headers.split(",")
        ]
        if len(_e_not_a) > 0 or len(_a_not_e) > 0:
            assert False, (
                f"The following expected field(s) were not found in the report: {_e_not_a}.  Report contains extra field(s), which were not expected: {_a_not_e}."
            )

    def verify_mav_965(self):
        """
        Steps to reproduce:
        Patient setup: in a school session today, marked as attending, session has HPV and doubles, patients is eligible for all vaccines (has consent, correct year group, no history)
        Complete pre-screening questions and vaccinate the patient for any one vaccine (eg. HPV)
        Testing has confirmed the following:
        Two vaccinations in same session
        - If HPV is followed by MenACWY then "feeling well" is pre-filled
        - If HPV is followed by Td/IPV  then both "feeling well" and "not pregnant" are pre-populated
        - If MenACWY followed by Td/IPV then "feeling well" is pre-filled
        - If MenCAWY followed by HPV then "feeling well" is pre-filled
        - If Td/IPV followed by MenACWY  then "feeling well" is pre-filled
        - If Td/IPV is followed by HPV  then both "feeling well" and "not pregnant" are pre-populated
        """
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_sessions()
        self.sessions_page.click_school1()
        self.sessions_page.click_consent_tab()
        self.sessions_page.search_child(child_name=self.LNK_MAV_965_CHILD)
        self.sessions_page.click_programme_tab(Programme.HPV)
        self.sessions_page.click_get_consent_response()
        self.consent_hpv.parent_1_verbal_positive(change_phone=False)
        self.sessions_page.search_child(child_name=self.LNK_MAV_965_CHILD)
        self.sessions_page.click_programme_tab(Programme.MENACWY)
        self.sessions_page.click_get_consent_response()
        self.consent_doubles.parent_1_verbal_positive(
            change_phone=False, programme=Programme.MENACWY
        )
        self.sessions_page.search_child(child_name=self.LNK_MAV_965_CHILD)
        self.sessions_page.click_programme_tab(Programme.TD_IPV)
        self.sessions_page.click_get_consent_response()
        self.consent_doubles.parent_1_verbal_positive(
            change_phone=False, programme=Programme.TD_IPV
        )
        self.sessions_page.register_child_as_attending(
            child_name=self.LNK_MAV_965_CHILD
        )
        self.sessions_page.record_vaccs_for_child(
            child_name=self.LNK_MAV_965_CHILD, programme=Programme.HPV
        )
        self.sessions_page.record_vaccs_for_child(
            child_name=self.LNK_MAV_965_CHILD, programme=Programme.MENACWY
        )
        self.sessions_page.record_vaccs_for_child(
            child_name=self.LNK_MAV_965_CHILD, programme=Programme.TD_IPV
        )

    def verify_mav_909(self):
        """
        Steps to reproduce:
        Find a patient in Year 8 and remove them from cohort using the button
        Upload a cohort list with their first name, surname, URN, date of birth and postcode

        Scenario 1
            Duplicate review is not flagged

            Expected result:
            The child is added back into the cohort, and in all the relevant sessions
            Actual Result:
            Server error page and user cannot bring the child back into the cohort

        Scenario 2
            The import screen flags for duplicate review, and user clicks "Review" next to the child's name

            Expected result:
            System allows you to review the new details against the previous record (before removing from cohort) and lets you choose which record to keep. Once review confirmed, the child is added back into the cohort, and in all the relevant sessions.
            Actual Result:
            Server error page and user cannot bring the child back into the cohort
        """
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_children()
        self.children_page.remove_child_from_cohort(child_name=self.LNK_MAV_909_CHILD)
        self.dashboard_page.go_to_dashboard()
        self.dashboard_page.click_programmes()
        self.upload_cohorts(file_paths=test_data_file_paths.COHORTS_MAV_909)
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value=self.LBL_DUPLICATE_REVIEW_MESSAGE,
        )
        self.po.act(locator=self.LNK_REVIEW, action=actions.CLICK_LINK)
        self.po.act(locator=self.RDO_USE_DUPLICATE, action=actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_RESOLVE_DUPLICATE, action=actions.CLICK_BUTTON)
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value=self.LBL_RECORD_UPDATED,
        )
