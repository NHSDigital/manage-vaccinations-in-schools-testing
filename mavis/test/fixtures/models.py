import base64
import logging
import os
import random
import time
import urllib.parse
import uuid
from typing import List

import jwt
import nhs_number
import pytest
import requests
from faker import Faker

from mavis.test.models import (
    Child,
    Clinic,
    Organisation,
    Parent,
    Programme,
    Relationship,
    School,
    Subteam,
    Team,
    User,
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
def year_groups():
    return {
        programme.group: random.choice(programme.year_groups) for programme in Programme
    }


@pytest.fixture(scope="session")
def schools(base_url, year_groups) -> dict[str, list[School]]:
    def _get_schools_with_year_group(year_group: str) -> list[School]:
        url = urllib.parse.urljoin(base_url, "api/testing/locations")
        params = {
            "type": "school",
            "status": "open",
            "is_attached_to_team": "false",
            "year_groups[]": [year_group],
        }

        response = requests.get(url, params=params)
        response.raise_for_status()

        data = response.json()
        schools_data = random.choices(data, k=2)

        return [
            School(
                name=normalize_whitespace(school_data["name"]), urn=school_data["urn"]
            )
            for school_data in schools_data
        ]

    return {
        programme.group: _get_schools_with_year_group(year_groups[programme.group])
        for programme in Programme
    }


@pytest.fixture
def children(year_groups) -> dict[str, list[Child]]:
    def _generate_children(n: int, year_group: int) -> list[Child]:
        return [
            Child(
                first_name=onboarding_faker.first_name(),
                last_name=onboarding_faker.last_name().upper(),
                nhs_number=nhs_number.generate(
                    for_region=nhs_number.REGION_SYNTHETIC,
                )[0],
                address=(
                    onboarding_faker.secondary_address(),
                    onboarding_faker.street_name(),
                    onboarding_faker.city(),
                    onboarding_faker.postcode(),
                ),
                date_of_birth=get_date_of_birth_for_year_group(year_group),
                year_group=year_group,
                parents=(Parent.get(Relationship.DAD), Parent.get(Relationship.MUM)),
            )
            for _ in range(n)
        ]

    return {
        programme.group: _generate_children(2, int(year_groups[programme.group]))
        for programme in Programme
    }


@pytest.fixture(scope="session")
def superuser():
    email = onboarding_faker.email()
    return User(username=email, password=email, role="superuser")


@pytest.fixture(scope="session")
def organisation():
    ods_code = onboarding_faker.bothify("?###?", letters="ABCDEFGHIJKLMNOPQRSTUVWXYZ")
    return Organisation(ods_code=ods_code)


@pytest.fixture(scope="session")
def subteam():
    return Subteam(
        key="team",
        name=f"{onboarding_faker.company()} est. {random.randint(1600, 2025)}",
        email=onboarding_faker.email(),
        phone=onboarding_faker.cellphone_number(),
    )


@pytest.fixture(scope="session")
def team(subteam, organisation) -> Team:
    return Team(
        name=subteam.name,
        workgroup=organisation.ods_code,
        careplus_venue_code=organisation.ods_code,
        email=subteam.email,
        phone=subteam.phone,
    )


@pytest.fixture(scope="session")
def users(admin, nurse, superuser) -> dict[str, User]:
    return {
        "admin": admin,
        "nurse": nurse,
        "superuser": superuser,
    }


@pytest.fixture(scope="session")
def onboarding(
    clinics, schools, subteam, team, organisation, users, programmes_enabled
):
    return {
        "clinics": {subteam.key: [it.to_onboarding() for it in clinics]},
        "team": team.to_onboarding(),
        "organisation": organisation.to_onboarding(),
        "programmes": programmes_enabled,
        "schools": {
            subteam.key: [
                school.to_onboarding()
                for schools_list in schools.values()
                for school in schools_list
            ]
        },
        "subteams": subteam.to_onboarding(),
        "users": [it.to_onboarding() for it in users.values()],
    }


def _check_response_status(response):
    if not response.ok:
        logger.warning(response.content)
    response.raise_for_status()


@pytest.fixture(scope="session", autouse=True)
def onboard_and_delete(base_url, onboarding, organisation):
    url = urllib.parse.urljoin(base_url, "api/testing/onboard")
    response = requests.post(url, json=onboarding)
    _check_response_status(response)

    yield

    url = urllib.parse.urljoin(base_url, f"api/testing/teams/{organisation.ods_code}")
    response = requests.delete(url)
    _check_response_status(response)


@pytest.fixture(scope="module", autouse=True)
def reset_before_each_module(base_url, organisation):
    url = urllib.parse.urljoin(base_url, f"api/testing/teams/{organisation.ods_code}")
    response = requests.delete(url, params={"keep_itself": "true"})
    _check_response_status(response)


@pytest.fixture(scope="session")
def programmes_enabled() -> list[str]:
    return os.environ["PROGRAMMES_ENABLED"].lower().split(",")


def _read_imms_api_credentials() -> dict[str, str]:
    return {
        "pem": base64.b64decode(os.environ["IMMS_API_PEM"]),
        "key": os.environ["IMMS_API_KEY"],
        "kid": os.environ["IMMS_API_KID"],
        "url": os.environ["IMMS_BASE_URL"],
    }


def _get_jwt_payload(api_auth: dict[str, str]) -> str:
    _kid = api_auth["kid"]
    _api_key = api_auth["key"]
    _pem = api_auth["pem"]
    _auth_endpoint = urllib.parse.urljoin(api_auth["url"], "oauth2-mock/token")
    headers = {
        "alg": "RS512",
        "typ": "JWT",
        "kid": _kid,
    }
    claims = {
        "sub": _api_key,
        "iss": _api_key,
        "jti": str(uuid.uuid4()),
        "aud": _auth_endpoint,
        "exp": int(time.time()) + 300,  # 5mins in the future
    }
    return jwt.encode(payload=claims, key=_pem, algorithm="RS512", headers=headers)


@pytest.fixture(scope="session", autouse=False)
def authenticate_api():
    _api_auth: dict[str, str] = _read_imms_api_credentials()
    _endpoint = urllib.parse.urljoin(_api_auth["url"], "oauth2-mock/token")
    _payload = {
        "grant_type": "client_credentials",
        "client_assertion_type": "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
        "client_assertion": _get_jwt_payload(api_auth=_api_auth),
    }
    _headers = {"Content-Type": "application/x-www-form-urlencoded"}

    response = requests.post(url=_endpoint, headers=_headers, data=_payload)

    _check_response_status(response=response)
    yield response.json()["access_token"]


@pytest.fixture(scope="session")
def imms_base_url():
    yield os.environ["IMMS_AUTH_URL"]
