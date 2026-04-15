import logging
import urllib.parse

import pytest

from mavis.test.data_models import Team
from mavis.test.utils import get_logged_httpx_client

logger = logging.getLogger(__name__)


@pytest.fixture(scope="session", autouse=True)
def delete_teams_after_tests(base_url, point_of_care_team, national_reporting_team):
    yield

    _delete_team(base_url, point_of_care_team)
    _delete_team(base_url, national_reporting_team)


@pytest.fixture(scope="module", autouse=True)
def reset_before_each_module(
    base_url, point_of_care_team, national_reporting_team
) -> None:
    _delete_team(base_url, point_of_care_team, keep_itself=True)
    _delete_team_locations(base_url, point_of_care_team, keep_base_locations=True)

    _delete_team(base_url, national_reporting_team, keep_itself=True)
    _delete_team_locations(base_url, national_reporting_team, keep_base_locations=True)


def _check_response_status(response) -> None:
    if not response.is_success:
        logger.warning(response.content)
    response.raise_for_status()


def _delete_team(base_url: str, team: Team, *, keep_itself: bool = False) -> None:
    url = urllib.parse.urljoin(base_url, f"api/testing/teams/{team.workgroup}")
    params = {"keep_itself": "true"} if keep_itself else {}
    with get_logged_httpx_client(timeout=30) as client:
        response = client.delete(url, params=params)
    _check_response_status(response)


def _delete_team_locations(
    base_url: str, team: Team, *, keep_base_locations: bool = False
) -> None:
    url = urllib.parse.urljoin(
        base_url, f"api/testing/teams/{team.workgroup}/locations"
    )
    params = {"keep_base_locations": "true"} if keep_base_locations else {}
    with get_logged_httpx_client(timeout=30) as client:
        response = client.delete(url, params=params)
    _check_response_status(response)
