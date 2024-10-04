from libs import CurrentExecution
from libs import file_ops
from pages import pg_parental_consent


class parental_consent_helper:
    ce = CurrentExecution()
    fo = file_ops.file_operations()
    pc = pg_parental_consent.pg_parental_consent()

    def run_test_for_data(self, file_path: str) -> None:
        _df = self.fo.read_excel_to_df(file_path=file_path)
        for _, _r in _df.iterrows():
            self.child_first_name = str(_r["ChildFirstName"])
            self.child_last_name = str(_r["ChildLastName"])
            self.child_aka = str(_r["ChildAKA"])
            self.child_dob_day = str(_r["ChildDobDay"])
            self.child_dob_month = str(_r["ChildDobMonth"])
            self.child_dob_month = str(_r["ChildDobMonth"])
            self.child_dob_year = str(_r["ChildDobYear"])
            self.school_name = str(_r["SchoolName"])
            self.parent_name = str(_r["ParentFullName"])
            self.relation = str(_r["Relation"])
            self.email = str(_r["Email"])
            self.phone = str(_r["Phone"])
            self.consent = str(_r["ConsentVaccine"])
            self.gp = str(_r["GPName"])
            self.addr1 = str(_r["AddressLine1"])
            self.addr2 = str(_r["AddressLine2"])
            self.city = str(_r["City"])
            self.postcode = str(_r["PostCode"])
            self.allergy_details = str(_r["AllergyDetails"])
            self.medical_condition_details = str(_r["MedicalConditionDetails"])
            self.reaction_details = str(_r["ReactionDetails"])
            self.expected_message = str(_r["ExpectedFinalMessage"])
            self.enter_details()

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
        self.pc.select_consent_for_vaccination(consented=self.consent)
        self.pc.fill_gp_details(gp_name=self.gp)
        self.pc.fill_address_details(line1=self.addr1, line2=self.addr2, city=self.city, postcode=self.postcode)
        self.pc.select_severe_allergies(allergy_details=self.allergy_details)
        self.pc.select_medical_condition(medical_condition_details=self.medical_condition_details)
        self.pc.select_severe_reaction(reaction_details=self.reaction_details)
        self.pc.confirm_details()
        self.pc.final_message(expected_message=self.expected_message)
