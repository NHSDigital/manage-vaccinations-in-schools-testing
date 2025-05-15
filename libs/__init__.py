import os
import time

import requests
from dotenv import load_dotenv

from libs.generic_constants import api_response_codes


class CurrentExecution:
    page = None
    browser = None
    service_url: str | None = ""
    base_auth_username: str | None = ""
    base_auth_password: str | None = ""
    current_browser_name: str | None = ""
    headless_mode: bool | None = False
    session_screenshots_dir: str | None = ""

    capture_screenshot_flag: bool | None = False
    nurse_username: str | None = ""
    nurse_password: str | None = ""
    superuser_username: str | None = ""
    superuser_password: str | None = ""
    admin_username: str | None = ""
    admin_password: str | None = ""
    reset_endpoint: str | None = ""
    api_token: str | None = ""
    reset_env_before_execution: bool | None = False
    slow_motion: int | None = 0

    screenshot_sequence: int = 0
    child_list: list[str] = []
    file_record_count: int = 0
    session_id: str = ""

    @staticmethod
    def get_env_values():
        load_dotenv()
        CurrentExecution.service_url = os.getenv("BASE_URL")
        CurrentExecution.base_auth_username = os.getenv("BASIC_AUTH_USERNAME")
        CurrentExecution.base_auth_password = os.getenv("BASIC_AUTH_PASSWORD")
        CurrentExecution.nurse_username = os.getenv("NURSE_USERNAME")
        CurrentExecution.nurse_password = os.getenv("NURSE_PASSWORD")
        CurrentExecution.superuser_username = os.getenv("SUPERUSER_USERNAME")
        CurrentExecution.superuser_password = os.getenv("SUPERUSER_PASSWORD")
        CurrentExecution.admin_username = os.getenv("ADMIN_USERNAME")
        CurrentExecution.admin_password = os.getenv("ADMIN_PASSWORD")
        CurrentExecution.headless_mode = os.getenv("HEADLESS", "True").lower() == "true"
        CurrentExecution.capture_screenshot_flag = os.getenv("CAPTURE_SCREENSHOTS", "True").lower() == "true"
        CurrentExecution.reset_endpoint = f"{CurrentExecution.service_url}{os.getenv('RESET_ENDPOINT')}"
        CurrentExecution.api_token = os.getenv("API_TOKEN")
        CurrentExecution.reset_env_before_execution = os.getenv("RESET_ENV_BEFORE_EXECUTION", "True").lower() == "true"
        CurrentExecution.slow_motion = int(os.getenv("SLOW_MOTION", 0))

    @staticmethod
    def reset_environment():
        _headers = {"Authorization": CurrentExecution.api_token}
        if CurrentExecution.reset_env_before_execution:
            for _ in range(3):
                _resp_code = requests.get(url=CurrentExecution.reset_endpoint, headers=_headers).status_code
                if (
                    api_response_codes.SUCCESS_STATUS_CODE_MIN
                    <= _resp_code
                    <= api_response_codes.SUCCESS_STATUS_CODE_MAX
                ):
                    break
                time.sleep(3)
            else:
                raise AssertionError(f"Reset endpoint failed with code: {_resp_code}")

    @staticmethod
    def set_file_record_count(record_count: int):
        CurrentExecution.file_record_count = record_count

    @staticmethod
    def get_file_record_count() -> int:
        return CurrentExecution.file_record_count

    @staticmethod
    def set_session_id(session_id: str):
        CurrentExecution.session_id = session_id

    @staticmethod
    def get_session_id() -> str:
        return CurrentExecution.session_id
