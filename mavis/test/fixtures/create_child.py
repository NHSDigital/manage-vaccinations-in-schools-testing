import random
import urllib.parse

import httpx
import pytest

from mavis.test.data_models import Child, School


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

@pytest.fixture
def create_child(base_url):
    def _create_child(year_group: int) -> Child:
        schools = School.get_schools_by_year_group(base_url, [year_group])
        selected_school = random.choice(schools)
        child = Child.generate(year_group=year_group)
        create_patient(base_url, child, selected_school.id)
        return child

    return _create_child
