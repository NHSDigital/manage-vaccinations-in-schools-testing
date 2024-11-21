from libs import playwright_ops
from libs.constants import actions, escape_characters, object_properties, wait_time
from libs.wrappers import wait


class pg_dashboard:
    po = playwright_ops.playwright_operations()

    LNK_PROGRAMMES = f"heading{escape_characters.SEPARATOR}Programmes"
    LNK_VACCINES = f"heading{escape_characters.SEPARATOR}Vaccines"
    LNK_SESSIONS = f"heading{escape_characters.SEPARATOR}Sessions"
    LNK_CHILDREN = f"heading{escape_characters.SEPARATOR}Children"
    LNK_NOTICES = f"heading{escape_characters.SEPARATOR}Important Notices"
    LNK_ORGANISATION = f"heading{escape_characters.SEPARATOR}Your organisation"
    LNK_DASHBOARD = "Manage vaccinations in schools"

    def click_programmes(self):
        self.po.perform_action(locator=self.LNK_PROGRAMMES, action=actions.CLICK_LINK)

    def click_vaccines(self):
        self.po.perform_action(locator=self.LNK_VACCINES, action=actions.CLICK_LINK)

    def click_sessions(self):
        self.po.perform_action(locator=self.LNK_SESSIONS, action=actions.CLICK_LINK)

    def click_children(self):
        self.po.perform_action(locator=self.LNK_CHILDREN, action=actions.CLICK_LINK)

    def click_important_notices(self):
        self.po.perform_action(locator=self.LNK_NOTICES, action=actions.CLICK_LINK)

    def click_your_organisation(self):
        self.po.perform_action(locator=self.LNK_ORGANISATION, action=actions.CLICK_LINK)

    def go_to_dashboard(self):
        wait(timeout=wait_time.MIN)  # Scripts sometimes error out without this wait when called as a teardown action
        self.po.perform_action(locator=self.LNK_DASHBOARD, action=actions.CLICK_LINK)

    def verify_all_expected_links(self):
        self.po.verify(locator=self.LNK_PROGRAMMES, property=object_properties.VISIBILITY, value=True, exact=True)
        self.po.verify(locator=self.LNK_VACCINES, property=object_properties.VISIBILITY, value=True, exact=True)
        self.po.verify(locator=self.LNK_SESSIONS, property=object_properties.VISIBILITY, value=True, exact=True)
        self.po.verify(locator=self.LNK_CHILDREN, property=object_properties.VISIBILITY, value=True, exact=True)
        self.po.verify(locator=self.LNK_NOTICES, property=object_properties.VISIBILITY, value=True, exact=True)
        self.po.verify(
            locator=self.LNK_ORGANISATION,
            property=object_properties.VISIBILITY,
            value=True,
            exact=True,
        )
