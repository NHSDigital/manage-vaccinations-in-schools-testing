from libs import CurrentExecution, playwright_ops
from libs.constants import actions, object_properties


class pg_login:
    po = playwright_ops.playwright_operations()
    ce = CurrentExecution()

    LNK_START_NOW = "Start now"
    TXT_EMAIL_ADDRESS = "Email address"
    TXT_PASSWORD = "Password"
    BTN_LOGIN = "Log in"
    BTN_LOGOUT = "Log out"
    LBL_BANNER = "banner"
    LBL_USER = "Nurse Joy"
    LBL_PARAGRAPH = "paragraph"

    def click_start(self):
        self.po.perform_action(locator=self.LNK_START_NOW, action=actions.CLICK_LINK)

    def enter_username(self, username: str):
        self.po.perform_action(locator=self.TXT_EMAIL_ADDRESS, action=actions.FILL, value=username)

    def enter_password(self, password: str):
        self.po.perform_action(locator=self.TXT_PASSWORD, action=actions.FILL, value=password)

    def click_login(self):
        self.po.perform_action(locator=self.BTN_LOGIN, action=actions.CLICK_BUTTON)

    def verify_login_successful(self):
        self.po.verify(locator=self.LBL_BANNER, property=object_properties.TEXT, value=self.LBL_USER)

    def perform_valid_login(self):
        self.click_start()
        self.enter_username(username=self.ce.login_username)
        self.enter_password(password=self.ce.login_password)
        self.click_login()
        self.verify_login_successful()

    def perform_invalid_login(self, user: str, pwd: str, expected_message: str) -> str:
        self.click_start()
        self.enter_username(username=user)
        self.enter_password(password=pwd)
        self.click_login()
        self.po.verify(locator=self.LBL_PARAGRAPH, property=object_properties.TEXT, value=expected_message, exact=True)

    def perform_logout(self):
        self.po.perform_action(locator=self.BTN_LOGOUT, action=actions.CLICK_BUTTON)

    def go_to_url(self, url: str) -> None:
        _full_url = f"{self.ce.service_url.replace("/start","")}{url}" if url.startswith("/") else url
        self.ce.page.goto(_full_url)

    def go_to_login_page(self) -> None:
        self.ce.page.goto(self.ce.service_url)
