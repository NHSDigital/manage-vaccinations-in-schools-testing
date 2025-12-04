from playwright.sync_api import Page

from mavis.test.annotations import step
from mavis.test.models import (
    ConsentMethod,
    ConsentOption,
    ConsentRefusalReason,
    Parent,
    Programme,
)
from mavis.test.pages.header_component import HeaderComponent
from mavis.test.utils import expect_alert_text


class NurseConsentWizardPage:
    def __init__(self, page: Page) -> None:
        self.page = page
        self.header = HeaderComponent(page)

        self.yes_radio = self.page.get_by_role("radio", name="Yes", exact=True)
        self.no_radio = self.page.get_by_role("radio", name="No", exact=True)
        self.continue_button = self.page.get_by_role("button", name="Continue")
        self.give_details_textbox = self.page.get_by_role(
            "textbox",
            name="Give details",
        )
        self.consent_refusal_radios = {
            reason: self.page.get_by_role("radio", name=reason)
            for reason in ConsentRefusalReason
        }
        self.consent_method_radios = {
            method: self.page.get_by_role("radio", name=method)
            for method in ConsentMethod
        }
        self.confirm_button = self.page.get_by_role("button", name="Confirm")
        self.no_response_radio = self.page.get_by_role("radio", name="No response")
        self.save_triage_button = self.page.get_by_role("button", name="Save triage")
        self.yes_safe_to_vaccinate_radio = self.page.get_by_role(
            "radio",
            name="Yes, it’s safe to vaccinate",
            exact=True,
        )
        self.yes_safe_to_vaccinate_with_nasal_spray_radio = self.page.get_by_role(
            "radio",
            name="Yes, it’s safe to vaccinate with nasal spray",
        )
        self.yes_safe_to_vaccinate_with_injection_radio = self.page.get_by_role(
            "radio",
            name="Yes, it’s safe to vaccinate with injected vaccine",
        )
        self.child_gillick_competent_radio = self.page.get_by_role(
            "radio",
            name="Child (Gillick competent)",
        )
        self.they_do_not_agree_radio = self.page.get_by_role(
            "radio",
            name="No, they do not agree",
        )
        self.yes_they_agree_radio = self.page.get_by_role(
            "radio",
            name="Yes, they agree",
        )
        self.online_flu_agree_nasal_radio = self.page.get_by_role(
            "radio",
            name="Yes, for the nasal spray",
        )
        self.online_flu_agree_injection_radio = self.page.get_by_role(
            "radio",
            name="Yes, for the injected vaccine only",
        )
        self.withdraw_consent_button = self.page.get_by_role(
            "button", name="Withdraw consent"
        )
        self.withdraw_consent_notes_textbox = self.page.get_by_role(
            "textbox", name="Notes"
        )

    @step("Click Continue")
    def click_continue(self) -> None:
        self.continue_button.click()

    @step("Click Confirm")
    def click_confirm(self) -> None:
        self.confirm_button.click()

    @step("Click on {1} radio button")
    def click_radio_button(self, name: str) -> None:
        self.page.get_by_role("radio", name=name).check()

    def answer_all_health_questions(
        self,
        programme: Programme,
        consent_option: ConsentOption = ConsentOption.INJECTION,
        answer: str = "No",
    ) -> None:
        for locator_text in programme.health_questions(consent_option):
            self.select_answer_for_health_question(locator_text, answer)

    @step("Select {2} for health question {1}")
    def select_answer_for_health_question(self, question: str, answer: str) -> None:
        question_locator = self.page.get_by_role("group", name=question)
        question_locator.get_by_label(answer).check()
        if answer == "Yes":
            question_locator.get_by_role("textbox").fill("Some details")

    @step("Select Yes")
    def select_yes(self) -> None:
        self.yes_radio.check()

    @step("Select No")
    def select_no(self) -> None:
        self.no_radio.check()

    @step("Give details")
    def give_details(self, details: str) -> None:
        self.give_details_textbox.fill(details)

    @step("Select consent refusal reason")
    def click_consent_refusal_reason(self, reason: ConsentRefusalReason) -> None:
        self.consent_refusal_radios[reason].check()

    @step("Select consent method")
    def click_consent_method(self, method: ConsentMethod) -> None:
        self.consent_method_radios[method].check()

    @step("Click on Yes, it’s safe to vaccinate")
    def click_safe_to_vaccinate(
        self,
        programme: Programme = Programme.HPV,
        consent_option: ConsentOption = ConsentOption.INJECTION,
        *,
        psd_option: bool | None = None,
    ) -> None:
        if programme is Programme.FLU:
            if consent_option is ConsentOption.INJECTION:
                self.yes_safe_to_vaccinate_with_injection_radio.check()
            else:
                self.yes_safe_to_vaccinate_with_nasal_spray_radio.check()
        else:
            self.yes_safe_to_vaccinate_radio.check()

        if psd_option is not None:
            if psd_option:
                self.select_yes()
            else:
                self.select_no()

    @step("Click on Save triage")
    def click_save_triage(self) -> None:
        self.save_triage_button.click()

    @step("Click on Yes, they agree")
    def click_yes_they_agree(self) -> None:
        self.yes_they_agree_radio.check()

    @step("Click on No, they do not agree")
    def click_no_they_do_not_agree(self) -> None:
        self.they_do_not_agree_radio.check()

    @step("Click on Child (Gillick competent)")
    def select_gillick_competent_child(self) -> None:
        self.child_gillick_competent_radio.check()
        self.click_continue()

    @step("Click on Yes, for the nasal spray")
    def click_yes_for_nasal_spray(self) -> None:
        self.online_flu_agree_nasal_radio.check()

    @step("Click on Yes, for the injected vaccine only")
    def click_yes_for_injected_vaccine(self) -> None:
        self.online_flu_agree_injection_radio.check()

    def record_parent_positive_consent(
        self,
        programme: Programme = Programme.HPV,
        consent_option: ConsentOption = ConsentOption.INJECTION,
        *,
        psd_option: bool | None = None,
        yes_to_health_questions: bool = False,
    ) -> None:
        self._process_consent_confirmation(
            programme=programme,
            consent_option=consent_option,
            psd_option=psd_option,
            yes_to_health_questions=yes_to_health_questions,
        )

    def record_parent_no_response(self) -> None:
        self.no_response_radio.check()
        self.click_continue()
        self.click_confirm()

    def record_parent_refuse_consent(self) -> None:
        self._handle_refusal_of_consent(ConsentRefusalReason.PERSONAL_CHOICE)
        self.select_yes()
        self.click_continue()
        self.click_confirm()

    def record_child_positive_consent(
        self,
        programme: Programme = Programme.HPV,
        consent_option: ConsentOption = ConsentOption.INJECTION,
        *,
        psd_option: bool | None = None,
        yes_to_health_questions: bool = False,
    ) -> None:
        self._process_consent_confirmation(
            programme=programme,
            consent_option=consent_option,
            psd_option=psd_option,
            yes_to_health_questions=yes_to_health_questions,
            child_consent=True,
        )

    def _handle_refusal_of_consent(self, reason: ConsentRefusalReason) -> None:
        self.click_no_they_do_not_agree()
        self.click_continue()
        self.click_consent_refusal_reason(reason)
        self.click_continue()

    def select_parent(self, parent: Parent) -> None:
        self.click_radio_button(parent.name_and_relationship)
        self.click_continue()
        self.click_continue()

    def select_consent_method(self, method: ConsentMethod) -> None:
        self.click_consent_method(method)
        self.click_continue()

    def _process_consent_confirmation(
        self,
        programme: Programme = Programme.HPV,
        consent_option: ConsentOption = ConsentOption.INJECTION,
        *,
        child_consent: bool = False,
        psd_option: bool | None = None,
        yes_to_health_questions: bool = False,
    ) -> None:
        if programme is Programme.FLU:
            if consent_option is ConsentOption.INJECTION:
                self.click_yes_for_injected_vaccine()
            else:
                self.click_yes_for_nasal_spray()
                if consent_option is ConsentOption.NASAL_SPRAY_OR_INJECTION:
                    self.select_yes()
                else:
                    self.select_no()
        else:
            self.click_yes_they_agree()
        self.click_continue()

        if child_consent:
            self.select_yes()
            self.click_continue()

        answer = "Yes" if yes_to_health_questions else "No"
        self.answer_all_health_questions(
            programme=programme, consent_option=consent_option, answer=answer
        )

        self.click_continue()

        if yes_to_health_questions:
            self.click_safe_to_vaccinate(
                programme=programme,
                consent_option=consent_option,
                psd_option=psd_option,
            )
            self.click_continue()

        self.click_confirm()

    def update_triage_outcome_positive(self) -> None:
        self.click_safe_to_vaccinate()
        self.click_save_triage()
        expect_alert_text(self.page, "Triage outcome updated")

    def click_withdraw_consent(self) -> None:
        self.withdraw_consent_button.click()

    def give_withdraw_consent_notes(self, notes: str) -> None:
        self.withdraw_consent_notes_textbox.fill(notes)
