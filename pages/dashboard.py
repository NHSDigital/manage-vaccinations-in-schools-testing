from libs import playwright_ops
from libs.generic_constants import actions, escape_characters, properties, wait_time


class DashboardPage:
    po = playwright_ops.playwright_operations()

    LNK_PROGRAMMES: str = f"heading{escape_characters.SEPARATOR_CHAR}Programmes"
    LNK_SESSIONS: str = f"heading{escape_characters.SEPARATOR_CHAR}Sessions"
    LNK_CHILDREN: str = f"heading{escape_characters.SEPARATOR_CHAR}Children"
    LNK_VACCINES: str = f"heading{escape_characters.SEPARATOR_CHAR}Vaccines"
    LNK_UNMATCHED_CONSENT_RESPONSES: str = (
        f"heading{escape_characters.SEPARATOR_CHAR}Unmatched consent responses"
    )
    LNK_SCHOOL_MOVES: str = f"heading{escape_characters.SEPARATOR_CHAR}School moves"
    LNK_IMPORT_RECORDS: str = f"heading{escape_characters.SEPARATOR_CHAR}Import records"
    LNK_NOTICES: str = f"heading{escape_characters.SEPARATOR_CHAR}Important Notices"
    LNK_ORGANISATION: str = (
        f"heading{escape_characters.SEPARATOR_CHAR}Your organisation"
    )
    LNK_SERVICE_GUIDANCE: str = (
        f"heading{escape_characters.SEPARATOR_CHAR}Service guidance"
    )
    LNK_NHS_LOGO: str = "Manage vaccinations in schools"

    def click_programmes(self):
        self.po.act(locator=self.LNK_PROGRAMMES, action=actions.CLICK_LINK)

    def click_sessions(self):
        self.po.act(locator=self.LNK_SESSIONS, action=actions.CLICK_LINK)

    def click_children(self):
        self.po.act(locator=self.LNK_CHILDREN, action=actions.CLICK_LINK)

    def click_vaccines(self):
        self.po.act(locator=self.LNK_VACCINES, action=actions.CLICK_LINK)

    def click_unmatched_consent_responses(self):
        self.po.act(
            locator=self.LNK_UNMATCHED_CONSENT_RESPONSES, action=actions.CLICK_LINK
        )

    def click_school_moves(self):
        self.po.act(locator=self.LNK_SCHOOL_MOVES, action=actions.CLICK_LINK)

    def click_import_records(self):
        self.po.act(locator=self.LNK_IMPORT_RECORDS, action=actions.CLICK_LINK)

    def click_important_notices(self):
        self.po.act(locator=self.LNK_NOTICES, action=actions.CLICK_LINK)

    def click_your_organisation(self):
        self.po.act(locator=self.LNK_ORGANISATION, action=actions.CLICK_LINK)

    def click_service_guidance(self):
        self.po.act(locator=self.LNK_SERVICE_GUIDANCE, action=actions.CLICK_LINK)

    def go_to_dashboard(self):
        self.po.act(
            locator=None, action=actions.WAIT, value=wait_time.MIN
        )  # Scripts sometimes error out without this wait when called as a teardown action
        self.po.act(locator=self.LNK_NHS_LOGO, action=actions.CLICK_LINK)

    def verify_all_expected_links_for_nurse(self):
        self.po.verify(
            locator=self.LNK_PROGRAMMES,
            property=properties.VISIBILITY,
            expected_value=True,
            exact=True,
        )
        self.po.verify(
            locator=self.LNK_SESSIONS,
            property=properties.VISIBILITY,
            expected_value=True,
            exact=True,
        )
        self.po.verify(
            locator=self.LNK_CHILDREN,
            property=properties.VISIBILITY,
            expected_value=True,
            exact=True,
        )
        self.po.verify(
            locator=self.LNK_VACCINES,
            property=properties.VISIBILITY,
            expected_value=True,
            exact=True,
        )
        self.po.verify(
            locator=self.LNK_IMPORT_RECORDS,
            property=properties.VISIBILITY,
            expected_value=True,
            exact=True,
        )
        self.po.verify(
            locator=self.LNK_UNMATCHED_CONSENT_RESPONSES,
            property=properties.VISIBILITY,
            expected_value=True,
            exact=True,
        )
        self.po.verify(
            locator=self.LNK_SCHOOL_MOVES,
            property=properties.VISIBILITY,
            expected_value=True,
            exact=True,
        )
        self.po.verify(
            locator=self.LNK_ORGANISATION,
            property=properties.VISIBILITY,
            expected_value=True,
            exact=True,
        )
        self.po.verify(
            locator=self.LNK_SERVICE_GUIDANCE,
            property=properties.VISIBILITY,
            expected_value=True,
            exact=True,
        )
        self.po.verify(
            locator=self.LNK_IMPORT_RECORDS,
            property=properties.VISIBILITY,
            expected_value=True,
            exact=True,
        )
        self.po.verify(
            locator=self.LNK_SERVICE_GUIDANCE,
            property=properties.HREF,
            expected_value="https://guide.manage-vaccinations-in-schools.nhs.uk/",
            exact=True,
        )

    def verify_all_expected_links_for_superuser(self):
        self.po.verify(
            locator=self.LNK_PROGRAMMES,
            property=properties.VISIBILITY,
            expected_value=True,
            exact=True,
        )
        self.po.verify(
            locator=self.LNK_SESSIONS,
            property=properties.VISIBILITY,
            expected_value=True,
            exact=True,
        )
        self.po.verify(
            locator=self.LNK_CHILDREN,
            property=properties.VISIBILITY,
            expected_value=True,
            exact=True,
        )
        self.po.verify(
            locator=self.LNK_VACCINES,
            property=properties.VISIBILITY,
            expected_value=True,
            exact=True,
        )
        self.po.verify(
            locator=self.LNK_UNMATCHED_CONSENT_RESPONSES,
            property=properties.VISIBILITY,
            expected_value=True,
            exact=True,
        )
        self.po.verify(
            locator=self.LNK_SCHOOL_MOVES,
            property=properties.VISIBILITY,
            expected_value=True,
            exact=True,
        )
        self.po.verify(
            locator=self.LNK_NOTICES,
            property=properties.VISIBILITY,
            expected_value=True,
            exact=True,
        )  # Superuser only
        self.po.verify(
            locator=self.LNK_ORGANISATION,
            property=properties.VISIBILITY,
            expected_value=True,
            exact=True,
        )
        self.po.verify(
            locator=self.LNK_IMPORT_RECORDS,
            property=properties.VISIBILITY,
            expected_value=True,
            exact=True,
        )
        self.po.verify(
            locator=self.LNK_SERVICE_GUIDANCE,
            property=properties.VISIBILITY,
            expected_value=True,
            exact=True,
        )
        self.po.verify(
            locator=self.LNK_SERVICE_GUIDANCE,
            property=properties.HREF,
            expected_value="https://guide.manage-vaccinations-in-schools.nhs.uk/",
            exact=True,
        )

    def verify_all_expected_links_for_admin(self):
        self.po.verify(
            locator=self.LNK_PROGRAMMES,
            property=properties.VISIBILITY,
            expected_value=True,
            exact=True,
        )
        self.po.verify(
            locator=self.LNK_SESSIONS,
            property=properties.VISIBILITY,
            expected_value=True,
            exact=True,
        )
        self.po.verify(
            locator=self.LNK_CHILDREN,
            property=properties.VISIBILITY,
            expected_value=True,
            exact=True,
        )
        self.po.verify(
            locator=self.LNK_VACCINES,
            property=properties.VISIBILITY,
            expected_value=True,
            exact=True,
        )
        self.po.verify(
            locator=self.LNK_UNMATCHED_CONSENT_RESPONSES,
            property=properties.VISIBILITY,
            expected_value=True,
            exact=True,
        )
        self.po.verify(
            locator=self.LNK_SCHOOL_MOVES,
            property=properties.VISIBILITY,
            expected_value=True,
            exact=True,
        )
        self.po.verify(
            locator=self.LNK_ORGANISATION,
            property=properties.VISIBILITY,
            expected_value=True,
            exact=True,
        )
        self.po.verify(
            locator=self.LNK_SERVICE_GUIDANCE,
            property=properties.VISIBILITY,
            expected_value=True,
            exact=True,
        )
        self.po.verify(
            locator=self.LNK_IMPORT_RECORDS,
            property=properties.VISIBILITY,
            expected_value=True,
            exact=True,
        )
        self.po.verify(
            locator=self.LNK_SERVICE_GUIDANCE,
            property=properties.HREF,
            expected_value="https://guide.manage-vaccinations-in-schools.nhs.uk/",
            exact=True,
        )
