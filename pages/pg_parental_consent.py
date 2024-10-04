from libs import playwright_ops
from libs.constants import object_properties, actions, data_values


class pg_parental_consent:
    po = playwright_ops.playwright_operations()

    BTN_START_NOW = "Start now"
    TXT_CHILD_FIRST_NAME = "First name"
    TXT_CHILD_LAST_NAME = "Last name"
    RDO_KNOWN_BY_ANOTHER_NAME_YES = "Yes"
    RDO_KNOWN_BY_ANOTHER_NAME_NO = "No"
    TXT_KNOWN_AS = "Known as"
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
    TXT_PHONE = "Phone number (optional)"
    CHK_TEXT_ALERTS = "Tick this box if you’d like"
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
    TXT_DETAILS = "Give details"
    BTN_CONFIRM = "Confirm"
    # LBL_MAIN_CONTENT = "#main-content"
    LBL_MAIN_CONTENT = "div"

    def click_start_now(self):
        self.po.perform_action(locator=self.BTN_START_NOW, action=actions.CLICK_BUTTON)

    def fill_child_name_details(
        self, child_first_name: str, child_last_name: str, known_as: str = data_values.EMPTY
    ) -> None:
        self.po.perform_action(locator=self.TXT_CHILD_FIRST_NAME, action=actions.FILL, value=child_first_name)
        self.po.perform_action(locator=self.TXT_CHILD_LAST_NAME, action=actions.FILL, value=child_last_name)
        if known_as == data_values.EMPTY:
            self.po.perform_action(locator=self.RDO_KNOWN_BY_ANOTHER_NAME_NO, action=actions.RADIO_BUTTON_SELECT)
        else:
            self.po.perform_action(locator=self.RDO_KNOWN_BY_ANOTHER_NAME_YES, action=actions.RADIO_BUTTON_SELECT)
            self.po.perform_action(locator=self.TXT_KNOWN_AS, action=actions.FILL, value=known_as)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def fill_child_dob(self, dob_day: str, dob_month: str, dob_year: str) -> None:
        self.po.perform_action(locator=self.TXT_DOB_DAY, action=actions.FILL, value=dob_day)
        self.po.perform_action(locator=self.TXT_DOB_MONTH, action=actions.FILL, value=dob_month)
        self.po.perform_action(locator=self.TXT_DOB_YEAR, action=actions.FILL, value=dob_year)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def select_child_school(self, school_name: str) -> None:
        # if school_name == self.po.get_object_property(locator=self.LBL_MAIN_CONTENT, property=object_properties.TEXT):
        #     self.po.perform_action(locator=self.RDO_SELECT_SCHOOL, action=actions.RADIO_BUTTON_SELECT)
        # else:
        self.po.perform_action(locator=self.RDO_SELECT_DIFFERENT_SCHOOL, action=actions.RADIO_BUTTON_SELECT)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.perform_action(locator=self.TXT_SCHOOL_NAME, action=actions.SELECT_FROM_LIST, value=school_name)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def fill_parent_details(self, parent_name: str, relation: str, email: str, phone: str) -> None:
        self.po.perform_action(locator=self.TXT_PARENT_NAME, action=actions.FILL, value=parent_name)
        self.po.perform_action(locator=relation, action=actions.RADIO_BUTTON_SELECT)
        self.po.perform_action(locator=self.TXT_EMAIL_ADDRESS, action=actions.FILL, value=email)
        if phone != data_values.EMPTY:
            self.po.perform_action(locator=self.TXT_PHONE, action=actions.FILL, value=phone)
            self.po.perform_action(locator=self.CHK_TEXT_ALERTS, action=actions.CHECKBOX_CHECK)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def check_phone_options(self) -> None:
        self.po.perform_action(locator=self.CHK_MOBILE_ONLY_TEXT, action=actions.CHECKBOX_CHECK)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def select_consent_for_vaccination(self, consented: bool = True) -> None:
        if consented:
            self.po.perform_action(locator=self.CHK_CONSENT_AGREE, action=actions.CHECKBOX_CHECK)
        else:
            self.po.perform_action(locator=self.CHK_CONSENT_DISAGREE, action=actions.CHECKBOX_CHECK)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def fill_gp_details(self, gp_name: str = data_values.EMPTY) -> None:
        if gp_name == data_values.EMPTY:
            self.po.perform_action(locator=self.RDO_GP_NOT_KNOWN, action=actions.RADIO_BUTTON_SELECT)
        else:
            self.po.perform_action(locator=self.RDO_GP_REGISTERED, action=actions.RADIO_BUTTON_SELECT)
            self.po.perform_action(locator=self.TXT_GP_NAME, action=actions.FILL, value=gp_name)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def fill_address_details(self, line1: str, line2: str, city: str, postcode: str) -> None:
        self.po.perform_action(locator=self.TXT_ADDRESS_LINE_1, action=actions.FILL, value=line1)
        self.po.perform_action(locator=self.TXT_ADDRESS_LINE_2, action=actions.FILL, value=line2)
        self.po.perform_action(locator=self.TXT_ADDRESS_CITY, action=actions.FILL, value=city)
        self.po.perform_action(locator=self.TXT_ADDRESS_POSTCODE, action=actions.FILL, value=postcode)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def select_severe_allergies(self, allergy_details: str = data_values.EMPTY) -> None:
        if allergy_details == data_values.EMPTY:
            self.po.perform_action(locator=self.RDO_NO, action=actions.RADIO_BUTTON_SELECT)
        else:
            self.po.perform_action(locator=self.RDO_YES, action=actions.RADIO_BUTTON_SELECT)
            self.po.perform_action(locator=self.TXT_DETAILS, action=actions.FILL, value=allergy_details)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def select_medical_condition(self, medical_condition_details: str = data_values.EMPTY) -> None:
        if medical_condition_details == data_values.EMPTY:
            self.po.perform_action(locator=self.RDO_NO, action=actions.RADIO_BUTTON_SELECT)
        else:
            self.po.perform_action(locator=self.RDO_YES, action=actions.RADIO_BUTTON_SELECT)
            self.po.perform_action(locator=self.TXT_DETAILS, action=actions.FILL, value=medical_condition_details)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def select_severe_reaction(self, reaction_details: str = data_values.EMPTY) -> None:
        if reaction_details == data_values.EMPTY:
            self.po.perform_action(locator=self.RDO_NO, action=actions.RADIO_BUTTON_SELECT)
        else:
            self.po.perform_action(locator=self.RDO_YES, action=actions.RADIO_BUTTON_SELECT)
            self.po.perform_action(locator=self.TXT_DETAILS, action=actions.FILL, value=reaction_details)
        self.po.perform_action(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def confirm_details(self):
        self.po.perform_action(locator=self.BTN_CONFIRM, action=actions.CLICK_BUTTON)

    def final_message(self, expected_message: str):
        self.po.verify(locator="heading", property=object_properties.TEXT, value=expected_message)
