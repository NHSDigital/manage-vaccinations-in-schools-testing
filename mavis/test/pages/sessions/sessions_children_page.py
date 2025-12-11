from playwright.sync_api import Locator, Page, expect

from mavis.test.annotations import step
from mavis.test.constants import (
    ConsentOption,
)
from mavis.test.data_models import Child
from mavis.test.pages.header_component import HeaderComponent
from mavis.test.pages.search_components import PatientStatusSearchComponent
from mavis.test.pages.sessions.sessions_tabs import SessionsTabs
from mavis.test.utils import (
    reload_until_element_is_visible,
)


class SessionsChildrenPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.tabs = SessionsTabs(page)
        self.search = PatientStatusSearchComponent(page)
        self.header = HeaderComponent(page)

        self.attending_button = self.page.get_by_role("button", name="Attending").first

    def register_child_as_attending(self, child: Child) -> None:
        self.search.search_for(str(child))
        reload_until_element_is_visible(
            self.page, self.page.get_by_role("link", name=str(child)).first
        )
        self.click_on_attending()

    @step("Click on Attending")
    def click_on_attending(self) -> None:
        self.attending_button.click()

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

    @step("Check note {2} appears in search for {1}")
    def check_note_appears_in_search(self, child: Child, note: str) -> None:
        heading = self.page.get_by_role("heading", name=str(child))
        next_element = heading.locator("xpath=following-sibling::*[1]")
        expect(next_element.get_by_role("blockquote")).to_have_text(note)
