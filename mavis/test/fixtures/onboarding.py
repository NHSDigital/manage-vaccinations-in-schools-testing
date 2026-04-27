import random
import urllib.parse

import httpx
import pytest

from mavis.test.constants import Programme
from mavis.test.fixtures.data_models import logger
from mavis.test.onboarding import (
    NationalReportingOnboarding,
    Onboarding,
    PointOfCareOnboarding,
)
from mavis.test.utils import deliberate_sleep


@pytest.fixture(scope="session")
def year_groups() -> dict[str, int]:
    return {
        programme.group: random.choice(programme.year_groups) for programme in Programme
    }


@pytest.fixture(scope="session")
def point_of_care_onboarding(base_url, year_groups) -> PointOfCareOnboarding:
    onboarding_data = PointOfCareOnboarding.get_onboarding_data_for_tests(
        base_url=base_url,
        year_groups={k: [v] for k, v in year_groups.items()},
    )
    return _create_onboarding_with_retry(base_url, onboarding_data)


@pytest.fixture(scope="session")
def national_reporting_onboarding(base_url) -> NationalReportingOnboarding:
    onboarding_data = NationalReportingOnboarding.get_onboarding_data_for_tests()
    return _create_onboarding_with_retry(base_url, onboarding_data)


def _create_onboarding_with_retry[T: Onboarding](
    base_url: str, onboarding_data: T, max_attempts: int = 3
) -> T:
    onboarding_url = urllib.parse.urljoin(base_url, "api/testing/onboard")

    for attempt in range(1, max_attempts + 1):
        response = httpx.post(
            onboarding_url, json=onboarding_data.to_dict(), timeout=30
        )
        if response.is_success:
            return onboarding_data

        logger.warning(
            "Onboarding request failed (attempt %s): %s", attempt, response.content
        )
        if attempt < max_attempts:
            deliberate_sleep(1, "retry backoff for onboarding API")
        else:
            response.raise_for_status()

    msg = "Failed to create onboarding data for tests"
    raise RuntimeError(msg)
