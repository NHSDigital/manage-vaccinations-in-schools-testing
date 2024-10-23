from libs import playwright_ops
from libs.constants import actions


class pg_home:
    po = playwright_ops.playwright_operations()

    LNK_PROGRAMMES = "Programmes"
    LNK_VACCINES = "Vaccines"

    def click_programmes(self):
        self.po.perform_action(locator=self.LNK_PROGRAMMES, action=actions.CLICK_LINK)

    def click_vaccines(self):
        self.po.perform_action(locator=self.LNK_VACCINES, action=actions.CLICK_LINK)
