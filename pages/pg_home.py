from libs import playwright_ops
from libs.constants import object_properties, actions


class pg_home:
    po = playwright_ops.playwright_operations()

    LNK_PROGRAMMES = "Programmes"

    def click_programmes(self, browser_page):
        self.po.perform_action(page=browser_page, locator=self.LNK_PROGRAMMES, action=actions.CLICK_LINK)
