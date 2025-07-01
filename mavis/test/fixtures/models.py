import logging
import random
import time
from typing import List
import urllib.parse

from faker import Faker
import pytest
import requests
import nhs_number

from mavis.test.models import (
    Clinic,
    School,
    Team,
    Organisation,
    User,
    Child,
    Parent,
    Relationship,
)
from mavis.test.wrappers import get_date_of_birth_for_year_group, normalize_whitespace


logger = logging.getLogger(__name__)

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
        School(name=normalize_whitespace(school_data["name"]), urn=school_data["urn"])
        for school_data in schools_data
    ]


@pytest.fixture
def children():
    def _generate_children(n: int) -> list[Child]:
        return [
            Child(
                first_name=onboarding_faker.first_name(),
                last_name=onboarding_faker.last_name().upper(),
                nhs_number=nhs_number.generate(
                    for_region=nhs_number.REGION_ENGLAND,
                )[0],
                address=(
                    onboarding_faker.secondary_address(),
                    onboarding_faker.street_name(),
                    onboarding_faker.city(),
                    onboarding_faker.postcode(),
                ),
                date_of_birth=get_date_of_birth_for_year_group(9),
                parents=(Parent.get(Relationship.DAD), Parent.get(Relationship.MUM)),
            )
            for _ in range(n)
        ]

    return _generate_children(2)


@pytest.fixture(scope="session")
def superuser():
    email = onboarding_faker.email()
    return User(username=email, password=email, role="superuser")


@pytest.fixture(scope="session")
def team():
    return Team(
        key="team",
        name=f"{onboarding_faker.company()} est. {random.randint(1600, 2025)}",
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
        "programmes": ["flu", "hpv", "menacwy", "td_ipv"],
        "schools": {team.key: [it.to_onboarding() for it in schools]},
        "teams": team.to_onboarding(),
        "users": [it.to_onboarding() for it in users.values()],
    }


def _check_response_status(response):
    if not response.ok:
        logger.warning(response.content)
    response.raise_for_status()


@pytest.fixture(scope="session", autouse=True)
def onboard_and_delete(base_url, onboarding, organisation):
    url = urllib.parse.urljoin(base_url, "api/onboard")
    response = requests.post(url, json=onboarding)
    _check_response_status(response)

    yield

    url = urllib.parse.urljoin(base_url, f"api/organisations/{organisation.ods_code}")
    response = requests.delete(url)
    _check_response_status(response)


@pytest.fixture(scope="module", autouse=True)
def reset_before_each_module(base_url, organisation):
    url = urllib.parse.urljoin(base_url, f"api/organisations/{organisation.ods_code}")
    response = requests.delete(url, params={"keep_itself": "true"})
    _check_response_status(response)
