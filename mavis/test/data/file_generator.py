import csv
import os
from collections.abc import Callable
from pathlib import Path

import nhs_number
import pandas as pd
from faker import Faker

from mavis.test.constants import Programme
from mavis.test.data.file_mappings import FileMapping
from mavis.test.data_models import Child, Clinic, Organisation, School, User
from mavis.test.utils import (
    get_current_datetime_compact,
    get_current_time_hms_format,
    get_date_of_birth_for_year_group,
    get_offset_date_compact_format,
)


class FileGenerator:
    template_path = Path(__file__).parent

    def __init__(  # noqa: PLR0913
        self,
        organisation: Organisation,
        schools: dict[str, list[School]],
        nurse: User,
        children: dict[str, list[Child]],
        clinics: list[Clinic] | None,
        year_groups: dict[str, int],
    ) -> None:
        self.organisation = organisation
        self.schools = schools
        self.nurse = nurse
        self.children = children
        self.clinics = clinics
        self.year_groups = year_groups

        self.faker = Faker(locale="en_GB")

        self.create_working_directory()

    def create_working_directory(self) -> None:
        worker_id = os.environ.get("PYTEST_XDIST_WORKER", "main")
        self.working_path = Path("working") / f"working_{worker_id}"

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
            "<<SESSION_ID>>": session_id or "",
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
        # ruff: disable[PLW0108]
        line_replacements = {
            "<<RANDOM_FNAME>>": lambda: self.faker.first_name(),
            "<<RANDOM_LNAME>>": lambda: self.faker.last_name().upper(),
            "<<RANDOM_NHS_NO>>": lambda: self.get_new_nhs_no(valid=True),
            "<<INVALID_NHS_NO>>": lambda: self.get_new_nhs_no(valid=False),
            "<<RANDOM_POSTCODE>>": lambda: self.faker.postcode(),
        }
        # ruff: enable[PLW0108]

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
        return str(nhs_numbers[0])

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
            session_id=str(session_id),
            programme_group=programme_group,
        )

        _output_file_path = file_mapping.output_path

        return _input_file_path, _output_file_path
