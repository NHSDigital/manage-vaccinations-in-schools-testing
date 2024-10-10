from dotenv import load_dotenv
from playwright.sync_api import sync_playwright
from libs.constants import workflow_type
from libs import api_ops
import os
import time


class CurrentExecution:
    page = None
    environment = None
    base_auth_username: str = ""
    base_auth_password: str = ""
    current_browser_name: str = ""
    headless_mode: bool = False
    playwright: bool = None
    execution_start_time = None
    execution_end_time = None
    execution_duration = None
    session_screenshots_dir: str = ""
    screenshot_sequence: int = 0
    capture_screenshot_flag: bool = False
    login_username: str = ""
    login_password: str = ""
    parental_consent_url: str = ""
    reset_endpoint: str = ""
    ao = api_ops.api_operations()

    @staticmethod
    def start_test(w_type: workflow_type):
        CurrentExecution.start_page(w_type=w_type)

    @staticmethod
    def end_test():
        CurrentExecution.close_page()

    @staticmethod
    def get_env_values():
        load_dotenv()
        CurrentExecution.environment = os.getenv("TEST_URL")
        CurrentExecution.base_auth_username = os.getenv("TEST_USERNAME")
        CurrentExecution.base_auth_password = os.getenv("TEST_PASSWORD")
        CurrentExecution.login_username = os.getenv("LOGIN_USERNAME")
        CurrentExecution.login_password = os.getenv("LOGIN_PASSWORD")
        CurrentExecution.current_browser_name = os.getenv("BROWSER").lower()
        CurrentExecution.headless_mode = os.getenv("HEADLESS").lower() == "true"
        CurrentExecution.capture_screenshot_flag = os.getenv("CAPTURE_SCREENSHOTS").lower() == "true"
        CurrentExecution.parental_consent_url = os.getenv("PARENTAL_CONSENT_URL")
        CurrentExecution.reset_endpoint = os.getenv("RESET_ENDPOINT")

    @staticmethod
    def start_browser():
        CurrentExecution.playwright = sync_playwright().start()
        CurrentExecution.playwright.selectors.set_test_id_attribute("data-qa")
        match CurrentExecution.current_browser_name:
            case "chromium":
                CurrentExecution.launch_chromium()
            case "edge":
                CurrentExecution.launch_edge()
            case "firefox":
                CurrentExecution.launch_firefox()
            case _:  # Chrome for all other cases
                CurrentExecution.launch_chrome()

    @staticmethod
    def start_page(w_type: workflow_type):
        CurrentExecution.context = CurrentExecution.browser.new_context(
            http_credentials={
                "username": CurrentExecution.base_auth_username,
                "password": CurrentExecution.base_auth_password,
            }
        )
        CurrentExecution.page = CurrentExecution.context.new_page()
        match w_type.lower():
            case workflow_type.PARENTAL_CONSENT:
                CurrentExecution.page.goto(url=CurrentExecution.parental_consent_url)
            case _:
                # CurrentExecution.reset_upload_data()
                CurrentExecution.page.goto(url=CurrentExecution.environment)

    @staticmethod
    def quit_browser():
        CurrentExecution.browser.close()

    @staticmethod
    def close_page():
        CurrentExecution.page.close()

    @staticmethod
    def launch_chromium():
        try:
            CurrentExecution.browser = CurrentExecution.playwright.chromium.launch(
                headless=CurrentExecution.headless_mode, args=["--fullscreen"]
            )
        except Exception as e:
            raise AssertionError(f"Error launching Chromium: {e}")

    @staticmethod
    def launch_edge():
        try:
            CurrentExecution.browser = CurrentExecution.playwright.chromium.launch(
                channel="msedge", headless=CurrentExecution.headless_mode, args=["--fullscreen"]
            )
        except Exception as e:
            raise AssertionError(f"Error launching Edge: {e}")

    @staticmethod
    def launch_firefox():
        try:
            CurrentExecution.browser = CurrentExecution.playwright.firefox.launch(
                headless=CurrentExecution.headless_mode, args=["--fullscreen"]
            )
        except Exception as e:
            raise AssertionError(f"Error launching Firefox: {e}")

    @staticmethod
    def launch_chrome():
        try:
            CurrentExecution.browser = CurrentExecution.playwright.chromium.launch(
                channel="chrome", headless=CurrentExecution.headless_mode, args=["--fullscreen"]
            )
        except Exception as e:
            raise AssertionError(f"Error launching Chrome: {e}")

    def launch_mobile_browser(self):
        device_name = self.device_name.lower()
        try:
            if "iphone_12" == device_name:
                self.browser = self.playwright.webkit.launch(headless=self.headless_mode)
                self.context = self.browser.new_context(**self.playwright.devices["iPhone 12"])
            elif "iphone_11" == device_name:
                self.browser = self.playwright.chromium.launch(channel="chrome", headless=self.headless_mode)
                self.context = self.browser.new_context(**self.playwright.devices["iPhone 11"])
            elif "pixel_5" == device_name:
                self.browser = self.playwright.webkit.launch(headless=self.headless_mode)
                self.context = self.browser.new_context(**self.playwright.devices["Pixel 5"])
            else:
                self.browser = self.playwright.chromium.launch(channel="chromium", headless=self.headless_mode)
                self.context = self.browser.new_context(**self.playwright.devices["Galaxy S9+"])

            self.page = self.context.new_page()
        except Exception as e:
            print(f"Error launching mobile browser for {device_name}: {e}")

    @staticmethod
    def reset_upload_data():
        _ = CurrentExecution.ao.api_get(endpoint=CurrentExecution.reset_endpoint, header=None, param=None)
