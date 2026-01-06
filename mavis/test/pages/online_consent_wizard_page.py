from datetime import date

from playwright.sync_api import Page, expect

from mavis.test.annotations import step
from mavis.test.constants import (
    ConsentOption,
    ConsentRefusalReason,
    Programme,
)
from mavis.test.data_models import Child, Parent, School


class OnlineConsentWizardPage:
    def __init__(self, page: Page) -> None:
        self.page = page

        self.first_name_textbox = self.page.get_by_role("textbox", name="First name")
        self.last_name_textbox = self.page.get_by_role("textbox", name="Last name")
        self.yes_radio = self.page.get_by_role("radio", name="Yes", exact=True)
        self.no_radio = self.page.get_by_role("radio", name="No", exact=True)
        self.preferred_first_name_textbox = self.page.get_by_role(
            "textbox",
            name="Preferred first name (optional)",
        )
        self.preferred_last_name_textbox = self.page.get_by_role(
            "textbox",
            name="Preferred last name (optional)",
        )
        self.continue_button = self.page.get_by_role("button", name="Continue")
        self.dob_day_textbox = self.page.get_by_role("textbox", name="Day")
        self.dob_month_textbox = self.page.get_by_role("textbox", name="Month")
        self.dob_year_textbox = self.page.get_by_role("textbox", name="Year")
        self.displayed_school_name = self.page.get_by_test_id("school-name")
        self.confirm_school_radio = self.page.get_by_role(
            "radio",
            name="Yes, they go to this school",
        )
        self.select_different_school_radio = self.page.get_by_role(
            "radio",
            name="No, they go to a different school",
        )
        self.school_name_combobox = self.page.get_by_role("combobox")
        self.full_name_textbox = self.page.get_by_role("textbox", name="Full name")
        self.email_address_textbox = self.page.get_by_role(
            "textbox",
            name="Email address",
        )
        self.phone_textbox = self.page.get_by_role("textbox", name="Phone number")
        self.text_alerts_checkbox = self.page.get_by_role(
            "checkbox",
            name="Get updates by text message",
        )
        self.address_line_1_textbox = self.page.get_by_role(
            "textbox",
            name="Address line 1",
        )
        self.address_line_2_textbox = self.page.get_by_role(
            "textbox",
            name="Address line 2 (optional)",
        )
        self.address_city_textbox = self.page.get_by_role(
            "textbox",
            name="Town or city",
        )
        self.address_postcode_textbox = self.page.get_by_role(
            "textbox",
            name="Postcode",
        )
        self.give_details_textbox = self.page.get_by_role(
            "textbox",
            name="Give details",
        )
        self.consent_refusal_radios = {
            reason: self.page.get_by_role("radio", name=reason)
            for reason in ConsentRefusalReason
        }
        self.confirm_button = self.page.get_by_role("button", name="Confirm")

        self.doubles_consent_both_radio = self.page.get_by_role(
            "radio",
            name="Yes, I agree to them having",
        )
        self.doubles_consent_one_radio = self.page.get_by_role(
            "radio",
            name="I agree to them having one of",
        )
        self.doubles_consent_menacwy_radio = self.page.get_by_role(
            "radio",
            name="MenACWY",
        )
        self.doubles_consent_tdipv_radio = self.page.get_by_role("radio", name="Td/IPV")
        self.flu_agree_injection_radio = self.page.get_by_role(
            "radio",
            name="Yes, I agree to the alternative flu injection",
        )
        self.flu_agree_nasal_radio = self.page.get_by_role(
            "radio",
            name="Yes, I agree to them having the nasal spray vaccine",
        )
        self.hpv_consent_agree_radio = self.page.get_by_role(
            "radio",
            name="Yes, I agree",
        )
        self.mmr_consent_agree_radio = self.page.get_by_role(
            "radio",
            name="Yes, I agree",
        )
        self.mmr_consent_agree_without_gelatine_radio = self.page.get_by_role(
            "radio",
            name="I want my child to have the vaccine that does not contain gelatine",
        )
        self.mmr_consent_agree_either_radio = self.page.get_by_role(
            "radio",
            name="My child can have either type of vaccine",
        )
        self.no_consent_radio = self.page.get_by_role("radio", name="No")

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

    @step("Fill child name details")
    def fill_child_name_details(
        self,
        first_name: str,
        last_name: str,
        known_as_first: str | None = None,
        known_as_last: str | None = None,
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
            self.confirm_school_radio.check()
        else:
            self.click_no_they_go_to_a_different_school()

            self.fill_school_name(name)
        self.click_continue()

    @step("Click No, they go to a different school")
    def click_no_they_go_to_a_different_school(self) -> None:
        self.select_different_school_radio.check()
        self.click_continue()
        self.page.wait_for_load_state()

    @step("Fill school name")
    def fill_school_name(self, school_name: str) -> None:
        self.school_name_combobox.fill(school_name)
        self.page.get_by_role("option", name=school_name).click()

    @step("Click on {1} radio button")
    def click_radio_button(self, name: str) -> None:
        self.page.get_by_role("radio", name=name).check()

    @step("Fill email address")
    def fill_email_address(self, email: str) -> None:
        self.email_address_textbox.fill(email)

    @step("Fill parent name")
    def fill_parent_name(self, parent_name: str) -> None:
        self.full_name_textbox.fill(parent_name)

    def fill_parent_details(
        self,
        parent: Parent,
        phone: str | None = None,
    ) -> None:
        self.fill_parent_name(parent.full_name)
        self.click_radio_button(parent.relationship)

        if parent.email_address:
            self.fill_email_address(parent.email_address)

        if phone:
            self.fill_phone_number_and_receive_text_alerts(phone)

        self.click_continue()

    @step("Agree to doubles vaccinations: {1}")
    def agree_to_doubles_vaccinations(self, *programmes: Programme) -> None:
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
    def agree_to_flu_vaccination(self, consent_option: ConsentOption) -> None:
        if consent_option is ConsentOption.INJECTION:
            self.flu_agree_injection_radio.check()
        else:
            self.flu_agree_nasal_radio.check()
        self.click_continue()
        if consent_option is ConsentOption.NASAL_SPRAY_OR_INJECTION:
            self.answer_yes()
        elif consent_option is ConsentOption.NASAL_SPRAY:
            self.answer_no()

    @step("Agree to HPV vaccination")
    def agree_to_hpv_vaccination(self) -> None:
        self.hpv_consent_agree_radio.check()
        self.click_continue()

    @step("Agree to MMR vaccination (consent option = {1})")
    def agree_to_mmr_vaccination(self, consent_option: ConsentOption) -> None:
        self.mmr_consent_agree_radio.check()
        self.click_continue()
        if consent_option is ConsentOption.MMR_WITHOUT_GELATINE:
            self.mmr_consent_agree_without_gelatine_radio.check()
        elif consent_option is ConsentOption.MMR_EITHER:
            self.mmr_consent_agree_either_radio.check()
        self.click_continue()

    @step("Don't agree to vaccination")
    def dont_agree_to_vaccination(self) -> None:
        self.no_consent_radio.check()
        self.click_continue()

    @step("Fill address details")
    def fill_address_details(
        self,
        line1: str,
        line2: str,
        city: str,
        postcode: str,
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
        self,
        programmes: list[Programme],
    ) -> int:
        return len(
            {
                question
                for programme in programmes
                for question in Programme.health_questions(programme)
            },
        )

    def answer_yes(self, details: str | None = None) -> None:
        self.select_yes()
        if details:
            self.give_details(details)
        self.click_continue()

    def answer_no(self) -> None:
        self.select_no()
        self.click_continue()

    def select_consent_not_given_reason(
        self,
        reason: ConsentRefusalReason,
        details: str | None = None,
    ) -> None:
        self.click_consent_refusal_reason(reason)
        if reason.requires_details:
            self.click_continue()
            self.give_details(str(details))

        self.click_continue()

    def expect_confirmation_text(self, text: str) -> None:
        confirmation = self.page.locator(".nhsuk-panel.nhsuk-panel--confirmation")
        expect(confirmation).to_contain_text(text)

    def go_to_url(self, url: str) -> None:
        self.page.goto(url)

    def fill_details(
        self,
        child: Child,
        parent: Parent,
        schools: list[School],
        *,
        change_school: bool = False,
    ) -> None:
        self.fill_child_name_details(*child.name)
        self.fill_child_date_of_birth(child.date_of_birth)

        if change_school:
            self.select_child_school(schools[1])
        else:
            self.select_child_school(schools[0])

        self.fill_parent_details(parent)

    def answer_health_questions(
        self, number_of_questions: int, *, yes_to_health_questions: bool
    ) -> None:
        for _ in range(number_of_questions):
            if yes_to_health_questions:
                self.answer_yes("More details")
            else:
                self.answer_no()

    def check_final_consent_message(
        self,
        child: Child,
        programmes: list[Programme],
        consent_option: ConsentOption = ConsentOption.INJECTION,
        *,
        yes_to_health_questions: bool,
    ) -> None:
        def programme_display(
            programme: Programme, consent_option: ConsentOption
        ) -> str:
            if programme is Programme.FLU:
                return (
                    "injected flu"
                    if consent_option is ConsentOption.INJECTION
                    else "nasal spray flu"
                )
            if programme is Programme.MMR:
                return "MMR"
            return str(programme)

        programmes_str = " and ".join(
            programme_display(programme, consent_option) for programme in programmes
        )

        if programmes in ([Programme.MENACWY], [Programme.TD_IPV]):
            title = f"Consent for the {programmes_str} vaccination confirmed"
        else:
            title = "Consent confirmed"

        if yes_to_health_questions:
            body = (
                f" As you answered ‘yes’ to some of the health questions, "
                f"we need to check the {programmes_str}"
                f" vaccination{'s are' if len(programmes) > 1 else ' is'} suitable for "
                f"{child.first_name} {child.last_name}. We’ll review your answers and"
                " get in touch again soon."
            )
        else:
            body = (
                f"{child.first_name} {child.last_name} is due to get the "
                f"{programmes_str} vaccination{'s' if len(programmes) > 1 else ''}"
                " at school"
            )
        final_message = f"{title}{body}"
        self.expect_confirmation_text(final_message)
