import time
import uuid
from datetime import datetime
from typing import NamedTuple

import dateutil.parser
import requests

from mavis.test.models import Child, DeliverySite, ImmsEndpoints, School


class ImmsApiVaccinationRecord(NamedTuple):
    patient_nhs_number: str
    vaccine_code: str
    delivery_site: DeliverySite
    vaccination_location_urn: str
    vaccination_time: datetime

    @classmethod
    def from_response(
        cls, response: requests.Response
    ) -> "ImmsApiVaccinationRecord | None":
        data = response.json()
        immunization = next(
            (
                entry["resource"]
                for entry in data.get("entry", [])
                if entry.get("resource", {}).get("resourceType") == "Immunization"
            ),
            None,
        )
        if immunization is None:
            return None

        return cls(
            patient_nhs_number=immunization["patient"]["identifier"]["value"],
            vaccine_code=immunization["vaccineCode"]["coding"][0]["code"],
            delivery_site=DeliverySite.from_code(
                immunization["site"]["coding"][0]["code"],
            ),
            vaccination_location_urn=immunization["location"]["identifier"]["value"],
            vaccination_time=dateutil.parser.isoparse(
                immunization["occurrenceDateTime"],
            ),
        )


class ImmsApiHelper:
    def __init__(self, token: str) -> None:
        self.headers = {
            "accept": "application/fhir+json",
            "content-type": "application/x-www-form-urlencoded",
            "x-correlation-id": str(uuid.uuid4()),
            "x-request-id": str(uuid.uuid4()),
            "Authorization": f"Bearer {token}",
        }

    def check_hpv_record_in_imms_api(
        self,
        child: Child,
        school: School,
        delivery_site: DeliverySite,
        vaccination_time: datetime,
    ) -> None:
        imms_vaccination_record = self._get_hpv_imms_api_record_for_child(child)

        assert imms_vaccination_record is not None, "No immunization record found"

        assert imms_vaccination_record.patient_nhs_number == child.nhs_number, (
            f"Expected NHS number {child.nhs_number}, "
            f"got {imms_vaccination_record.patient_nhs_number}"
        )

        gardasil_9_vaccine_code = "33493111000001108"
        assert imms_vaccination_record.vaccine_code == gardasil_9_vaccine_code, (
            f"Expected vaccine code {gardasil_9_vaccine_code}, "
            f"got {imms_vaccination_record.vaccine_code}"
        )

        assert imms_vaccination_record.delivery_site == delivery_site, (
            f"Expected vaccination site {delivery_site}, "
            f"got {imms_vaccination_record.delivery_site}"
        )

        assert imms_vaccination_record.vaccination_location_urn == school.urn, (
            f"Expected vaccination location urn {school.urn}, "
            f"got {imms_vaccination_record.vaccination_location_urn}"
        )

        tolerance_seconds = 10
        assert (
            abs(
                (
                    vaccination_time - imms_vaccination_record.vaccination_time
                ).total_seconds(),
            )
            < tolerance_seconds
        ), (
            f"Expected vaccination time within {tolerance_seconds} seconds of"
            f" {vaccination_time}, got {imms_vaccination_record.vaccination_time}"
        )

    def check_hpv_record_is_not_in_imms_api(
        self,
        child: Child,
    ) -> None:
        imms_vaccination_record = self._get_hpv_imms_api_record_for_child(child)

        assert imms_vaccination_record is None, (
            f"Expected no immunization record for {child.nhs_number}, "
            f"got {imms_vaccination_record}"
        )

    def _get_hpv_imms_api_record_for_child(
        self,
        child: Child,
    ) -> ImmsApiVaccinationRecord | None:
        _params = {
            "_include": "Immunization:patient",
            "-immunization.target": "HPV",
            "patient.identifier": f"https://fhir.nhs.uk/Id/nhs-number|{child.nhs_number}",
        }

        # wait 15 seconds for the API to be updated with the latest information
        time.sleep(15)

        response = requests.get(
            url=ImmsEndpoints.READ.to_url,
            headers=self.headers,
            params=_params,
            timeout=30,
        )
        response.raise_for_status()

        return ImmsApiVaccinationRecord.from_response(response)
