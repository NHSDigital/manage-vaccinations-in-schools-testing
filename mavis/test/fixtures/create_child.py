import random
import urllib.parse

import httpx
import pytest

from mavis.test.constants import ALL_YEAR_GROUPS, Programme
from mavis.test.data_models import Child, School, Team


def create_patient(base_url: str, child: Child, school_id: int) -> Child:
    url = urllib.parse.urljoin(base_url, "/api/testing/patients")
    data = {
        "given_name": child.first_name,
        "family_name": child.last_name,
        "date_of_birth": child.date_of_birth.isoformat(),
        "nhs_number": child.nhs_number,
        "address_line_1": child.address[0],
        "address_line_2": child.address[1],
        "address_town": child.address[2],
        "address_postcode": child.address[3],
        "school_id": school_id,
    }
    response = httpx.post(url, json=data)
    response.raise_for_status()
    return child


def link_location_to_workgroup_teams(
    base_url: str, workgroup: str, school_id: int
) -> None:
    url = urllib.parse.urljoin(base_url, "/api/testing/team-locations")
    data = {"workgroup": workgroup, "school_id": school_id}
    response = httpx.post(url, json=data)
    response.raise_for_status()


@pytest.fixture
def create_child(base_url):
    def _create_child(year_group: int, team: Team) -> Child:
        schools = School.get_schools_by_year_group(base_url, [year_group])
        selected_school = random.choice(schools)
        child = Child.generate(year_group=year_group)
        create_patient(base_url, child, selected_school.id)
        link_location_to_workgroup_teams(
            base_url,
            workgroup=team.workgroup,
            school_id=selected_school.id,
        )
        return child

    return _create_child


@pytest.fixture
def create_child_eligible_for_programme(create_child):
    def _create_child_eligible_for_programme(programme: Programme, team: Team) -> Child:
        year_group = random.choice(programme.year_groups)
        return create_child(year_group, team)

    return _create_child_eligible_for_programme


@pytest.fixture
def create_child_ineligible_for_programme(base_url):
    def _create_child_ineligible_for_programme(
        programme: Programme, team: Team
    ) -> Child:
        programme_years = set(programme.year_groups)
        child_years = ALL_YEAR_GROUPS.difference(programme_years)
        if not child_years:
            msg = f"No ineligible years available for programme {programme.group}"
            raise ValueError(msg)

        valid_combinations = set()
        for child_year in child_years:
            for programme_year in programme_years:
                if School.get_schools_by_year_group(
                    base_url, [child_year, programme_year]
                ):
                    valid_combinations.add((child_year, programme_year))
        if not valid_combinations:
            msg_0 = f"No school found with any ineligible year for {programme.group}"
            raise ValueError(msg_0)

        (child_year, programme_year) = random.choice(list(valid_combinations))
        schools = School.get_schools_by_year_group(
            base_url, [child_year, programme_year]
        )
        selected_school = random.choice(schools)
        child = Child.generate(year_group=child_year)
        create_patient(base_url, child, selected_school.id)
        link_location_to_workgroup_teams(
            base_url,
            workgroup=team.workgroup,
            school_id=selected_school.id,
        )
        return child

    return _create_child_ineligible_for_programme
