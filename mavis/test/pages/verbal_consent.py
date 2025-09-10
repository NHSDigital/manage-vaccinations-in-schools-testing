from playwright.sync_api import Page, expect

from mavis.test.annotations import step
from mavis.test.models import (
    ConsentMethod,
    ConsentOption,
    ConsentRefusalReason,
    Parent,
    Programme,
)


class VerbalConsentPage:
    def __init__(self, page: Page) -> None:
        self.page = page

        self.yes_radio = self.page.get_by_role("radio", name="Yes", exact=True)
        self.no_radio = self.page.get_by_role("radio", name="No", exact=True)
        self.continue_button = self.page.get_by_role("button", name="Continue")
        self.phone_textbox = self.page.get_by_role("textbox", name="Phone number")
        self.text_alerts_checkbox = self.page.get_by_role(
            "checkbox",
            name="Get updates by text message",
        )
        self.mobile_only_text_checkbox = self.page.get_by_role(
            "checkbox",
            name="I can only receive text",
        )
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
        self.add_phone_number_link = self.page.get_by_role(
            "link",
            name="Add phone number",
        )
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

    @step("Click Continue")
    def click_continue(self) -> None:
        self.continue_button.click()

    @step("Click Confirm")
    def click_confirm(self) -> None:
        self.confirm_button.click()

    @step("Fill phone number {1} and receive text alerts")
    def fill_phone_number_and_receive_text_alerts(self, phone: str) -> None:
        self.phone_textbox.fill(phone)
        self.text_alerts_checkbox.check()

    @step("Click on {1} radio button")
    def click_radio_button(self, name: str) -> None:
        self.page.get_by_role("radio", name=name).check()

    def set_all_health_questions_to_no(
        self,
        programme: Programme,
        consent_option: ConsentOption = ConsentOption.INJECTION,
    ) -> None:
        for locator_text in programme.health_questions(consent_option):
            self.select_no_for_health_question(locator_text)

    @step("Select No for health question {1}")
    def select_no_for_health_question(self, question: str) -> None:
        self.page.get_by_role("group", name=question).get_by_label("No").check()

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

    @step("Click on Add phone number")
    def click_add_phone_number(self) -> None:
        self.add_phone_number_link.click()

    @step("Click on Yes, it’s safe to vaccinate")
    def click_safe_to_vaccinate(
        self,
        programme: Programme = Programme.HPV,
        consent_option: ConsentOption = ConsentOption.INJECTION,
    ) -> None:
        if programme is Programme.FLU:
            if consent_option is ConsentOption.INJECTION:
                self.yes_safe_to_vaccinate_with_injection_radio.check()
            else:
                self.yes_safe_to_vaccinate_with_nasal_spray_radio.check()
        else:
            self.yes_safe_to_vaccinate_radio.check()

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
    def click_gillick_competent(self) -> None:
        self.child_gillick_competent_radio.check()

    @step("Click on Yes, for the nasal spray")
    def click_yes_for_nasal_spray(self) -> None:
        self.online_flu_agree_nasal_radio.check()

    @step("Click on Yes, for the injected vaccine only")
    def click_yes_for_injected_vaccine(self) -> None:
        self.online_flu_agree_injection_radio.check()

    def expect_text_in_alert(self, text: str) -> None:
        expect(self.page.get_by_role("alert")).to_contain_text(text)

    def change_parent_phone(self) -> None:
        self.fill_phone_number_and_receive_text_alerts("7700900000")
        self.click_continue()
        self.mobile_only_text_checkbox.check()
        self.click_continue()

    def parent_verbal_positive(
        self,
        parent: Parent,
        programme: Programme = Programme.HPV,
        consent_option: ConsentOption = ConsentOption.INJECTION,
        *,
        change_phone: bool = False,
    ) -> None:
        self._select_parent(parent_locator=parent.name_and_relationship)
        self._select_consent_method(ConsentMethod.IN_PERSON)
        self._process_consent_confirmation(
            programme=programme, consent_option=consent_option
        )
        if change_phone:
            self.click_add_phone_number()
            self.change_parent_phone()
        self.click_confirm()

    def parent_verbal_no_response(self, parent: Parent) -> None:
        self._select_parent(parent_locator=parent.name_and_relationship)
        self._select_consent_method(ConsentMethod.IN_PERSON)
        self.no_response_radio.check()
        self.click_continue()
        self.click_confirm()

    def parent_verbal_refuse_consent(self, parent: Parent) -> None:
        self._select_parent(parent_locator=parent.name_and_relationship)
        self._select_consent_method(ConsentMethod.IN_PERSON)
        self._handle_refusal_of_consent(ConsentRefusalReason.PERSONAL_CHOICE)
        self.select_yes()
        self.click_continue()
        self.click_confirm()

    def parent_written_positive(
        self,
        parent: Parent,
        consent_option: ConsentOption = ConsentOption.INJECTION,
    ) -> None:
        self._select_parent(parent_locator=parent.name_and_relationship)
        self._select_consent_method(ConsentMethod.PAPER)
        self._process_consent_confirmation(consent_option=consent_option)
        self.click_add_phone_number()
        self.fill_phone_number_and_receive_text_alerts("7700900000")
        self.click_continue()
        self.click_continue()
        self.click_continue()
        self.click_continue()
        self.click_continue()
        self.click_confirm()

    def update_triage_outcome_positive(self) -> None:
        self.click_safe_to_vaccinate()
        self.click_save_triage()
        self.expect_text_in_alert("Triage outcome updated")

    def parent_phone_positive(
        self, parent: Parent, consent_option: ConsentOption = ConsentOption.INJECTION
    ) -> None:
        self._select_parent(parent_locator=parent.name_and_relationship)
        self._select_consent_method(ConsentMethod.PHONE)
        self._process_consent_confirmation(consent_option=consent_option)
        self.click_confirm()

    def parent_paper_refuse_consent(self, parent: Parent) -> None:
        self._select_parent(parent_locator=parent.name_and_relationship)
        self._select_consent_method(ConsentMethod.PAPER)
        self._handle_refusal_of_consent(ConsentRefusalReason.VACCINE_ALREADY_RECEIVED)
        self.give_details("vaccine will be given elsewhere")
        self.click_continue()
        self.click_confirm()

    def child_consent_verbal_positive(
        self, consent_option: ConsentOption = ConsentOption.INJECTION
    ) -> None:
        self.child_gillick_competent_radio.check()
        self.click_continue()
        self._process_consent_confirmation(
            child_consent=True, consent_option=consent_option
        )
        self.click_confirm()

    def _handle_refusal_of_consent(self, reason: ConsentRefusalReason) -> None:
        self.click_no_they_do_not_agree()
        self.click_continue()
        self.click_consent_refusal_reason(reason)
        self.click_continue()

    def _select_parent(self, parent_locator: str) -> None:
        self.click_radio_button(parent_locator)
        self.click_continue()
        self.click_continue()

    def _select_consent_method(self, method: ConsentMethod) -> None:
        self.click_consent_method(method)
        self.click_continue()

    def _process_consent_confirmation(
        self,
        programme: Programme = Programme.HPV,
        consent_option: ConsentOption = ConsentOption.INJECTION,
        *,
        child_consent: bool = False,
    ) -> None:
        if programme is Programme.FLU:
            if consent_option is ConsentOption.INJECTION:
                self.click_yes_for_injected_vaccine()
            else:
                self.click_yes_for_nasal_spray()
                if consent_option is ConsentOption.BOTH:
                    self.select_yes()
                else:
                    self.select_no()
        else:
            self.click_yes_they_agree()
        self.click_continue()
        if child_consent:
            self.select_yes()
            self.click_continue()
        self.set_all_health_questions_to_no(
            programme=programme,
            consent_option=consent_option,
        )
        self.click_continue()
        self.click_safe_to_vaccinate(programme=programme, consent_option=consent_option)
        self.click_continue()
