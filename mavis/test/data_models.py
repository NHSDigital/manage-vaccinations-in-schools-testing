import random
import urllib.parse
from abc import ABC, abstractmethod
from datetime import date, datetime
from typing import NamedTuple
from zoneinfo import ZoneInfo

import nhs_number
import requests
from attr import dataclass
from faker import Faker

from mavis.test.constants import (
    ConsentOption,
    DeliverySite,
    Programme,
    Relationship,
)
from mavis.test.utils import (
    get_date_of_birth_for_year_group,
    normalize_postcode,
    normalize_whitespace,
)

faker = Faker("en_GB")


@dataclass
class Location:
    name: str

    def __str__(self) -> str:
        return self.name


@dataclass
class Clinic(Location):
    def to_onboarding(self) -> dict:
        return {"name": self.name}

    @classmethod
    def generate(cls) -> "Clinic":
        return cls(
            name=faker.company(),
        )


@dataclass
class School(Location):
    urn: str
    site: str
    address_line_1: str
    address_line_2: str
    address_town: str
    address_postcode: str

    def __str__(self) -> str:
        return self.name

    @property
    def urn_and_site(self) -> str:
        if self.site:
            return self.urn + self.site
        return self.urn

    def to_onboarding(self) -> str:
        return self.urn_and_site

    @classmethod
    def get_from_testing_api(
        cls, base_url: str, year_groups: dict[str, int]
    ) -> "dict[str, list[School]]":
        def _get_schools_with_year_group(year_group: int) -> list[School]:
            url = urllib.parse.urljoin(base_url, "api/testing/locations")
            params = {
                "type": "school",
                "status": "open",
                "is_attached_to_team": "false",
                "gias_year_groups[]": [str(year_group)],
                "site": "",
            }

            response = requests.get(url, params=params, timeout=30)
            response.raise_for_status()

            data = response.json()
            schools_data = random.choices(data, k=2)

            return [
                School(
                    name=normalize_whitespace(school_data["name"]),
                    urn=school_data["urn"],
                    site=school_data["site"],
                    address_line_1=school_data["address_line_1"],
                    address_line_2=school_data["address_line_2"],
                    address_town=school_data["address_town"],
                    address_postcode=school_data["address_postcode"],
                )
                for school_data in schools_data
            ]

        return {
            programme.group: _get_schools_with_year_group(year_groups[programme.group])
            for programme in Programme
        }


@dataclass
class Organisation:
    ods_code: str

    def to_onboarding(self) -> dict:
        return {
            "ods_code": self.ods_code,
        }

    @classmethod
    def generate(cls) -> "Organisation":
        return cls(
            ods_code=faker.bothify("?###?", letters="ABCDEFGHIJKLMNOPQRSTUVWXYZ"),
        )


@dataclass
class Subteam:
    key: str
    name: str
    email: str
    phone: str

    def __str__(self) -> str:
        return self.name

    def to_onboarding(self) -> dict:
        return {self.key: {"name": self.name, "email": self.email, "phone": self.phone}}

    @classmethod
    def generate(cls) -> "Subteam":
        return cls(
            key="team",
            name=f"{faker.company()} est. {random.randint(1600, 2025)}",
            email=faker.email(),
            phone=faker.cellphone_number(),
        )


@dataclass
class Team(ABC):
    name: str
    workgroup: str
    team_type: str

    def __str__(self) -> str:
        return f"{self.name}"

    def _base_onboarding_dict(self) -> dict:
        return {
            "name": self.name,
            "workgroup": self.workgroup,
            "type": self.team_type,
        }

    @abstractmethod
    def to_onboarding(self) -> dict:
        """
        Convert team data to onboarding dictionary format.
        Must be implemented by subclasses.
        """


@dataclass
class PointOfCareTeam(Team):
    careplus_venue_code: str
    careplus_staff_code: str
    careplus_staff_type: str
    email: str
    phone: str

    def to_onboarding(self) -> dict:
        base = self._base_onboarding_dict()
        base.update(
            {
                "email": self.email,
                "phone": self.phone,
                "careplus_venue_code": self.careplus_venue_code,
                "careplus_staff_code": self.careplus_staff_code,
                "careplus_staff_type": self.careplus_staff_type,
                "privacy_notice_url": "https://example.com/privacy",
                "privacy_policy_url": "https://example.com/privacy",
            }
        )
        return base

    @classmethod
    def generate(
        cls, subteam: Subteam, organisation: Organisation
    ) -> "PointOfCareTeam":
        return cls(
            name=subteam.name,
            workgroup=organisation.ods_code,
            team_type="point_of_care",
            careplus_venue_code=organisation.ods_code + "A",
            careplus_staff_code=organisation.ods_code + "B",
            careplus_staff_type=organisation.ods_code + "C",
            email=subteam.email,
            phone=subteam.phone,
        )


@dataclass
class NationalReportingTeam(Team):
    def to_onboarding(self) -> dict:
        return self._base_onboarding_dict()

    @classmethod
    def generate(cls, organisation: Organisation) -> "NationalReportingTeam":
        return cls(
            name=f"NR {faker.company()} est. {random.randint(1600, 2025)}",
            workgroup=organisation.ods_code,
            team_type="national_reporting",
        )


@dataclass
class User:
    username: str
    password: str
    role: str

    def __str__(self) -> str:
        return self.username

    def to_onboarding(self) -> dict:
        return {
            "email": self.username,
            "password": self.password,
            "given_name": self.role,
            "family_name": self.role,
            "fallback_role": self.role,
        }

    @classmethod
    def generate(cls, role: str) -> "User":
        email = faker.email()
        return cls(
            username=email,
            password=email,
            role=role,
        )


@dataclass
class Parent:
    full_name: str
    relationship: Relationship
    email_address: str

    @property
    def name_and_relationship(self) -> str:
        return f"{self.full_name} ({self.relationship})"

    @classmethod
    def get(cls, relationship: Relationship) -> "Parent":
        return cls(
            full_name=relationship.generate_name,
            relationship=relationship,
            email_address=faker.email(),
        )


@dataclass
class Child:
    first_name: str
    last_name: str
    nhs_number: str
    address: tuple[str, str, str, str]
    date_of_birth: date
    year_group: int
    parents: tuple[Parent, Parent]

    def __str__(self) -> str:
        return f"{self.last_name}, {self.first_name}"

    @property
    def name(self) -> tuple[str, str]:
        return self.first_name, self.last_name

    @classmethod
    def generate(cls, year_group: int) -> "Child":
        return cls(
            first_name=faker.first_name(),
            last_name=faker.last_name().upper(),
            nhs_number=nhs_number.generate(
                for_region=nhs_number.REGION_SYNTHETIC,
            )[0],
            address=(
                faker.secondary_address(),
                faker.street_name(),
                faker.city(),
                normalize_postcode(faker.postcode()),
            ),
            date_of_birth=get_date_of_birth_for_year_group(year_group),
            year_group=year_group,
            parents=(Parent.get(Relationship.DAD), Parent.get(Relationship.MUM)),
        )

    @classmethod
    def generate_children_for_year_group(cls, n: int, year_group: int) -> list["Child"]:
        return [cls.generate(year_group) for _ in range(n)]

    @classmethod
    def generate_children_in_year_group_for_each_programme_group(
        cls, n: int, year_group_dict: dict[str, int]
    ) -> dict[str, list["Child"]]:
        return {
            programme.group: cls.generate_children_for_year_group(
                n, year_group_dict[programme.group]
            )
            for programme in Programme
        }


@dataclass
class VaccinationRecord:
    child: Child
    programme: Programme
    batch_name: str
    consent_option: ConsentOption = ConsentOption.INJECTION
    delivery_site: DeliverySite = DeliverySite.LEFT_ARM_UPPER

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
