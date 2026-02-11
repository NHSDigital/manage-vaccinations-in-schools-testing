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
    DUP_1 = "dup_1"
    DUP_2 = "dup_2"
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
    INVALID_STRUCTURE = "invalid_structure"
    MMR_DOSE_ONE = "mmr_dose_one"
    NATIONAL_REPORTING_HPV = "national_reporting_hpv"
    NATIONAL_REPORTING_NEGATIVE = "national_reporting_negative"
    NATIONAL_REPORTING_POSITIVE = "national_reporting_positive"
    NEGATIVE = "negative"
    NO_CARE_SETTING = "no_care_setting"
    NOT_GIVEN = "not_given"
    POSITIVE = "positive"
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
    HEADER_ONLY = "header_only"
    INVALID_STRUCTURE = "invalid_structure"
    NEGATIVE = "negative"
    POSITIVE = "positive"
    WHITESPACE = "whitespace"
    FIXED_CHILD = "fixed_child"

    @property
    def folder(self) -> Path:
        return Path("child")


class ClassFileMapping(FileMapping):
    EMPTY_FILE = "empty"
    FIXED_CHILD = "fixed_child"
    HEADER_ONLY = "header_only"
    INVALID_STRUCTURE = "invalid_structure"
    NEGATIVE = "negative"
    POSITIVE = "positive"
    RANDOM_CHILD = "random_child"
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

    @property
    def import_format_details_path(self) -> Path:
        """Direct path to the import format details specification file."""
        return self.folder / f"{self.value}.txt"

    @property
    def folder(self) -> Path:
        return Path("import_format_details")
