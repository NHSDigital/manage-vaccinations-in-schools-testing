import csv
from datetime import date, datetime
from pathlib import Path
from typing import NamedTuple
from zoneinfo import ZoneInfo

from dateutil.relativedelta import relativedelta

from mavis.test.utils import get_todays_date


class Patient(NamedTuple):
    nhs_number: str
    date_of_birth: date
    family_name: str
    given_name: str
    address_line_1: str
    address_line_2: str
    address_town: str
    address_postcode: str
    date_of_death: date | None = None

    @classmethod
    def from_csv_row(cls, row: dict[str, str]) -> "Patient":
        address_parts = [
            row[f"ADDRESS_LINE_{i}"] for i in range(1, 5) if row[f"ADDRESS_LINE_{i}"]
        ]
        date_of_death_string = row.get("DATE_OF_DEATH", "")[:8]

        return cls(
            nhs_number=row["NHS_NUMBER"],
            date_of_birth=datetime.strptime(row["DATE_OF_BIRTH"], "%Y%m%d")
            .replace(tzinfo=ZoneInfo("Europe/London"))
            .date(),
            family_name=row["FAMILY_NAME"],
            given_name=row["GIVEN_NAME"],
            address_line_1=address_parts[0],
            address_line_2=address_parts[1],
            address_town=row["ADDRESS_LINE_4"],
            address_postcode=row["POST_CODE"],
            date_of_death=(
                datetime.strptime(date_of_death_string, "%Y%m%d")
                .replace(tzinfo=ZoneInfo("Europe/London"))
                .date()
                if date_of_death_string
                else None
            ),
        )

    @property
    def full_name(self) -> tuple[str, str]:
        return (self.given_name, self.family_name)

    @property
    def address(self) -> tuple[str, str, str, str]:
        return (
            self.address_line_1,
            self.address_line_2,
            self.address_town,
            self.address_postcode,
        )


with (Path(__file__).parent / "pds.csv").open(newline="") as file:
    reader = csv.DictReader(file)
    patients = [Patient.from_csv_row(row) for row in reader]

patients_without_date_of_death = [
    patient for patient in patients if not patient.date_of_death
]

cutoff_date = get_todays_date() - relativedelta(years=22)

child_patients_without_date_of_death = [
    patient
    for patient in patients_without_date_of_death
    if patient.date_of_birth >= cutoff_date
]
