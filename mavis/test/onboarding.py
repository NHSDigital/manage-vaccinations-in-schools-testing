import random
import time
from typing import List, NamedTuple
import urllib.parse

from faker import Faker
import pytest
import requests


class Clinic(NamedTuple):
    name: str

    def __str__(self):
        return self.name

    def to_onboarding(self):
        return {"name": self.name}


class School(NamedTuple):
    name: str
    urn: str

    def __str__(self):
        return self.name

    def to_onboarding(self):
        return self.urn


class Team(NamedTuple):
    key: str
    name: str
    email: str
    phone: str

    def __str__(self):
        return self.name

    def to_onboarding(self):
        return {self.key: {"name": self.name, "email": self.email, "phone": self.phone}}


class Organisation(NamedTuple):
    name: str
    ods_code: str
    email: str
    phone: str

    def __str__(self):
        return f"{self.name} ({self.ods_code})"

    def to_onboarding(self):
        return {
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "ods_code": self.ods_code,
            "careplus_venue_code": self.ods_code,
            "privacy_notice_url": "https://example.com/privacy",
            "privacy_policy_url": "https://example.com/privacy",
        }


class User(NamedTuple):
    username: str
    password: str
    role: str

    def __str__(self):
        return self.username

    def to_onboarding(self):
        return {
            "email": self.username,
            "password": self.password,
            "given_name": self.role,
            "family_name": self.role,
            "fallback_role": self.role,
        }


onboarding_faker = Faker(locale="en_GB")
onboarding_faker.seed_instance(seed=time.time())
onboarding_faker.unique.clear()


@pytest.fixture(scope="session")
def admin():
    email = onboarding_faker.email()
    return User(username=email, password=email, role="admin")


@pytest.fixture(scope="session")
def clinics() -> List[Clinic]:
    return [
        Clinic(name=onboarding_faker.company()),
    ]


@pytest.fixture(scope="session")
def nurse():
    email = onboarding_faker.email()
    return User(username=email, password=email, role="nurse")


@pytest.fixture(scope="session")
def schools(base_url) -> List[School]:
    url = urllib.parse.urljoin(base_url, "api/locations")
    params = {
        "type": "school",
        "status": "open",
        "is_attached_to_organisation": "false",
        "year_groups[]": ["8", "9", "10", "11"],  # HPV and Doubles
    }

    response = requests.get(url, params=params)
    response.raise_for_status()

    data = response.json()
    schools_data = random.choices(data, k=2)

    return [
        School(name=school_data["name"], urn=school_data["urn"])
        for school_data in schools_data
    ]


@pytest.fixture(scope="session")
def superuser():
    email = onboarding_faker.email()
    return User(username=email, password=email, role="superuser")


@pytest.fixture(scope="session")
def team():
    return Team(
        key="team",
        name=onboarding_faker.company(),
        email=onboarding_faker.email(),
        phone=onboarding_faker.cellphone_number(),
    )


@pytest.fixture(scope="session")
def organisation(team) -> Organisation:
    ods_code = onboarding_faker.bothify("?###?", letters="ABCDEFGHIJKLMNOPQRSTUVWXYZ")
    return Organisation(
        name=team.name, ods_code=ods_code, email=team.email, phone=team.phone
    )


@pytest.fixture(scope="session")
def users(admin, nurse, superuser) -> dict[str, User]:
    return {
        "admin": admin,
        "nurse": nurse,
        "superuser": superuser,
    }


@pytest.fixture(scope="session")
def onboarding(clinics, schools, team, organisation, users):
    return {
        "clinics": {team.key: [it.to_onboarding() for it in clinics]},
        "organisation": organisation.to_onboarding(),
        "programmes": ["hpv", "menacwy", "td_ipv"],
        "schools": {team.key: [it.to_onboarding() for it in schools]},
        "teams": team.to_onboarding(),
        "users": [it.to_onboarding() for it in users.values()],
    }


@pytest.fixture(scope="session", autouse=True)
def onboard(base_url, onboarding):
    url = urllib.parse.urljoin(base_url, "api/onboard")
    response = requests.post(url, json=onboarding)
    if response.ok:
        return

    print(response.json())
    response.raise_for_status()


@pytest.fixture(scope="module", autouse=True)
def reset(base_url, organisation):
    yield

    url = urllib.parse.urljoin(base_url, f"api/organisations/{organisation.ods_code}")
    response = requests.delete(url)
    if response.ok:
        return

    response.raise_for_status()
