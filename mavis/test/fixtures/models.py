import base64
import logging
import os
import random
import time
import urllib.parse
import uuid

import jwt
import nhs_number
import pytest
import requests
from faker import Faker

from mavis.test.models import (
    Child,
    Clinic,
    Onboarding,
    Organisation,
    Parent,
    Programme,
    Relationship,
    School,
    Subteam,
    Team,
    User,
)
from mavis.test.utils import get_date_of_birth_for_year_group

logger = logging.getLogger(__name__)

onboarding_faker = Faker(locale="en_GB")
onboarding_faker.seed_instance(seed=time.time())
onboarding_faker.unique.clear()


@pytest.fixture(scope="session")
def year_groups() -> dict[str, int]:
    return {
        programme.group: random.choice(programme.year_groups) for programme in Programme
    }


@pytest.fixture(scope="session")
def programmes_enabled() -> list[str]:
    return os.environ["PROGRAMMES_ENABLED"].lower().split(",")


@pytest.fixture(scope="session")
def onboarding(
    base_url,
    year_groups,
    programmes_enabled,
) -> Onboarding:
    onboarding_url = urllib.parse.urljoin(base_url, "api/testing/onboard")
    max_attempts = 3
    onboarding_data = None

    for attempt in range(1, max_attempts + 1):
        onboarding_data = Onboarding.get_onboarding_data_for_tests(
            base_url=base_url,
            year_groups=year_groups,
            programmes=programmes_enabled,
        )
        response = requests.post(
            onboarding_url, json=onboarding_data.to_dict(), timeout=30
        )
        if response.ok:
            break
        logger.warning(
            "Onboarding request failed (attempt %s): %s", attempt, response.content
        )
        if attempt < max_attempts:
            time.sleep(1)
        else:
            response.raise_for_status()

    if not onboarding_data:
        msg = "Failed to create onboarding data for tests"
        raise RuntimeError(msg)

    return onboarding_data


def _check_response_status(response) -> None:
    if not response.ok:
        logger.warning(response.content)
    response.raise_for_status()


@pytest.fixture(scope="session", autouse=True)
def delete_team_after_tests(base_url, team):
    yield

    url = urllib.parse.urljoin(base_url, f"api/testing/teams/{team.workgroup}")
    response = requests.delete(url, timeout=30)
    _check_response_status(response)


@pytest.fixture(scope="module", autouse=True)
def reset_before_each_module(base_url, team) -> None:
    url = urllib.parse.urljoin(base_url, f"api/testing/teams/{team.workgroup}")
    response = requests.delete(url, params={"keep_itself": "true"}, timeout=30)
    _check_response_status(response)


@pytest.fixture(scope="session")
def healthcare_assistant(onboarding) -> User:
    return onboarding.users["healthcare_assistant"]


@pytest.fixture(scope="session")
def medical_secretary(onboarding) -> User:
    return onboarding.users["medical_secretary"]


@pytest.fixture(scope="session")
def prescriber(onboarding) -> User:
    return onboarding.users["prescriber"]


@pytest.fixture(scope="session")
def clinics(onboarding) -> list[Clinic]:
    return onboarding.clinics


@pytest.fixture(scope="session")
def nurse(onboarding) -> User:
    return onboarding.users["nurse"]


@pytest.fixture(scope="session")
def schools(onboarding) -> dict[str, list[School]]:
    return onboarding.schools


@pytest.fixture(scope="session")
def superuser(onboarding) -> User:
    return onboarding.users["superuser"]


@pytest.fixture(scope="session")
def organisation(onboarding) -> Organisation:
    return onboarding.organisation


@pytest.fixture(scope="session")
def subteam(onboarding) -> Subteam:
    return onboarding.subteam


@pytest.fixture(scope="session")
def team(onboarding) -> Team:
    return onboarding.team


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
        programme.group: _generate_children(2, year_groups[programme.group])
        for programme in Programme
    }


def _read_imms_api_credentials() -> dict[str, str]:
    return {
        "pem": os.environ["IMMS_API_PEM"],
        "key": os.environ["IMMS_API_KEY"],
        "kid": os.environ["IMMS_API_KID"],
        "url": os.environ["IMMS_BASE_URL"],
    }


def _get_jwt_payload(api_auth: dict[str, str]) -> str:
    _kid = api_auth["kid"]
    _api_key = api_auth["key"]
    _decoded_pem = base64.b64decode(api_auth["pem"])
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
    return jwt.encode(
        payload=claims,
        key=_decoded_pem,
        algorithm="RS512",
        headers=headers,
    )


@pytest.fixture(scope="session", autouse=False)
def authenticate_api():
    _api_auth: dict[str, str] = _read_imms_api_credentials()
    _endpoint = urllib.parse.urljoin(_api_auth["url"], "oauth2-mock/token")
    _payload = {
        "grant_type": "client_credentials",
        "client_assertion_type": "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",  # noqa: E501
        "client_assertion": _get_jwt_payload(api_auth=_api_auth),
    }
    _headers = {"Content-Type": "application/x-www-form-urlencoded"}

    response = requests.post(url=_endpoint, headers=_headers, data=_payload, timeout=30)

    _check_response_status(response=response)
    return response.json()["access_token"]


@pytest.fixture(scope="session")
def imms_base_url():
    return os.environ["IMMS_AUTH_URL"]
