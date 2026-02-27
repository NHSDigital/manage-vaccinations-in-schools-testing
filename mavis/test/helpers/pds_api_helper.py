import uuid

import dateutil.parser
import requests

from mavis.test.constants import PdsEndpoints
from mavis.test.data.pds import Patient


class PdsApiHelper:
    def __init__(self, token: str) -> None:
        self.headers = {
            "accept": "application/fhir+json",
            "content-type": "application/x-www-form-urlencoded",
            "x-correlation-id": str(uuid.uuid4()),
            "x-request-id": str(uuid.uuid4()),
            "Authorization": f"Bearer {token}",
        }

    def get_patient_by_nhs_number(self, nhs_number: str) -> Patient:
        response = requests.get(
            url=PdsEndpoints.GET_PATIENT_DETAILS.to_url_with_suffix(nhs_number),
            headers=self.headers,
            timeout=30,
        )
        response.raise_for_status()

        data = response.json()

        name_data = data["name"][0]
        given_name = name_data["given"][0]
        family_name = name_data["family"]
        date_of_birth = dateutil.parser.parse(data["birthDate"]).date()
        date_of_death = (
            dateutil.parser.parse(data["deceasedDateTime"]).date()
            if "deceasedDateTime" in data
            else None
        )

        if "address" not in data:
            msg = "No address in patient data"
            raise ValueError(msg)
        address = None
        for addr in data["address"]:
            if addr.get("use") == "home":
                address = addr
                break
        if address is None:
            address = data["address"][0]

        address_lines = address["line"]
        postal_code = address["postalCode"]

        while len(address_lines) < 3:
            address_lines.append("")

        return Patient(
            nhs_number=nhs_number,
            date_of_birth=date_of_birth,
            family_name=family_name,
            given_name=given_name,
            address_line_1=address_lines[0],
            address_line_2=address_lines[1],
            address_town=address_lines[2],
            address_postcode=postal_code,
            date_of_death=date_of_death,
        )
