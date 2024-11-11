import os

from dotenv import load_dotenv
from playwright.sync_api import sync_playwright

from libs import api_ops
from libs.constants import workflow_type


class CurrentExecution:
    page = None
    environment = None
    base_auth_username: str = ""
    base_auth_password: str = ""
    current_browser_name: str = ""
    headless_mode: bool = False
    playwright: bool = None
    session_screenshots_dir: str = ""
    screenshot_sequence: int = 0
    capture_screenshot_flag: bool = False
    login_username: str = ""
    login_password: str = ""
    parental_consent_url: str = ""
    reset_endpoint: str = ""
    api_token: str = ""

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
        CurrentExecution.headless_mode = os.getenv("HEADLESS").lower() == "true"
        CurrentExecution.capture_screenshot_flag = os.getenv("CAPTURE_SCREENSHOTS").lower() == "true"
        CurrentExecution.parental_consent_url = os.getenv("PARENTAL_CONSENT_URL")
        CurrentExecution.reset_endpoint = os.getenv("RESET_ENDPOINT")
        CurrentExecution.api_token = os.getenv("API_TOKEN")

    @staticmethod
    def start_browser(browser_name: str):
        CurrentExecution.playwright = sync_playwright().start()
        CurrentExecution.playwright.selectors.set_test_id_attribute("data-qa")
        match browser_name.lower():
            case "chromium":
                CurrentExecution.launch_chromium()
            case "msedge":
                CurrentExecution.launch_edge()
            case "firefox":
                CurrentExecution.launch_firefox()
            case "chrome":  # Google Chrome for all other cases
                CurrentExecution.launch_chrome()
            case _:  # Mobile browsers
                CurrentExecution.launch_mobile_browser(device_name=browser_name)

    @staticmethod
    def start_page(w_type: workflow_type):
        CurrentExecution.page = CurrentExecution.context.new_page()
        match w_type.lower():
            case workflow_type.PARENTAL_CONSENT:
                CurrentExecution.page.goto(url=CurrentExecution.parental_consent_url)
            case _:
                CurrentExecution.reset_upload_data()
                CurrentExecution.page.goto(url=CurrentExecution.environment)

    @staticmethod
    def quit_browser():
        CurrentExecution.browser.close()

    @staticmethod
    def close_page():
        if CurrentExecution.page.get_by_role("button", name="Log out").is_visible():
            CurrentExecution.page.get_by_role("button", name="Log out").click()
        CurrentExecution.page.close()

    @staticmethod
    def launch_chromium():
        try:
            CurrentExecution.browser = CurrentExecution.playwright.chromium.launch(
                headless=CurrentExecution.headless_mode, args=["--fullscreen"]
            )
            CurrentExecution.context = CurrentExecution.browser.new_context(
                http_credentials={
                    "username": CurrentExecution.base_auth_username,
                    "password": CurrentExecution.base_auth_password,
                }
            )
        except Exception as e:
            raise AssertionError(f"Error launching Chromium: {e}")

    @staticmethod
    def launch_edge():
        try:
            CurrentExecution.browser = CurrentExecution.playwright.chromium.launch(
                channel="msedge", headless=CurrentExecution.headless_mode, args=["--fullscreen"]
            )
            CurrentExecution.context = CurrentExecution.browser.new_context(
                http_credentials={
                    "username": CurrentExecution.base_auth_username,
                    "password": CurrentExecution.base_auth_password,
                }
            )

        except Exception as e:
            raise AssertionError(f"Error launching Edge: {e}")

    @staticmethod
    def launch_firefox():
        try:
            CurrentExecution.browser = CurrentExecution.playwright.firefox.launch(
                headless=CurrentExecution.headless_mode, args=["--fullscreen"]
            )
            CurrentExecution.context = CurrentExecution.browser.new_context(
                http_credentials={
                    "username": CurrentExecution.base_auth_username,
                    "password": CurrentExecution.base_auth_password,
                }
            )

        except Exception as e:
            raise AssertionError(f"Error launching Firefox: {e}")

    @staticmethod
    def launch_chrome():
        try:
            CurrentExecution.browser = CurrentExecution.playwright.chromium.launch(
                channel="chrome", headless=CurrentExecution.headless_mode, args=["--fullscreen"]
            )
            CurrentExecution.context = CurrentExecution.browser.new_context(
                http_credentials={
                    "username": CurrentExecution.base_auth_username,
                    "password": CurrentExecution.base_auth_password,
                }
            )

        except Exception as e:
            raise AssertionError(f"Error launching Chrome: {e}")

    @staticmethod
    def launch_mobile_browser(device_name: str):
        _http_credentials = {
            "username": CurrentExecution.base_auth_username,
            "password": CurrentExecution.base_auth_password,
        }
        try:
            match device_name.lower():
                case "iphone_12":
                    CurrentExecution.browser = CurrentExecution.playwright.webkit.launch(
                        headless=CurrentExecution.headless_mode
                    )
                    CurrentExecution.context = CurrentExecution.browser.new_context(
                        **CurrentExecution.playwright.devices["iPhone 12"], http_credentials=_http_credentials
                    )
                case "iphone_11":
                    CurrentExecution.browser = CurrentExecution.playwright.chromium.launch(
                        channel="chrome", headless=CurrentExecution.headless_mode
                    )
                    CurrentExecution.context = CurrentExecution.browser.new_context(
                        **CurrentExecution.playwright.devices["iPhone 11"], http_credentials=_http_credentials
                    )
                case "pixel_5":
                    CurrentExecution.browser = CurrentExecution.playwright.webkit.launch(
                        headless=CurrentExecution.headless_mode
                    )
                    CurrentExecution.context = CurrentExecution.browser.new_context(
                        **CurrentExecution.playwright.devices["Pixel 5"], http_credentials=_http_credentials
                    )
                case _:
                    CurrentExecution.browser = CurrentExecution.playwright.chromium.launch(
                        channel="chromium", headless=CurrentExecution.headless_mode
                    )
                    CurrentExecution.context = CurrentExecution.browser.new_context(
                        **CurrentExecution.playwright.devices["Galaxy S9+"], http_credentials=_http_credentials
                    )
        except Exception as e:
            raise AssertionError(f"Error launching device browser {device_name}: {e}")

    @staticmethod
    def reset_upload_data():
        _headers = {"Authorization": CurrentExecution.api_token}
        # _ = api_ops.api_operations().api_get(endpoint=CurrentExecution.reset_endpoint, header=_headers, param=None)
