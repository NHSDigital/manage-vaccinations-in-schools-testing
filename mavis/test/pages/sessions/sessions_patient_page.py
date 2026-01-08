import time

from playwright.sync_api import Page, expect

from mavis.test.annotations import step
from mavis.test.constants import (
    MAVIS_NOTE_LENGTH_LIMIT,
    ConsentOption,
    DeliverySite,
    Programme,
)
from mavis.test.data_models import (
    Child,
    Parent,
    School,
    VaccinationRecord,
)
from mavis.test.pages.header_component import HeaderComponent
from mavis.test.utils import (
    expect_alert_text,
    expect_details,
)


class SessionsPatientPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.header = HeaderComponent(page)

        self.update_triage_outcome_link = self.page.get_by_role(
            "link",
            name="Update triage outcome",
        )
        self.safe_to_vaccinate_radio = self.page.get_by_role(
            "radio",
            name="Yes, it’s safe to vaccinate",
        )
        self.save_triage_button = self.page.get_by_role("button", name="Save triage")
        self.assess_gillick_competence_link = self.page.get_by_role(
            "link",
            name="Assess Gillick competence",
        )
        self.edit_gillick_competence_link = self.page.get_by_role(
            "link",
            name="Edit Gillick competence",
        )
        self.could_not_vaccinate_link = self.page.get_by_role(
            "link",
            name="Could not vaccinate",
        )
        self.mark_as_invalid_link = self.page.get_by_role(
            "link",
            name="Mark as invalid",
        )
        self.mark_as_invalid_button = self.page.get_by_role(
            "button",
            name="Mark as invalid",
        )
        self.notes_textbox = self.page.get_by_role("textbox", name="Notes")
        self.record_a_new_consent_response_button = self.page.get_by_role(
            "button",
            name="Record a new consent response",
        )
        self.ready_for_injection_radio = self.page.locator(
            "#vaccinate-form-vaccine-method-injection-field",
        )
        self.ready_for_nasal_spray_radio = self.page.locator(
            "#vaccinate-form-vaccine-method-nasal-field",
        )
        pre_screening = self.page.locator("section").filter(
            has=page.get_by_role("heading", name="Pre-screening checks"),
        )

        self.pre_screening_listitem = pre_screening.get_by_role("listitem")
        self.pre_screening_checkbox = pre_screening.get_by_role("checkbox")
        self.pre_screening_notes = pre_screening.get_by_role(
            "textbox",
            name="Pre-screening notes (optional)",
        )
        vaccinations_card = page.get_by_role("table", name="Vaccination records")
        self.vaccinations_card_row = vaccinations_card.get_by_role("row")
        self.withdraw_consent_link = self.page.get_by_role(
            "link", name="Withdraw consent"
        )
        self.triage_safe_mmr_either_radio = self.page.get_by_role(
            "radio",
            name="Yes, it’s safe to vaccinate",
            exact=True,
        )
        self.triage_safe_mmr_gelatine_free_radio = self.page.get_by_role(
            "radio",
            name="Yes, it’s safe to vaccinate with the gelatine-free injection",
            exact=True,
        )
        self.record_vaccinations_breadcrumb = self.page.get_by_role(
            "link",
            name="Record vaccinations",
        )
        self.back_link = self.page.get_by_role("link", name="Back", exact=True).first
        self.continue_button = self.page.get_by_role("button", name="Continue")
        self.notes_length_error = (
            page.locator("div").filter(has_text="There is a problemEnter").nth(3)
        )

    def _select_tab(self, name: str) -> None:
        link = self.page.get_by_label("Secondary menu").get_by_role("link", name=name)
        if link.get_by_role("strong").is_visible():
            return
        link.click()
        link.get_by_role("strong").wait_for()

    @step("Click on {1} tab")
    def click_programme_tab(self, programme: Programme) -> None:
        tab_name = "MMR" if programme is Programme.MMR else str(programme)
        self._select_tab(tab_name)

    @step("Click on Update triage outcome")
    def click_update_triage_outcome(self) -> None:
        self.update_triage_outcome_link.click()

    @step("Click on Yes, it’s safe to vaccinate")
    def select_yes_safe_to_vaccinate(self) -> None:
        self.safe_to_vaccinate_radio.click()

    @step("Click on Save triage")
    def click_save_triage(self) -> None:
        self.save_triage_button.click()

    @step("Click on Assess Gillick competence")
    def click_assess_gillick_competence(self) -> None:
        self.assess_gillick_competence_link.click()

    @step("Click on Edit Gillick competence")
    def click_edit_gillick_competence(self) -> None:
        self.edit_gillick_competence_link.click()

    @step("Click on Could not vaccinate")
    def click_could_not_vaccinate(self) -> None:
        self.could_not_vaccinate_link.click()

    @step("Click on Mark as invalid")
    def click_mark_as_invalid_link(self) -> None:
        self.mark_as_invalid_link.click()

    @step("Click on Mark as invalid")
    def click_mark_as_invalid_button(self) -> None:
        self.mark_as_invalid_button.click()

    def invalidate_parent_refusal(self, parent: Parent) -> None:
        invalidation_notes = "Invalidation notes."
        self.click_response_from_parent(parent)
        self.click_mark_as_invalid_link()
        self.fill_notes(invalidation_notes)
        self.click_mark_as_invalid_button()
        expect_details(self.page, "Response", "Invalid")
        expect_details(self.page, "Notes", invalidation_notes)

        self.click_back()
        expect_details(self.page, "Response", "Invalid")
        expect(self.page.get_by_text("No requests have been sent.")).to_be_visible()

    @step("Click Back")
    def click_back(self) -> None:
        self.back_link.click()

    @step("Click on Continue")
    def click_continue_button(self) -> None:
        self.continue_button.click()

    @step("Fill notes")
    def fill_notes(self, notes: str) -> None:
        self.notes_textbox.fill(notes)

    @step("Click on Yes")
    def select_identity_confirmed_by_child(self, child: Child) -> None:
        self.page.get_by_role(
            "group",
            name=f"Has {child.first_name} confirmed their identity?",
        ).get_by_label("Yes").check()

    @step("Click on Yes")
    def select_ready_for_vaccination(
        self,
        consent_option: ConsentOption = ConsentOption.INJECTION,
    ) -> None:
        if consent_option is ConsentOption.INJECTION:
            self.ready_for_injection_radio.check()
        else:
            self.ready_for_nasal_spray_radio.check()

    @step("Select vaccination site {1}")
    def select_delivery_site(self, site: DeliverySite) -> None:
        self.page.get_by_role("radio", name=str(site)).check()

    @step("Click on Record a new consent response")
    def click_record_a_new_consent_response(self) -> None:
        # temporary wait before clicking the button to prevent errors
        time.sleep(1)
        self.record_a_new_consent_response_button.click()

    @step("Go back to Record Vaccinations")
    def click_back_to_record_vaccinations(self) -> None:
        self.record_vaccinations_breadcrumb.click()

    @step("Click response from {1}")
    def click_response_from_parent(self, parent: Parent) -> None:
        self.page.get_by_role("link", name=parent.full_name).click()

    def click_withdraw_consent(self) -> None:
        self.withdraw_consent_link.click()

    @step("Confirm pre-screening checks are true")
    def confirm_pre_screening_checks(
        self,
        programme: Programme,
        consent_option: ConsentOption = ConsentOption.INJECTION,
    ) -> None:
        for check in programme.pre_screening_checks(consent_option):
            locator = self.pre_screening_listitem.get_by_text(check)
            expect(locator).to_be_visible()

        # need to wait for checkbox to load properly
        time.sleep(1)

        expect(self.pre_screening_checkbox).to_be_editable()
        self.pre_screening_checkbox.check()

        self.page.wait_for_load_state()
        expect(self.pre_screening_checkbox).to_be_checked()

    def expect_conflicting_consent_text(self) -> None:
        expect(
            self.page.get_by_text(
                "You can only vaccinate if all respondents give consent.",
            ),
        ).to_be_visible()

    def expect_consent_status(self, programme: Programme, status: str) -> None:
        expect(self.page.get_by_text(f"{programme}: {status}")).to_be_visible()

    def expect_child_safe_to_vaccinate(self, child: Child) -> None:
        expect(
            self.page.get_by_text(
                f"NURSE, Nurse decided that {child!s} is safe to vaccinate.",
            ),
        ).to_be_visible()

    @step("Click on {1} vaccination details")
    def click_vaccination_details(self, school: School) -> None:
        with self.page.expect_navigation():
            self.vaccinations_card_row.filter(has_text=str(school)).get_by_role(
                "link",
            ).click()

    def go_back_to_session_for_school(self, school: School) -> None:
        self.page.get_by_role("link", name=school.name).click()
        expect(self.page.get_by_role("heading", name=school.name).first).to_be_visible()

    def verify_triage_updated_for_child(self) -> None:
        expect_alert_text(self.page, "Triage outcome updated")

    @step("Triage MMR patient")
    def triage_mmr_patient(self, consent_option: ConsentOption) -> None:
        if consent_option is ConsentOption.MMR_EITHER:
            self.triage_safe_mmr_either_radio.check()
        else:
            self.triage_safe_mmr_gelatine_free_radio.check()
        self.save_triage_button.click()

    def set_up_vaccination(
        self, vaccination_record: VaccinationRecord, notes: str = ""
    ) -> None:
        self.click_programme_tab(vaccination_record.programme)

        self.confirm_pre_screening_checks(
            vaccination_record.programme, vaccination_record.consent_option
        )
        self.pre_screening_notes.fill(notes)

        self.select_identity_confirmed_by_child(vaccination_record.child)

        self.select_ready_for_vaccination(vaccination_record.consent_option)
        if vaccination_record.consent_option is ConsentOption.INJECTION:
            self.select_delivery_site(vaccination_record.delivery_site)

        self.click_continue_button()

        if len(notes) > MAVIS_NOTE_LENGTH_LIMIT:
            expect(self.notes_length_error).to_be_visible()
            self.pre_screening_notes.fill("Prescreening notes")
            self.click_continue_button()

    @step("Click on Session activity and notes tab")
    def click_session_activity_and_notes(self) -> None:
        self._select_tab("Session activity and notes")
