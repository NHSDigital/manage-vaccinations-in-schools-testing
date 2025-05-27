import os

from playwright.sync_api import Browser, Page


class CurrentExecution:
    page: Page = None
    browser: Browser = None
    session_screenshots_dir: str = ""
    capture_screenshot_flag: bool = False
    screenshot_sequence: int = 0
    file_record_count: int = 0

    @classmethod
    def get_env_values(cls):
        cls.capture_screenshot_flag = (
            os.environ.get("CAPTURE_SCREENSHOTS", "").lower() == "true"
        )

    @classmethod
    def set_file_record_count(cls, record_count: int):
        cls.file_record_count = record_count

    @classmethod
    def get_file_record_count(cls) -> int:
        return cls.file_record_count
