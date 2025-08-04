import csv
import os
from enum import Enum
from pathlib import Path
from typing import Optional

import nhs_number
import pandas as pd
from faker import Faker

from mavis.test.models import Child, Team, Programme, School, User
from mavis.test.wrappers import (
    get_current_datetime,
    get_current_time,
    get_date_of_birth_for_year_group,
    get_offset_date,
    normalize_whitespace,
)


class FileMapping(Enum):
    @property
    def input_template_path(self) -> Path:
        return self.folder / f"i_{self.value}.csv"

    @property
    def output_path(self) -> Path:
        return self.folder / f"o_{self.value}.txt"

    @property
    def folder(self) -> Path:
        return Path("")


class VaccsFileMapping(FileMapping):
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
    NOT_GIVEN = "not_given"
    NO_CARE_SETTING = "no_care_setting"
    SYSTMONE_POSITIVE = "systmone_positive"
    SYSTMONE_NEGATIVE = "systmone_negative"
    SYSTMONE_HIST_NEGATIVE = "systmone_hist_negative"
    WHITESPACE = "whitespace"
    SYSTMONE_WHITESPACE = "systmone_whitespace"
    HIST_FLU_NIVS = "hist_flu_nivs"
    HIST_FLU_SYSTMONE = "hist_flu_systmone"
    CLINIC_NAME_CASE = "clinic_name_case"

    @property
    def folder(self) -> Path:
        return Path("vaccs")


class CohortsFileMapping(FileMapping):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    INVALID_STRUCTURE = "invalid_structure"
    EMPTY_FILE = "empty"
    HEADER_ONLY = "header_only"
    FIXED_CHILD_YEAR_8 = "fixed_child_year_8"
    FIXED_CHILD = "fixed_child"

    @property
    def folder(self) -> Path:
        return Path("cohorts")


class ChildFileMapping(FileMapping):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    INVALID_STRUCTURE = "invalid_structure"
    EMPTY_FILE = "empty"
    HEADER_ONLY = "header_only"
    WHITESPACE = "whitespace"

    @property
    def folder(self) -> Path:
        return Path("child")


class ClassFileMapping(FileMapping):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    INVALID_STRUCTURE = "invalid_structure"
    EMPTY_FILE = "empty"
    HEADER_ONLY = "header_only"
    WHITESPACE = "whitespace"
    WRONG_YEAR_GROUP = "wrong_year_group"
    RANDOM_CHILD_YEAR_9 = "random_child_year_9"
    FIXED_CHILD = "fixed_child"
    TWO_FIXED_CHILDREN = "two_fixed_children"
    TWO_FIXED_CHILDREN_HOMESCHOOL = "two_fixed_children_homeschool"

    @property
    def folder(self) -> Path:
        return Path("class_list")


class TestData:
    template_path = Path(__file__).parent
    working_path = Path("working")

    def __init__(
        self,
        team: Team,
        schools: dict[str, list[School]],
        nurse: User,
        children: dict[str, list[Child]],
    ):
        self.team = team
        self.schools = schools
        self.nurse = nurse
        self.children = children

        self.faker = Faker(locale="en_GB")

        self.working_path.mkdir(parents=True, exist_ok=True)

    def read_file(self, filename):
        return (self.template_path / filename).read_text(encoding="utf-8")

    def create_file_from_template(
        self,
        template_path: Path,
        file_name_prefix: str,
        session_id: Optional[str] = None,
        programme_group: str = Programme.HPV.group,
    ) -> Path:
        static_replacements = {
            "<<VACCS_DATE>>": get_current_datetime()[:8],
            "<<VACCS_TIME>>": get_current_time(),
            "<<HIST_VACCS_DATE>>": get_offset_date(offset_days=-(365 * 2)),
            "<<SESSION_ID>>": session_id,
        }

        if self.team:
            static_replacements["<<ORG_CODE>>"] = self.team.ods_code

        if self.schools:
            schools = self.schools[programme_group]
            for index, school in enumerate(schools):
                static_replacements[f"<<SCHOOL_{index}_NAME>>"] = school.name
                static_replacements[f"<<SCHOOL_{index}_URN>>"] = school.urn

        if self.nurse:
            static_replacements["<<NURSE_EMAIL>>"] = self.nurse.username

        if self.children:
            children = self.children[programme_group]
            for index, child in enumerate(children):
                static_replacements[f"<<CHILD_{index}_FIRST_NAME>>"] = child.first_name
                static_replacements[f"<<CHILD_{index}_LAST_NAME>>"] = child.last_name
                static_replacements[f"<<CHILD_{index}_NHS_NO>>"] = child.nhs_number
                static_replacements[f"<<CHILD_{index}_ADDRESS_LINE_1>>"] = (
                    child.address[0]
                )
                static_replacements[f"<<CHILD_{index}_ADDRESS_LINE_2>>"] = (
                    child.address[1]
                )
                static_replacements[f"<<CHILD_{index}_TOWN>>"] = child.address[2]
                static_replacements[f"<<CHILD_{index}_POSTCODE>>"] = child.address[3]
                static_replacements[f"<<CHILD_{index}_DATE_OF_BIRTH>>"] = (
                    child.date_of_birth.strftime("%Y%m%d")
                )
                static_replacements[f"<<CHILD_{index}_YEAR_GROUP>>"] = str(
                    child.year_group
                )
                static_replacements[f"<<CHILD_{index}_PARENT_1_NAME>>"] = child.parents[
                    0
                ].full_name
                static_replacements[f"<<CHILD_{index}_PARENT_2_NAME>>"] = child.parents[
                    1
                ].full_name
                static_replacements[f"<<CHILD_{index}_PARENT_1_EMAIL>>"] = (
                    child.parents[0].email_address
                )
                static_replacements[f"<<CHILD_{index}_PARENT_2_EMAIL>>"] = (
                    child.parents[1].email_address
                )
                static_replacements[f"<<CHILD_{index}_PARENT_1_RELATIONSHIP>>"] = (
                    child.parents[0].relationship
                )
                static_replacements[f"<<CHILD_{index}_PARENT_2_RELATIONSHIP>>"] = (
                    child.parents[1].relationship
                )

        for year_group in range(8, 12):
            static_replacements[f"<<DOB_YEAR_{year_group}>>"] = str(
                get_date_of_birth_for_year_group(year_group)
            )

        dynamic_replacements = {
            "<<RANDOM_FNAME>>": lambda: self.faker.first_name(),
            "<<RANDOM_LNAME>>": lambda: self.faker.last_name().upper(),
            "<<RANDOM_NHS_NO>>": lambda: self.get_new_nhs_no(valid=True),
            "<<INVALID_NHS_NO>>": lambda: self.get_new_nhs_no(valid=False),
        }

        output_filename = f"{file_name_prefix}{get_current_datetime()}.csv"
        output_path = self.working_path / output_filename

        if os.path.getsize(self.template_path / template_path) > 0:
            template_df = pd.read_csv(self.template_path / template_path, dtype=str)
            # template_df.replace(static_replacements, inplace=True)
            template_df = self.replace_substrings_in_df(
                template_df, static_replacements
            )
            template_df = template_df.apply(
                lambda col: col.apply(
                    lambda x: (
                        dynamic_replacements[x.strip()]()
                        if isinstance(x, str) and x.strip() in dynamic_replacements
                        else x
                    )
                )
            )
            template_df.to_csv(
                path_or_buf=output_path,
                quoting=csv.QUOTE_MINIMAL,
                encoding="utf-8",
                index=False,
            )
        else:
            open(output_path, "w").close()
        return output_path

    def replace_substrings_in_df(self, df, replacements):
        def replace_substrings(cell):
            if isinstance(cell, str):
                for old, new in replacements.items():
                    if old and new:
                        cell = cell.replace(old, new)
            return cell

        for col in df.columns:
            df[col] = df[col].map(replace_substrings)
        return df

    def get_new_nhs_no(self, valid=True) -> str:
        return nhs_number.generate(
            valid=valid, for_region=nhs_number.REGION_SYNTHETIC, quantity=1
        )[0]

    def get_expected_errors(self, file_path: Path) -> Optional[list[str]]:
        file_content = self.read_file(file_path)
        return file_content.splitlines() if file_content else None

    def get_file_paths(
        self,
        file_mapping: FileMapping,
        session_id: Optional[str] = None,
        programme_group: str = Programme.HPV.group,
    ) -> tuple[Path, Path]:
        _input_file_path = self.create_file_from_template(
            template_path=file_mapping.input_template_path,
            file_name_prefix=str(file_mapping),
            session_id=session_id,
            programme_group=programme_group,
        )

        _output_file_path = file_mapping.output_path

        return _input_file_path, _output_file_path

    def read_scenario_list_from_file(self, input_file_path: str) -> Optional[str]:
        try:
            _df = pd.read_csv(input_file_path)
            return (
                ", ".join(_df["TEST_DESC_IGNORED"].tolist())
                if "TEST_DESC_IGNORED" in _df.columns
                else None
            )
        except pd.errors.EmptyDataError:
            return None

    def create_child_list_from_file(
        self, file_path: Path, is_vaccinations: bool
    ) -> list[str]:
        _file_df = pd.read_csv(file_path)

        if is_vaccinations:
            _cols = ["PERSON_SURNAME", "PERSON_FORENAME"]
        else:
            _cols = ["CHILD_LAST_NAME", "CHILD_FIRST_NAME"]

        col0 = _file_df[_cols[0]].apply(normalize_whitespace)
        col1 = _file_df[_cols[1]].apply(normalize_whitespace)
        _names_list = (col0 + ", " + col1).tolist()
        return _names_list

    def get_session_id(self, path: Path) -> str:
        data_frame = pd.read_excel(path, sheet_name="Vaccinations", dtype=str)
        return data_frame["SESSION_ID"].iloc[0]

    def increment_date_of_birth_for_records(self, file_path: Path):
        _file_df = pd.read_csv(file_path)
        _file_df["CHILD_DATE_OF_BIRTH"] = pd.to_datetime(
            _file_df["CHILD_DATE_OF_BIRTH"]
        ) + pd.Timedelta(days=1)
        _file_df.to_csv(file_path, index=False)
