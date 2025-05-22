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

    screenshot_sequence: int = 0
    child_list: list[str] = []
    file_record_count: int = 0
    session_id: str = ""

    @classmethod
    def get_env_values(cls):
        load_dotenv()

        cls.nurse_username = os.environ["NURSE_USERNAME"]
        cls.nurse_password = os.environ["NURSE_PASSWORD"]
        cls.superuser_username = os.environ["SUPERUSER_USERNAME"]
        cls.superuser_password = os.environ["SUPERUSER_PASSWORD"]
        cls.capture_screenshot_flag = (
            os.environ.get("CAPTURE_SCREENSHOTS", "").lower() == "true"
        )

    @classmethod
    def set_file_record_count(cls, record_count: int):
        cls.file_record_count = record_count

    @classmethod
    def get_file_record_count(cls) -> int:
        return cls.file_record_count

    @classmethod
    def set_session_id(cls, session_id: str):
        cls.session_id = session_id

    @classmethod
    def get_session_id(cls) -> str:
        return cls.session_id
