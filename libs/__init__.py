from datetime import datetime
from dotenv import load_dotenv
from playwright.sync_api import sync_playwright
import os


class CurrentExecution:
    page = None
    environment = None
    base_auth_username=""
    base_auth_password=""
    current_browser_name=""
    headless_mode=False
    playwright=None

    def start_execution(self):
        self.execution_start_time = datetime.now()
        CurrentExecution.get_env_values()
        CurrentExecution.start_browser()

    def end_execution(self):
        self.execution_end_time = datetime.now()
        self.execution_duration = self.execution_end_time - self.execution_start_time
        CurrentExecution.quit_browser()

    @staticmethod
    def get_env_values():
        load_dotenv()
        CurrentExecution.environment = os.getenv("TEST_URL")
        CurrentExecution.base_auth_username = os.getenv("TEST_USERNAME")
        CurrentExecution.base_auth_password = os.getenv("TEST_PASSWORD")
        CurrentExecution.current_browser_name = os.getenv("BROWSER").lower()
        CurrentExecution.headless_mode = os.getenv("HEADLESS").lower() == "true"

    @staticmethod
    def start_browser():
        CurrentExecution.playwright = sync_playwright().start()
        match CurrentExecution.current_browser_name:
            case "chromium":
                CurrentExecution.launch_chromium()
            case "edge":
                CurrentExecution.launch_edge()
            case "firefox":
                CurrentExecution.launch_firefox()
            case _:  # Chrome for all other cases
                CurrentExecution.launch_chrome()

    def quit_browser(self):
        self.browser.close()

    @staticmethod
    def launch_chromium():
        try:
            CurrentExecution.browser = CurrentExecution.playwright.chromium.launch(headless=CurrentExecution.headless_mode, args=["--fullscreen"])
            CurrentExecution.context = CurrentExecution.browser.new_context(
                http_credentials={"username": CurrentExecution.base_auth_username, "password": CurrentExecution.base_auth_password}
            )
            CurrentExecution.page = CurrentExecution.context.new_page()
            CurrentExecution.page.goto(url=CurrentExecution.environment)
        except Exception as e:
            raise AssertionError(f"Error launching Chromium: {e}")

    @staticmethod
    def launch_edge():
        try:
            CurrentExecution.browser = CurrentExecution.playwright.chromium.launch(
                channel="msedge", headless=CurrentExecution.headless_mode, args=["--fullscreen"]
            )
            CurrentExecution.context = CurrentExecution.browser.new_context(
                http_credentials={"username": CurrentExecution.base_auth_username, "password": CurrentExecution.base_auth_password}
            )
            CurrentExecution.page = CurrentExecution.context.new_page()
            CurrentExecution.page.goto(url=CurrentExecution.environment)
        except Exception as e:
            raise AssertionError(f"Error launching Edge: {e}")

    @staticmethod
    def launch_firefox():
        try:
            CurrentExecution.browser = CurrentExecution.playwright.firefox.launch(headless=CurrentExecution.headless_mode, args=["--fullscreen"])
            CurrentExecution.context = CurrentExecution.browser.new_context(
                http_credentials={"username": CurrentExecution.base_auth_username, "password": CurrentExecution.base_auth_password}
            )
            CurrentExecution.page = CurrentExecution.context.new_page()
            CurrentExecution.page.goto(url=CurrentExecution.environment)
        except Exception as e:
            raise AssertionError(f"Error launching Firefox: {e}")

    @staticmethod
    def launch_chrome():
        try:
            CurrentExecution.browser = CurrentExecution.playwright.chromium.launch(
                channel="chrome", headless=CurrentExecution.headless_mode, args=["--fullscreen"]
            )
            CurrentExecution.context = CurrentExecution.browser.new_context(
                http_credentials={"username": CurrentExecution.base_auth_username, "password": CurrentExecution.base_auth_password}
            )
            CurrentExecution.page = CurrentExecution.context.new_page()
            CurrentExecution.page.goto(url=CurrentExecution.environment)
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
