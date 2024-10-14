from libs import CurrentExecution
from libs import file_ops
from pages import pg_parental_consent
from libs.constants import data_values, test_data_file_paths


class parental_consent_helper:
    ce = CurrentExecution()
    fo = file_ops.file_operations()
    pc = pg_parental_consent.pg_parental_consent()

    def __init__(self):
        self.df = self.fo.read_excel_to_df(file_path=test_data_file_paths.PARENTAL_CONSENT)

    def read_data_for_scenario(self, scenario_data) -> None:
        _, _row = scenario_data
        self.child_first_name = str(_row["ChildFirstName"])
        self.child_last_name = str(_row["ChildLastName"])
        self.child_aka = str(_row["ChildAKA"])
        self.child_dob_day = str(_row["ChildDobDay"])
        self.child_dob_month = str(_row["ChildDobMonth"])
        self.child_dob_month = str(_row["ChildDobMonth"])
        self.child_dob_year = str(_row["ChildDobYear"])
        self.school_name = str(_row["SchoolName"])
        self.parent_name = str(_row["ParentFullName"])
        self.relation = str(_row["Relation"])
        self.email = str(_row["Email"])
        self.phone = str(_row["Phone"])
        self.consent = str(_row["ConsentVaccine"]).lower() == "true"
        self.gp = str(_row["GPName"])
        self.addr1 = str(_row["AddressLine1"])
        self.addr2 = str(_row["AddressLine2"])
        self.city = str(_row["City"])
        self.postcode = str(_row["PostCode"])
        self.allergy_details = str(_row["AllergyDetails"])
        self.medical_condition_details = str(_row["MedicalConditionDetails"])
        self.reaction_details = str(_row["ReactionDetails"])
        self.consent_not_given_reason = str(_row["ConsentNotGivenReason"])
        self.consent_not_given_details = str(_row["ConsentNotGivenDetails"])
        self.expected_message = str(_row["ExpectedFinalMessage"])

    def enter_details(self) -> None:
        self.pc.click_start_now()
        self.pc.fill_child_name_details(
            child_first_name=self.child_first_name, child_last_name=self.child_last_name, known_as=self.child_aka
        )
        self.pc.fill_child_dob(
            dob_day=self.child_dob_day, dob_month=self.child_dob_month, dob_year=self.child_dob_year
        )
        self.pc.select_child_school(school_name=self.school_name)
        self.pc.fill_parent_details(
            parent_name=self.parent_name,
            relation=self.relation,
            email=self.email,
            phone=self.phone,
        )
        if self.phone != data_values.EMPTY:
            self.pc.check_phone_options()
        self.pc.select_consent_for_vaccination(consented=self.consent)
        if self.consent:
            self.pc.fill_gp_details(gp_name=self.gp)
            self.pc.fill_address_details(line1=self.addr1, line2=self.addr2, city=self.city, postcode=self.postcode)
            self.pc.select_severe_allergies(allergy_details=self.allergy_details)
            self.pc.select_medical_condition(medical_condition_details=self.medical_condition_details)
            self.pc.select_severe_reaction(reaction_details=self.reaction_details)
        else:
            self.pc.select_consent_not_given_reason(
                reason=self.consent_not_given_reason, reason_details=self.consent_not_given_details
            )
        self.pc.click_confirm_details()
        self.pc.verify_final_message(expected_message=self.expected_message)
        self.ce.end_test()
