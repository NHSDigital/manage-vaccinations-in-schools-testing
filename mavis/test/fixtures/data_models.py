import logging
import time

import pytest
from faker import Faker

from mavis.test.data.file_generator import FileGenerator
from mavis.test.data_models import (
    Child,
    Clinic,
    Organisation,
    PointOfCareTeam,
    School,
    Subteam,
    User,
)

logger = logging.getLogger(__name__)

onboarding_faker = Faker(locale="en_GB")
onboarding_faker.seed_instance(seed=time.time())
onboarding_faker.unique.clear()

# point of care


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
def team(onboarding) -> PointOfCareTeam:
    return onboarding.team


@pytest.fixture
def children(year_groups) -> dict[str, list[Child]]:
    return Child.generate_children_in_year_group_for_each_programme_group(
        2, year_groups
    )


@pytest.fixture
def file_generator(organisation, schools, nurse, children, clinics, year_groups):
    return FileGenerator(organisation, schools, nurse, children, clinics, year_groups)


# national reporting


@pytest.fixture(scope="session")
def national_reporting_healthcare_assistant(national_reporting_onboarding) -> User:
    return national_reporting_onboarding.users["healthcare_assistant"]


@pytest.fixture(scope="session")
def national_reporting_medical_secretary(national_reporting_onboarding) -> User:
    return national_reporting_onboarding.users["medical_secretary"]


@pytest.fixture(scope="session")
def national_reporting_prescriber(national_reporting_onboarding) -> User:
    return national_reporting_onboarding.users["prescriber"]


@pytest.fixture(scope="session")
def national_reporting_nurse(national_reporting_onboarding) -> User:
    return national_reporting_onboarding.users["nurse"]


@pytest.fixture(scope="session")
def national_reporting_superuser(national_reporting_onboarding) -> User:
    return national_reporting_onboarding.users["superuser"]


@pytest.fixture(scope="session")
def national_reporting_organisation(national_reporting_onboarding) -> Organisation:
    return national_reporting_onboarding.organisation


@pytest.fixture(scope="session")
def national_reporting_team(national_reporting_onboarding) -> PointOfCareTeam:
    return national_reporting_onboarding.team


@pytest.fixture
def national_reporting_children(year_groups) -> dict[str, list[Child]]:
    return Child.generate_children_in_year_group_for_each_programme_group(
        2, year_groups
    )


@pytest.fixture
def national_reporting_file_generator(
    national_reporting_organisation,
    schools,
    national_reporting_nurse,
    national_reporting_children,
    year_groups,
):
    return FileGenerator(
        national_reporting_organisation,
        schools,
        national_reporting_nurse,
        national_reporting_children,
        None,
        year_groups,
    )
