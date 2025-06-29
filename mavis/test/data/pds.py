from datetime import date, datetime
import csv
from pathlib import Path
from typing import NamedTuple, Optional


class Patient(NamedTuple):
    nhs_number: str
    date_of_birth: date
    family_name: str
    given_name: str
    address_line_1: str
    address_line_2: str
    address_town: str
    address_postcode: str
    date_of_death: Optional[date] = None

    @classmethod
    def from_csv_row(cls, row):
        address_parts = [
            row[f"ADDRESS_LINE_{i}"] for i in range(1, 5) if row[f"ADDRESS_LINE_{i}"]
        ]
        date_of_death_string = row.get("DATE_OF_DEATH", "")[:8]

        return cls(
            nhs_number=row["NHS_NUMBER"],
            date_of_birth=datetime.strptime(row["DATE_OF_BIRTH"], "%Y%m%d").date(),
            family_name=row["FAMILY_NAME"],
            given_name=row["GIVEN_NAME"],
            address_line_1=address_parts[0],
            address_line_2=address_parts[1],
            address_town=row["ADDRESS_LINE_4"],
            address_postcode=row["POST_CODE"],
            date_of_death=(
                datetime.strptime(date_of_death_string, "%Y%m%d").date()
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

child_patients_without_date_of_death = [
    patient
    for patient in patients_without_date_of_death
    if patient.date_of_birth >= date.today().replace(year=date.today().year - 22)
]
