import os

from dotenv import load_dotenv
from playwright.sync_api import Browser, Page


class CurrentExecution:
    page: Page = None
    browser: Browser = None
    session_screenshots_dir: str = ""

    capture_screenshot_flag: bool = False
    nurse_username: str = ""
    nurse_password: str = ""
    superuser_username: str = ""
    superuser_password: str = ""
    admin_username: str = ""
    admin_password: str = ""

    screenshot_sequence: int = 0
    child_list: list[str] = []
    file_record_count: int = 0
    session_id: str = ""

    @staticmethod
    def get_env_values():
        load_dotenv()

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
        CurrentExecution.capture_screenshot_flag = (
            CurrentExecution.get_env_value(var_name="CAPTURE_SCREENSHOTS").lower()
            == "true"
        )

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
