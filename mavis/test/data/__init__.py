from pathlib import Path
from typing import Final, List, Optional

import nhs_number
import pandas as pd
import re

from ..onboarding import Organisation, School
from ..wrappers import (
    get_current_datetime,
    get_current_time,
    get_offset_date,
    get_date_of_birth_for_year_group,
)


class FilePath:
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
    VACCS_MAV_1080: Final[str] = "VACCS_MAV_1080"
    VACCS_SYSTMONE_MAV_1080: Final[str] = "VACCS_SYSTMONE_MAV_1080"
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
    CHILD_MAV_1080: Final[str] = "CHILD_MAV_1080"
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
    CLASS_MAV_965: Final[str] = "CLASS_MAV_965"
    CLASS_MAV_1080: Final[str] = "CLASS_MAV_1080"
    COHORTS_NO_CONSENT: Final[str] = "COHORTS_NO_CONSENT"
    COHORTS_CONFLICTING_CONSENT: Final[str] = "COHORTS_CONFLICTING_CONSENT"
    COHORTS_E2E_1: Final[str] = "COHORTS_E2E_1"
    CLASS_MOVES_CONFIRM_IGNORE: Final[str] = "CLASS_MOVES_CONFIRM_IGNORE"
    CLASS_MOVES_UNKNOWN_HOMESCHOOLED: Final[str] = "CLASS_MOVES_UNKNOWN_HOMESCHOOLED"
    CLASS_CHANGE_NHSNO: Final[str] = "CLASS_CHANGE_NHSNO"
    COHORTS_UCR_MATCH: Final[str] = "COHORTS_UCR_MATCH"
    COHORTS_CONSENT_TWICE: Final[str] = "COHORTS_CONSENT_TWICE"
    COHORTS_CONFLICTING_GILLICK: Final[str] = "COHORTS_CONFLICTING_GILLICK"
    COHORTS_FULL_NAME: Final[str] = "COHORTS_FULL_NAME"
    COHORTS_MAV_927_PERF: Final[str] = "COHORTS_MAV_927_PERF"
    COHORTS_MAV_909: Final[str] = "COHORTS_MAV_909"
    COHORTS_MAV_853: Final[str] = "COHORTS_MAV_853"
    COHORTS_GILLICK_NOTES_LENGTH: Final[str] = "COHORTS_GILLICK_NOTES_LENGTH"


class TestData:
    """
    A class to handle operations related to test data.
    """

    template_path = Path(__file__).parent
    working_path = Path("working")

    def __init__(self, organisation: Organisation, schools: List[School]):
        self.organisation = organisation
        self.schools = schools
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
        self, file_paths: str, session_id: Optional[str] = None
    ) -> tuple[str, str]:
        """
        Get input and output file paths based on a mapping.

        Args:
            file_paths (str): Identifier for the file paths.

        Returns:
            tuple[str, str]: Input and output file paths.
        """
        query = self.file_mapping.query("ID==@file_paths")

        _input_template_path: str = query["INPUT_TEMPLATE"].to_string(index=False)
        _output_template_path: str = query["OUTPUT_TEMPLATE"].to_string(index=False)
        _file_prefix: str = query["FILE_PREFIX"].to_string(index=False)

        _input_file_path: str = self.create_file_from_template(
            template_path=_input_template_path,
            file_name_prefix=_file_prefix,
            session_id=session_id,
        )

        return _input_file_path, _output_template_path

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
