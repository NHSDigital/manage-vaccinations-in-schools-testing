import logging
import time

import pytest
from faker import Faker

from mavis.test.data.file_generator import FileGenerator
from mavis.test.data_models import (
    Child,
    Clinic,
    NationalReportingTeam,
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


@pytest.fixture
def children(year_groups) -> dict[str, list[Child]]:
    return Child.generate_children_in_year_group_for_each_programme_group(
        2, year_groups
    )


@pytest.fixture(scope="session")
def schools(point_of_care_onboarding) -> dict[str, list[School]]:
    # schools are retrieved during point of care onboarding
    # but are also used to generate national reporting files
    return point_of_care_onboarding.schools


# point of care only


@pytest.fixture(scope="session")
def point_of_care_healthcare_assistant(point_of_care_onboarding) -> User:
    return point_of_care_onboarding.users["healthcare_assistant"]


@pytest.fixture(scope="session")
def point_of_care_medical_secretary(point_of_care_onboarding) -> User:
    return point_of_care_onboarding.users["medical_secretary"]


@pytest.fixture(scope="session")
def point_of_care_prescriber(point_of_care_onboarding) -> User:
    return point_of_care_onboarding.users["prescriber"]


@pytest.fixture(scope="session")
def point_of_care_clinics(point_of_care_onboarding) -> list[Clinic]:
    return point_of_care_onboarding.clinics


@pytest.fixture(scope="session")
def point_of_care_nurse(point_of_care_onboarding) -> User:
    return point_of_care_onboarding.users["nurse"]


@pytest.fixture(scope="session")
def point_of_care_superuser(point_of_care_onboarding) -> User:
    return point_of_care_onboarding.users["superuser"]


@pytest.fixture(scope="session")
def point_of_care_organisation(point_of_care_onboarding) -> Organisation:
    return point_of_care_onboarding.organisation


@pytest.fixture(scope="session")
def point_of_care_subteam(point_of_care_onboarding) -> Subteam:
    return point_of_care_onboarding.subteam


@pytest.fixture(scope="session")
def point_of_care_team(point_of_care_onboarding) -> PointOfCareTeam:
    return point_of_care_onboarding.team


@pytest.fixture
def point_of_care_file_generator(
    point_of_care_organisation,
    schools,
    point_of_care_nurse,
    children,
    point_of_care_clinics,
    year_groups,
):
    return FileGenerator(
        point_of_care_organisation,
        schools,
        point_of_care_nurse,
        children,
        point_of_care_clinics,
        year_groups,
    )


# national reporting only


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
def national_reporting_team(national_reporting_onboarding) -> NationalReportingTeam:
    return national_reporting_onboarding.team


@pytest.fixture
def national_reporting_file_generator(
    national_reporting_organisation,
    schools,
    national_reporting_nurse,
    children,
    year_groups,
):
    return FileGenerator(
        national_reporting_organisation,
        schools,
        national_reporting_nurse,
        children,
        None,
        year_groups,
    )
