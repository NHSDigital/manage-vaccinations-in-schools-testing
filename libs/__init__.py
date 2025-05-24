from playwright.sync_api import Browser, Page


class CurrentExecution:
    page: Page = None
    browser: Browser = None
