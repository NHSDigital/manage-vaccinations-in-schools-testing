from libs.mavis_constants import test_data_file_paths
from libs.test_data import TestData
from pages import ConsentPage


class ParentalConsentHelper:
    def __init__(self):
        self.df = TestData().read_spreadsheet(
            test_data_file_paths.PARENTAL_CONSENT_DOUBLES
        )

    def read_data_for_scenario(self, scenario_data) -> None:
        _, _row = scenario_data
        self.scenario_id = _row.name
        self.child_first_name = _row["ChildFirstName"]
        self.child_last_name = _row["ChildLastName"]
        self.child_aka_first = _row["ChildAKAFirst"]
        self.child_aka_last = _row["ChildAKALast"]
        self.child_dob_day = _row["ChildDobDay"]
        self.child_dob_month = _row["ChildDobMonth"]
        self.child_dob_month = _row["ChildDobMonth"]
        self.child_dob_year = _row["ChildDobYear"]
        self.school_name = _row["SchoolName"]
        self.parent_name = _row["ParentFullName"]
        self.relation = _row["Relation"]
        self.email = _row["Email"]
        self.phone = _row["Phone"]
        self.consent_for = (
            _row["ConsentVaccine"].lower() if _row["ConsentVaccine"] else "none"
        )
        self.gp = _row["GPName"]
        self.addr1 = _row["AddressLine1"]
        self.addr2 = _row["AddressLine2"]
        self.city = _row["City"]
        self.postcode = _row["PostCode"]
        self.bleeding_disorder_details = _row["BleedingDisorderDetails"]
        self.severe_allergy_details = _row["SevereAllergyDetails"]
        self.reaction_details = _row["ReactionDetails"]
        self.extra_support_details = _row["ExtraSupportDetails"]
        self.vaccinated_in_past_details = _row["VaccinatedInPastDetails"]
        self.other_vaccs_in_past_details = _row["OtherVaccsInPastDetails"]
        self.consent_not_given_reason = _row["ConsentNotGivenReason"]
        self.consent_not_given_details = _row["ConsentNotGivenDetails"]
        self.expected_message = _row["ExpectedFinalMessage"]

    def enter_details_on_mavis(self, page: ConsentPage):
        page.fill_child_name_details(
            scenario_id=self.scenario_id,
            child_first_name=self.child_first_name,
            child_last_name=self.child_last_name,
            known_as_first=self.child_aka_first,
            known_as_last=self.child_aka_last,
        )
        page.fill_child_dob(
            scenario_id=self.scenario_id,
            dob_day=self.child_dob_day,
            dob_month=self.child_dob_month,
            dob_year=self.child_dob_year,
        )
        page.select_child_school(
            scenario_id=self.scenario_id, school_name=self.school_name
        )
        page.fill_parent_details(
            scenario_id=self.scenario_id,
            parent_name=self.parent_name,
            relation=self.relation,
            email=self.email,
            phone=self.phone,
        )
        if self.phone:
            page.check_phone_options(scenario_id=self.scenario_id)
        page.select_consent_for_double_vaccinations(
            scenario_id=self.scenario_id, consent_for=self.consent_for
        )
        if self.consent_for != "none":
            page.fill_address_details(
                scenario_id=self.scenario_id,
                line1=self.addr1,
                line2=self.addr2,
                city=self.city,
                postcode=self.postcode,
            )
            for details in [
                self.bleeding_disorder_details,
                self.severe_allergy_details,
                self.reaction_details,
                self.extra_support_details,
                self.vaccinated_in_past_details,
            ]:
                page.select_and_provide_details(
                    scenario_id=self.scenario_id, details=details
                )
            if self.consent_for.lower() == "both":
                page.select_and_provide_details(
                    scenario_id=self.scenario_id,
                    details=self.other_vaccs_in_past_details,
                )
        if self.consent_for.lower() != "both":
            page.select_consent_not_given_reason(
                scenario_id=self.scenario_id,
                reason=self.consent_not_given_reason,
                notes=self.consent_not_given_details,
            )

        page.click_confirm_details(scenario_id=self.scenario_id)
        page.verify_final_message(
            scenario_id=self.scenario_id, expected_message=self.expected_message
        )
