from datetime import date
from playwright.sync_api import Page, expect
from typing import Optional

from mavis.test.models import (
    ConsentMethod,
    ConsentRefusalReason,
    Programme,
    School,
    Parent,
)
from mavis.test.step import step


class ConsentPage:
    def __init__(self, page: Page):
        self.page = page

        self.first_name_textbox = self.page.get_by_role("textbox", name="First name")
        self.last_name_textbox = self.page.get_by_role("textbox", name="Last name")
        self.yes_radio = self.page.get_by_role("radio", name="Yes")
        self.no_radio = self.page.get_by_role("radio", name="No")
        self.preferred_first_name_textbox = self.page.get_by_role(
            "textbox", name="Preferred first name (optional)"
        )
        self.preferred_last_name_textbox = self.page.get_by_role(
            "textbox", name="Preferred last name (optional)"
        )
        self.continue_button = self.page.get_by_role("button", name="Continue")
        self.dob_day_textbox = self.page.get_by_role("textbox", name="Day")
        self.dob_month_textbox = self.page.get_by_role("textbox", name="Month")
        self.dob_year_textbox = self.page.get_by_role("textbox", name="Year")
        self.displayed_school_name = self.page.get_by_test_id("school-name")
        self.confirm_school_radio = self.page.get_by_role(
            "radio", name="Yes, they go to this school"
        )
        self.select_different_school_radio = self.page.get_by_role(
            "radio", name="No, they go to a different school"
        )
        self.school_name_combobox = self.page.get_by_role("combobox")
        self.full_name_textbox = self.page.get_by_role("textbox", name="Full name")
        self.email_address_textbox = self.page.get_by_role(
            "textbox", name="Email address"
        )
        self.phone_textbox = self.page.get_by_role("textbox", name="Phone number")
        self.text_alerts_checkbox = self.page.get_by_role(
            "checkbox", name="Get updates by text message"
        )
        self.mobile_only_text_checkbox = self.page.get_by_role(
            "checkbox", name="I can only receive text"
        )
        self.mobile_only_voice_checkbox = self.page.get_by_role(
            "checkbox", name="I can only receive voice calls"
        )
        self.address_line_1_textbox = self.page.get_by_role(
            "textbox", name="Address line 1"
        )
        self.address_line_2_textbox = self.page.get_by_role(
            "textbox", name="Address line 2 (optional)"
        )
        self.address_city_textbox = self.page.get_by_role(
            "textbox", name="Town or city"
        )
        self.address_postcode_textbox = self.page.get_by_role(
            "textbox", name="Postcode"
        )
        self.give_details_textbox = self.page.get_by_role(
            "textbox", name="Give details"
        )
        self.consent_refusal_radios = {
            reason: self.page.get_by_role("radio", name=reason)
            for reason in ConsentRefusalReason
        }
        self.consent_method_radios = {
            method: self.page.get_by_role("radio", name=method)
            for method in ConsentMethod
        }
        self.change_phone_link = self.page.get_by_role(
            "link", name="Change   your phone"
        )
        self.add_phone_number_link = self.page.get_by_role(
            "link", name="Add phone number"
        )
        self.confirm_button = self.page.get_by_role("button", name="Confirm")
        self.no_response_radio = self.page.get_by_role("radio", name="No response")
        self.save_triage_button = self.page.get_by_role("button", name="Save triage")
        self.yes_safe_to_vaccinate_radio = self.page.get_by_role(
            "radio", name="Yes, it’s safe to vaccinate"
        )
        self.child_gillick_competent_radio = self.page.get_by_role(
            "radio", name="Child (Gillick competent)"
        )
        self.they_do_not_agree_radio = self.page.get_by_role(
            "radio", name="No, they do not agree"
        )
        self.yes_they_agree_radio = self.page.get_by_role(
            "radio", name="Yes, they agree"
        )

        self.doubles_consent_both_radio = self.page.get_by_role(
            "radio", name="Yes, I agree to them having"
        )
        self.doubles_consent_one_radio = self.page.get_by_role(
            "radio", name="I agree to them having one of"
        )
        self.doubles_consent_menacwy_radio = self.page.get_by_role(
            "radio", name="MenACWY"
        )
        self.doubles_consent_tdipv_radio = self.page.get_by_role("radio", name="Td/IPV")
        self.flu_agree_injection_radio = self.page.get_by_role(
            "radio", name="Yes, I agree to the alternative flu injection"
        )
        self.flu_agree_nasal_radio = self.page.get_by_role(
            "radio", name="Yes, I agree to them having the nasal spray vaccine"
        )
        self.hpv_consent_agree_radio = self.page.get_by_role(
            "radio", name="Yes, I agree"
        )
        self.no_consent_radio = self.page.get_by_role("radio", name="No")

    @step("Click Continue")
    def click_continue(self):
        self.continue_button.click()

    @step("Click Confirm")
    def click_confirm(self) -> None:
        self.confirm_button.click()

    @step("Fill phone number {1} and receive text alerts")
    def fill_phone_number_and_receive_text_alerts(self, phone: str) -> None:
        self.phone_textbox.fill(phone)
        self.text_alerts_checkbox.check()

    @step("Fill child name details")
    def fill_child_name_details(
        self,
        first_name: str,
        last_name: str,
        known_as_first: Optional[str] = None,
        known_as_last: Optional[str] = None,
    ) -> None:
        self.first_name_textbox.fill(first_name)
        self.last_name_textbox.fill(last_name)

        if known_as_first or known_as_last:
            self.yes_radio.click()
            self.preferred_first_name_textbox.fill(str(known_as_first))
            self.preferred_last_name_textbox.fill(str(known_as_last))
        else:
            self.no_radio.click()

        self.click_continue()

    @step("Fill child date of birth")
    def fill_child_date_of_birth(self, date_of_birth: date) -> None:
        self.dob_day_textbox.fill(str(date_of_birth.day))
        self.dob_month_textbox.fill(str(date_of_birth.month))
        self.dob_year_textbox.fill(str(date_of_birth.year))
        self.click_continue()

    @step("Select child school")
    def select_child_school(self, school: School) -> None:
        name = str(school)

        if name == self.displayed_school_name:
            self.confirm_school_radio.click()
        else:
            self.select_different_school_radio.click()
            self.click_continue()

            self.page.wait_for_load_state()

            self.school_name_combobox.fill(name)
            self.page.get_by_role("option", name=name).click()

        self.click_continue()

    @step("Click on {1} radio button")
    def click_radio_button(self, name: str) -> None:
        self.page.get_by_role("radio", name=name).check()

    @step("Fill email address")
    def fill_email_address(self, email):
        self.email_address_textbox.fill(email)

    @step("Fill parent name")
    def fill_parent_name(self, parent_name: str) -> None:
        self.full_name_textbox.fill(parent_name)

    def fill_parent_details(
        self,
        parent: Parent,
        phone: Optional[str] = None,
    ) -> None:
        self.fill_parent_name(parent.full_name)
        self.click_radio_button(parent.relationship)

        if parent.email_address:
            self.fill_email_address(parent.email_address)

        if phone:
            self.fill_phone_number_and_receive_text_alerts(phone)

        self.click_continue()

    @step("Agree to doubles vaccinations: {1}")
    def agree_to_doubles_vaccinations(self, *programmes: Programme):
        if Programme.MENACWY in programmes and Programme.TD_IPV in programmes:
            self.doubles_consent_both_radio.check()
        elif Programme.MENACWY in programmes:
            self.doubles_consent_one_radio.check()
            self.doubles_consent_menacwy_radio.check()
        elif Programme.TD_IPV in programmes:
            self.doubles_consent_one_radio.check()
            self.doubles_consent_tdipv_radio.check()
        self.click_continue()

    @step("Agree to Flu vaccination (injection = {injection})")
    def agree_to_flu_vaccination(self, *, injection: bool):
        if injection:
            self.flu_agree_injection_radio.check()
        else:
            self.flu_agree_nasal_radio.check()
        self.click_continue()

    @step("Agree to HPV vaccination")
    def agree_to_hpv_vaccination(self):
        self.hpv_consent_agree_radio.check()
        self.click_continue()

    @step("Don't agree to vaccination")
    def dont_agree_to_vaccination(self):
        self.no_consent_radio.check()
        self.click_continue()

    @step("Fill address details")
    def fill_address_details(
        self, line1: str, line2: str, city: str, postcode: str
    ) -> None:
        self.address_line_1_textbox.fill(line1)
        self.address_line_2_textbox.fill(line2)
        self.address_city_textbox.fill(city)
        self.address_postcode_textbox.fill(postcode)
        self.click_continue()

    def set_all_health_questions_to_no(self, programme: Programme):
        for locator_text in programme.health_questions:
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
    def click_add_phone_number(self):
        self.add_phone_number_link.click()

    @step("Click on Yes, it’s safe to vaccinate")
    def click_safe_to_vaccinate(self):
        self.yes_safe_to_vaccinate_radio.check()

    @step("Click on Save triage")
    def click_save_triage(self):
        self.save_triage_button.click()

    @step("Click on Yes, they agree")
    def click_yes_they_agree(self):
        self.yes_they_agree_radio.check()

    @step("Click on No, they do not agree")
    def click_no_they_do_not_agree(self):
        self.they_do_not_agree_radio.check()

    @step("Click on Child (Gillick competent)")
    def click_gillick_competent(self):
        self.child_gillick_competent_radio.check()

    def answer_yes(self, details: Optional[str] = None):
        self.select_yes()
        if details:
            self.give_details(details)
        self.click_continue()

    def answer_no(self):
        self.select_no()
        self.click_continue()

    def select_consent_not_given_reason(
        self, reason: ConsentRefusalReason, details: Optional[str] = None
    ) -> None:
        self.click_consent_refusal_reason(reason)
        if reason.requires_details:
            self.click_continue()
            self.give_details(str(details))

        self.click_continue()

    def expect_text_in_main(self, text: str) -> None:
        expect(self.page.get_by_role("main")).to_contain_text(text)

    def change_parent_phone(self):
        self.fill_phone_number_and_receive_text_alerts("7700900000")
        self.click_continue()
        self.mobile_only_text_checkbox.check()
        self.click_continue()

    def parent_verbal_positive(
        self,
        parent: Parent,
        change_phone: bool = True,
        programme: Programme = Programme.HPV,
    ):
        self._select_parent(parent_locator=parent.name_and_relationship)
        self._select_consent_method(ConsentMethod.IN_PERSON)
        self._process_consent_confirmation(programme)
        if change_phone:
            self.click_add_phone_number()
            self.change_parent_phone()
        self.click_confirm()

    def parent_verbal_no_response(self, parent: Parent):
        self._select_parent(parent_locator=parent.name_and_relationship)
        self._select_consent_method(ConsentMethod.IN_PERSON)
        self.no_response_radio.check()
        self.click_continue()
        self.click_confirm()

    def parent_verbal_refuse_consent(self, parent: Parent):
        self._select_parent(parent_locator=parent.name_and_relationship)
        self._select_consent_method(ConsentMethod.IN_PERSON)
        self._handle_refusal_of_consent(ConsentRefusalReason.PERSONAL_CHOICE)
        self.click_confirm()

    def parent_written_positive(self, parent: Parent):
        self._select_parent(parent_locator=parent.name_and_relationship)
        self._select_consent_method(ConsentMethod.PAPER)
        self._process_consent_confirmation()
        self.click_add_phone_number()
        self.fill_phone_number_and_receive_text_alerts("7700900000")
        self.click_continue()
        self.click_continue()
        self.click_continue()
        self.click_continue()
        self.click_continue()
        self.click_confirm()

    def update_triage_outcome_positive(self):
        self.click_safe_to_vaccinate()
        self.click_save_triage()
        expect(self.page.get_by_role("main")).to_contain_text(
            "Triage outcome updated for"
        )

    def parent_phone_positive(self, parent: Parent):
        self._select_parent(parent_locator=parent.name_and_relationship)
        self._select_consent_method(ConsentMethod.PHONE)
        self._process_consent_confirmation()
        self.click_confirm()

    def parent_paper_refuse_consent(self, parent: Parent):
        self._select_parent(parent_locator=parent.name_and_relationship)
        self._select_consent_method(ConsentMethod.PAPER)
        self._handle_refusal_of_consent(ConsentRefusalReason.VACCINE_ALREADY_RECEIVED)
        self.give_details("vaccine will be given elsewhere")
        self.click_continue()
        self.click_confirm()

    def child_consent_verbal_positive(self):
        self.child_gillick_competent_radio.check()
        self.click_continue()
        self._process_consent_confirmation(child_consent=True)
        self.click_confirm()

    def _handle_refusal_of_consent(self, reason: ConsentRefusalReason):
        self.click_no_they_do_not_agree()
        self.click_continue()
        self.click_consent_refusal_reason(reason)
        self.click_continue()

    def _select_parent(self, parent_locator: str):
        self.click_radio_button(parent_locator)
        self.click_continue()
        self.click_continue()

    def _select_consent_method(self, method: ConsentMethod):
        self.click_consent_method(method)
        self.click_continue()

    def _process_consent_confirmation(
        self, programme=Programme.HPV, child_consent: bool = False
    ):
        self.click_yes_they_agree()
        self.click_continue()
        if child_consent:
            self.select_yes()
            self.click_continue()
        self.set_all_health_questions_to_no(programme=programme)
        self.click_continue()
        self.click_safe_to_vaccinate()
        self.click_continue()
