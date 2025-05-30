from typing import Final, Optional

from ..generic_constants import actions, properties
from ..mavis_constants import Programme
from ..onboarding import School
from ..playwright_ops import PlaywrightOperations


class ConsentPage:
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
    LBL_MAIN: Final[str] = "main"
    RDO_PARENT1_DAD: Final[str] = "Parent1 (Dad)"
    RDO_PARENT2_MUM: Final[str] = "Parent2 (Mum)"
    LBL_HEADING: Final[str] = "heading"
    LNK_CHANGE_PHONE: Final[str] = "Change   your phone"
    LNK_ADD_PHONE_NUMBER: Final[str] = "Add phone number"
    RDO_CHILD_GILLICK_COMPETENT: Final[str] = "Child (Gillick competent)"
    BTN_SAVE_TRIAGE: Final[str] = "Save triage"

    # DOUBLES
    RDO_DOUBLES_CONSENT_BOTH: Final[str] = "Yes, I agree to them having"
    RDO_DOUBLES_CONSENT_ONE: Final[str] = "I agree to them having one of"
    RDO_DOUBLES_CONSENT_MENACWY: Final[str] = "MenACWY"
    RDO_DOUBLES_CONSENT_TDIPV: Final[str] = "Td/IPV"
    RDO_DOUBLES_CONSENT_NONE: Final[str] = "No"
    LBL_DOUBLES_CONSENT_RECORDED: Final[str] = "Consent recorded for CF"

    # HPV
    CHK_HPV_CONSENT_AGREE: Final[str] = "Yes, I agree"
    CHK_HPV_CONSENT_DISAGREE: Final[str] = "No"
    LBL_HPV_CONSENT_RECORDED: Final[str] = "Consent recorded for CLAST, CFirst"

    # CONSTANTS
    VACCINE_ALREADY_RECEIVED: Final[str] = "vaccine already received"
    VACCINE_WILL_BE_GIVEN_ELSEWHERE: Final[str] = "vaccine will be given elsewhere"
    MEDICAL_REASONS: Final[str] = "medical reasons"
    PERSONAL_CHOICE: Final[str] = "personal choice"

    def __init__(self, playwright_operations: PlaywrightOperations):
        self.po = playwright_operations

    def fill_child_name_details(
        self,
        first_name: str,
        last_name: str,
        known_as_first: Optional[str] = None,
        known_as_last: Optional[str] = None,
    ) -> None:
        self.po.act(
            locator=self.TXT_CHILD_FIRST_NAME,
            action=actions.FILL,
            value=first_name,
        )
        self.po.act(
            locator=self.TXT_CHILD_LAST_NAME, action=actions.FILL, value=last_name
        )

        if known_as_first or known_as_last:
            self.po.act(
                locator=self.RDO_KNOWN_BY_ANOTHER_NAME_YES,
                action=actions.RADIO_BUTTON_SELECT,
            )
            self.po.act(
                locator=self.TXT_KNOWN_AS_FIRST,
                action=actions.FILL,
                value=known_as_first,
            )
            self.po.act(
                locator=self.TXT_KNOWN_AS_LAST, action=actions.FILL, value=known_as_last
            )
        else:
            self.po.act(
                locator=self.RDO_KNOWN_BY_ANOTHER_NAME_NO,
                action=actions.RADIO_BUTTON_SELECT,
            )

        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def fill_child_dob(self, dob_day: int, dob_month: int, dob_year: int) -> None:
        self.po.act(locator=self.TXT_DOB_DAY, action=actions.FILL, value=str(dob_day))
        self.po.act(
            locator=self.TXT_DOB_MONTH, action=actions.FILL, value=str(dob_month)
        )
        self.po.act(locator=self.TXT_DOB_YEAR, action=actions.FILL, value=str(dob_year))
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def select_child_school(self, school: School) -> None:
        name = str(school)

        if name == self.po.get_element_property(
            locator=self.LBL_SCHOOL_NAME, property=properties.TEXT, by_test_id=True
        ):
            self.po.act(
                locator=self.RDO_SELECT_SCHOOL, action=actions.RADIO_BUTTON_SELECT
            )
        else:
            self.po.act(
                locator=self.RDO_SELECT_DIFFERENT_SCHOOL,
                action=actions.RADIO_BUTTON_SELECT,
            )
            self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
            self.po.act(
                locator=self.TXT_SCHOOL_NAME,
                action=actions.SELECT_FROM_LIST,
                value=name,
            )
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def fill_parent_details(
        self,
        parent_name: str,
        relation: str,
        *,
        email: Optional[str] = None,
        phone: Optional[str] = None,
    ) -> None:
        self.po.act(
            locator=self.TXT_PARENT_FULL_NAME, action=actions.FILL, value=parent_name
        )
        self.po.act(locator=relation, action=actions.RADIO_BUTTON_SELECT)

        if email:
            self.po.act(
                locator=self.TXT_EMAIL_ADDRESS, action=actions.FILL, value=email
            )

        if phone:
            self.po.act(
                locator=self.TXT_PHONE_OPTIONAL, action=actions.FILL, value=phone
            )
            self.po.act(locator=self.CHK_TEXT_ALERTS, action=actions.CHECKBOX_CHECK)

        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def check_phone_options(self) -> None:
        self.po.act(locator=self.CHK_MOBILE_ONLY_TEXT, action=actions.CHECKBOX_CHECK)
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def select_consent_for_double_vaccinations(
        self,
        consent_for: Optional[str] = None,
    ) -> None:
        match (consent_for or "").lower():
            case "both":
                self.po.act(
                    locator=self.RDO_DOUBLES_CONSENT_BOTH,
                    action=actions.RADIO_BUTTON_SELECT,
                )
            case "menacwy":
                self.po.act(
                    locator=self.RDO_DOUBLES_CONSENT_ONE,
                    action=actions.RADIO_BUTTON_SELECT,
                )
                self.po.act(
                    locator=self.RDO_DOUBLES_CONSENT_MENACWY,
                    action=actions.RADIO_BUTTON_SELECT,
                )
            case "td_ipv":
                self.po.act(
                    locator=self.RDO_DOUBLES_CONSENT_ONE,
                    action=actions.RADIO_BUTTON_SELECT,
                )
                self.po.act(
                    locator=self.RDO_DOUBLES_CONSENT_TDIPV,
                    action=actions.RADIO_BUTTON_SELECT,
                )
            case _:
                self.po.act(
                    locator=self.RDO_DOUBLES_CONSENT_NONE,
                    action=actions.RADIO_BUTTON_SELECT,
                )
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def select_consent_for_hpv_vaccination(self, consented: bool) -> None:
        if consented:
            self.po.act(
                locator=self.CHK_HPV_CONSENT_AGREE, action=actions.CHECKBOX_CHECK
            )
        else:
            self.po.act(
                locator=self.CHK_HPV_CONSENT_DISAGREE, action=actions.CHECKBOX_CHECK
            )
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def fill_address_details(
        self, line1: str, line2: str, city: str, postcode: str
    ) -> None:
        self.po.act(locator=self.TXT_ADDRESS_LINE_1, action=actions.FILL, value=line1)
        self.po.act(locator=self.TXT_ADDRESS_LINE_2, action=actions.FILL, value=line2)
        self.po.act(locator=self.TXT_ADDRESS_CITY, action=actions.FILL, value=city)
        self.po.act(
            locator=self.TXT_ADDRESS_POSTCODE, action=actions.FILL, value=postcode
        )
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def set_all_health_questions_to_no(self, programme: Programme):
        for locator_text in programme.health_questions:
            self.po.act(
                locator=self._get_no_action(locator_text),
                action=actions.CHAIN_LOCATOR_ACTION,
            )

    def _get_no_action(self, locator: str) -> str:
        return f"get_by_role('group', name='{locator}').get_by_label('No').check()"

    def select_and_provide_details(self, details: Optional[str] = None) -> None:
        if details:
            self.po.act(locator=self.RDO_YES, action=actions.RADIO_BUTTON_SELECT)
            self.po.act(
                locator=self.TXT_GIVE_DETAILS, action=actions.FILL, value=details
            )
        else:
            self.po.act(locator=self.RDO_NO, action=actions.RADIO_BUTTON_SELECT)

        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def select_medical_condition(self, notes: Optional[str] = None):
        if notes:
            self.po.act(locator=self.RDO_YES, action=actions.RADIO_BUTTON_SELECT)
            self.po.act(
                locator=self.TXT_GIVE_DETAILS,
                action=actions.FILL,
                value=notes,
            )
        else:
            self.po.act(locator=self.RDO_NO, action=actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def select_severe_reaction(self, notes: Optional[str] = None):
        if notes:
            self.po.act(locator=self.RDO_YES, action=actions.RADIO_BUTTON_SELECT)
            self.po.act(
                locator=self.TXT_GIVE_DETAILS,
                action=actions.FILL,
                value=notes,
            )
        else:
            self.po.act(locator=self.RDO_NO, action=actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def select_extra_support(self, notes: Optional[str] = None):
        if notes:
            self.po.act(locator=self.RDO_YES, action=actions.RADIO_BUTTON_SELECT)
            self.po.act(
                locator=self.TXT_GIVE_DETAILS,
                action=actions.FILL,
                value=notes,
            )
        else:
            self.po.act(locator=self.RDO_NO, action=actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def select_consent_not_given_reason(self, reason: str, notes: str) -> None:
        match reason.lower():
            case self.VACCINE_ALREADY_RECEIVED:
                self.po.act(
                    locator=self.RDO_VACCINE_ALREADY_RECEIVED,
                    action=actions.RADIO_BUTTON_SELECT,
                )
                self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
                self.po.act(
                    locator=self.TXT_GIVE_DETAILS,
                    action=actions.FILL,
                    value=notes,
                )
            case self.VACCINE_WILL_BE_GIVEN_ELSEWHERE:
                self.po.act(
                    locator=self.RDO_VACCINE_WILL_BE_GIVEN_ELSEWHERE,
                    action=actions.RADIO_BUTTON_SELECT,
                )
                self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
                self.po.act(
                    locator=self.TXT_GIVE_DETAILS,
                    action=actions.FILL,
                    value=notes,
                )
            case self.MEDICAL_REASONS:
                self.po.act(
                    locator=self.RDO_VACCINE_MEDICAL_REASONS,
                    action=actions.RADIO_BUTTON_SELECT,
                )
                self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
                self.po.act(
                    locator=self.TXT_GIVE_DETAILS,
                    action=actions.FILL,
                    value=notes,
                )
            case self.PERSONAL_CHOICE:
                self.po.act(
                    locator=self.RDO_PERSONAL_CHOICE, action=actions.RADIO_BUTTON_SELECT
                )
            case _:  # Other
                self.po.act(locator=self.RDO_OTHER, action=actions.RADIO_BUTTON_SELECT)
                self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
                self.po.act(
                    locator=self.TXT_GIVE_DETAILS,
                    action=actions.FILL,
                    value=notes,
                )
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    # --- Shared methods for confirmation and verification ---
    def click_confirm_details(self, scenario_id: str = "") -> None:
        if "mavis-1778" in scenario_id.lower():
            self.po.act(locator=self.LNK_CHANGE_PHONE, action=actions.CLICK_LINK)
            self.change_parent_phone()
        self.po.act(locator=self.BTN_CONFIRM, action=actions.CLICK_BUTTON)

    def verify_final_message(self, expected_message: str) -> None:
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value=expected_message,
        )

    def change_parent_phone(self):
        self.po.act(
            locator=self.TXT_PHONE_OPTIONAL, action=actions.FILL, value="7700900000"
        )
        self.po.act(locator=self.CHK_TEXT_ALERTS, action=actions.CHECKBOX_CHECK)
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.check_phone_options()

    def parent_1_verbal_positive(
        self, change_phone: bool = True, programme: Programme = Programme.HPV
    ):
        self._select_parent(parent_locator=self.RDO_PARENT1_DAD)
        self._select_consent_method(method_locator=self.RDO_IN_PERSON)
        self._process_consent_confirmation(programme=programme)
        if change_phone:
            self.po.act(locator=self.LNK_ADD_PHONE_NUMBER, action=actions.CLICK_LINK)
            self.change_parent_phone()
        self.po.act(locator=self.BTN_CONFIRM, action=actions.CLICK_BUTTON)

    def parent_1_verbal_no_response(self):
        self._select_parent(parent_locator=self.RDO_PARENT1_DAD)
        self._select_consent_method(method_locator=self.RDO_IN_PERSON)
        self.po.act(locator=self.RDO_NO_RESPONSE, action=actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.act(locator=self.BTN_CONFIRM, action=actions.CLICK_BUTTON)

    def parent_2_verbal_refuse_consent(self):
        self._select_parent(parent_locator=self.RDO_PARENT2_MUM)
        self._select_consent_method(method_locator=self.RDO_IN_PERSON)
        self._handle_refusal_of_consent(reason_locator=self.RDO_PERSONAL_CHOICE)
        self.po.act(locator=self.BTN_CONFIRM, action=actions.CLICK_BUTTON)

    def parent_1_online_positive(self):
        self._select_parent(parent_locator=self.RDO_PARENT1_DAD)
        self._select_consent_method(method_locator=self.RDO_ONLINE)
        self._process_consent_confirmation()
        self.po.act(locator=self.LNK_ADD_PHONE_NUMBER, action=actions.CLICK_LINK)
        self.po.act(locator=self.TXT_PHONE, action=actions.FILL, value="7700900000")
        self.po.act(locator=self.CHK_TEXT_UPDATES, action=actions.CHECKBOX_CHECK)
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.act(locator=self.BTN_CONFIRM, action=actions.CLICK_BUTTON)

    def update_triage_outcome_positive(self):
        self.po.act(
            locator=self.RDO_YES_SAFE_TO_VACCINATE, action=actions.RADIO_BUTTON_SELECT
        )
        self.po.act(locator=self.BTN_SAVE_TRIAGE, action=actions.CLICK_BUTTON)
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value="Triage outcome updated for",
        )

    def parent_1_verbal_refuse_consent(self):
        self._select_parent(parent_locator=self.RDO_PARENT1_DAD)
        self._select_consent_method(method_locator=self.RDO_IN_PERSON)
        self._handle_refusal_of_consent(reason_locator=self.RDO_PERSONAL_CHOICE)
        self.po.act(locator=self.BTN_CONFIRM, action=actions.CLICK_BUTTON)

    def service_give_consent(self):
        self._select_parent(parent_locator=self.RDO_PARENT1_DAD)
        self._select_consent_method(method_locator=self.RDO_ONLINE)
        self._process_consent_confirmation()
        self.po.act(locator=self.BTN_CONFIRM, action=actions.CLICK_BUTTON)

    def service_refuse_consent(self):
        self._select_parent(parent_locator=self.RDO_PARENT1_DAD)
        self._select_consent_method(method_locator=self.RDO_ONLINE)
        self._handle_refusal_of_consent(reason_locator=self.VACCINE_ALREADY_RECEIVED)
        self.po.act(
            locator=self.TXT_GIVE_DETAILS,
            action=actions.FILL,
            value=self.VACCINE_WILL_BE_GIVEN_ELSEWHERE,
        )
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.act(locator=self.BTN_CONFIRM, action=actions.CLICK_BUTTON)
        self.po.verify(
            locator=self.LBL_MAIN,
            property=properties.TEXT,
            expected_value=self.LBL_HPV_CONSENT_RECORDED,
            exact=False,
        )

    def child_consent_verbal_positive(self):
        self.po.act(
            locator=self.RDO_CHILD_GILLICK_COMPETENT, action=actions.RADIO_BUTTON_SELECT
        )
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self._process_consent_confirmation(child_consent=True)
        self.po.act(locator=self.BTN_CONFIRM, action=actions.CLICK_BUTTON)

    def _handle_refusal_of_consent(self, reason_locator: str):
        self.po.act(
            locator=self.RDO_NO_THEY_DO_NOT_AGREE, action=actions.RADIO_BUTTON_SELECT
        )
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.act(locator=reason_locator, action=actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def _select_parent(self, parent_locator: str):
        self.po.act(locator=parent_locator, action=actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def _select_consent_method(self, method_locator: str):
        self.po.act(locator=method_locator, action=actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)

    def _process_consent_confirmation(
        self, programme=Programme.HPV, child_consent: bool = False
    ):
        self.po.act(locator=self.RDO_YES_THEY_AGREE, action=actions.RADIO_BUTTON_SELECT)
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        if child_consent:
            self.po.act(locator=self.RDO_YES, action=actions.RADIO_BUTTON_SELECT)
            self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.set_all_health_questions_to_no(programme=programme)
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
        self.po.act(
            locator=self.RDO_YES_SAFE_TO_VACCINATE, action=actions.RADIO_BUTTON_SELECT
        )
        self.po.act(locator=self.BTN_CONTINUE, action=actions.CLICK_BUTTON)
