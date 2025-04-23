from typing import Final

from libs import playwright_ops
from libs.generic_constants import element_properties, framework_actions
from libs.mavis_constants import programme_names, test_data_values


class pg_consent_doubles:
    po = playwright_ops.playwright_operations()

    BTN_START_NOW: Final[str] = "Start now"
    TXT_CHILD_FIRST_NAME: Final[str] = "First name"
    TXT_CHILD_LAST_NAME: Final[str] = "Last name"
    RDO_KNOWN_BY_ANOTHER_NAME_YES: Final[str] = "Yes"
    RDO_KNOWN_BY_ANOTHER_NAME_NO: Final[str] = "No"
    TXT_KNOWN_AS_FIRST: Final[str] = "Preferred first name (optional)"
    TXT_KNOWN_AS_LAST: Final[str] = "Preferred last name (optional)"
    BTN_CONTINUE: Final[str] = "Continue"
    TXT_DOB_DAY: Final[str] = "Day"
    TXT_DOB_MONTH: Final[str] = "Month"
    TXT_DOB_YEAR: Final[str] = "Year"
    RDO_SELECT_SCHOOL: Final[str] = "Yes, they go to this school"
    RDO_SELECT_DIFFERENT_SCHOOL: Final[str] = "No, they go to a different school"
    TXT_SCHOOL_NAME: Final[str] = "Select a school"
    TXT_PARENT_FULL_NAME: Final[str] = "Full name"
    RDO_RELATION_DAD: Final[str] = "Dad"
    RDO_RELATION_MUM: Final[str] = "Mum"
    RDO_RELATION_GUARDIAN: Final[str] = "Guardian"
    TXT_EMAIL_ADDRESS: Final[str] = "Email address"
    TXT_PHONE_OPTIONAL: Final[str] = "Phone number (optional)"
    TXT_PHONE: Final[str] = "Phone number"
    CHK_TEXT_ALERTS: Final[str] = "Tick this box if you’d like"
    CHK_TEXT_UPDATES: Final[str] = "Get updates by text message"
    CHK_MOBILE_ONLY_TEXT: Final[str] = "I can only receive text"
    CHK_MOBILE_ONLY_VOICE: Final[str] = "I can only receive voice calls"
    CHK_MOBILE_OTHER: Final[str] = "Other"
    RDO_CONSENT_BOTH: Final[str] = "Yes, I agree to them having"
    RDO_CONSENT_ONE: Final[str] = "I agree to them having one of"
    RDO_CONSENT_MENACWY: Final[str] = "MenACWY"
    RDO_CONSENT_TDIPV: Final[str] = "Td/IPV"
    RDO_CONSENT_NONE: Final[str] = "No"
    RDO_GP_REGISTERED: Final[str] = "Yes, they are registered with a GP"
    RDO_GP_NOT_REGISTERED: Final[str] = "No, they are not registered with a GP"
    RDO_GP_NOT_KNOWN: Final[str] = "I don’t know"
    TXT_GP_NAME: Final[str] = "Name of GP surgery"
    TXT_ADDRESS_LINE_1: Final[str] = "Address line 1"
    TXT_ADDRESS_LINE_2: Final[str] = "Address line 2 (optional)"
    TXT_ADDRESS_CITY: Final[str] = "Town or city"
    TXT_ADDRESS_POSTCODE: Final[str] = "Postcode"
    RDO_YES: Final[str] = "Yes"
    RDO_NO: Final[str] = "No"
    TXT_GIVE_DETAILS: Final[str] = "Give details"
    BTN_CONFIRM: Final[str] = "Confirm"
    LBL_SCHOOL_NAME: Final[str] = "school-name"
    RDO_VACCINE_ALREADY_RECEIVED: Final[str] = "Vaccine already received"
    RDO_VACCINE_WILL_BE_GIVEN_ELSEWHERE: Final[str] = "Vaccine will be given elsewhere"
    RDO_VACCINE_MEDICAL_REASONS: Final[str] = "Medical reasons"
    RDO_PERSONAL_CHOICE: Final[str] = "Personal choice"
    RDO_OTHER: Final[str] = "Other"
    RDO_ONLINE: Final[str] = "Online"
    RDO_IN_PERSON: Final[str] = "In person"
    RDO_YES_THEY_AGREE: Final[str] = "Yes, they agree"
    RDO_NO_THEY_DO_NOT_AGREE: Final[str] = "No, they do not agree"
    RDO_NO_RESPONSE: Final[str] = "No response"
    RDO_YES_SAFE_TO_VACCINATE: Final[str] = "Yes, it’s safe to vaccinate"
    LBL_CONSENT_RECORDED: Final[str] = "Consent recorded for CF"
    LBL_MAIN: Final[str] = "main"
    RDO_PARENT1_DAD: Final[str] = "Parent1 (Dad)"
    RDO_PARENT2_MUM: Final[str] = "Parent2 (Mum)"
    LBL_HEADING: Final[str] = "heading"
    LNK_CHANGE_PHONE: Final[str] = "Change   your phone"
    LNK_ADD_PHONE_NUMBER: Final[str] = "Add phone number"
    RDO_CHILD_GILLICK_COMPETENT: Final[str] = "Child (Gillick competent)"
    BTN_SAVE_TRIAGE: Final[str] = "Save triage"

    # CONSTANTS
    VACCINE_ALREADY_RECEIVED: Final[str] = "vaccine already received"
    VACCINE_WILL_BE_GIVEN_ELSEWHERE: Final[str] = "vaccine will be given elsewhere"
    MEDICAL_REASONS: Final[str] = "medical reasons"
    PERSONAL_CHOICE: Final[str] = "personal choice"

    def click_start_now(self):
        self.po.act(locator=self.BTN_START_NOW, action=framework_actions.CLICK_BUTTON)

    def fill_child_name_details(
        self,
        scenario_id: str,
        child_first_name: str,
        child_last_name: str,
        known_as_first: str = test_data_values.EMPTY,
        known_as_last: str = test_data_values.EMPTY,
    ) -> None:
        self.po.act(locator=self.TXT_CHILD_FIRST_NAME, action=framework_actions.FILL, value=child_first_name)
        self.po.act(locator=self.TXT_CHILD_LAST_NAME, action=framework_actions.FILL, value=child_last_name)
        if known_as_first == test_data_values.EMPTY and known_as_last == test_data_values.EMPTY:
            self.po.act(locator=self.RDO_KNOWN_BY_ANOTHER_NAME_NO, action=framework_actions.RADIO_BUTTON_SELECT)
        else:
            self.po.act(locator=self.RDO_KNOWN_BY_ANOTHER_NAME_YES, action=framework_actions.RADIO_BUTTON_SELECT)
            self.po.act(locator=self.TXT_KNOWN_AS_FIRST, action=framework_actions.FILL, value=known_as_first)
            self.po.act(locator=self.TXT_KNOWN_AS_LAST, action=framework_actions.FILL, value=known_as_last)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)

    def fill_child_dob(self, scenario_id: str, dob_day: str, dob_month: str, dob_year: str) -> None:
        self.po.act(locator=self.TXT_DOB_DAY, action=framework_actions.FILL, value=dob_day)
        self.po.act(locator=self.TXT_DOB_MONTH, action=framework_actions.FILL, value=dob_month)
        self.po.act(locator=self.TXT_DOB_YEAR, action=framework_actions.FILL, value=dob_year)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)

    def select_child_school(self, scenario_id: str, school_name: str) -> None:
        if school_name == self.po.get_element_property(
            locator=self.LBL_SCHOOL_NAME, property=element_properties.TEXT, by_test_id=True
        ):
            self.po.act(locator=self.RDO_SELECT_SCHOOL, action=framework_actions.RADIO_BUTTON_SELECT)
        else:
            self.po.act(locator=self.RDO_SELECT_DIFFERENT_SCHOOL, action=framework_actions.RADIO_BUTTON_SELECT)
            self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
            self.po.act(locator=self.TXT_SCHOOL_NAME, action=framework_actions.SELECT_FROM_LIST, value=school_name)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)

    def fill_parent_details(self, scenario_id: str, parent_name: str, relation: str, email: str, phone: str) -> None:
        self.po.act(locator=self.TXT_PARENT_FULL_NAME, action=framework_actions.FILL, value=parent_name)
        self.po.act(locator=relation, action=framework_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.TXT_EMAIL_ADDRESS, action=framework_actions.FILL, value=email)
        if phone != test_data_values.EMPTY:
            self.po.act(locator=self.TXT_PHONE_OPTIONAL, action=framework_actions.FILL, value=phone)
            self.po.act(locator=self.CHK_TEXT_ALERTS, action=framework_actions.CHECKBOX_CHECK)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)

    def check_phone_options(
        self,
        scenario_id: str,
    ) -> None:
        self.po.act(locator=self.CHK_MOBILE_ONLY_TEXT, action=framework_actions.CHECKBOX_CHECK)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)

    def select_consent_for_vaccination(self, scenario_id: str, consent_for: str) -> None:
        match consent_for.lower():
            case "both":
                self.po.act(locator=self.RDO_CONSENT_BOTH, action=framework_actions.RADIO_BUTTON_SELECT)
            case "menacwy":
                self.po.act(locator=self.RDO_CONSENT_ONE, action=framework_actions.RADIO_BUTTON_SELECT)
                self.po.act(locator=self.RDO_CONSENT_MENACWY, action=framework_actions.RADIO_BUTTON_SELECT)
            case "td/ipv":
                self.po.act(locator=self.RDO_CONSENT_ONE, action=framework_actions.RADIO_BUTTON_SELECT)
                self.po.act(locator=self.RDO_CONSENT_TDIPV, action=framework_actions.RADIO_BUTTON_SELECT)
            case _:
                self.po.act(locator=self.RDO_CONSENT_NONE, action=framework_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)

    def fill_gp_details(self, scenario_id: str, gp_name: str = test_data_values.EMPTY) -> None:
        if gp_name == test_data_values.EMPTY:
            self.po.act(locator=self.RDO_GP_NOT_KNOWN, action=framework_actions.RADIO_BUTTON_SELECT)
        else:
            self.po.act(locator=self.RDO_GP_REGISTERED, action=framework_actions.RADIO_BUTTON_SELECT)
            self.po.act(locator=self.TXT_GP_NAME, action=framework_actions.FILL, value=gp_name)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)

    def fill_address_details(self, scenario_id: str, line1: str, line2: str, city: str, postcode: str) -> None:
        self.po.act(locator=self.TXT_ADDRESS_LINE_1, action=framework_actions.FILL, value=line1)
        self.po.act(locator=self.TXT_ADDRESS_LINE_2, action=framework_actions.FILL, value=line2)
        self.po.act(locator=self.TXT_ADDRESS_CITY, action=framework_actions.FILL, value=city)
        self.po.act(locator=self.TXT_ADDRESS_POSTCODE, action=framework_actions.FILL, value=postcode)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)

    def select_bleeding_disorder(
        self, scenario_id: str, bleeding_disorder_details: str = test_data_values.EMPTY
    ) -> None:
        if bleeding_disorder_details == test_data_values.EMPTY:
            self.po.act(locator=self.RDO_NO, action=framework_actions.RADIO_BUTTON_SELECT)
        else:
            self.po.act(locator=self.RDO_YES, action=framework_actions.RADIO_BUTTON_SELECT)
            self.po.act(locator=self.TXT_GIVE_DETAILS, action=framework_actions.FILL, value=bleeding_disorder_details)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)

    def select_severe_allergies(self, scenario_id: str, allergy_details: str = test_data_values.EMPTY) -> None:
        if allergy_details == test_data_values.EMPTY:
            self.po.act(locator=self.RDO_NO, action=framework_actions.RADIO_BUTTON_SELECT)
        else:
            self.po.act(locator=self.RDO_YES, action=framework_actions.RADIO_BUTTON_SELECT)
            self.po.act(locator=self.TXT_GIVE_DETAILS, action=framework_actions.FILL, value=allergy_details)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)

    def select_severe_reaction(self, scenario_id: str, reaction_details: str = test_data_values.EMPTY) -> None:
        if reaction_details == test_data_values.EMPTY:
            self.po.act(locator=self.RDO_NO, action=framework_actions.RADIO_BUTTON_SELECT)
        else:
            self.po.act(locator=self.RDO_YES, action=framework_actions.RADIO_BUTTON_SELECT)
            self.po.act(locator=self.TXT_GIVE_DETAILS, action=framework_actions.FILL, value=reaction_details)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)

    def select_extra_support(self, scenario_id: str, extra_support_details: str = test_data_values.EMPTY) -> None:
        if extra_support_details == test_data_values.EMPTY:
            self.po.act(locator=self.RDO_NO, action=framework_actions.RADIO_BUTTON_SELECT)
        else:
            self.po.act(locator=self.RDO_YES, action=framework_actions.RADIO_BUTTON_SELECT)
            self.po.act(locator=self.TXT_GIVE_DETAILS, action=framework_actions.FILL, value=extra_support_details)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)

    def vaccinated_in_past(self, scenario_id: str, vaccs_in_past_details: str = test_data_values.EMPTY) -> None:
        if vaccs_in_past_details == test_data_values.EMPTY:
            self.po.act(locator=self.RDO_NO, action=framework_actions.RADIO_BUTTON_SELECT)
        else:
            self.po.act(locator=self.RDO_YES, action=framework_actions.RADIO_BUTTON_SELECT)
            self.po.act(locator=self.TXT_GIVE_DETAILS, action=framework_actions.FILL, value=vaccs_in_past_details)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)

    def other_vaccs_in_past(self, scenario_id: str, other_vaccs_in_past_details: str = test_data_values.EMPTY) -> None:
        if other_vaccs_in_past_details == test_data_values.EMPTY:
            self.po.act(locator=self.RDO_NO, action=framework_actions.RADIO_BUTTON_SELECT)
        else:
            self.po.act(locator=self.RDO_YES, action=framework_actions.RADIO_BUTTON_SELECT)
            self.po.act(
                locator=self.TXT_GIVE_DETAILS, action=framework_actions.FILL, value=other_vaccs_in_past_details
            )
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)

    def click_confirm_details(
        self,
        scenario_id: str,
    ) -> None:
        if "mavis-1778" in scenario_id.lower():
            self.po.act(locator=self.LNK_CHANGE_PHONE, action=framework_actions.CLICK_LINK)
            self.change_parent_phone()
        self.po.act(locator=self.BTN_CONFIRM, action=framework_actions.CLICK_BUTTON)

    def verify_final_message(self, scenario_id: str, expected_message: str) -> None:
        self.po.verify(locator=self.LBL_MAIN, property=element_properties.TEXT, expected_value=expected_message)

    def select_consent_not_given_reason(self, scenario_id: str, reason: str, reason_details: str) -> None:
        match reason.lower():
            case self.VACCINE_ALREADY_RECEIVED:
                self.po.act(locator=self.RDO_VACCINE_ALREADY_RECEIVED, action=framework_actions.RADIO_BUTTON_SELECT)
                self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
                self.po.act(locator=self.TXT_GIVE_DETAILS, action=framework_actions.FILL, value=reason_details)
            case self.VACCINE_WILL_BE_GIVEN_ELSEWHERE:
                self.po.act(
                    locator=self.RDO_VACCINE_WILL_BE_GIVEN_ELSEWHERE, action=framework_actions.RADIO_BUTTON_SELECT
                )
                self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
                self.po.act(locator=self.TXT_GIVE_DETAILS, action=framework_actions.FILL, value=reason_details)
            case self.MEDICAL_REASONS:
                self.po.act(locator=self.RDO_VACCINE_MEDICAL_REASONS, action=framework_actions.RADIO_BUTTON_SELECT)
                self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
                self.po.act(locator=self.TXT_GIVE_DETAILS, action=framework_actions.FILL, value=reason_details)
            case self.PERSONAL_CHOICE:
                self.po.act(locator=self.RDO_PERSONAL_CHOICE, action=framework_actions.RADIO_BUTTON_SELECT)
            case _:  # Other
                self.po.act(locator=self.RDO_OTHER, action=framework_actions.RADIO_BUTTON_SELECT)
                self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
                self.po.act(locator=self.TXT_GIVE_DETAILS, action=framework_actions.FILL, value=reason_details)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)

    def service_give_consent(self):
        self.po.act(locator=self.RDO_PARENT1_DAD, action=framework_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)  # Parent contact details page
        self.po.act(locator=self.RDO_ONLINE, action=framework_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self.po.act(locator=self.RDO_YES_THEY_AGREE, action=framework_actions.RADIO_BUTTON_SELECT)
        # self.po.perform_action(locator=self.RDO_NO_THEY_DO_NOT_AGREE , action=actions.RADIO_BUTTON_SELECT)
        # self.po.perform_action(locator=self.RDO_NO_RESPONSE , action=actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        # page.get_by_role("group", name="Does your child have any severe allergies?").get_by_label("Yes").check()
        # page.get_by_role("textbox", name="Give details").click()
        # page.get_by_role("textbox", name="Give details").fill("Severe allergies")
        self.set_health_questions_no()
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self.po.act(locator=self.RDO_YES_SAFE_TO_VACCINATE, action=framework_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self.po.act(locator=self.BTN_CONFIRM, action=framework_actions.CLICK_BUTTON)

    def service_refuse_consent(self):
        self.po.act(locator=self.RDO_PARENT1_DAD, action=framework_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)  # Parent contact details page
        self.po.act(locator=self.RDO_ONLINE, action=framework_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self.po.act(locator=self.RDO_NO_THEY_DO_NOT_AGREE, action=framework_actions.RADIO_BUTTON_SELECT)
        # self.po.perform_action(locator=self.RDO_NO_RESPONSE , action=actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self.po.act(locator=self.RDO_VACCINE_ALREADY_RECEIVED, action=framework_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self.po.act(
            locator=self.TXT_GIVE_DETAILS, action=framework_actions.FILL, value=self.VACCINE_WILL_BE_GIVEN_ELSEWHERE
        )
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self.po.act(locator=self.BTN_CONFIRM, action=framework_actions.CLICK_BUTTON)
        self.po.verify(
            locator=self.LBL_MAIN,
            property=element_properties.TEXT,
            expected_value=self.LBL_CONSENT_RECORDED,
            exact=False,
        )

    def parent_1_verbal_no_response(self):
        self.po.act(locator=self.RDO_PARENT1_DAD, action=framework_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)  # Parent contact details page
        self.po.act(locator=self.RDO_IN_PERSON, action=framework_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self.po.act(locator=self.RDO_NO_RESPONSE, action=framework_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self.po.act(locator=self.BTN_CONFIRM, action=framework_actions.CLICK_BUTTON)

    def parent_2_verbal_refuse_consent(self):
        self.po.act(locator=self.RDO_PARENT2_MUM, action=framework_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)  # Parent contact details page
        self.po.act(locator=self.RDO_IN_PERSON, action=framework_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self.po.act(locator=self.RDO_NO_THEY_DO_NOT_AGREE, action=framework_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self.po.act(locator=self.RDO_PERSONAL_CHOICE, action=framework_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self.po.act(locator=self.BTN_CONFIRM, action=framework_actions.CLICK_BUTTON)

    def change_parent_phone(self):  # MAVIS-1778
        self.po.act(locator=self.TXT_PHONE_OPTIONAL, action=framework_actions.FILL, value="7700900000")
        self.po.act(locator=self.CHK_TEXT_ALERTS, action=framework_actions.CHECKBOX_CHECK)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self.check_phone_options(scenario_id="")

    def parent_1_verbal_positive(self, change_phone: bool = True, programme_name: str = programme_names.MENACWY):
        self.po.act(locator=self.RDO_PARENT1_DAD, action=framework_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)  # Parent contact details page
        self.po.act(locator=self.RDO_IN_PERSON, action=framework_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self.po.act(locator=self.RDO_YES_THEY_AGREE, action=framework_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self.set_health_questions_no(programme_name=programme_name)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self.po.act(locator=self.RDO_YES_SAFE_TO_VACCINATE, action=framework_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        if change_phone:
            self.po.act(locator=self.LNK_ADD_PHONE_NUMBER, action=framework_actions.CLICK_LINK)
            self.po.act(locator=self.TXT_PHONE, action=framework_actions.FILL, value="7700900000")
            self.po.act(locator=self.CHK_TEXT_UPDATES, action=framework_actions.CHECKBOX_CHECK)
            self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
            self.check_phone_options(scenario_id="")
        self.po.act(locator=self.BTN_CONFIRM, action=framework_actions.CLICK_BUTTON)

    def parent_1_online_positive(self):
        self.po.act(locator=self.RDO_PARENT1_DAD, action=framework_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)  # Parent contact details page
        self.po.act(locator=self.RDO_ONLINE, action=framework_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self.po.act(locator=self.RDO_YES_THEY_AGREE, action=framework_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self.set_health_questions_no()
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self.po.act(locator=self.RDO_YES_SAFE_TO_VACCINATE, action=framework_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self.po.act(locator=self.LNK_ADD_PHONE_NUMBER, action=framework_actions.CLICK_LINK)
        self.po.act(locator=self.TXT_PHONE, action=framework_actions.FILL, value="7700900000")
        self.po.act(locator=self.CHK_TEXT_UPDATES, action=framework_actions.CHECKBOX_CHECK)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)  # Online consent
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)  # Yes they agree
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)  # Health questions again
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)  # Safe to vaccinate
        self.po.act(locator=self.BTN_CONFIRM, action=framework_actions.CLICK_BUTTON)

    def set_health_questions_no(self, programme_name: str):
        if programme_name == programme_names.MENACWY:
            self.po.act(
                locator="get_by_role('group', name='Does your child have a bleeding disorder or another medical condition they').get_by_label('No').check()",
                action=framework_actions.CHAIN_LOCATOR_ACTION,
            )
            self.po.act(
                locator="get_by_role('group', name='Does your child have any').get_by_label('No').check()",
                action=framework_actions.CHAIN_LOCATOR_ACTION,
            )
            self.po.act(
                locator="get_by_role('group', name='Has your child ever had a').get_by_label('No').check()",
                action=framework_actions.CHAIN_LOCATOR_ACTION,
            )
            self.po.act(
                locator="get_by_role('group', name='Does your child need extra').get_by_label('No').check()",
                action=framework_actions.CHAIN_LOCATOR_ACTION,
            )
            self.po.act(
                locator="get_by_role('group', name='Has your child had a').get_by_label('No').check()",
                action=framework_actions.CHAIN_LOCATOR_ACTION,
            )
        else:
            self.po.act(
                locator="get_by_role('group', name='Does your child have a bleeding disorder or another medical condition they').get_by_label('No').check()",
                action=framework_actions.CHAIN_LOCATOR_ACTION,
            )
            self.po.act(
                locator="get_by_role('group', name='Does your child have any').get_by_label('No').check()",
                action=framework_actions.CHAIN_LOCATOR_ACTION,
            )
            self.po.act(
                locator="get_by_role('group', name='Has your child ever had a').get_by_label('No').check()",
                action=framework_actions.CHAIN_LOCATOR_ACTION,
            )
            self.po.act(
                locator="get_by_role('group', name='Does your child need extra').get_by_label('No').check()",
                action=framework_actions.CHAIN_LOCATOR_ACTION,
            )
            self.po.act(
                locator="get_by_role('group', name='Has your child had a tetanus').get_by_label('No').check()",
                action=framework_actions.CHAIN_LOCATOR_ACTION,
            )

    def child_consent_verbal_positive(self):
        self.po.act(locator=self.RDO_CHILD_GILLICK_COMPETENT, action=framework_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self.po.act(locator=self.RDO_YES_THEY_AGREE, action=framework_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self.po.act(
            locator=self.RDO_YES, action=framework_actions.RADIO_BUTTON_SELECT
        )  # Yes send notification to parents
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self.set_health_questions_no()
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self.po.act(locator=self.RDO_YES_SAFE_TO_VACCINATE, action=framework_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self.po.act(locator=self.BTN_CONFIRM, action=framework_actions.CLICK_BUTTON)

    def update_triage_outcome_positive(self):
        self.po.act(locator=self.RDO_YES_SAFE_TO_VACCINATE, action=framework_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_SAVE_TRIAGE, action=framework_actions.CLICK_BUTTON)
        self.po.verify(
            locator=self.LBL_MAIN, property=element_properties.TEXT, expected_value="Triage outcome updated for"
        )

    def parent_1_verbal_refuse_consent(self):
        self.po.act(locator=self.RDO_PARENT1_DAD, action=framework_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)  # Parent contact details page
        self.po.act(locator=self.RDO_IN_PERSON, action=framework_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self.po.act(locator=self.RDO_NO_THEY_DO_NOT_AGREE, action=framework_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self.po.act(locator=self.RDO_PERSONAL_CHOICE, action=framework_actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=framework_actions.CLICK_BUTTON)
        self.po.act(locator=self.BTN_CONFIRM, action=framework_actions.CLICK_BUTTON)
