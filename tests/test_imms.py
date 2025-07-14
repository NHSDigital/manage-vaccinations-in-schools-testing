import pytest

from tests.helpers import imms_api


@pytest.fixture(scope="session")
def helper(authenticate_api):
    yield imms_api.imms_api_helper(authenticate_api)
   #  yield authenticate_api


def test_search(helper):
    _params = {
        "patient.identifier": "https://fhir.nhs.uk/Id/nhs-number|9000000009",
        "-immunization.target": "FLU"
    }
    helper.search_with_both_methods(params=_params)
    print(helper)
