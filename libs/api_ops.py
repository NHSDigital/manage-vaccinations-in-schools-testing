import requests

from libs.constants import api_response_codes


class api_operations:
    @staticmethod
    def api_get(endpoint, header, param):
        if header is None and param is None:
            resp = requests.get(url=endpoint)
        elif header is not None and param is None:
            resp = requests.get(url=endpoint, headers=header)
        elif header is None and param is not None:
            resp = requests.get(url=endpoint, params=param)
        else:
            resp = requests.get(url=endpoint, params=param, headers=header)
        assert api_operations.__verify_response_code(
            resp.status_code
        ), f"API GET failed for {endpoint} - {resp.status_code}."
        return resp

    @staticmethod
    def __verify_response_code(response_code: int) -> bool:
        return (
            True
            if api_response_codes.SUCCESS_STATUS_CODE_MIN
            <= response_code
            <= api_response_codes.SUCCESS_STATUS_CODE_MAX
            else False
        )
