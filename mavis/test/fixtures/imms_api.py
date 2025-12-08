import base64
import logging
import os
import time
import urllib.parse
import uuid

import jwt
import pytest
import requests

logger = logging.getLogger(__name__)


@pytest.fixture(scope="session", autouse=False)
def authenticate_api():
    _api_auth: dict[str, str] = _read_imms_api_credentials()
    _endpoint = urllib.parse.urljoin(_api_auth["url"], "oauth2-mock/token")
    _payload = {
        "grant_type": "client_credentials",
        "client_assertion_type": "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",  # noqa: E501
        "client_assertion": _get_jwt_payload(api_auth=_api_auth),
    }
    _headers = {"Content-Type": "application/x-www-form-urlencoded"}

    response = requests.post(url=_endpoint, headers=_headers, data=_payload, timeout=30)

    if not response.ok:
        logger.warning(response.content)
    response.raise_for_status()

    return response.json()["access_token"]


def _read_imms_api_credentials() -> dict[str, str]:
    return {
        "pem": os.environ["IMMS_API_PEM"],
        "key": os.environ["IMMS_API_KEY"],
        "kid": os.environ["IMMS_API_KID"],
        "url": os.environ["IMMS_BASE_URL"],
    }


def _get_jwt_payload(api_auth: dict[str, str]) -> str:
    _kid = api_auth["kid"]
    _api_key = api_auth["key"]
    _decoded_pem = base64.b64decode(api_auth["pem"])
    _auth_endpoint = urllib.parse.urljoin(api_auth["url"], "oauth2-mock/token")
    headers = {
        "alg": "RS512",
        "typ": "JWT",
        "kid": _kid,
    }
    claims = {
        "sub": _api_key,
        "iss": _api_key,
        "jti": str(uuid.uuid4()),
        "aud": _auth_endpoint,
        "exp": int(time.time()) + 300,  # 5mins in the future
    }
    return jwt.encode(
        payload=claims,
        key=_decoded_pem,
        algorithm="RS512",
        headers=headers,
    )
