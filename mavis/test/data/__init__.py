import csv
from collections.abc import Callable
from enum import Enum
from pathlib import Path

import nhs_number
import pandas as pd
from faker import Faker

from mavis.test.models import Child, Clinic, Organisation, Programme, School, User
from mavis.test.utils import (
    get_current_datetime_compact,
    get_current_time_hms_format,
    get_date_of_birth_for_year_group,
    get_offset_date_compact_format,
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
        return Path()


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
    RANDOM_CHILD = "random_child"
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
        organisation: Organisation,
        schools: dict[str, list[School]],
        nurse: User,
        children: dict[str, list[Child]],
        clinics: list[Clinic],
        year_groups: dict[str, int],
    ) -> None:
        self.organisation = organisation
        self.schools = schools
        self.nurse = nurse
        self.children = children
        self.clinics = clinics
        self.year_groups = year_groups

        self.faker = Faker(locale="en_GB")

        self.working_path.mkdir(parents=True, exist_ok=True)

    def read_file(self, filename: Path) -> str:
        return (self.template_path / filename).read_text(encoding="utf-8")

    def create_file_from_template(
        self,
        template_path: Path,
        file_name_prefix: str,
        session_id: str | None = None,
        programme_group: str = Programme.HPV.group,
    ) -> Path:
        file_replacements = self.create_file_replacements_dict(
            programme_group=programme_group, session_id=session_id
        )

        line_replacements = self.create_line_replacements_dict(programme_group)

        output_filename = f"{file_name_prefix}{get_current_datetime_compact()}.csv"
        output_path = self.working_path / output_filename

        if (self.template_path / template_path).stat().st_size > 0:
            template_df = pd.read_csv(self.template_path / template_path, dtype=str)
            template_df = self.replace_substrings_in_df(
                template_df,
                file_replacements,
            )
            template_df = template_df.apply(
                lambda col: col.apply(
                    lambda x: (
                        line_replacements[x.strip()]()
                        if isinstance(x, str) and x.strip() in line_replacements
                        else x
                    ),
                ),
            )
            template_df.to_csv(
                path_or_buf=output_path,
                quoting=csv.QUOTE_MINIMAL,
                encoding="utf-8",
                index=False,
            )
        else:
            output_path.touch()
        return output_path

    def create_file_replacements_dict(
        self, programme_group: str, session_id: str | None
    ) -> dict[str, str]:
        file_replacements = self._vaccs_file_replacements(session_id)
        file_replacements.update(self._organisation_replacements())
        file_replacements.update(self._school_replacements(programme_group))
        file_replacements.update(self._nurse_replacements())
        file_replacements.update(self._clinic_replacements())
        file_replacements.update(self._children_replacements(programme_group))
        file_replacements.update(self._year_group_replacements(programme_group))
        return file_replacements

    def _vaccs_file_replacements(self, session_id: str | None) -> dict[str, str]:
        return {
            "<<VACCS_DATE>>": get_current_datetime_compact()[:8],
            "<<VACCS_TIME>>": get_current_time_hms_format(),
            "<<HIST_VACCS_DATE>>": get_offset_date_compact_format(
                offset_days=-(365 * 2)
            ),
            "<<SESSION_ID>>": session_id if session_id else "",
        }

    def _organisation_replacements(self) -> dict[str, str]:
        if self.organisation:
            return {"<<ORG_CODE>>": self.organisation.ods_code}
        return {}

    def _school_replacements(self, programme_group: str) -> dict[str, str]:
        replacements = {}
        if self.schools:
            schools = self.schools[programme_group]
            for index, school in enumerate(schools):
                replacements[f"<<SCHOOL_{index}_NAME>>"] = school.name
                replacements[f"<<SCHOOL_{index}_URN>>"] = school.urn_and_site
        return replacements

    def _nurse_replacements(self) -> dict[str, str]:
        if self.nurse:
            return {"<<NURSE_EMAIL>>": self.nurse.username}
        return {}

    def _clinic_replacements(self) -> dict[str, str]:
        replacements = {}
        if self.clinics:
            for index, clinic in enumerate(self.clinics):
                replacements[f"<<CLINIC_{index}_LOWER>>"] = clinic.name.lower()
                replacements[f"<<CLINIC_{index}>>"] = clinic.name
        return replacements

    def _children_replacements(self, programme_group: str) -> dict[str, str]:
        replacements = {}
        if self.children:
            children = self.children[programme_group]
            for index, child in enumerate(children):
                replacements[f"<<CHILD_{index}_FIRST_NAME>>"] = child.first_name
                replacements[f"<<CHILD_{index}_LAST_NAME>>"] = child.last_name
                replacements[f"<<CHILD_{index}_NHS_NO>>"] = child.nhs_number
                replacements[f"<<CHILD_{index}_ADDRESS_LINE_1>>"] = child.address[0]
                replacements[f"<<CHILD_{index}_ADDRESS_LINE_2>>"] = child.address[1]
                replacements[f"<<CHILD_{index}_TOWN>>"] = child.address[2]
                replacements[f"<<CHILD_{index}_POSTCODE>>"] = child.address[3]
                replacements[f"<<CHILD_{index}_DATE_OF_BIRTH>>"] = (
                    child.date_of_birth.strftime("%Y%m%d")
                )
                replacements[f"<<CHILD_{index}_YEAR_GROUP>>"] = str(child.year_group)
                replacements[f"<<CHILD_{index}_PARENT_1_NAME>>"] = child.parents[
                    0
                ].full_name
                replacements[f"<<CHILD_{index}_PARENT_2_NAME>>"] = child.parents[
                    1
                ].full_name
                replacements[f"<<CHILD_{index}_PARENT_1_EMAIL>>"] = child.parents[
                    0
                ].email_address
                replacements[f"<<CHILD_{index}_PARENT_2_EMAIL>>"] = child.parents[
                    1
                ].email_address
                replacements[f"<<CHILD_{index}_PARENT_1_RELATIONSHIP>>"] = (
                    child.parents[0].relationship
                )
                replacements[f"<<CHILD_{index}_PARENT_2_RELATIONSHIP>>"] = (
                    child.parents[1].relationship
                )
        return replacements

    def _year_group_replacements(self, programme_group: str) -> dict[str, str]:
        replacements = {}
        for year_group in range(8, 12):
            replacements[f"<<DOB_YEAR_{year_group}>>"] = str(
                get_date_of_birth_for_year_group(year_group)
            )
        if self.year_groups:
            fixed_year_group = self.year_groups[programme_group]
            replacements["<<FIXED_YEAR_GROUP>>"] = str(fixed_year_group)
        return replacements

    def create_line_replacements_dict(
        self, programme_group: str
    ) -> dict[str, Callable[[], str]]:
        line_replacements = {
            "<<RANDOM_FNAME>>": lambda: self.faker.first_name(),
            "<<RANDOM_LNAME>>": lambda: self.faker.last_name().upper(),
            "<<RANDOM_NHS_NO>>": lambda: self.get_new_nhs_no(valid=True),
            "<<INVALID_NHS_NO>>": lambda: self.get_new_nhs_no(valid=False),
            "<<RANDOM_POSTCODE>>": lambda: self.faker.postcode(),
        }

        if self.year_groups:
            fixed_year_group = self.year_groups[programme_group]
            line_replacements["<<FIXED_YEAR_GROUP_DOB>>"] = lambda: str(
                get_date_of_birth_for_year_group(fixed_year_group),
            )

        return line_replacements

    def replace_substrings_in_df(
        self, df: pd.DataFrame, replacements: dict[str, str]
    ) -> pd.DataFrame:
        def replace_substrings(cell: object) -> object:
            if isinstance(cell, str):
                for old, new in replacements.items():
                    if old and new:
                        cell = cell.replace(old, new)
            return cell

        for col in df.columns:
            df[col] = df[col].map(replace_substrings)
        return df

    def get_new_nhs_no(self, *, valid: bool = True) -> str:
        nhs_numbers = nhs_number.generate(
            valid=valid,
            for_region=nhs_number.REGION_SYNTHETIC,
            quantity=1,
        )
        if not nhs_numbers:
            exception_message = "Failed to generate NHS number."
            raise ValueError(exception_message)
        return nhs_numbers[0]

    def get_expected_errors(self, file_path: Path) -> list[str] | None:
        file_content = self.read_file(file_path)
        return file_content.splitlines() if file_content else None

    def get_file_paths(
        self,
        file_mapping: FileMapping,
        session_id: str | None = None,
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

    def read_scenario_list_from_file(self, input_file_path: Path) -> str | None:
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
        self,
        file_path: Path,
        *,
        is_vaccinations: bool,
    ) -> list[str]:
        _file_df = pd.read_csv(file_path)

        if is_vaccinations:
            _cols = ["PERSON_SURNAME", "PERSON_FORENAME"]
        else:
            _cols = ["CHILD_LAST_NAME", "CHILD_FIRST_NAME"]

        last_name_list = _file_df[_cols[0]].apply(normalize_whitespace)
        first_name_list = _file_df[_cols[1]].apply(normalize_whitespace)
        return (last_name_list + ", " + first_name_list).tolist()

    def get_session_id(self, path: Path) -> str:
        data_frame = pd.read_excel(path, sheet_name="Vaccinations", dtype=str)
        return data_frame["SESSION_ID"].iloc[0]

    def increment_date_of_birth_for_records(self, file_path: Path) -> None:
        _file_df = pd.read_csv(file_path)
        _file_df["CHILD_DATE_OF_BIRTH"] = pd.to_datetime(
            _file_df["CHILD_DATE_OF_BIRTH"],
        ) + pd.Timedelta(days=1)
        _file_df.to_csv(file_path, index=False)
