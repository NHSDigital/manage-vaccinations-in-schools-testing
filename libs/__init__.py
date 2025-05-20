import os
import time

import requests
from dotenv import load_dotenv
from playwright.sync_api import Browser, Page

from libs.generic_constants import api_response_codes


class CurrentExecution:
    page: Page = None
    browser: Browser = None
    service_url: str = ""
    base_auth_username: str = ""
    base_auth_password: str = ""
    current_browser_name: str = ""
    headless_mode: bool = False
    session_screenshots_dir: str = ""

    capture_screenshot_flag: bool = False
    nurse_username: str = ""
    nurse_password: str = ""
    superuser_username: str = ""
    superuser_password: str = ""
    admin_username: str = ""
    admin_password: str = ""
    reset_endpoint: str = ""
    api_token: str = ""
    reset_env_before_execution: bool = False
    slow_motion: int = 0

    screenshot_sequence: int = 0
    child_list: list[str] = []
    file_record_count: int = 0
    session_id: str = ""

    @staticmethod
    def get_env_values():
        load_dotenv()
        CurrentExecution.service_url = CurrentExecution.get_env_value(
            var_name="BASE_URL"
        )
        CurrentExecution.base_auth_username = CurrentExecution.get_env_value(
            var_name="BASIC_AUTH_USERNAME"
        )
        CurrentExecution.base_auth_password = CurrentExecution.get_env_value(
            var_name="BASIC_AUTH_PASSWORD"
        )
        CurrentExecution.nurse_username = CurrentExecution.get_env_value(
            var_name="NURSE_USERNAME"
        )
        CurrentExecution.nurse_password = CurrentExecution.get_env_value(
            var_name="NURSE_PASSWORD"
        )
        CurrentExecution.superuser_username = CurrentExecution.get_env_value(
            var_name="SUPERUSER_USERNAME"
        )
        CurrentExecution.superuser_password = CurrentExecution.get_env_value(
            var_name="SUPERUSER_PASSWORD"
        )
        CurrentExecution.admin_username = CurrentExecution.get_env_value(
            var_name="ADMIN_USERNAME"
        )
        CurrentExecution.admin_password = CurrentExecution.get_env_value(
            var_name="ADMIN_PASSWORD"
        )
        CurrentExecution.headless_mode = (
            CurrentExecution.get_env_value(var_name="HEADLESS").lower() == "true"
        )
        CurrentExecution.capture_screenshot_flag = (
            CurrentExecution.get_env_value(var_name="CAPTURE_SCREENSHOTS").lower()
            == "true"
        )
        CurrentExecution.reset_endpoint = f"{CurrentExecution.service_url}{CurrentExecution.get_env_value(var_name='RESET_ENDPOINT')}"
        CurrentExecution.api_token = CurrentExecution.get_env_value(
            var_name="API_TOKEN"
        )
        CurrentExecution.reset_env_before_execution = (
            CurrentExecution.get_env_value(
                var_name="RESET_ENV_BEFORE_EXECUTION"
            ).lower()
            == "true"
        )
        CurrentExecution.slow_motion = int(
            CurrentExecution.get_env_value(var_name="SLOW_MOTION")
        )

    @staticmethod
    def reset_environment():
        _headers = {"Authorization": CurrentExecution.api_token}
        if CurrentExecution.reset_env_before_execution:
            for _ in range(3):
                _resp_code = requests.get(
                    url=CurrentExecution.reset_endpoint, headers=_headers
                ).status_code
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

    @staticmethod
    def get_env_value(var_name: str) -> str:
        _val = os.getenv(var_name)
        if _val is None:
            return ""
        else:
            return _val
