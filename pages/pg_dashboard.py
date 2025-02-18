from libs import playwright_ops
from libs.constants import (
    element_actions,
    element_properties,
    escape_characters,
    wait_time,
)
from libs.wrappers import wait


class pg_dashboard:
    po = playwright_ops.playwright_operations()

    LNK_PROGRAMMES = f"heading{escape_characters.SEPARATOR_CHAR}Programmes"
    LNK_SESSIONS = f"heading{escape_characters.SEPARATOR_CHAR}Sessions"
    LNK_CHILDREN = f"heading{escape_characters.SEPARATOR_CHAR}Children"
    LNK_VACCINES = f"heading{escape_characters.SEPARATOR_CHAR}Vaccines"
    LNK_UNMATCHED_CONSENT_RESPONSES = f"heading{escape_characters.SEPARATOR_CHAR}Unmatched consent responses"
    LNK_SCHOOL_MOVES = f"heading{escape_characters.SEPARATOR_CHAR}School moves"
    LNK_IMPORT_RECORDS = f"heading{escape_characters.SEPARATOR_CHAR}Import records"
    LNK_NOTICES = f"heading{escape_characters.SEPARATOR_CHAR}Important Notices"
    LNK_ORGANISATION = f"heading{escape_characters.SEPARATOR_CHAR}Your organisation"
    LNK_SERVICE_GUIDANCE = f"heading{escape_characters.SEPARATOR_CHAR}Service guidance"
    LNK_NHS_LOGO = "Manage vaccinations in schools"

    def click_programmes(self):
        self.po.act(locator=self.LNK_PROGRAMMES, action=element_actions.CLICK_LINK)

    def click_sessions(self):
        self.po.act(locator=self.LNK_SESSIONS, action=element_actions.CLICK_LINK)

    def click_children(self):
        self.po.act(locator=self.LNK_CHILDREN, action=element_actions.CLICK_LINK)

    def click_vaccines(self):
        self.po.act(locator=self.LNK_VACCINES, action=element_actions.CLICK_LINK)

    def click_unmatched_consent_responses(self):
        self.po.act(locator=self.LNK_UNMATCHED_CONSENT_RESPONSES, action=element_actions.CLICK_LINK)

    def click_school_moves(self):
        self.po.act(locator=self.LNK_SCHOOL_MOVES, action=element_actions.CLICK_LINK)

    def click_import_records(self):
        self.po.act(locator=self.LNK_IMPORT_RECORDS, action=element_actions.CLICK_LINK)

    def click_important_notices(self):
        self.po.act(locator=self.LNK_NOTICES, action=element_actions.CLICK_LINK)

    def click_your_organisation(self):
        self.po.act(locator=self.LNK_ORGANISATION, action=element_actions.CLICK_LINK)

    def click_service_guidance(self):
        self.po.act(locator=self.LNK_SERVICE_GUIDANCE, action=element_actions.CLICK_LINK)

    def go_to_dashboard(self):
        wait(timeout=wait_time.MIN)  # Scripts sometimes error out without this wait when called as a teardown action
        self.po.act(locator=self.LNK_NHS_LOGO, action=element_actions.CLICK_LINK)

    def verify_all_expected_links_for_nurse(self):
        self.po.verify(
            locator=self.LNK_PROGRAMMES, property=element_properties.VISIBILITY, expected_value=True, exact=True
        )
        self.po.verify(
            locator=self.LNK_SESSIONS, property=element_properties.VISIBILITY, expected_value=True, exact=True
        )
        self.po.verify(
            locator=self.LNK_CHILDREN, property=element_properties.VISIBILITY, expected_value=True, exact=True
        )
        self.po.verify(
            locator=self.LNK_VACCINES, property=element_properties.VISIBILITY, expected_value=True, exact=True
        )
        self.po.verify(
            locator=self.LNK_IMPORT_RECORDS, property=element_properties.VISIBILITY, expected_value=True, exact=True
        )
        self.po.verify(
            locator=self.LNK_UNMATCHED_CONSENT_RESPONSES,
            property=element_properties.VISIBILITY,
            expected_value=True,
            exact=True,
        )
        self.po.verify(
            locator=self.LNK_SCHOOL_MOVES, property=element_properties.VISIBILITY, expected_value=True, exact=True
        )
        self.po.verify(
            locator=self.LNK_ORGANISATION, property=element_properties.VISIBILITY, expected_value=True, exact=True
        )
        self.po.verify(
            locator=self.LNK_SERVICE_GUIDANCE, property=element_properties.VISIBILITY, expected_value=True, exact=True
        )
        self.po.verify(
            locator=self.LNK_SERVICE_GUIDANCE,
            property=element_properties.HREF,
            expected_value="https://guide.manage-vaccinations-in-schools.nhs.uk/",
            exact=True,
        )

    def verify_all_expected_links_for_superuser(self):
        self.po.verify(
            locator=self.LNK_PROGRAMMES, property=element_properties.VISIBILITY, expected_value=True, exact=True
        )
        self.po.verify(
            locator=self.LNK_SESSIONS, property=element_properties.VISIBILITY, expected_value=True, exact=True
        )
        self.po.verify(
            locator=self.LNK_CHILDREN, property=element_properties.VISIBILITY, expected_value=True, exact=True
        )
        self.po.verify(
            locator=self.LNK_VACCINES, property=element_properties.VISIBILITY, expected_value=True, exact=True
        )
        self.po.verify(
            locator=self.LNK_UNMATCHED_CONSENT_RESPONSES,
            property=element_properties.VISIBILITY,
            expected_value=True,
            exact=True,
        )
        self.po.verify(
            locator=self.LNK_SCHOOL_MOVES, property=element_properties.VISIBILITY, expected_value=True, exact=True
        )
        self.po.verify(
            locator=self.LNK_NOTICES, property=element_properties.VISIBILITY, expected_value=True, exact=True
        )  # Superuser only
        self.po.verify(
            locator=self.LNK_ORGANISATION, property=element_properties.VISIBILITY, expected_value=True, exact=True
        )
        self.po.verify(
            locator=self.LNK_SERVICE_GUIDANCE, property=element_properties.VISIBILITY, expected_value=True, exact=True
        )
        self.po.verify(
            locator=self.LNK_SERVICE_GUIDANCE,
            property=element_properties.HREF,
            expected_value="https://guide.manage-vaccinations-in-schools.nhs.uk/",
            exact=True,
        )
