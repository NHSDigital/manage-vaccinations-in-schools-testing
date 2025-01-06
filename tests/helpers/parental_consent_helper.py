from libs import CurrentExecution, testdata_ops
from libs.constants import data_values, test_data_file_paths
from pages import pg_parental_consent


class parental_consent_helper:
    ce = CurrentExecution()
    tdo = testdata_ops.testdata_operations()
    pc = pg_parental_consent.pg_parental_consent()

    def __init__(self):
        self.df = self.tdo.read_spreadsheet(file_path=test_data_file_paths.PARENTAL_CONSENT)

    def read_data_for_scenario(self, scenario_data) -> None:
        _, _row = scenario_data
        self.scenario_id = _row.name
        self.child_first_name = str(_row["ChildFirstName"])
        self.child_last_name = str(_row["ChildLastName"])
        self.child_aka_first = str(_row["ChildAKAFirst"])
        self.child_aka_last = str(_row["ChildAKALast"])
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
        self.extra_support_details = str(_row["ExtraSupportDetails"])
        self.consent_not_given_reason = str(_row["ConsentNotGivenReason"])
        self.consent_not_given_details = str(_row["ConsentNotGivenDetails"])
        self.expected_message = str(_row["ExpectedFinalMessage"])

    def enter_details_on_mavis(self) -> None:
        self.pc.click_start_now()
        self.pc.fill_child_name_details(
            scenario_id=self.scenario_id,
            child_first_name=self.child_first_name,
            child_last_name=self.child_last_name,
            known_as_first=self.child_aka_first,
            known_as_last=self.child_aka_last,
        )
        self.pc.fill_child_dob(
            scenario_id=self.scenario_id,
            dob_day=self.child_dob_day,
            dob_month=self.child_dob_month,
            dob_year=self.child_dob_year,
        )
        self.pc.select_child_school(scenario_id=self.scenario_id, school_name=self.school_name)
        self.pc.fill_parent_details(
            scenario_id=self.scenario_id,
            parent_name=self.parent_name,
            relation=self.relation,
            email=self.email,
            phone=self.phone,
        )
        if self.phone != data_values.EMPTY:
            self.pc.check_phone_options(
                scenario_id=self.scenario_id,
            )
        self.pc.select_consent_for_vaccination(scenario_id=self.scenario_id, consented=self.consent)
        if self.consent:
            # self.pc.fill_gp_details(gp_name=self.gp)  # Removed on 04/12/2024 as GP details are to be retrieved from PDS now.
            self.pc.fill_address_details(
                scenario_id=self.scenario_id,
                line1=self.addr1,
                line2=self.addr2,
                city=self.city,
                postcode=self.postcode,
            )
            self.pc.select_severe_allergies(scenario_id=self.scenario_id, allergy_details=self.allergy_details)
            self.pc.select_medical_condition(
                scenario_id=self.scenario_id, medical_condition_details=self.medical_condition_details
            )
            self.pc.select_severe_reaction(scenario_id=self.scenario_id, reaction_details=self.reaction_details)
            self.pc.select_extra_support(
                scenario_id=self.scenario_id, extra_support_details=self.extra_support_details
            )
        else:
            self.pc.select_consent_not_given_reason(
                scenario_id=self.scenario_id,
                reason=self.consent_not_given_reason,
                reason_details=self.consent_not_given_details,
            )
        self.pc.click_confirm_details(
            scenario_id=self.scenario_id,
        )
        self.pc.verify_final_message(scenario_id=self.scenario_id, expected_message=self.expected_message)
