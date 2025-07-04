import json
import urllib
import urllib.parse
import uuid

import requests

from mavis.test.models import ImmsEndpoints


class imms_api_helper:
    def __init__(self, token):
        self.header = {
            "accept": "application/fhir+json",
            "content-type": "application/x-www-form-urlencoded",
            "x-correlation-id": str(uuid.uuid4()),
            "x-request-id": str(uuid.uuid4()),
            "Authorization": f"Bearer {token}",
        }

    def _make_url(self, endpoint: ImmsEndpoints):
        return urllib.parse.urljoin()

    def _search_get_with_params(self, params: dict):
        return requests.get(
            endpoint=ImmsEndpoints.SEARCH, header=self.header(), param=params
        )

    def _search_post_with_payload(self, payload: dict):
        return requests.post(
            endpoint=ImmsEndpoints.SEARCH,
            header=self.header(),
            payload=payload,
            param=None,
        )

    def search_with_both_methods(self, params: dict):
        _resp1 = self._search_get_with_params(params=params)
        _resp2 = self._search_post_with_payload(payload=params)
        _json1 = json.loads(_resp1.text)
        _json2 = json.loads(_resp2.text)
        assert _json1 == _json2, (
            f"Responses from param search and payload search do not match {_json1} and {_json2}."
        )
