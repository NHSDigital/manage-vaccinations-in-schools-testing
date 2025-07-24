import uuid
from datetime import datetime
import requests
import dateutil.parser
from typing import NamedTuple

from mavis.test.models import ImmsEndpoints, Child, School, VaccinationSite


class ImmsApiHelper:
    def __init__(self, token):
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
        vaccination_site: VaccinationSite,
        vaccination_time: datetime,
    ):
        GARDASIL_9_VACCINE_CODE = "33493111000001108"

        _params = {
            "_include": "Immunization:patient",
            "-immunization.target": "HPV",
            "patient.identifier": f"https://fhir.nhs.uk/Id/nhs-number|{child.nhs_number}",
        }

        response = requests.get(
            url=ImmsEndpoints.READ.to_url, headers=self.headers, params=_params
        )
        response.raise_for_status()
        imms_vaccination_record = ImmsApiVaccinationRecord.from_response(response)
        assert imms_vaccination_record is not None, "No immunization record found"

        assert imms_vaccination_record.patient_nhs_number == child.nhs_number, (
            f"Expected NHS number {child.nhs_number}, got {imms_vaccination_record.patient_nhs_number}"
        )

        assert imms_vaccination_record.vaccine_code == GARDASIL_9_VACCINE_CODE, (
            f"Expected vaccine code {GARDASIL_9_VACCINE_CODE}, got {imms_vaccination_record.vaccine_code}"
        )

        assert imms_vaccination_record.vaccination_site == vaccination_site, (
            f"Expected vaccination site code {vaccination_site}, got {imms_vaccination_record.vaccination_site}"
        )

        assert imms_vaccination_record.vaccination_location_urn == school.urn, (
            f"Expected vaccination location urn {school.urn}, got {imms_vaccination_record.vaccination_location_urn}"
        )

        tolerance_seconds = 10
        assert (
            abs(
                (
                    vaccination_time - imms_vaccination_record.vaccination_time
                ).total_seconds()
            )
            < tolerance_seconds
        ), (
            f"Expected vaccination time within {tolerance_seconds} seconds of {vaccination_time}, got {imms_vaccination_record.vaccination_time}"
        )


class ImmsApiVaccinationRecord(NamedTuple):
    patient_nhs_number: str
    vaccine_code: str
    vaccination_site: VaccinationSite
    vaccination_location_urn: str
    vaccination_time: datetime

    @classmethod
    def from_response(cls, response):
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
            vaccination_site=VaccinationSite.from_code(
                immunization["site"]["coding"][0]["code"]
            ),
            vaccination_location_urn=immunization["location"]["identifier"]["value"],
            vaccination_time=dateutil.parser.isoparse(
                immunization["occurrenceDateTime"]
            ),
        )
