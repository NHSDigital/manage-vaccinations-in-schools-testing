import logging
import os
import random
import time
import urllib.parse

import pytest
import requests
from faker import Faker

from mavis.test.constants import Programme
from mavis.test.data.file_generator import FileGenerator
from mavis.test.data_models import (
    Child,
    Clinic,
    Onboarding,
    Organisation,
    School,
    Subteam,
    Team,
    User,
)

logger = logging.getLogger(__name__)

onboarding_faker = Faker(locale="en_GB")
onboarding_faker.seed_instance(seed=time.time())
onboarding_faker.unique.clear()


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

    url = urllib.parse.urljoin(
        base_url, f"api/testing/teams/{team.workgroup}/locations"
    )
    response = requests.delete(url, params={"keep_base_locations": "true"}, timeout=30)
    _check_response_status(response)


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
    return Child.generate_children_in_year_group_for_each_programme_group(
        2, year_groups
    )


@pytest.fixture
def file_generator(organisation, schools, nurse, children, clinics, year_groups):
    return FileGenerator(organisation, schools, nurse, children, clinics, year_groups)
