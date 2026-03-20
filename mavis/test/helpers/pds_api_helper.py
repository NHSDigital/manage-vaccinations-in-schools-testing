import csv
import random
import uuid
from datetime import date, datetime
from pathlib import Path
from time import sleep
from typing import NamedTuple
from zoneinfo import ZoneInfo

import dateutil.parser
import requests
from dateutil.relativedelta import relativedelta

from mavis.test.constants import PdsEndpoints, Relationship
from mavis.test.data_models import Child, Parent
from mavis.test.fixtures.fhir_api import AuthToken
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

    def matches_key_attributes(self, other_patient: "Patient") -> bool:
        return (
            self.nhs_number == other_patient.nhs_number
            and self.date_of_birth == other_patient.date_of_birth
            and self.date_of_death == other_patient.date_of_death
            and self.family_name.upper() == other_patient.family_name.upper()
            and self.given_name.upper() == other_patient.given_name.upper()
            and self.address_postcode.upper() == other_patient.address_postcode.upper()
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


class PdsApiHelper:
    def __init__(self, auth_token: AuthToken) -> None:
        self.headers = {
            "accept": "application/fhir+json",
            "content-type": "application/x-www-form-urlencoded",
            "x-correlation-id": str(uuid.uuid4()),
            "x-request-id": str(uuid.uuid4()),
            "Authorization": f"Bearer {auth_token.token}",
        }
        self._load_patients()

    def _load_patients(self) -> None:
        with (Path(__file__).parent.parent / "data" / "pds.csv").open(
            newline=""
        ) as file:
            reader = csv.DictReader(file)
            self.patients = [Patient.from_csv_row(row) for row in reader]

    def get_random_child_patient_without_date_of_death(self) -> Child:
        patients_without_date_of_death = [
            patient for patient in self.patients if not patient.date_of_death
        ]

        cutoff_date = get_todays_date() - relativedelta(years=22)

        child_patients_without_date_of_death = [
            patient
            for patient in patients_without_date_of_death
            if patient.date_of_birth >= cutoff_date
        ]

        checked_nhs_numbers = set()
        while True:
            if len(checked_nhs_numbers) == len(child_patients_without_date_of_death):
                msg = "All patients in PDS export are outdated"
                raise RuntimeError(msg)

            sleep(0.5)

            child = random.choice(child_patients_without_date_of_death)
            if child.nhs_number in checked_nhs_numbers:
                continue

            checked_nhs_numbers.add(child.nhs_number)
            try:
                child_in_pds = self.get_patient_by_nhs_number(child.nhs_number)
            except requests.exceptions.HTTPError as e:
                if e.response.status_code in {404, 429}:
                    continue
                raise
            except ValueError:
                continue

            if not (
                child.matches_key_attributes(child_in_pds)
                and self.confirm_patient_can_be_found_by_search(child)
            ):
                continue

            try:
                if self.confirm_patient_can_be_found_by_search(child):
                    break
            except requests.exceptions.HTTPError as e:
                if e.response.status_code in {404, 429}:
                    continue
                continue

        return Child(
            child.given_name,
            child.family_name,
            child.nhs_number,
            child.address,
            child.date_of_birth,
            9,
            (Parent.get(Relationship.DAD), Parent.get(Relationship.MUM)),
        )

    def get_patient_by_nhs_number(self, nhs_number: str) -> Patient:
        response = requests.get(
            url=PdsEndpoints.GET_PATIENT_DETAILS.to_url_with_suffix(nhs_number),
            headers=self.headers,
            timeout=30,
        )
        response.raise_for_status()

        data = response.json()

        patient_id = data["id"]
        name_data = data["name"][0]
        given_name = name_data["given"][0]
        family_name = name_data["family"]
        date_of_birth = dateutil.parser.parse(data["birthDate"]).date()
        date_of_death = (
            dateutil.parser.parse(data["deceasedDateTime"]).date()
            if "deceasedDateTime" in data
            else None
        )

        if "address" not in data:
            msg = "No address in patient data"
            raise ValueError(msg)
        address = None
        for addr in data["address"]:
            if addr.get("use") == "home":
                address = addr
                break
        if address is None:
            address = data["address"][0]

        address_lines = address["line"]
        if "postalCode" not in address:
            msg = "No postal code in patient address"
            raise ValueError(msg)
        postal_code = address["postalCode"]

        required_address_lines = 3
        while len(address_lines) < required_address_lines:
            address_lines.append("")

        return Patient(
            nhs_number=patient_id,
            date_of_birth=date_of_birth,
            family_name=family_name,
            given_name=given_name,
            address_line_1=address_lines[0],
            address_line_2=address_lines[1],
            address_town=address_lines[2],
            address_postcode=postal_code,
            date_of_death=date_of_death,
        )

    def confirm_patient_can_be_found_by_search(self, patient: Patient) -> bool:
        response = requests.get(
            url=PdsEndpoints.SEARCH_FOR_PATIENT.to_url_with_suffix(
                f"family={patient.family_name}"
                f"&given={patient.given_name}"
                f"&birthdate=eq{patient.date_of_birth.isoformat()}"
                f"&address-postcode={patient.address_postcode.replace(' ', '')}"
            ),
            headers=self.headers,
            timeout=30,
        )
        response.raise_for_status()

        data = response.json()
        return (
            "issues" not in data
            and "entry" in data
            and data["entry"][0]["resource"]["id"] == patient.nhs_number
        )
