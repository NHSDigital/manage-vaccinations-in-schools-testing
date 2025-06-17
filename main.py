from typing import NamedTuple


class VaccinationFileHPV(NamedTuple):
    test_desc_ignored: str
    organisation_code: str
    school_urn: str
    school_name: str
    nhs_number: str
    person_forename: str
    person_surname: str
    person_dob: str
    person_gender_code: str
    person_postcode: str
    date_of_vaccination: str
    vaccine_given: str
    batch_number: str
    batch_expiry_date: str
    anatomical_site: str
    dose_sequence: str
    vaccinated: str
    care_setting: str
    performing_professional_forename: str
    performing_professional_surname: str
    performing_professional_email: str
    clinic_name: str
    time_of_vaccination: str
    reason_not_vaccinated: str
    session_id: str
    programme: str

    def create_file(self) -> None:
        print(vars(self))


v = VaccinationFileHPV()
v.create_file()
