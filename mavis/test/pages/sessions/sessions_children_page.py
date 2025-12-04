from playwright.sync_api import Locator, Page, expect

from mavis.test.annotations import step
from mavis.test.models import (
    Child,
    ConsentOption,
)
from mavis.test.pages.header import HeaderComponent
from mavis.test.pages.sessions.search_component import SearchComponent
from mavis.test.pages.sessions.sessions_tabs import SessionsTabs
from mavis.test.utils import (
    reload_until_element_is_visible,
)


class SessionsChildrenPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.tabs = SessionsTabs(page)
        self.search = SearchComponent(page)
        self.header = HeaderComponent(page)

        self.needs_consent_radio = self.page.get_by_role(
            "radio",
            name="Needs consent",
        )
        self.has_a_refusal_radio = self.page.get_by_role(
            "radio",
            name="Has a refusal",
        )
        self.parent_refused_checkbox = self.page.get_by_role(
            "checkbox",
            name="Parent refused",
        )
        self.due_vaccination_radio = self.page.get_by_role(
            "radio",
            name="Due vaccination",
        )
        self.conflicting_consent_checkbox = self.page.get_by_role(
            "checkbox",
            name="Conflicting consent",
        )

    @step("Select Needs consent")
    def select_needs_consent(self) -> None:
        self.needs_consent_radio.check()

    @step("Select Has a refusal")
    def select_has_a_refusal(self) -> None:
        self.has_a_refusal_radio.check()

    @step("Select Parent refused")
    def select_parent_refused(self) -> None:
        self.parent_refused_checkbox.check()

    @step("Select Due vaccination")
    def select_due_vaccination(self) -> None:
        self.due_vaccination_radio.check()

    @step("Select Conflicting consent")
    def select_conflicting_consent(self) -> None:
        self.conflicting_consent_checkbox.check()

    def verify_child_shows_correct_flu_consent_method(
        self,
        child: Child,
        option: ConsentOption,
    ) -> None:
        flu_consent_section = self.get_flu_consent_status_locator_from_search(child)

        expect(flu_consent_section).to_contain_text("Due vaccination")
        if option is ConsentOption.INJECTION:
            method_locator = flu_consent_section.get_by_text("injection")
        else:
            method_locator = flu_consent_section.get_by_text("nasal spray")

        reload_until_element_is_visible(self.page, method_locator)

    def get_flu_consent_status_locator_from_search(self, child: Child) -> Locator:
        child_locator = self.search.get_patient_card_locator(child)
        flu_consent_section = child_locator.locator("p:has-text('Flu')")
        reload_until_element_is_visible(self.page, flu_consent_section)

        return flu_consent_section

    @step("Expect Has a refusal to be selected")
    def expect_has_a_refusal_to_be_selected(self) -> None:
        expect(self.has_a_refusal_radio).to_be_checked()
