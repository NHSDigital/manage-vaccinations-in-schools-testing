import uuid

import requests

from mavis.test.models import ImmsEndpoints, Child


class imms_api_helper:
    def __init__(self, token):
        self.headers = {
            "accept": "application/fhir+json",
            "content-type": "application/x-www-form-urlencoded",
            "x-correlation-id": str(uuid.uuid4()),
            "x-request-id": str(uuid.uuid4()),
            "Authorization": f"Bearer {token}",
        }

    def check_hpv_record_in_imms_api(self, child: Child):
        HPV_VACCINE_CODE = "33493111000001108"

        _params = {
            "_include": "Immunization:patient",
            "-immunization.target": "COVID19,FLU,RSV,HPV",
            "patient.identifier": f"https://fhir.nhs.uk/Id/nhs-number|{child.nhs_number}",
        }

        response = requests.get(
            url=ImmsEndpoints.READ.to_url, headers=self.headers, params=_params
        )
        response.raise_for_status()
        data = response.json()

        response_nhs_number = (
            data.get("entry", [{}])[0]
            .get("resource", {})
            .get("patient", {})
            .get("identifier", {})
            .get("value")
        )

        response_vaccine_code = (
            data.get("entry", [{}])[0]
            .get("resource", {})
            .get("vaccineCode", {})
            .get("coding", [{}])[0]
            .get("code")
        )

        assert response_nhs_number == str(child.nhs_number), (
            f"Expected {child.nhs_number}, got {response_nhs_number}"
        )
        assert response_vaccine_code == HPV_VACCINE_CODE, (
            f"Expected {HPV_VACCINE_CODE}, got {response_vaccine_code}"
        )
