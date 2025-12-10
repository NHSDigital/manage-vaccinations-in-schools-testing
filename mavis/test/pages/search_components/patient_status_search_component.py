from playwright.sync_api import Page, expect

from mavis.test.annotations import step
from mavis.test.pages.search_components.patient_search_component import (
    PatientSearchComponent,
)


class PatientStatusSearchComponent(PatientSearchComponent):
    def __init__(
        self,
        page: Page,
    ) -> None:
        super().__init__(page)
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

    @step("Expect Has a refusal to be selected")
    def expect_has_a_refusal_to_be_selected(self) -> None:
        expect(self.has_a_refusal_radio).to_be_checked()
