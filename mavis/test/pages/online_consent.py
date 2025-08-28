from datetime import date
from playwright.sync_api import Page, expect
from typing import Optional

from mavis.test.models import (
    ConsentRefusalReason,
    Programme,
    School,
    Parent,
    Child,
    ConsentOption,
)
from mavis.test.annotations import step


class OnlineConsentPage:
    def __init__(self, page: Page):
        self.page = page

        self.first_name_textbox = self.page.get_by_role("textbox", name="First name")
        self.last_name_textbox = self.page.get_by_role("textbox", name="Last name")
        self.yes_radio = self.page.get_by_role("radio", name="Yes", exact=True)
        self.no_radio = self.page.get_by_role("radio", name="No", exact=True)
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
        self.confirm_button = self.page.get_by_role("button", name="Confirm")

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

        if name == self.displayed_school_name.inner_text().strip():
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

    @step("Agree to Flu vaccination (consent_option = {consent_option})")
    def agree_to_flu_vaccination(self, consent_option: ConsentOption):
        if consent_option is ConsentOption.INJECTION:
            self.flu_agree_injection_radio.check()
        else:
            self.flu_agree_nasal_radio.check()
        self.click_continue()
        if consent_option is ConsentOption.BOTH:
            self.answer_yes()
        elif consent_option is ConsentOption.NASAL_SPRAY:
            self.answer_no()

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

    def get_number_of_health_questions_for_programmes(
        self, programmes: list[Programme]
    ) -> int:
        return len(
            {
                question
                for programme in programmes
                for question in Programme.health_questions(programme)
            }
        )

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

    def expect_confirmation_text(self, text: str) -> None:
        confirmation = self.page.locator(".nhsuk-panel.nhsuk-panel--confirmation")
        expect(confirmation).to_contain_text(text)

    def go_to_url(self, url: str):
        self.page.goto(url)

    def fill_details(
        self,
        child: Child,
        parent: Parent,
        schools: list[School],
        change_school: bool = False,
    ):
        self.fill_child_name_details(*child.name)
        self.fill_child_date_of_birth(child.date_of_birth)

        if change_school:
            self.select_child_school(schools[1])
        else:
            self.select_child_school(schools[0])

        self.fill_parent_details(parent)

    def answer_health_questions(self, number_of_questions: int, health_question: bool):
        for _ in range(number_of_questions):
            if health_question:
                self.answer_yes("More details")
            else:
                self.answer_no()

    def get_number_of_health_questions_for_flu(
        self, consent_option: ConsentOption
    ) -> int:
        number_of_health_questions = len(
            Programme.health_questions(Programme.FLU, consent_option)
        )
        if consent_option is not ConsentOption.INJECTION:
            number_of_health_questions -= 1
        return number_of_health_questions

    def check_final_consent_message(
        self,
        child: Child,
        programmes: list[Programme],
        health_question: bool,
        consent_option: ConsentOption = ConsentOption.INJECTION,
    ):
        def programme_display(programme, consent_option) -> str:
            if programme == Programme.FLU:
                return (
                    "injected flu"
                    if consent_option is ConsentOption.INJECTION
                    else "nasal spray flu"
                )
            else:
                return str(programme)

        programmes_str = " and ".join(
            programme_display(programme, consent_option) for programme in programmes
        )

        if programmes == [Programme.MENACWY] or programmes == [Programme.TD_IPV]:
            title = f"Consent for the {programmes_str} vaccination confirmed"
        else:
            title = "Consent confirmed"

        if health_question:
            body = (
                f" As you answered ‘yes’ to some of the health questions, "
                f"we need to check the {programmes_str} vaccination{'s are' if len(programmes) > 1 else ' is'} suitable for "
                f"{child.first_name} {child.last_name}. We’ll review your answers and get in touch again soon."
            )
        else:
            body = f"{child.first_name} {child.last_name} is due to get the {programmes_str} vaccination{'s' if len(programmes) > 1 else ''} at school"

        final_message = "".join([title, body])
        self.expect_confirmation_text(final_message)
