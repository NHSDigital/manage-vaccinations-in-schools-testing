import pytest

# from tests.helpers import imms_api


@pytest.fixture(scope="session")
def helper(authenticate_api):
    # yield imms_api.imms_api_helper(authenticate_api)
    yield authenticate_api


def test_search(helper):
    # _params = {"-nhsNumber": "1234567890", "-diseaseType": "COVID19"}
    # helper.search_with_both_methods(params=_params)
    print(helper)
