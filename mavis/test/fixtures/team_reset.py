import logging
import urllib.parse

import pytest
import requests

logger = logging.getLogger(__name__)


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


def _check_response_status(response) -> None:
    if not response.ok:
        logger.warning(response.content)
    response.raise_for_status()
