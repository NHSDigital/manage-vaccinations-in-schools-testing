from typing import Final

from libs.generic_constants import actions, properties
from libs.mavis_constants import test_data_values
from libs.playwright_ops import PlaywrightOperations


class LoginPage:
    LNK_START_NOW: Final[str] = "Start now"
    TXT_EMAIL_ADDRESS: Final[str] = "Email address"
    TXT_PASSWORD: Final[str] = "Password"
    BTN_LOGIN: Final[str] = "Log in"
    BTN_LOGOUT: Final[str] = "Log out"
    LBL_BANNER: Final[str] = "banner"
    BTN_ROLE: Final[str] = f"SAIS Organisation 1 ({test_data_values.ORG_CODE})"
    LBL_PARAGRAPH: Final[str] = "paragraph"

    def __init__(self, playwright_operations: PlaywrightOperations):
        self.po = playwright_operations

    def log_in(self, username: str, password: str):
        self.__login_actions(username=username, password=password)
        self.po.act(locator=self.BTN_ROLE, action=actions.CLICK_BUTTON)
        self.verify_login(is_successful_login=True, verify_text=self.BTN_LOGOUT)

    def log_out(self):
        self.po.act(locator=self.BTN_LOGOUT, action=actions.CLICK_BUTTON)

    def try_invalid_login(self, user: str, pwd: str, expected_message: str):
        self.__login_actions(username=user, password=pwd)
        self.verify_login(is_successful_login=False, verify_text=expected_message)

    def verify_login(self, is_successful_login: bool, verify_text: str):
        locator = self.LBL_BANNER if is_successful_login else self.LBL_PARAGRAPH
        self.po.verify(
            locator=locator, property=properties.TEXT, expected_value=verify_text
        )

    def __login_actions(self, username: str, password: str) -> None:
        self.po.act(locator=self.LNK_START_NOW, action=actions.CLICK_LINK)
        self.po.act(locator=self.TXT_EMAIL_ADDRESS, action=actions.FILL, value=username)
        self.po.act(locator=self.TXT_PASSWORD, action=actions.FILL, value=password)
        self.po.act(locator=self.BTN_LOGIN, action=actions.CLICK_BUTTON)

    def go_to_login_page(self) -> None:
        self.po.page.goto("/")
