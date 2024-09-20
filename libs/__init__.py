from datetime import datetime
from dotenv import load_dotenv
from playwright.sync_api import sync_playwright, Browser, expect
import os


class CurrentExecution:
    page = None

    def start_execution(self):
        self.execution_start_time = datetime.now()
        self.get_env_values()
        self.start_browser()

    def end_execution(self):
        self.execution_end_time = datetime.now()
        self.execution_duration = self.execution_end_time - self.execution_start_time
        self.quit_browser()

    def get_env_values(self):
        load_dotenv()
        self.environment = os.getenv("TEST_URL")
        self.base_auth_username = os.getenv("TEST_USERNAME")
        self.base_auth_password = os.getenv("TEST_PASSWORD")
        self.current_browser_name = os.getenv("BROWSER").lower()
        self.headless_mode = os.getenv("HEADLESS").lower() == "true"

    def start_browser(self):
        self.playwright = sync_playwright().start()
        match self.current_browser_name:
            case "chromium":
                self.launch_chromium()
            case "edge":
                self.launch_edge()
            case "safari":
                self.launch_safari()
            case "firefox":
                self.launch_firefox()
            case _:  # Chrome for all other cases
                self.launch_chrome()

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
            print(f"Error launching Chromium: {e}")

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
            print(f"Error launching Edge: {e}")

    def launch_safari(self):
        try:
            self.browser = self.playwright.webkit.launch(headless=self.headless_mode, args=["--fullscreen"])
            self.context = self.browser.new_context(
                http_credentials={"username": self.base_auth_username, "password": self.base_auth_password}
            )
            self.page = self.context.new_page()
            self.page.goto(url=self.environment)
        except Exception as e:
            print(f"Error launching Safari: {e}")

    def launch_chrome(self):
        try:
            self.browser = self.playwright.chromium.launch(
                channel="chrome", headless=self.headless_mode, args=["--fullscreen"]
            )
            self.context = self.browser.new_context(
                http_credentials={"username": self.base_auth_username, "password": self.base_auth_password}
            )
            self.page = self.context.new_page()
            self.page.goto(url=self.environment)
        except Exception as e:
            print(f"Error launching Safari: {e}")

    def launch_firefox(self):
        try:
            self.browser = self.playwright.firefox.launch(headless=self.headless_mode, args=["--fullscreen"])
            self.context = self.browser.new_context(
                http_credentials={"username": self.base_auth_username, "password": self.base_auth_password}
            )
            self.page = self.context.new_page()
            self.page.goto(url=self.environment)
        except Exception as e:
            print(f"Error launching Firefox: {e}")

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
