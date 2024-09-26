from libs import playwright_ops
from libs.constants import object_properties, actions
from libs import CurrentExecution


class login:
    po = playwright_ops.playwright_operations()
    ce = CurrentExecution()

    LNK_START_NOW = "Start now"
    TXT_EMAIL_ADDRESS = "Email address"
    TXT_PASSWORD = "Password"
    BTN_LOGIN = "Log in"
    LBL_BANNER = "banner"
    LBL_USER = "Nurse Joy"

    def perform_login(self, browser_page):
        self.po.perform_action(page=browser_page, locator=self.LNK_START_NOW, action=actions.CLICK_LINK)
        self.po.perform_action(
            page=browser_page, locator=self.TXT_EMAIL_ADDRESS, action=actions.FILL, value=self.ce.login_username
        )
        self.po.perform_action(
            page=browser_page, locator=self.TXT_PASSWORD, action=actions.FILL, value=self.ce.login_password
        )
        self.po.perform_action(page=browser_page, locator=self.BTN_LOGIN, action=actions.CLICK_BUTTON)
        self.verify_login_successful(browser_page=browser_page)

    def verify_login_successful(self, browser_page):
        self.po.verify(page=browser_page, locator=self.LBL_BANNER, property=object_properties.TEXT, value=self.LBL_USER)
