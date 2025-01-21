from libs import playwright_ops
from libs.constants import actions, data_values, object_properties


class pg_parental_consent:
    po = playwright_ops.playwright_operations()

    BTN_START_NOW = "Start now"
    TXT_CHILD_FIRST_NAME = "First name"
    TXT_CHILD_LAST_NAME = "Last name"
    RDO_KNOWN_BY_ANOTHER_NAME_YES = "Yes"
    RDO_KNOWN_BY_ANOTHER_NAME_NO = "No"
    TXT_KNOWN_AS_FIRST = "Preferred first name (optional)"
    TXT_KNOWN_AS_LAST = "Preferred last name (optional)"
    BTN_CONTINUE = "Continue"
    TXT_DOB_DAY = "Day"
    TXT_DOB_MONTH = "Month"
    TXT_DOB_YEAR = "Year"
    RDO_SELECT_SCHOOL = "Yes, they go to this school"
    RDO_SELECT_DIFFERENT_SCHOOL = "No, they go to a different school"
    TXT_SCHOOL_NAME = "Select a school"
    TXT_PARENT_NAME = "Your name"
    RDO_RELATION_DAD = "Dad"
    RDO_RELATION_MUM = "Mum"
    RDO_RELATION_GUARDIAN = "Guardian"
    TXT_EMAIL_ADDRESS = "Email address"
    TXT_PHONE_OPTIONAL = "Phone number (optional)"
    TXT_PHONE = "Phone number"
    CHK_TEXT_ALERTS = "Tick this box if you’d like"
    CHK_TEXT_UPDATES = "Get updates by text message"
    CHK_MOBILE_ONLY_TEXT = "I can only receive text"
    CHK_MOBILE_ONLY_VOICE = "I can only receive voice calls"
    CHK_MOBILE_OTHER = "Other"
    CHK_CONSENT_AGREE = "Yes, I agree"
    CHK_CONSENT_DISAGREE = "No"
    RDO_GP_REGISTERED = "Yes, they are registered with a GP"
    RDO_GP_NOT_REGISTERED = "No, they are not registered with a GP"
    RDO_GP_NOT_KNOWN = "I don’t know"
    TXT_GP_NAME = "Name of GP surgery"
    TXT_ADDRESS_LINE_1 = "Address line 1"
    TXT_ADDRESS_LINE_2 = "Address line 2 (optional)"
    TXT_ADDRESS_CITY = "Town or city"
    TXT_ADDRESS_POSTCODE = "Postcode"
    RDO_YES = "Yes"
    RDO_NO = "No"
    TXT_GIVE_DETAILS = "Give details"
    BTN_CONFIRM = "Confirm"
    LBL_SCHOOL_NAME = "school-name"
    RDO_VACCINE_ALREADY_RECEIVED = "Vaccine already received"
    RDO_VACCINE_WILL_BE_GIVEN_ELSEWHERE = "Vaccine will be given elsewhere"
    RDO_VACCINE_MEDICAL_REASONS = "Medical reasons"
    RDO_PERSONAL_CHOICE = "Personal choice"
    RDO_OTHER = "Other"
    RDO_ONLINE = "Online"
    RDO_IN_PERSON = "In person"
    RDO_YES_THEY_AGREE = "Yes, they agree"
    RDO_NO_THEY_DO_NOT_AGREE = "No, they do not agree"
    RDO_NO_RESPONSE = "No response"
    RDO_YES_SAFE_TO_VACCINATE = "Yes, it’s safe to vaccinate"
    LBL_CONSENT_RECORDED = "Consent recorded for CF"
    LBL_MAIN = "main"
    RDO_PARENT1_DAD = "Parent1 (Dad)"
    RDO_PARENT2_MUM = "Parent2 (Mum)"
    LBL_HEADING = "heading"
    LNK_CHANGE_PHONE = "Change   your phone"
    LNK_ADD_PHONE_NUMBER = "Add phone number"

    # CONSTANTS
    VACCINE_ALREADY_RECEIVED = "vaccine already received"
    VACCINE_WILL_BE_GIVEN_ELSEWHERE = "vaccine will be given elsewhere"
    MEDICAL_REASONS = "medical reasons"
    PERSONAL_CHOICE = "personal choice"

    def click_start_now(self):
        self.po.perform_action(locator=self.BTN_START_NOW, action=actions.CLICK_BUTTON)

    def fill_child_name_details(
        self,
        scenario_id: str,
        child_first_name: str,
        child_last_name: str,
        known_as_first: str = data_values.EMPTY,
        known_as_last: str = data_values.EMPTY,
    ) -> None:
        self.po.perform_action(locator=self.TXT_CHILD_FIRST_NAME, action=actions.FILL, value=child_first_name)
        self.po.perform_action(locator=self.TXT_CHILD_LAST_NAME, action=actions.FILL, value=child_last_name)
        if known_as_first == data_values.EMPTY and known_as_last == data_values.EMPTY:
            self.po.perform_action(locator=self.RDO_KNOWN_BY_ANOTHER_NAME_NO, action=actions.RADIO_BUTTON_SELECT)
        else:
            self.po.perform_action(locator=self.RDO_KNOWN_BY_ANOTHER_NAME_YES, action=actions.RADIO_BUTTON_SELECT)
            self.po.perform_action(locator=self.TXT_KNOWN_AS_FIRST, action=actions.FILL, value=known_as_first)
            self.po.perform_action(locator=self.TXT_KNOWN_AS_LAST, action=actions.FILL, value=known_as_last)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def fill_child_dob(self, scenario_id: str, dob_day: str, dob_month: str, dob_year: str) -> None:
        self.po.perform_action(locator=self.TXT_DOB_DAY, action=actions.FILL, value=dob_day)
        self.po.perform_action(locator=self.TXT_DOB_MONTH, action=actions.FILL, value=dob_month)
        self.po.perform_action(locator=self.TXT_DOB_YEAR, action=actions.FILL, value=dob_year)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def select_child_school(self, scenario_id: str, school_name: str) -> None:
        if school_name == self.po.get_object_property(
            locator=self.LBL_SCHOOL_NAME, property=object_properties.TEXT, by_test_id=True
        ):
            self.po.perform_action(locator=self.RDO_SELECT_SCHOOL, action=actions.RADIO_BUTTON_SELECT)
        else:
            self.po.perform_action(locator=self.RDO_SELECT_DIFFERENT_SCHOOL, action=actions.RADIO_BUTTON_SELECT)
            self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
            self.po.perform_action(locator=self.TXT_SCHOOL_NAME, action=actions.SELECT_FROM_LIST, value=school_name)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def fill_parent_details(self, scenario_id: str, parent_name: str, relation: str, email: str, phone: str) -> None:
        self.po.perform_action(locator=self.TXT_PARENT_NAME, action=actions.FILL, value=parent_name)
        self.po.perform_action(locator=relation, action=actions.RADIO_BUTTON_SELECT)
        self.po.perform_action(locator=self.TXT_EMAIL_ADDRESS, action=actions.FILL, value=email)
        if phone != data_values.EMPTY:
            self.po.perform_action(locator=self.TXT_PHONE_OPTIONAL, action=actions.FILL, value=phone)
            self.po.perform_action(locator=self.CHK_TEXT_ALERTS, action=actions.CHECKBOX_CHECK)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def check_phone_options(
        self,
        scenario_id: str,
    ) -> None:
        self.po.perform_action(locator=self.CHK_MOBILE_ONLY_TEXT, action=actions.CHECKBOX_CHECK)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def select_consent_for_vaccination(self, scenario_id: str, consented: bool = True) -> None:
        if consented:
            self.po.perform_action(locator=self.CHK_CONSENT_AGREE, action=actions.CHECKBOX_CHECK)
        else:
            self.po.perform_action(locator=self.CHK_CONSENT_DISAGREE, action=actions.CHECKBOX_CHECK)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def fill_gp_details(self, scenario_id: str, gp_name: str = data_values.EMPTY) -> None:
        if gp_name == data_values.EMPTY:
            self.po.perform_action(locator=self.RDO_GP_NOT_KNOWN, action=actions.RADIO_BUTTON_SELECT)
        else:
            self.po.perform_action(locator=self.RDO_GP_REGISTERED, action=actions.RADIO_BUTTON_SELECT)
            self.po.perform_action(locator=self.TXT_GP_NAME, action=actions.FILL, value=gp_name)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def fill_address_details(self, scenario_id: str, line1: str, line2: str, city: str, postcode: str) -> None:
        self.po.perform_action(locator=self.TXT_ADDRESS_LINE_1, action=actions.FILL, value=line1)
        self.po.perform_action(locator=self.TXT_ADDRESS_LINE_2, action=actions.FILL, value=line2)
        self.po.perform_action(locator=self.TXT_ADDRESS_CITY, action=actions.FILL, value=city)
        self.po.perform_action(locator=self.TXT_ADDRESS_POSTCODE, action=actions.FILL, value=postcode)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def select_severe_allergies(self, scenario_id: str, allergy_details: str = data_values.EMPTY) -> None:
        if allergy_details == data_values.EMPTY:
            self.po.perform_action(locator=self.RDO_NO, action=actions.RADIO_BUTTON_SELECT)
        else:
            self.po.perform_action(locator=self.RDO_YES, action=actions.RADIO_BUTTON_SELECT)
            self.po.perform_action(locator=self.TXT_GIVE_DETAILS, action=actions.FILL, value=allergy_details)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def select_medical_condition(self, scenario_id: str, medical_condition_details: str = data_values.EMPTY) -> None:
        if medical_condition_details == data_values.EMPTY:
            self.po.perform_action(locator=self.RDO_NO, action=actions.RADIO_BUTTON_SELECT)
        else:
            self.po.perform_action(locator=self.RDO_YES, action=actions.RADIO_BUTTON_SELECT)
            self.po.perform_action(locator=self.TXT_GIVE_DETAILS, action=actions.FILL, value=medical_condition_details)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def select_severe_reaction(self, scenario_id: str, reaction_details: str = data_values.EMPTY) -> None:
        if reaction_details == data_values.EMPTY:
            self.po.perform_action(locator=self.RDO_NO, action=actions.RADIO_BUTTON_SELECT)
        else:
            self.po.perform_action(locator=self.RDO_YES, action=actions.RADIO_BUTTON_SELECT)
            self.po.perform_action(locator=self.TXT_GIVE_DETAILS, action=actions.FILL, value=reaction_details)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def select_extra_support(self, scenario_id: str, extra_support_details: str = data_values.EMPTY) -> None:
        if extra_support_details == data_values.EMPTY:
            self.po.perform_action(locator=self.RDO_NO, action=actions.RADIO_BUTTON_SELECT)
        else:
            self.po.perform_action(locator=self.RDO_YES, action=actions.RADIO_BUTTON_SELECT)
            self.po.perform_action(locator=self.TXT_GIVE_DETAILS, action=actions.FILL, value=extra_support_details)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def click_confirm_details(
        self,
        scenario_id: str,
    ) -> None:
        if "mavis-1778" in scenario_id.lower():
            self.po.perform_action(locator=self.LNK_CHANGE_PHONE, action=actions.CLICK_LINK)
            self.change_parent_phone()
        self.po.perform_action(locator=self.BTN_CONFIRM, action=actions.CLICK_BUTTON)

    def verify_final_message(self, scenario_id: str, expected_message: str) -> None:
        self.po.verify(locator=self.LBL_HEADING, property=object_properties.TEXT, expected_value=expected_message)

    def select_consent_not_given_reason(self, scenario_id: str, reason: str, reason_details: str) -> None:
        match reason.lower():
            case self.VACCINE_ALREADY_RECEIVED:
                self.po.perform_action(locator=self.RDO_VACCINE_ALREADY_RECEIVED, action=actions.RADIO_BUTTON_SELECT)
                self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
                self.po.perform_action(locator=self.TXT_GIVE_DETAILS, action=actions.FILL, value=reason_details)
            case self.VACCINE_WILL_BE_GIVEN_ELSEWHERE:
                self.po.perform_action(
                    locator=self.RDO_VACCINE_WILL_BE_GIVEN_ELSEWHERE, action=actions.RADIO_BUTTON_SELECT
                )
                self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
                self.po.perform_action(locator=self.TXT_GIVE_DETAILS, action=actions.FILL, value=reason_details)
            case self.MEDICAL_REASONS:
                self.po.perform_action(locator=self.RDO_VACCINE_MEDICAL_REASONS, action=actions.RADIO_BUTTON_SELECT)
                self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
                self.po.perform_action(locator=self.TXT_GIVE_DETAILS, action=actions.FILL, value=reason_details)
            case self.PERSONAL_CHOICE:
                self.po.perform_action(locator=self.RDO_PERSONAL_CHOICE, action=actions.RADIO_BUTTON_SELECT)
            case _:  # Other
                self.po.perform_action(locator=self.RDO_OTHER, action=actions.RADIO_BUTTON_SELECT)
                self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
                self.po.perform_action(locator=self.TXT_GIVE_DETAILS, action=actions.FILL, value=reason_details)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def service_give_consent(self):
        self.po.perform_action(locator=self.RDO_PARENT1_DAD, action=actions.RADIO_BUTTON_SELECT)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)  # Parent contact details page
        self.po.perform_action(locator=self.RDO_ONLINE, action=actions.RADIO_BUTTON_SELECT)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.perform_action(locator=self.RDO_YES_THEY_AGREE, action=actions.RADIO_BUTTON_SELECT)
        # self.po.perform_action(locator=self.RDO_NO_THEY_DO_NOT_AGREE , action=actions.RADIO_BUTTON_SELECT)
        # self.po.perform_action(locator=self.RDO_NO_RESPONSE , action=actions.RADIO_BUTTON_SELECT)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        # page.get_by_role("group", name="Does your child have any severe allergies?").get_by_label("Yes").check()
        # page.get_by_role("textbox", name="Give details").click()
        # page.get_by_role("textbox", name="Give details").fill("Severe allergies")
        self.set_health_questions_no()
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.perform_action(locator=self.RDO_YES_SAFE_TO_VACCINATE, action=actions.RADIO_BUTTON_SELECT)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.perform_action(locator=self.BTN_CONFIRM, action=actions.CLICK_BUTTON)

    def service_refuse_consent(self):
        self.po.perform_action(locator=self.RDO_PARENT1_DAD, action=actions.RADIO_BUTTON_SELECT)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)  # Parent contact details page
        self.po.perform_action(locator=self.RDO_ONLINE, action=actions.RADIO_BUTTON_SELECT)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.perform_action(locator=self.RDO_NO_THEY_DO_NOT_AGREE, action=actions.RADIO_BUTTON_SELECT)
        # self.po.perform_action(locator=self.RDO_NO_RESPONSE , action=actions.RADIO_BUTTON_SELECT)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.perform_action(locator=self.RDO_VACCINE_ALREADY_RECEIVED, action=actions.RADIO_BUTTON_SELECT)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.perform_action(
            locator=self.TXT_GIVE_DETAILS, action=actions.FILL, value=self.VACCINE_WILL_BE_GIVEN_ELSEWHERE
        )
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.perform_action(locator=self.BTN_CONFIRM, action=actions.CLICK_BUTTON)
        self.po.verify(
            locator=self.LBL_MAIN,
            property=object_properties.TEXT,
            expected_value=self.LBL_CONSENT_RECORDED,
            exact=False,
        )

    def parent_1_verbal_no_response(self):
        self.po.perform_action(locator=self.RDO_PARENT1_DAD, action=actions.RADIO_BUTTON_SELECT)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)  # Parent contact details page
        self.po.perform_action(locator=self.RDO_IN_PERSON, action=actions.RADIO_BUTTON_SELECT)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.perform_action(locator=self.RDO_NO_RESPONSE, action=actions.RADIO_BUTTON_SELECT)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.perform_action(locator=self.BTN_CONFIRM, action=actions.CLICK_BUTTON)

    def parent_2_verbal_refuse_consent(self):
        self.po.perform_action(locator=self.RDO_PARENT2_MUM, action=actions.RADIO_BUTTON_SELECT)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)  # Parent contact details page
        self.po.perform_action(locator=self.RDO_IN_PERSON, action=actions.RADIO_BUTTON_SELECT)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.perform_action(locator=self.RDO_NO_THEY_DO_NOT_AGREE, action=actions.RADIO_BUTTON_SELECT)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.perform_action(locator=self.RDO_PERSONAL_CHOICE, action=actions.RADIO_BUTTON_SELECT)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.perform_action(locator=self.BTN_CONFIRM, action=actions.CLICK_BUTTON)

    def change_parent_phone(self):  # MAVIS-1778
        self.po.perform_action(locator=self.TXT_PHONE_OPTIONAL, action=actions.FILL, value="7700900000")
        self.po.perform_action(locator=self.CHK_TEXT_ALERTS, action=actions.CHECKBOX_CHECK)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.check_phone_options(scenario_id="")

    def parent_1_verbal_positive(self):
        self.po.perform_action(locator=self.RDO_PARENT1_DAD, action=actions.RADIO_BUTTON_SELECT)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)  # Parent contact details page
        self.po.perform_action(locator=self.RDO_IN_PERSON, action=actions.RADIO_BUTTON_SELECT)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.perform_action(locator=self.RDO_YES_THEY_AGREE, action=actions.RADIO_BUTTON_SELECT)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.set_health_questions_no()
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.perform_action(locator=self.RDO_YES_SAFE_TO_VACCINATE, action=actions.RADIO_BUTTON_SELECT)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.perform_action(locator=self.LNK_ADD_PHONE_NUMBER, action=actions.CLICK_LINK)
        self.po.perform_action(locator=self.TXT_PHONE, action=actions.FILL, value="7700900000")
        self.po.perform_action(locator=self.CHK_TEXT_UPDATES, action=actions.CHECKBOX_CHECK)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.check_phone_options(scenario_id="")
        self.po.perform_action(locator=self.BTN_CONFIRM, action=actions.CLICK_BUTTON)

    def parent_1_online_positive(self):
        self.po.perform_action(locator=self.RDO_PARENT1_DAD, action=actions.RADIO_BUTTON_SELECT)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)  # Parent contact details page
        self.po.perform_action(locator=self.RDO_ONLINE, action=actions.RADIO_BUTTON_SELECT)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.perform_action(locator=self.RDO_YES_THEY_AGREE, action=actions.RADIO_BUTTON_SELECT)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.set_health_questions_no()
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.perform_action(locator=self.RDO_YES_SAFE_TO_VACCINATE, action=actions.RADIO_BUTTON_SELECT)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.perform_action(locator=self.LNK_ADD_PHONE_NUMBER, action=actions.CLICK_LINK)
        self.po.perform_action(locator=self.TXT_PHONE, action=actions.FILL, value="7700900000")
        self.po.perform_action(locator=self.CHK_TEXT_UPDATES, action=actions.CHECKBOX_CHECK)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)  # Online consent
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)  # Yes they agree
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)  # Health questions again
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)  # Safe to vaccinate
        self.po.perform_action(locator=self.BTN_CONFIRM, action=actions.CLICK_BUTTON)

    def set_health_questions_no(self):
        self.po.perform_action(
            locator="get_by_role('group', name='Does your child have any severe allergies?').get_by_label('No').check()",
            action=actions.CHAIN_LOCATOR_ACTION,
        )
        self.po.perform_action(
            locator="get_by_role('group', name='Does your child have any medical conditions for which they receive treatment?').get_by_label('No').check()",
            action=actions.CHAIN_LOCATOR_ACTION,
        )
        self.po.perform_action(
            locator="get_by_role('group', name='Has your child ever had a').get_by_label('No').check()",
            action=actions.CHAIN_LOCATOR_ACTION,
        )
        self.po.perform_action(
            locator="get_by_role('group', name='Does your child need extra').get_by_label('No').check()",
            action=actions.CHAIN_LOCATOR_ACTION,
        )
