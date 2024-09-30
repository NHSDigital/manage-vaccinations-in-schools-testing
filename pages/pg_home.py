from libs import playwright_ops
from libs.constants import object_properties, actions


class pg_home:
    po = playwright_ops.playwright_operations()

    LNK_PROGRAMMES = "Programmes"

    def click_programmes(self):
        self.po.perform_action(locator=self.LNK_PROGRAMMES, action=actions.CLICK_LINK)
