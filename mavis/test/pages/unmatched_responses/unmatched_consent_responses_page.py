from playwright.sync_api import Page, expect

from mavis.test.annotations import step
from mavis.test.models import Child, Relationship
from mavis.test.pages.header import HeaderComponent
from mavis.test.utils import reload_until_element_is_visible


class UnmatchedConsentResponsesPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.header = HeaderComponent(page)

        self.rows = page.get_by_role("row")
        self.empty_paragraph = page.get_by_text(
            "There are currently no unmatched consent responses.",
        )
        self.archived_alert = page.get_by_role("alert", name="Success").filter(
            has_text="archived",
        )
        self.created_alert = page.get_by_role("alert", name="Success").filter(
            has_text="created",
        )
        self.matched_alert = page.get_by_role("alert", name="Success").filter(
            has_text="matched",
        )

    @step("Click on consent response for {1}")
    def click_parent_on_consent_record_for_child(self, child: Child) -> None:
        parent_name = next(
            (p.full_name for p in child.parents if p.relationship is Relationship.DAD),
            None,
        )
        reload_until_element_is_visible(
            self.page,
            self.page.get_by_role("link", name=str(parent_name)),
        )
        self.page.get_by_role("link", name=str(parent_name)).click()

    def check_response_for_child_not_visible(self, child: Child) -> None:
        row = self.rows.filter(has=self.page.get_by_text(str(child)))
        expect(row).not_to_be_visible()
