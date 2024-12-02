from libs import playwright_ops
from libs.constants import actions, escape_characters, object_properties, wait_time
from libs.wrappers import wait


class pg_dashboard:
    po = playwright_ops.playwright_operations()

    LNK_PROGRAMMES = f"heading{escape_characters.SEPARATOR}Programmes"
    LNK_SESSIONS = f"heading{escape_characters.SEPARATOR}Sessions"
    LNK_CHILDREN = f"heading{escape_characters.SEPARATOR}Children"
    LNK_VACCINES = f"heading{escape_characters.SEPARATOR}Vaccines"
    LNK_UNMATCHED_CONSENT_RESPONSES = f"heading{escape_characters.SEPARATOR}Unmatched consent responses"
    LNK_SCHOOL_MOVES = f"heading{escape_characters.SEPARATOR}School moves"
    LNK_NOTICES = f"heading{escape_characters.SEPARATOR}Important Notices"
    LNK_ORGANISATION = f"heading{escape_characters.SEPARATOR}Your organisation"
    LNK_SERVICE_GUIDANCE = f"heading{escape_characters.SEPARATOR}Service guidance"
    LNK_NHS_LOGO = "Manage vaccinations in schools"

    def click_programmes(self):
        self.po.perform_action(locator=self.LNK_PROGRAMMES, action=actions.CLICK_LINK)

    def click_sessions(self):
        self.po.perform_action(locator=self.LNK_SESSIONS, action=actions.CLICK_LINK)

    def click_children(self):
        self.po.perform_action(locator=self.LNK_CHILDREN, action=actions.CLICK_LINK)

    def click_vaccines(self):
        self.po.perform_action(locator=self.LNK_VACCINES, action=actions.CLICK_LINK)

    def click_unmatched_consent_responses(self):
        self.po.perform_action(locator=self.LNK_UNMATCHED_CONSENT_RESPONSES, action=actions.CLICK_LINK)

    def click_school_moves(self):
        self.po.perform_action(locator=self.LNK_SCHOOL_MOVES, action=actions.CLICK_LINK)

    def click_important_notices(self):
        self.po.perform_action(locator=self.LNK_NOTICES, action=actions.CLICK_LINK)

    def click_your_organisation(self):
        self.po.perform_action(locator=self.LNK_ORGANISATION, action=actions.CLICK_LINK)

    def click_service_guidance(self):
        self.po.perform_action(locator=self.LNK_SERVICE_GUIDANCE, action=actions.CLICK_LINK)

    def go_to_dashboard(self):
        wait(timeout=wait_time.MIN)  # Scripts sometimes error out without this wait when called as a teardown action
        self.po.perform_action(locator=self.LNK_NHS_LOGO, action=actions.CLICK_LINK)

    def verify_all_expected_links(self):
        self.po.verify(locator=self.LNK_PROGRAMMES, property=object_properties.VISIBILITY, value=True, exact=True)
        self.po.verify(locator=self.LNK_SESSIONS, property=object_properties.VISIBILITY, value=True, exact=True)
        self.po.verify(locator=self.LNK_CHILDREN, property=object_properties.VISIBILITY, value=True, exact=True)
        self.po.verify(locator=self.LNK_VACCINES, property=object_properties.VISIBILITY, value=True, exact=True)
        self.po.verify(
            locator=self.LNK_UNMATCHED_CONSENT_RESPONSES, property=object_properties.VISIBILITY, value=True, exact=True
        )
        self.po.verify(locator=self.LNK_SCHOOL_MOVES, property=object_properties.VISIBILITY, value=True, exact=True)
        self.po.verify(locator=self.LNK_NOTICES, property=object_properties.VISIBILITY, value=True, exact=True)
        self.po.verify(locator=self.LNK_ORGANISATION, property=object_properties.VISIBILITY, value=True, exact=True)
        self.po.verify(
            locator=self.LNK_SERVICE_GUIDANCE, property=object_properties.VISIBILITY, value=True, exact=True
        )
        self.po.verify(
            locator=self.LNK_SERVICE_GUIDANCE,
            property=object_properties.HREF,
            value="https://guide.manage-vaccinations-in-schools.nhs.uk/",
            exact=True,
        )
