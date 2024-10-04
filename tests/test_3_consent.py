import pytest

from pages import pg_parental_consent
from pages.pg_parental_consent import parent_relation


class Test_Regression_Consent:
    pc = pg_parental_consent.pg_parental_consent()

    @pytest.mark.regression
    @pytest.mark.order(301)
    def test_reg_parental_consent_workflow(self, start_consent_workflow):
        self.pc.click_start_now()
        self.pc.fill_child_name_details(child_full_name="ChildFirst ChildLast", known_as="AKA")
        self.pc.fill_child_dob(dob="01/12/2010")
        self.pc.select_child_school(school_name="Abeng International Independent School")
        self.pc.fill_parent_details(
            parent_name="ParentFirst ParentLast",
            relation=parent_relation.DAD,
            email="adfaf@lajskdfl.com",
            phone="07412345678",
        )
        self.pc.check_phone_options()
        self.pc.check_consent_to_vaccination(consented=True)
        self.pc.fill_gp_details(gp_name="MyGP")
        self.pc.fill_address_details(line1="line1", line2="line2", city="city1", postcode="AA1 1AA")
        self.pc.select_severe_allergies(allergies=False)
        self.pc.select_medical_condition(medical_condition=False)
        self.pc.select_severe_reaction(severe_reaction=False)
        self.pc.confirm_details()
        self.pc.final_message(
            expected_message="ChildFirst ChildLast will get their HPV vaccination at school on 3 October 2024"
        )
