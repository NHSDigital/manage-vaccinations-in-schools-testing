import urllib.parse

import httpx
import pytest

from mavis.test.data_models import Child


def create_patient(base_url: str, child: Child) -> Child:
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
    }
    response = httpx.post(url, json=data)
    response.raise_for_status()
    return child


@pytest.fixture
def create_child(base_url):
    def _create_child(year_group: int) -> Child:
        child = Child.generate(year_group=year_group)
        create_patient(base_url, child)
        return child

    return _create_child
