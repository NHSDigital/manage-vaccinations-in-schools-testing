from typing import Final


class playwright_constants:
    TEST_ID_ATTRIBUTE: Final[str] = "data-qa"
    DEFAULT_TIMEOUT: Final[int] = 60000


class browsers_and_devices:
    CHROMIUM: Final[str] = "chromium"
    FIREFOX: Final[str] = "firefox"
    MSEDGE: Final[str] = "msedge"
    CHROME: Final[str] = "chrome"
    GALAXY_S20: Final[str] = "s20"
    PIXEL_7: Final[str] = "pixel_7"
    GALAXY_S9_PLUS: Final[str] = "s9+"
    IPAD_7: Final[str] = "ipad_7"
    IPHONE_15: Final[str] = "iphone_15"
    IPHONE_14: Final[str] = "iphone_14"


class child_year_group:
    YEAR_8: Final[str] = "YEAR_8"
    YEAR_9: Final[str] = "YEAR_9"
    YEAR_10: Final[str] = "YEAR_10"
    YEAR_11: Final[str] = "YEAR_11"
    ALL: Final[str] = "ALL"


class programme_names:
    HPV: Final[str] = "hpv"
    MENACWY: Final[str] = "menacwy"
    TDIPV: Final[str] = "tdipv"


class data_values:
    EMPTY: Final[str] = "<empty>"


class record_limit:
    FILE_RECORD_MIN_THRESHOLD: Final[int] = 15
    FILE_RECORD_MAX_THRESHOLD: Final[int] = 15


class test_data_file_paths:
    PARENTAL_CONSENT_HPV: Final[str] = "test_data/ParentalConsent_HPV.xlsx"
    PARENTAL_CONSENT_DOUBLES: Final[str] = "test_data/ParentalConsent_Doubles.xlsx"
    VACCS_POSITIVE: Final[str] = "VACCS_HPV_POSITIVE"
    VACCS_NEGATIVE: Final[str] = "VACCS_HPV_NEGATIVE"
    VACCS_HIST_POSITIVE: Final[str] = "VACCS_HIST_HPV_POSITIVE"
    VACCS_HIST_NEGATIVE: Final[str] = "VACCS_HIST_HPV_NEGATIVE"
    VACCS_DUP_1: Final[str] = "VACCS_HPV_DUP_1"
    VACCS_DUP_2: Final[str] = "VACCS_HPV_DUP_2"
    VACCS_INVALID_STRUCTURE: Final[str] = "VACCS_HPV_INVALID_STRUCTURE"
    VACCS_EMPTY_FILE: Final[str] = "VACCS_HPV_EMPTY_FILE"
    VACCS_HPV_DOSE_TWO: Final[str] = "VACCS_HPV_DOSE_TWO"
    VACCS_HEADER_ONLY: Final[str] = "VACCS_HPV_HEADER_ONLY"
    VACCS_MAV_853: Final[str] = "VACCS_HPV_MAV_853"
    VACCS_HPV_MAV_855: Final[str] = "VACCS_HPV_MAV_855"
    VACCS_SYSTMONE_POSITIVE: Final[str] = "VACCS_SYSTMONE_POSITIVE"
    VACCS_SYSTMONE_NEGATIVE: Final[str] = "VACCS_SYSTMONE_NEGATIVE"
    VACCS_SYSTMONE_HIST_NEGATIVE: Final[str] = "VACCS_SYSTMONE_HIST_NEGATIVE"
    COHORTS_POSITIVE: Final[str] = "COHORTS_POSITIVE"
    COHORTS_NEGATIVE: Final[str] = "COHORTS_NEGATIVE"
    COHORTS_INVALID_STRUCTURE: Final[str] = "COHORTS_INVALID_STRUCTURE"
    COHORTS_EMPTY_FILE: Final[str] = "COHORTS_EMPTY_FILE"
    COHORTS_HEADER_ONLY: Final[str] = "COHORTS_HEADER_ONLY"
    CHILD_POSITIVE: Final[str] = "CHILD_POSITIVE"
    CHILD_NEGATIVE: Final[str] = "CHILD_NEGATIVE"
    CHILD_INVALID_STRUCTURE: Final[str] = "CHILD_INVALID_STRUCTURE"
    CHILD_EMPTY_FILE: Final[str] = "CHILD_EMPTY_FILE"
    CHILD_HEADER_ONLY: Final[str] = "CHILD_HEADER_ONLY"
    CLASS_POSITIVE: Final[str] = "CLASS_POSITIVE"
    CLASS_NEGATIVE: Final[str] = "CLASS_NEGATIVE"
    CLASS_INVALID_STRUCTURE: Final[str] = "CLASS_INVALID_STRUCTURE"
    CLASS_EMPTY_FILE: Final[str] = "CLASS_EMPTY_FILE"
    CLASS_HEADER_ONLY: Final[str] = "CLASS_HEADER_ONLY"
    CLASS_CHILDREN_FILTER: Final[str] = "CLASS_CHILDREN_FILTER"
    CLASS_YEAR_GROUP: Final[str] = "CLASS_YEAR_GROUP"
    CLASS_SESSION_ID: Final[str] = "CLASS_SESSION_ID"
    CLASS_SINGLE_VACC: Final[str] = "CLASS_SINGLE_VACC"
    CLASS_MAV_854: Final[str] = "CLASS_MAV_854"
    COHORTS_NO_CONSENT: Final[str] = "COHORTS_NO_CONSENT"
    COHORTS_CONFLICTING_CONSENT: Final[str] = "COHORTS_CONFLICTING_CONSENT"
    COHORTS_E2E_1: Final[str] = "COHORTS_E2E_1"
    CLASS_MOVES_CONFIRM_IGNORE: Final[str] = "CLASS_MOVES_CONFIRM_IGNORE"
    CLASS_MOVES_UNKNOWN_HOMESCHOOLED: Final[str] = "CLASS_MOVES_UNKNOWN_HOMESCHOOLED"
    COHORTS_UCR_MATCH: Final[str] = "COHORTS_UCR_MATCH"
    COHORTS_CONSENT_TWICE: Final[str] = "COHORTS_CONSENT_TWICE"
    COHORTS_CONFLICTING_GILLICK: Final[str] = "COHORTS_CONFLICTING_GILLICK"
    COHORTS_FULL_NAME: Final[str] = "COHORTS_FULL_NAME"


class report_headers:
    CAREPLUS: Final[str] = (
        "NHS Number,Surname,Forename,Date of Birth,Address Line 1,Person Giving Consent,Ethnicity,Date Attended,Time Attended,Venue Type,Venue Code,Staff Type,Staff Code,Attended,Reason Not Attended,Suspension End Date,Vaccine 1,Dose 1,Reason Not Given 1,Site 1,Manufacturer 1,Batch No 1,Vaccine 2,Dose 2,Reason Not Given 2,Site 2,Manufacturer 2,Batch No 2,Vaccine 3,Dose 3,Reason Not Given 3,Site 3,Manufacturer 3,Batch No 3,Vaccine 4,Dose 4,Reason Not Given 4,Site 4,Manufacturer 4,Batch No 4,Vaccine 5,Dose 5,Reason Not Given 5,Site 5,Manufacturer 5,Batch No 5"
    )
    CSV: Final[str] = (
        "ORGANISATION_CODE,SCHOOL_URN,SCHOOL_NAME,CARE_SETTING,CLINIC_NAME,PERSON_FORENAME,PERSON_SURNAME,PERSON_DATE_OF_BIRTH,PERSON_DATE_OF_DEATH,YEAR_GROUP,PERSON_GENDER_CODE,PERSON_ADDRESS_LINE_1,PERSON_POSTCODE,NHS_NUMBER,NHS_NUMBER_STATUS_CODE,GP_ORGANISATION_CODE,GP_NAME,CONSENT_STATUS,CONSENT_DETAILS,HEALTH_QUESTION_ANSWERS,TRIAGE_STATUS,TRIAGED_BY,TRIAGE_DATE,TRIAGE_NOTES,GILLICK_STATUS,GILLICK_ASSESSMENT_DATE,GILLICK_ASSESSED_BY,GILLICK_ASSESSMENT_NOTES,VACCINATED,DATE_OF_VACCINATION,TIME_OF_VACCINATION,PROGRAMME_NAME,VACCINE_GIVEN,PERFORMING_PROFESSIONAL_EMAIL,PERFORMING_PROFESSIONAL_FORENAME,PERFORMING_PROFESSIONAL_SURNAME,BATCH_NUMBER,BATCH_EXPIRY_DATE,ANATOMICAL_SITE,ROUTE_OF_VACCINATION,DOSE_SEQUENCE,REASON_NOT_VACCINATED,LOCAL_PATIENT_ID,SNOMED_PROCEDURE_CODE,REASON_FOR_INCLUSION,RECORD_CREATED,RECORD_UPDATED"
    )
    SYSTMONE: Final[str] = (
        "Practice code,NHS number,Surname,Middle name,Forename,Gender,Date of Birth,House name,House number and road,Town,Postcode,Vaccination,Part,Admin date,Batch number,Expiry date,Dose,Reason,Site,Method,Notes"
    )
    SCHOOL_MOVES: Final[str] = (
        "NHS_REF,SURNAME,FORENAME,GENDER,DOB,ADDRESS1,ADDRESS2,ADDRESS3,TOWN,POSTCODE,COUNTY,ETHNIC_OR,ETHNIC_DESCRIPTION,NATIONAL_URN_NO,BASE_NAME,STARTDATE,STUD_ID,DES_NUMBER"
    )
