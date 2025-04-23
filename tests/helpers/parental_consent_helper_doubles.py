from libs import CurrentExecution, testdata_ops
from libs.mavis_constants import test_data_file_paths, test_data_values
from pages import pg_consent_doubles


class parental_consent_helper:
    ce = CurrentExecution()
    tdo = testdata_ops.testdata_operations()
    pc = pg_consent_doubles.pg_consent_doubles()

    def __init__(self):
        self.df = self.tdo.read_spreadsheet(file_path=test_data_file_paths.PARENTAL_CONSENT_DOUBLES)

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
        self.consent_for = str(_row["ConsentVaccine"])
        self.gp = str(_row["GPName"])
        self.addr1 = str(_row["AddressLine1"])
        self.addr2 = str(_row["AddressLine2"])
        self.city = str(_row["City"])
        self.postcode = str(_row["PostCode"])
        self.bleeding_disorder_details = str(_row["BleedingDisorderDetails"])
        self.severe_allergy_details = str(_row["SevereAllergyDetails"])
        self.reaction_details = str(_row["ReactionDetails"])
        self.extra_support_details = str(_row["ExtraSupportDetails"])
        self.vaccinated_in_past_details = str(_row["VaccinatedInPastDetails"])
        self.other_vaccs_in_past_details = str(_row["OtherVaccsInPastDetails"])
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
        if self.phone != test_data_values.EMPTY:
            self.pc.check_phone_options(
                scenario_id=self.scenario_id,
            )
        self.pc.select_consent_for_vaccination(scenario_id=self.scenario_id, consent_for=self.consent_for)
        if self.consent_for.lower() != test_data_values.EMPTY:  # None
            self.pc.fill_address_details(
                scenario_id=self.scenario_id,
                line1=self.addr1,
                line2=self.addr2,
                city=self.city,
                postcode=self.postcode,
            )
            self.pc.select_bleeding_disorder(
                scenario_id=self.scenario_id, bleeding_disorder_details=self.bleeding_disorder_details
            )
            self.pc.select_severe_allergies(scenario_id=self.scenario_id, allergy_details=self.severe_allergy_details)
            self.pc.select_severe_reaction(scenario_id=self.scenario_id, reaction_details=self.reaction_details)
            self.pc.select_extra_support(
                scenario_id=self.scenario_id, extra_support_details=self.extra_support_details
            )
            self.pc.vaccinated_in_past(
                scenario_id=self.scenario_id, vaccs_in_past_details=self.vaccinated_in_past_details
            )
        if self.consent_for.lower() == "both":
            self.pc.other_vaccs_in_past(
                scenario_id=self.scenario_id, other_vaccs_in_past_details=self.other_vaccs_in_past_details
            )
        if self.consent_for.lower() != "both":
            self.pc.select_consent_not_given_reason(
                scenario_id=self.scenario_id,
                reason=self.consent_not_given_reason,
                reason_details=self.consent_not_given_details,
            )
        self.pc.click_confirm_details(
            scenario_id=self.scenario_id,
        )
        self.pc.verify_final_message(scenario_id=self.scenario_id, expected_message=self.expected_message)
