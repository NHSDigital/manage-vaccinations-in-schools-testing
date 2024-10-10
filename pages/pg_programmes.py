from libs import CurrentExecution, file_ops, playwright_ops, testdata_ops
from libs.wrappers import *
from libs.constants import actions, object_properties


class pg_programmes:
    po = playwright_ops.playwright_operations()
    ce = CurrentExecution()
    tdo = testdata_ops.testdata_operations()
    fo = file_ops.file_operations()

    LNK_HPV = "HPV"
    LNK_IMPORTS = "Imports"
    LNK_IMPORT_RECORDS = "Import records"
    RDO_CHILD_RECORDS = "Child records"
    RDO_VACCINATION_RECORDS = "Vaccination records"
    BTN_CONTINUE = "Continue"
    LBL_CHOOSE_FILE_CHILD_RECORDS = "HPVImport child records"
    LBL_CHOOSE_FILE_VACCINATION_RECORDS = "HPVImport vaccination records"
    LBL_IMPORT_STARTED = "Import processing started"
    LBL_PARAGRAPH = "paragraph"
    LBL_UPLOAD_TABLE = "Vaccination report Uploaded on<<date_time>>Uploaded byNurse JoyProgrammeHPV"
    LBL_POSITIVE_RECORDS_UPLOADED = "15 vaccination records"
    LBL_ROW_ERRORS = "Row 1                              ORGANISATION_CODE: Enter an organisation code that matches the current team.                            Row 2                              ORGANISATION_CODE: Enter an organisation code that matches the current team.                            Row 3                              SCHOOL_URN: The school URN is not recognised. If you’ve checked the URN, and you believe it’s valid, contact our support team.                            Row 4                              SCHOOL_NAME: Enter a school name.                            Row 6                              NHS_NUMBER: Enter an NHS number with 10 characters.                            Row 7                              NHS_NUMBER: Enter an NHS number with 10 characters.                            Row 8                              PERSON_FORENAME: Enter a first name.                            Row 9                              PERSON_SURNAME: Enter a last name.                            Row 10                              PERSON_DOB: Enter a date of birth in the correct format.                            Row 11                              PERSON_DOB: Enter a date of birth in the correct format.                            Row 12                              PERSON_DOB: is not part of this programme                            Row 13                              PERSON_DOB: Enter a date of birth in the correct format.                            Row 14                              PERSON_GENDER_CODE/PERSON_GENDER: Enter a gender or gender code.                            Row 15                              PERSON_GENDER_CODE/PERSON_GENDER: Enter a gender or gender code.                            Row 16                              PERSON_POSTCODE: Enter a valid postcode, such as SW1A 1AA                            Row 17                              PERSON_POSTCODE: Enter a valid postcode, such as SW1A 1AA                            Row 18                              DATE_OF_VACCINATION: Enter a date in the correct format.                            Row 19                              DATE_OF_VACCINATION: The vaccination date is outside the programme. Enter a date before today.                            Row 20                              VACCINATED: You need to record whether the child was vaccinated or not. Enter ‘Y’ or ‘N’ in the ‘vaccinated’ column.                            Row 21                              VACCINE_GIVEN: Enter a valid vaccine, eg Gardasil 9.                            Row 22                              BATCH_NUMBER: Enter a batch number.                            Row 23                              BATCH_EXPIRY_DATA: Enter a batch expiry date.                            Row 24                              ANATOMICAL_SITE: Enter an anatomical site.                            Row 26                              DOSE_SEQUENCE: The dose sequence number cannot be greater than 3. Enter a dose sequence number, for example, 1, 2 or 3.                            Row 27                              DOSE_SEQUENCE: must be less than or equal to 3                            Row 28                              CARE_SETTING: Enter a care setting.                            Row 29                              CARE_SETTING: Enter a valid care setting."

    def click_HPV(self):
        self.po.perform_action(locator=self.LNK_HPV, action=actions.CLICK_LINK)

    def click_Imports(self):
        self.po.perform_action(locator=self.LNK_IMPORTS, action=actions.CLICK_LINK)

    def click_ImportRecords(self):
        self.po.perform_action(locator=self.LNK_IMPORT_RECORDS, action=actions.CLICK_LINK)

    def select_ChildRecords(self):
        self.po.perform_action(locator=self.RDO_CHILD_RECORDS, action=actions.RADIO_BUTTON_SELECT)

    def select_VaccinationRecords(self):
        self.po.perform_action(locator=self.RDO_VACCINATION_RECORDS, action=actions.RADIO_BUTTON_SELECT)

    def click_Continue(self):
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def click_ChooseFile_ChildRecords(self):
        self.po.perform_action(locator=self.LBL_CHOOSE_FILE_CHILD_RECORDS, action=actions.CLICK_LABEL)

    def choose_file_child_records(self, file_path: str):
        self.po.perform_action(
            locator=self.LBL_CHOOSE_FILE_CHILD_RECORDS,
            action=actions.SELECT_FILE,
            value=file_path,
        )

    def click_ChooseFile_VaccinationRecords(self):
        self.po.perform_action(locator=self.LBL_CHOOSE_FILE_VACCINATION_RECORDS, action=actions.CLICK_LABEL)

    def choose_file_vaccination_records(self, file_path: str):
        self.po.perform_action(
            locator=self.LBL_CHOOSE_FILE_VACCINATION_RECORDS,
            action=actions.SELECT_FILE,
            value=file_path,
        )

    def verify_Import_Processing_Started(self):
        self.po.verify(locator=self.LBL_PARAGRAPH, property=object_properties.TEXT, value=self.LBL_IMPORT_STARTED)

    def click_uploaded_file_datetime(self):
        self.po.perform_action(locator=self.upload_time, action=actions.CLICK_LINK)

    def record_upload_time(self):
        self.upload_time = get_link_formatted_date_time()

    def verify_uploaded_file_details(self):
        self.LBL_UPLOAD_TABLE = self.LBL_UPLOAD_TABLE.replace("<<date_time>>", self.upload_time)
        self.po.verify(locator="h1", property=object_properties.TEXT, value=self.LBL_UPLOAD_TABLE)
        self.po.verify(locator="h3", property=object_properties.TEXT, value=self.LBL_POSITIVE_RECORDS_UPLOADED)

    def verify_uploaded_file_errors(self):
        self.po.verify(
            locator="import-errors", property=object_properties.TEXT, value=self.LBL_ROW_ERRORS, by_test_id=True
        )

    def upload_hpv_vaccination_positive_records(self, input_file_path: str):
        self.upload_hpv_vaccination_records(input_file_path=input_file_path)
        self.verify_uploaded_file_details()

    def upload_hpv_vaccination_negative_records(self, input_file_path: str):
        self.upload_hpv_vaccination_records(input_file_path=input_file_path)
        self.verify_uploaded_file_errors()

    def upload_hpv_vaccination_records(self, input_file_path: str):
        self.click_HPV()
        self.click_Imports()
        self.click_ImportRecords()
        self.select_VaccinationRecords()
        self.click_Continue()
        self.choose_file_vaccination_records(file_path=input_file_path)
        self.click_Continue()
        self.record_upload_time()
        # self.verify_Import_Processing_Started()
        wait("5s")  # Wait for processing to finish
        self.click_Imports()
        self.click_uploaded_file_datetime()

    def upload_hpv_child_records(self, input_file_path: str):
        self.click_HPV()
        self.click_Imports()
        self.click_ImportRecords()
        self.select_ChildRecords()
        self.click_Continue()
        self.choose_file_child_records(file_path=input_file_path)
        self.click_Continue()
