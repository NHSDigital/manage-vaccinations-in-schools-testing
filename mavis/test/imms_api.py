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
        max_attempts = 5
        for attempt in range(max_attempts):
            try:
                imms_vaccination_record = self._get_hpv_imms_api_record_for_child(child)
                self.check_record_has_expected_fields(
                    child,
                    school,
                    delivery_site,
                    vaccination_time,
                    imms_vaccination_record,
                )
                break  # Success, exit loop
            except AssertionError:
                if attempt == max_attempts - 1:
                    raise
                time.sleep(3)

    def check_record_has_expected_fields(
        self,
        child: Child,
        school: School,
        delivery_site: DeliverySite,
        vaccination_time: datetime,
        imms_vaccination_record: ImmsApiVaccinationRecord | None,
    ) -> None:
        if imms_vaccination_record is None:
            msg = "No immunization record found"
            raise AssertionError(msg)

        self._raise_error_if_not_equal(
            imms_vaccination_record.patient_nhs_number, child.nhs_number, "NHS number"
        )

        gardasil_9_vaccine_code = "33493111000001108"
        self._raise_error_if_not_equal(
            imms_vaccination_record.vaccine_code,
            gardasil_9_vaccine_code,
            "Vaccine code",
        )

        self._raise_error_if_not_equal(
            imms_vaccination_record.delivery_site, delivery_site, "Vaccination site"
        )

        self._raise_error_if_not_equal(
            imms_vaccination_record.vaccination_location_urn,
            school.urn,
            "Vaccination location urn",
        )

        self._raise_error_if_time_not_within_tolerance(
            vaccination_time,
            imms_vaccination_record.vaccination_time,
            tolerance_seconds=10,
        )

    def _raise_error_if_not_equal(
        self, actual: object, expected: object, message: str
    ) -> None:
        if actual != expected:
            msg = f"{message}: expected '{expected}', got '{actual}'"
            raise AssertionError(msg)

    def _raise_error_if_time_not_within_tolerance(
        self, actual: datetime, expected: datetime, tolerance_seconds: int
    ) -> None:
        if abs(actual - expected).total_seconds() >= tolerance_seconds:
            msg = (
                f"Vaccination time: expected within {tolerance_seconds} seconds ",
                f"of {expected}, got {actual}",
            )
            raise AssertionError(msg)

    def check_hpv_record_is_not_in_imms_api(
        self,
        child: Child,
    ) -> None:
        max_attempts = 5
        for attempt in range(max_attempts):
            imms_vaccination_record = self._get_hpv_imms_api_record_for_child(child)
            if imms_vaccination_record is None:
                break
            if attempt == max_attempts - 1:
                msg = f"Immunization record still found for {child.nhs_number}"
                raise AssertionError(msg)
            time.sleep(3)

    def _get_hpv_imms_api_record_for_child(
        self,
        child: Child,
    ) -> ImmsApiVaccinationRecord | None:
        _params = {
            "_include": "Immunization:patient",
            "-immunization.target": "HPV",
            "patient.identifier": f"https://fhir.nhs.uk/Id/nhs-number|{child.nhs_number}",
        }

        response = requests.get(
            url=ImmsEndpoints.READ.to_url,
            headers=self.headers,
            params=_params,
            timeout=30,
        )
        response.raise_for_status()

        return ImmsApiVaccinationRecord.from_response(response)
