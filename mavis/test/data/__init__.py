from pathlib import Path
from typing import List, Optional
from enum import StrEnum

import nhs_number
import pandas as pd
import re

from ..models import Organisation, School, User
from ..wrappers import (
    get_current_datetime,
    get_current_time,
    get_offset_date,
    get_date_of_birth_for_year_group,
)


class BaseFilePath(StrEnum):
    @property
    def input_template(self) -> str:
        return f"{self.folder}/i_{self.value}.csv"

    @property
    def output_path(self) -> str:
        return f"{self.folder}/o_{self.value}.txt"

    @property
    def folder(self) -> str:
        return ""


class VaccsFilePath(BaseFilePath):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    HIST_POSITIVE = "hist_positive"
    HIST_NEGATIVE = "hist_negative"
    DUP_1 = "dup_1"
    DUP_2 = "dup_2"
    INVALID_STRUCTURE = "invalid_structure"
    EMPTY_FILE = "empty"
    HPV_DOSE_TWO = "hpv_dose_two"
    HEADER_ONLY = "header_only"
    MAV_853 = "mav_853"
    MAV_855 = "mav_855"
    SYSTMONE_POSITIVE = "systmone_positive"
    SYSTMONE_NEGATIVE = "systmone_negative"
    SYSTMONE_HIST_NEGATIVE = "systmone_hist_negative"
    MAV_1080 = "mav_1080"
    SYSTMONE_MAV_1080 = "systmone_mav_1080"

    @property
    def folder(self) -> str:
        return "vaccs"


class CohortsFilePath(BaseFilePath):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    INVALID_STRUCTURE = "invalid_structure"
    EMPTY_FILE = "empty"
    HEADER_ONLY = "header_only"
    NO_CONSENT = "no_consent"
    CONFLICTING_CONSENT = "conflicting_consent"
    E2E_1 = "e2e_1"
    UCR_MATCH = "ucr_match"
    CONSENT_TWICE = "consent_twice"
    CONFLICTING_GILLICK = "conflicting_gillick"
    FULL_NAME = "full_name"
    MAV_927_PERF = "mav_927_perf"
    MAV_909 = "mav_909"
    MAV_853 = "mav_853"
    GILLICK_NOTES_LENGTH = "gillick_notes_length"

    @property
    def folder(self) -> str:
        return "cohorts"


class ChildFilePath(BaseFilePath):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    INVALID_STRUCTURE = "invalid_structure"
    EMPTY_FILE = "empty"
    HEADER_ONLY = "header_only"
    MAV_1080 = "mav_1080"

    @property
    def folder(self) -> str:
        return "child"


class ClassFilePath(BaseFilePath):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    INVALID_STRUCTURE = "invalid_structure"
    EMPTY_FILE = "empty"
    HEADER_ONLY = "header_only"
    CHILDREN_FILTER = "children_filter"
    YEAR_GROUP = "year_group"
    SESSION_ID = "session_id"
    SINGLE_VACC = "single_vacc"
    MAV_854 = "mav_854"
    MAV_965 = "mav_965"
    MAV_1080 = "mav_1080"
    MOVES_CONFIRM_IGNORE = "moves_confirm_ignore"
    MOVES_UNKNOWN_HOMESCHOOLED = "moves_unknown_homeschooled"
    CHANGE_NHSNO = "change_nhsno"

    @property
    def folder(self) -> str:
        return "class_list"


class TestData:
    """
    A class to handle operations related to test data.
    """

    template_path = Path(__file__).parent
    working_path = Path("working")

    def __init__(self, organisation: Organisation, schools: List[School], nurse: User):
        self.organisation = organisation
        self.schools = schools
        self.nurse = nurse
        self.file_mapping = pd.read_csv(self.template_path / "file_mapping.csv")

        self.working_path.mkdir(parents=True, exist_ok=True)

    def read_file(self, filename):
        return (self.template_path / filename).read_text(encoding="utf-8")

    def create_file_from_template(
        self,
        template_path: str,
        file_name_prefix: str,
        session_id: Optional[str] = None,
    ) -> str:
        """
        Create a file from a template while replacing placeholders with calculated values.

        Args:
            template_path (str): Path to the template file.
            file_name_prefix (str): Prefix for the generated file name.

        Returns:
            str: Path to the created file.
        """

        template_text = self.read_file(template_path)

        _dt = get_current_datetime()
        _hist_dt = get_offset_date(offset_days=-(365 * 2))

        replacements = {
            "<<VACCS_DATE>>": _dt[:8],
            "<<VACCS_TIME>>": get_current_time(),
            "<<HIST_VACCS_DATE>>": _hist_dt,
            "<<SESSION_ID>>": session_id,
        }

        if self.organisation:
            replacements["<<ORG_CODE>>"] = self.organisation.ods_code

        if self.schools:
            for index, school in enumerate(self.schools):
                replacements[f"<<SCHOOL_{index}_NAME>>"] = school.name
                replacements[f"<<SCHOOL_{index}_URN>>"] = school.urn

        if self.nurse:
            replacements["<<NURSE_EMAIL>>"] = self.nurse.username

        for year_group in range(8, 12):
            replacements[f"<<DOB_YEAR_{year_group}>>"] = (
                get_date_of_birth_for_year_group(year_group)
            )

        _file_text = []
        _ctr = 0

        for line in template_text.splitlines():
            dynamic_replacements = replacements.copy()
            dynamic_replacements["<<FNAME>>"] = f"F{_dt}{_ctr}"
            dynamic_replacements["<<LNAME>>"] = f"L{_dt}{_ctr}"
            dynamic_replacements["<<NHS_NO>>"] = self.get_new_nhs_no(valid=True)
            dynamic_replacements["<<INVALID_NHS_NO>>"] = self.get_new_nhs_no(
                valid=False
            )
            dynamic_replacements["<<PARENT_EMAIL>>"] = f"{_dt}{_ctr}@example.com"

            for key, value in dynamic_replacements.items():
                line = line.replace(key, str(value) if value else "")

            _file_text.append(line)
            _ctr += 1

        filename = f"{file_name_prefix}{get_current_datetime()}.csv"

        path = self.working_path / filename
        path.write_text("\n".join(_file_text), encoding="utf-8")
        return str(path)

    def get_new_nhs_no(self, valid=True) -> str:
        """
        Generate a new NHS number.

        Args:
            valid (bool, optional): Whether to generate a valid NHS number. Defaults to True.

        Returns:
            str: Generated NHS number.
        """
        return nhs_number.generate(
            valid=valid, for_region=nhs_number.REGION_ENGLAND, quantity=1
        )[0]

    def get_expected_errors(self, file_path: str):
        """
        Get expected errors from a file.

        Args:
            file_path (str): Path to the file.

        Returns:
            list[str]: List of expected errors.
        """
        file_content = self.read_file(file_path)

        return file_content.splitlines() if file_content else None

    def get_file_paths(
        self, file_paths: BaseFilePath, session_id: Optional[str] = None
    ) -> tuple[str, str]:
        """
        Get input and output file paths based on a mapping.

        Args:
            file (BaseFilePath): Identifier for the file paths.

        Returns:
            tuple[str, str]: Input and output file paths.
        """

        _input_file_path: str = self.create_file_from_template(
            template_path=file_paths.input_template,
            file_name_prefix=str(file_paths),
            session_id=session_id,
        )

        _output_file_path = file_paths.output_path

        return _input_file_path, _output_file_path

    def create_child_list_from_file(
        self, file_path: str, is_vaccinations: bool
    ) -> list[str]:
        """
        Create a list of child names from a file.

        Args:
            file_path (str): Path to the file.
            is_vaccinations (bool): Whether the file type is for vaccinations.

        Returns:
            list: List of child names.
        """
        _file_df = pd.read_csv(file_path)

        if is_vaccinations:
            _cols = ["PERSON_SURNAME", "PERSON_FORENAME"]
        else:
            _cols = ["CHILD_LAST_NAME", "CHILD_FIRST_NAME"]

        col0 = _file_df[_cols[0]].apply(self.normalize_whitespace)
        col1 = _file_df[_cols[1]].apply(self.normalize_whitespace)
        _names_list = (col0 + ", " + col1).tolist()
        return _names_list

    def normalize_whitespace(self, string: str) -> str:
        # Remove zero-width joiner
        string = string.replace("\u200d", "")
        # Replace non-breaking spaces with regular spaces
        string = string.replace("\u00a0", " ")
        # Strip leading/trailing whitespace, and replace consecutive whitespace with a single space
        string = re.sub(r"\s+", " ", string.strip())
        return string

    def get_session_id(self, path: str) -> str:
        """
        Get the session ID from an Excel file.

        Args:
            path (str): Path to the Excel file.

        Returns:
            str: Session ID.
        """

        data_frame = pd.read_excel(path, sheet_name="Vaccinations")
        return data_frame["SESSION_ID"].iloc[0]
