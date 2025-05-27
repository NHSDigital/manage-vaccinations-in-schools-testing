import os

from playwright.sync_api import Browser, Page


class CurrentExecution:
    page: Page = None
    browser: Browser = None
    session_screenshots_dir: str = ""
    capture_screenshot_flag: bool = False
    screenshot_sequence: int = 0

    @classmethod
    def get_env_values(cls):
        cls.capture_screenshot_flag = (
            os.environ.get("CAPTURE_SCREENSHOTS", "").lower() == "true"
        )
