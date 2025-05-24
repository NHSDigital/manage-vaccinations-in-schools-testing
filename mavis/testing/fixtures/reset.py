import os
import time
import urllib.parse

import pytest
import requests
from requests.auth import HTTPBasicAuth


@pytest.fixture(scope="session")
def reset_endpoint(base_url) -> str:
    return urllib.parse.urljoin(base_url, os.environ["RESET_ENDPOINT"])


@pytest.fixture(scope="session")
def skip_reset(pytestconfig) -> bool:
    return pytestconfig.getoption("skip_reset")


@pytest.fixture(scope="session")
def reset_environment(reset_endpoint, basic_auth, skip_reset):
    if skip_reset:

        def _reset_environment():
            pass

        return _reset_environment
    else:
        auth = HTTPBasicAuth(**basic_auth)

        def _reset_environment():
            for _ in range(3):
                response = requests.get(url=reset_endpoint, auth=auth)
                if response.ok:
                    break
                time.sleep(3)
            else:
                response.raise_for_status()

        return _reset_environment


@pytest.fixture(scope="session")
def playwright(playwright, reset_environment):
    reset_environment()
    playwright.selectors.set_test_id_attribute("data-qa")
    yield playwright
