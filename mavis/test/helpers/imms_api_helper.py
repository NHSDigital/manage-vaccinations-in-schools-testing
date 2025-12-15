import json
import time
import uuid
from datetime import datetime
from pathlib import Path
from typing import NamedTuple

import dateutil.parser
import requests

from mavis.test.constants import DeliverySite, ImmsEndpoints, Vaccine
from mavis.test.data_models import Child, School
from mavis.test.utils import get_current_datetime


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
            delivery_site=DeliverySite.from_imms_api_code(
                immunization["site"]["coding"][0]["code"],
            ),
            vaccination_location_urn=immunization["location"]["identifier"]["value"],
            vaccination_time=dateutil.parser.isoparse(
                immunization["occurrenceDateTime"],
            ),
        )

    @classmethod
    def from_values(
        cls,
        vaccine: Vaccine,
        child: Child,
        delivery_site: DeliverySite,
        school: School,
        vaccination_time: datetime,
    ) -> "ImmsApiVaccinationRecord":
        return cls(
            patient_nhs_number=child.nhs_number,
            vaccine_code=vaccine.imms_api_code,
            delivery_site=delivery_site,
            vaccination_location_urn=school.urn,
            vaccination_time=vaccination_time,
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

    def check_record_in_imms_api(
        self,
        vaccine: Vaccine,
        child: Child,
        school: School,
        delivery_site: DeliverySite,
        vaccination_time: datetime,
    ) -> None:
        max_attempts = 20
        for attempt in range(max_attempts):
            try:
                imms_vaccination_record = self._get_imms_api_record_for_child(
                    vaccine, child
                )
                self.check_expected_and_actual_records_match(
                    ImmsApiVaccinationRecord.from_values(
                        vaccine, child, delivery_site, school, vaccination_time
                    ),
                    imms_vaccination_record,
                )
                break  # Success, exit loop
            except AssertionError:
                if attempt == max_attempts - 1:
                    raise
                time.sleep(3)

    def check_expected_and_actual_records_match(
        self,
        expected_record: ImmsApiVaccinationRecord,
        actual_record: ImmsApiVaccinationRecord | None,
    ) -> None:
        if actual_record is None:
            msg = "No immunization record found"
            raise AssertionError(msg)

        self._raise_error_if_not_equal(
            actual_record.patient_nhs_number,
            expected_record.patient_nhs_number,
            "NHS number",
        )

        self._raise_error_if_not_equal(
            actual_record.vaccine_code,
            expected_record.vaccine_code,
            "Vaccine code",
        )

        self._raise_error_if_not_equal(
            actual_record.delivery_site,
            expected_record.delivery_site,
            "Vaccination site",
        )

        self._raise_error_if_not_equal(
            actual_record.vaccination_location_urn,
            expected_record.vaccination_location_urn,
            "Vaccination location urn",
        )

        self._raise_error_if_time_not_within_tolerance(
            actual_record.vaccination_time,
            expected_record.vaccination_time,
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
                f"Vaccination time: expected within {tolerance_seconds} seconds "
                f"of {expected}, got {actual}",
            )
            raise AssertionError(msg)

    def check_record_is_not_in_imms_api(
        self,
        vaccine: Vaccine,
        child: Child,
    ) -> None:
        max_attempts = 5
        for attempt in range(max_attempts):
            imms_vaccination_record = self._get_imms_api_record_for_child(
                vaccine, child
            )
            if imms_vaccination_record is None:
                break
            if attempt == max_attempts - 1:
                msg = f"Immunization record still found for {child.nhs_number}"
                raise AssertionError(msg)
            time.sleep(3)

    def _get_imms_api_record_for_child(
        self,
        vaccine: Vaccine,
        child: Child,
    ) -> ImmsApiVaccinationRecord | None:
        _params = {
            "_include": "Immunization:patient",
            "-immunization.target": vaccine.programme.upper(),
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

    def create_vaccination_record(
        self,
        vaccine: Vaccine,
        child: Child,
        school: School,
        delivery_site: DeliverySite,
        vaccination_time: datetime,
    ) -> None:
        """Create a vaccination record in the IMMS API.

        Args:
            vaccine: The vaccine that was administered
            child: The child who received the vaccination
            school: The school where vaccination took place
            delivery_site: Anatomical site of delivery
            vaccination_time: When the vaccination occurred

        Returns:
            True if record was created successfully

        Raises:
            requests.HTTPError: If the API request fails
        """
        # Create FHIR Immunization resource payload
        immunization_payload = self._create_fhir_immunization_payload(
            vaccine=vaccine,
            child=child,
            school=school,
            delivery_site=delivery_site,
            vaccination_time=vaccination_time,
        )

        # Create headers for POST request
        create_headers = self.headers.copy()
        create_headers["content-type"] = "application/fhir+json"

        response = requests.post(
            url=ImmsEndpoints.CREATE.to_url,
            headers=create_headers,
            json=immunization_payload,
            timeout=30,
        )
        response.raise_for_status()

        # If creation was successful, verify the record exists in the API
        self.check_record_in_imms_api(
            vaccine=vaccine,
            child=child,
            school=school,
            delivery_site=delivery_site,
            vaccination_time=vaccination_time,
        )

    def _create_fhir_immunization_payload(
        self,
        vaccine: Vaccine,
        child: Child,
        school: School,
        delivery_site: DeliverySite,
        vaccination_time: datetime,
    ) -> dict:
        """Create a FHIR Immunization resource payload using FileGenerator pattern.

        This loads a FHIR R4 Immunization template and substitutes placeholders
        using the same pattern as FileGenerator for consistency.
        """
        # Load template file
        template_path = (
            Path(__file__).parent.parent
            / "data"
            / "fhir_immunization_template.json.template"
        )

        with template_path.open("r") as f:
            template_content = f.read()

        # Generate unique IDs for this immunization
        immunization_id = str(uuid.uuid4())

        # Create replacements dictionary using FileGenerator pattern
        replacements = {
            "<<IMMUNIZATION_ID>>": immunization_id,
            "<<VACCINE_CODE>>": vaccine.imms_api_code,
            "<<VACCINE_NAME>>": vaccine.name,
            "<<PATIENT_NHS_NUMBER>>": child.nhs_number,
            "<<PATIENT_FAMILY_NAME>>": child.last_name,
            "<<PATIENT_GIVEN_NAME>>": child.first_name,
            "<<PATIENT_GENDER>>": "unknown",  # Child model doesn't have gender
            "<<PATIENT_BIRTH_DATE>>": child.date_of_birth.strftime("%Y-%m-%d"),
            "<<PATIENT_POSTAL_CODE>>": child.address[3],  # postcode from address tuple
            "<<VACCINATION_TIME>>": vaccination_time.strftime(
                "%Y-%m-%dT%H:%M:%S+00:00"
            ),
            "<<RECORDED_TIME>>": get_current_datetime(),
            "<<SCHOOL_URN>>": school.urn,
            "<<DELIVERY_SITE_CODE>>": delivery_site.imms_api_code,
            "<<DELIVERY_SITE_DISPLAY>>": delivery_site.value,
            "<<TARGET_DISEASE_CODE>>": vaccine.target_disease_code,
            "<<TARGET_DISEASE_DISPLAY>>": vaccine.target_disease_display,
        }

        # Apply replacements using FileGenerator pattern
        payload_content = template_content
        for placeholder, value in replacements.items():
            payload_content = payload_content.replace(placeholder, value)

        return json.loads(payload_content)
