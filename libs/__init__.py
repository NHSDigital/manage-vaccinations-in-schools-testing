import os

from dotenv import load_dotenv

from libs import api_ops


class CurrentExecution:
    page = None
    browser = None
    service_url: str = ""
    base_auth_username: str = ""
    base_auth_password: str = ""
    current_browser_name: str = ""
    headless_mode: bool = False
    session_screenshots_dir: str = ""
    screenshot_sequence: int = 0
    capture_screenshot_flag: bool = False
    nurse_username: str = ""
    nurse_password: str = ""
    superuser_username: str = ""
    superuser_password: str = ""
    parental_consent_url: str = ""
    reset_endpoint: str = ""
    api_token: str = ""

    @staticmethod
    def get_env_values():
        load_dotenv()
        CurrentExecution.service_url = os.getenv("TEST_URL")
        CurrentExecution.base_auth_username = os.getenv("TEST_USERNAME")
        CurrentExecution.base_auth_password = os.getenv("TEST_PASSWORD")
        CurrentExecution.nurse_username = os.getenv("NURSE_USERNAME")
        CurrentExecution.nurse_password = os.getenv("NURSE_PASSWORD")
        CurrentExecution.superuser_username = os.getenv("SUPERUSER_USERNAME")
        CurrentExecution.superuser_password = os.getenv("SUPERUSER_PASSWORD")
        CurrentExecution.headless_mode = os.getenv("HEADLESS").lower() == "true"
        CurrentExecution.capture_screenshot_flag = os.getenv("CAPTURE_SCREENSHOTS").lower() == "true"
        CurrentExecution.parental_consent_url = os.getenv("PARENTAL_CONSENT_URL")
        CurrentExecution.reset_endpoint = os.getenv("RESET_ENDPOINT")
        CurrentExecution.api_token = os.getenv("API_TOKEN")

    @staticmethod
    def reset_environment():
        _headers = {"Authorization": CurrentExecution.api_token}
        _ = api_ops.api_operations().api_get(endpoint=CurrentExecution.reset_endpoint, header=_headers, param=None)
