from typing import Final

from libs import CurrentExecution, playwright_ops
from libs.generic_constants import element_properties, framework_actions


class pg_login:
    po = playwright_ops.playwright_operations()
    ce = CurrentExecution()

    LNK_START_NOW: Final[str] = "Start now"
    TXT_EMAIL_ADDRESS: Final[str] = "Email address"
    TXT_PASSWORD: Final[str] = "Password"
    BTN_LOGIN: Final[str] = "Log in"
    BTN_LOGOUT: Final[str] = "Log out"
    LBL_BANNER: Final[str] = "banner"
    LBL_NURSE: Final[str] = "JOY, Nurse"
    BTN_NURSE_ROLE: Final[str] = "SAIS Organisation 1 (R1L)"
    BTN_SUPERUSER_ROLE: Final[str] = "SAIS Organisation 1 (R1L)"
    LBL_SUPERUSER: Final[str] = "SUPERUSER, Superuser"
    LBL_PARAGRAPH: Final[str] = "paragraph"

    def login_as_nurse(self):
        self.__login_actions(username=self.ce.nurse_username, password=self.ce.nurse_password)
        self.po.act(locator=self.BTN_NURSE_ROLE, action=framework_actions.CLICK_BUTTON)
        self.verify_login(is_successful_login=True, verify_text=self.LBL_NURSE)

    def login_as_superuser(self):
        self.__login_actions(username=self.ce.superuser_username, password=self.ce.superuser_password)
        self.po.act(locator=self.BTN_SUPERUSER_ROLE, action=framework_actions.CLICK_BUTTON)
        self.verify_login(is_successful_login=True, verify_text=self.LBL_SUPERUSER)

    def try_invalid_login(self, user: str, pwd: str, expected_message: str) -> str:
        self.__login_actions(username=user, password=pwd)
        self.verify_login(is_successful_login=False, verify_text=expected_message)

    def logout_of_mavis(self):
        self.po.act(locator=self.BTN_LOGOUT, action=framework_actions.CLICK_BUTTON)

    def verify_login(self, is_successful_login: bool, verify_text: str):
        _locator = self.LBL_BANNER if is_successful_login else self.LBL_PARAGRAPH
        self.po.verify(locator=_locator, property=element_properties.TEXT, expected_value=verify_text)

    def __login_actions(self, username: str, password: str) -> None:
        self.po.act(locator=self.LNK_START_NOW, action=framework_actions.CLICK_LINK)
        self.po.act(locator=self.TXT_EMAIL_ADDRESS, action=framework_actions.FILL, value=username)
        self.po.act(locator=self.TXT_PASSWORD, action=framework_actions.FILL, value=password)
        self.po.act(locator=self.BTN_LOGIN, action=framework_actions.CLICK_BUTTON)

    def go_to_login_page(self) -> None:
        self.ce.page.goto(self.ce.service_url)
