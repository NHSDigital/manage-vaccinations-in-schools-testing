from typing import Final


class playwright_constants:
    TEST_ID_ATTRIBUTE: Final[str] = "data-qa"
    DEFAULT_TIMEOUT: Final[int] = 60000


class browsers_and_devices:
    CHROMIUM: Final[str] = "chromium"


class child_year_group:
    YEAR_8: Final[str] = "YEAR_8"
    YEAR_9: Final[str] = "YEAR_9"
    YEAR_10: Final[str] = "YEAR_10"
    YEAR_11: Final[str] = "YEAR_11"
    ALL: Final[str] = "ALL"


class vaccine_index:
    HPV: Final[int] = 1
    MENACWY: Final[int] = 2
    TDIPV: Final[int] = 3


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
    CLASS_MAV_854: Final[str] = "CLASS_MAV_854"
    COHORTS_NO_CONSENT: Final[str] = "COHORTS_NO_CONSENT"
    COHORTS_CONFLICTING_CONSENT: Final[str] = "COHORTS_CONFLICTING_CONSENT"
    COHORTS_E2E_1: Final[str] = "COHORTS_E2E_1"
    CLASS_MOVES_ONE: Final[str] = "CLASS_MOVES_ONE"
    CLASS_MOVES_TWO: Final[str] = "CLASS_MOVES_TWO"
    COHORTS_UCR_MATCH: Final[str] = "COHORTS_UCR_MATCH"
    COHORTS_CONSENT_TWICE: Final[str] = "COHORTS_CONSENT_TWICE"
    COHORTS_CONFLICTING_GILLICK: Final[str] = "COHORTS_CONFLICTING_GILLICK"
    COHORTS_FULL_NAME: Final[str] = "COHORTS_FULL_NAME"
