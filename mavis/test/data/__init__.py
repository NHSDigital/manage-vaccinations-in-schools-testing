from pathlib import Path
from typing import List, Optional
from enum import Enum
from faker import Faker

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
    MAV_853 = "mav_853"
    MAV_855 = "mav_855"
    SYSTMONE_POSITIVE = "systmone_positive"
    SYSTMONE_NEGATIVE = "systmone_negative"
    SYSTMONE_HIST_NEGATIVE = "systmone_hist_negative"
    MAV_1080 = "mav_1080"
    SYSTMONE_MAV_1080 = "systmone_mav_1080"

    @property
    def folder(self) -> Path:
        return Path("vaccs")


class CohortsFileMapping(FileMapping):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    INVALID_STRUCTURE = "invalid_structure"
    EMPTY_FILE = "empty"
    HEADER_ONLY = "header_only"
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
    def folder(self) -> Path:
        return Path("cohorts")


class ChildFileMapping(FileMapping):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    INVALID_STRUCTURE = "invalid_structure"
    EMPTY_FILE = "empty"
    HEADER_ONLY = "header_only"
    MAV_1080 = "mav_1080"

    @property
    def folder(self) -> Path:
        return Path("child")


class ClassFileMapping(FileMapping):
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
    def folder(self) -> Path:
        return Path("class_list")


class TestData:
    template_path = Path(__file__).parent
    working_path = Path("working")

    def __init__(self, organisation: Organisation, schools: List[School], nurse: User):
        self.organisation = organisation
        self.schools = schools
        self.nurse = nurse

        self.faker = Faker(locale="en_GB")

        self.working_path.mkdir(parents=True, exist_ok=True)

    def read_file(self, filename):
        return (self.template_path / filename).read_text(encoding="utf-8")

    def create_file_from_template(
        self,
        template_path: Path,
        file_name_prefix: str,
        session_id: Optional[str] = None,
    ) -> Path:
        static_replacements = {
            "<<VACCS_DATE>>": get_current_datetime()[:8],
            "<<VACCS_TIME>>": get_current_time(),
            "<<HIST_VACCS_DATE>>": get_offset_date(offset_days=-(365 * 2)),
            "<<SESSION_ID>>": session_id,
        }

        if self.organisation:
            static_replacements["<<ORG_CODE>>"] = self.organisation.ods_code

        if self.schools:
            for index, school in enumerate(self.schools):
                static_replacements[f"<<SCHOOL_{index}_NAME>>"] = school.name
                static_replacements[f"<<SCHOOL_{index}_URN>>"] = school.urn

        if self.nurse:
            static_replacements["<<NURSE_EMAIL>>"] = self.nurse.username

        for year_group in range(8, 12):
            static_replacements[f"<<DOB_YEAR_{year_group}>>"] = (
                get_date_of_birth_for_year_group(year_group)
            )

        file_content = self._replace_placeholders(
            template_path=template_path, static_replacements=static_replacements
        )
        filename = f"{file_name_prefix}{get_current_datetime()}.csv"

        output_path = self.working_path / filename
        output_path.write_text(file_content, encoding="utf-8")

        return output_path

    def _replace_placeholders(
        self, template_path: Path, static_replacements: dict[str, str]
    ) -> str:
        template_text = self.read_file(template_path)

        lines = []
        for line in template_text.splitlines():
            dynamic_replacements = {
                "<<FNAME>>": self.faker.first_name(),
                "<<LNAME>>": self.faker.last_name().upper(),
                "<<NHS_NO>>": self.get_new_nhs_no(valid=True),
                "<<INVALID_NHS_NO>>": self.get_new_nhs_no(valid=False),
                "<<PARENT_EMAIL>>": self.faker.email(),
            }
            all_replacements = {**static_replacements, **dynamic_replacements}

            for key, value in all_replacements.items():
                line = line.replace(key, str(value) if value else "")
            lines.append(line)

        return "\n".join(lines)

    def get_new_nhs_no(self, valid=True) -> str:
        return nhs_number.generate(
            valid=valid, for_region=nhs_number.REGION_ENGLAND, quantity=1
        )[0]

    def get_expected_errors(self, file_path: Path) -> Optional[list[str]]:
        file_content = self.read_file(file_path)
        return file_content.splitlines() if file_content else None

    def get_file_paths(
        self, file_mapping: FileMapping, session_id: Optional[str] = None
    ) -> tuple[Path, Path]:
        _input_file_path = self.create_file_from_template(
            template_path=file_mapping.input_template_path,
            file_name_prefix=str(file_mapping),
            session_id=session_id,
        )

        _output_file_path = file_mapping.output_path

        return _input_file_path, _output_file_path

    def create_child_list_from_file(
        self, file_path: Path, is_vaccinations: bool
    ) -> list[str]:
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
        """
        Normalize whitespace in a string:
        - Remove zero-width joiners
        - Replace non-breaking spaces with regular spaces
        - Collapse consecutive whitespace to a single space
        - Strip leading/trailing whitespace
        """
        string = string.replace("\u200d", "")
        string = string.replace("\u00a0", " ")
        return re.sub(r"\s+", " ", string).strip()

    def get_session_id(self, path: Path) -> str:
        data_frame = pd.read_excel(path, sheet_name="Vaccinations")
        return data_frame["SESSION_ID"].iloc[0]

    def increment_date_of_birth_for_records(self, file_path: Path):
        _file_df = pd.read_csv(file_path)
        _file_df["CHILD_DATE_OF_BIRTH"] = pd.to_datetime(
            _file_df["CHILD_DATE_OF_BIRTH"]
        ) + pd.Timedelta(days=1)
        _file_df.to_csv(file_path, index=False)
