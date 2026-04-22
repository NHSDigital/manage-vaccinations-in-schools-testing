from enum import Enum
from pathlib import Path


class FileMapping(Enum):
    @property
    def input_template_path(self) -> Path:
        return self.folder / f"i_{self.value}.csv"

    @property
    def output_path(self) -> Path:
        return self.folder / f"o_{self.value}.txt"

    @property
    def folder(self) -> Path:
        return Path()


class VaccsFileMapping(FileMapping):
    CLINIC_NAME_CASE = "clinic_name_case"
    CLOSE_MATCH_1 = "close_match_1"
    CLOSE_MATCH_2 = "close_match_2"
    DUP_1 = "dup_1"
    DUP_2 = "dup_2"
    MULTIPLE_EXACT_DUPLICATES = "multiple_exact_duplicates"
    EMPTY_FILE = "empty"
    FLU_INJECTED = "flu_injected"
    FLU_NASAL = "flu_nasal"
    HEADER_ONLY = "header_only"
    HIST_FLU_NIVS = "hist_flu_nivs"
    HIST_FLU_SYSTMONE = "hist_flu_systmone"
    HIST_HPV = "hist_hpv"
    HIST_NEGATIVE = "hist_negative"
    HIST_POSITIVE = "hist_positive"
    HPV_DOSE_TWO = "hpv_dose_two"
    HPV_DOSE_TWO_YESTERDAY = "hpv_dose_two_yesterday"
    INVALID_STRUCTURE = "invalid_structure"
    MMR_DOSE_ONE = "mmr_dose_one"
    MMR_MMRV_PROCEDURE_CODES = "mmr_mmrv_procedure_codes"
    NATIONAL_REPORTING_HPV = "national_reporting_hpv"
    NATIONAL_REPORTING_NEGATIVE = "national_reporting_negative"
    NATIONAL_REPORTING_POSITIVE = "national_reporting_positive"
    NEGATIVE = "negative"
    NO_CARE_SETTING = "no_care_setting"
    NOT_GIVEN = "not_given"
    POSITIVE = "positive"
    REPORTING_REGRESSION_TEAM_A = "reporting_regression_team_a"
    REPORTING_REGRESSION_TEAM_B = "reporting_regression_team_b"
    SNOMED_VERIFICATION = "snomed_verification"
    SYSTMONE_HIST_NEGATIVE = "systmone_hist_negative"
    SYSTMONE_NEGATIVE = "systmone_negative"
    SYSTMONE_POSITIVE = "systmone_positive"
    SYSTMONE_WHITESPACE = "systmone_whitespace"
    WHITESPACE = "whitespace"

    @property
    def folder(self) -> Path:
        return Path("vaccs")


class ChildFileMapping(FileMapping):
    EMPTY_FILE = "empty"
    FIXED_CHILD = "fixed_child"
    HEADER_ONLY = "header_only"
    HOME_EDUCATED_CHILD = "home_educated_child"
    INVALID_STRUCTURE = "invalid_structure"
    NEGATIVE = "negative"
    POSITIVE = "positive"
    RANDOM_CHILD_WITHOUT_NHS_NUMBER = "random_child_without_nhs_number"
    UNKNOWN_SCHOOL_CHILD = "unknown_school_child"
    WHITESPACE = "whitespace"
    CLOSE_MATCH_1 = "close_match_1"
    CLOSE_MATCH_2 = "close_match_2"

    @property
    def folder(self) -> Path:
        return Path("child")


class ClassFileMapping(FileMapping):
    CLOSE_MATCH_1 = "close_match_1"
    CLOSE_MATCH_2 = "close_match_2"
    DUPLICATE_POSTCODE = "duplicate_postcode"
    DUPLICATE_POSTCODE_2 = "duplicate_postcode_2"
    EMPTY_FILE = "empty"
    FIXED_CHILD = "fixed_child"
    HEADER_ONLY = "header_only"
    INVALID_STRUCTURE = "invalid_structure"
    NEGATIVE = "negative"
    POSITIVE = "positive"
    RANDOM_CHILD = "random_child"
    REPORTING_REGRESSION_ONE_F = "reporting_regression_one_f"
    REPORTING_REGRESSION_TWO_MF = "reporting_regression_two_mf"
    TWO_FIXED_CHILDREN = "two_fixed_children"
    TWO_FIXED_CHILDREN_HOMESCHOOL = "two_fixed_children_homeschool"
    WHITESPACE = "whitespace"
    WRONG_YEAR_GROUP = "wrong_year_group"

    @property
    def folder(self) -> Path:
        return Path("class_list")


class ImportFormatDetails(Enum):
    CLASS = "class"
    CHILD = "child"
    VACCS = "vaccs"
    NATIONAL_REPORTING = "national_reporting"

    @property
    def import_format_details_path(self) -> Path:
        """Direct path to the import format details specification file."""
        return self.folder / f"{self.value}.txt"

    @property
    def folder(self) -> Path:
        return Path("import_format_details")
