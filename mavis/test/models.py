from enum import StrEnum
from typing import NamedTuple
from datetime import date
from faker import Faker

faker = Faker("en_GB")


class Programme(StrEnum):
    FLU = "Flu"
    HPV = "HPV"
    MENACWY = "MenACWY"
    TD_IPV = "Td/IPV"

    @property
    def group(self):
        if self in {Programme.MENACWY, Programme.TD_IPV}:
            return "doubles"
        return self.value

    @property
    def vaccines(self):
        match self:
            case self.FLU:
                return [Vaccine.FLUENZ_TETRA_LAIV]
            case self.HPV:
                return [Vaccine.GARDASIL_9]
            case self.MENACWY:
                return [Vaccine.MENQUADFI, Vaccine.MENVEO, Vaccine.NIMENRIX]
            case self.TD_IPV:
                return [Vaccine.REVAXIS]

    @property
    def health_questions(self):
        common_doubles_questions = [
            HealthQuestion.BLEEDING_DISORDER,
            HealthQuestion.SEVERE_ALLERGIES,
            HealthQuestion.REACTION,
            HealthQuestion.EXTRA_SUPPORT,
        ]
        programme_specific_questions = {
            Programme.MENACWY: common_doubles_questions
            + [HealthQuestion.PAST_MENACWY_VACCINE],
            Programme.TD_IPV: common_doubles_questions
            + [HealthQuestion.PAST_TDIPV_VACCINE],
            Programme.HPV: [
                HealthQuestion.SEVERE_ALLERGIES,
                HealthQuestion.MEDICAL_CONDITIONS,
                HealthQuestion.REACTION,
                HealthQuestion.EXTRA_SUPPORT,
            ],
        }
        return programme_specific_questions[self]

    @property
    def pre_screening_checks(self):
        checks = [
            PreScreeningCheck.NOT_ACUTELY_UNWELL,
            PreScreeningCheck.NO_RELEVANT_ALLERGIES,
            PreScreeningCheck.NOT_ALREADY_HAD,
            PreScreeningCheck.KNOW_VACCINATION,
        ]

        if self.group == "doubles":
            checks.append(PreScreeningCheck.NO_RELEVANT_MEDICATION)

        if self == self.TD_IPV:
            checks.append(PreScreeningCheck.NOT_PREGNANT)

        return checks

    @property
    def year_groups(self) -> list[str]:
        match self:
            case self.FLU:
                return ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
            case self.HPV:
                return ["8", "9", "10", "11"]
            case self.MENACWY | self.TD_IPV:
                return ["9", "10", "11"]


class Vaccine(StrEnum):
    # Flu
    FLUENZ_TETRA_LAIV = "Fluenz Tetra - LAIV"

    # HPV
    GARDASIL_9 = "Gardasil 9"

    # MenACWY
    MENQUADFI = "MenQuadfi"
    MENVEO = "Menveo"
    NIMENRIX = "Nimenrix"

    # Td/IPV
    REVAXIS = "Revaxis"


class HealthQuestion(StrEnum):
    BLEEDING_DISORDER = "Does your child have a bleeding disorder or another medical condition they receive treatment for?"
    SEVERE_ALLERGIES = "Does your child have any severe allergies?"
    MEDICAL_CONDITIONS = (
        "Does your child have any medical conditions for which they receive treatment?"
    )
    REACTION = "Has your child ever had a severe reaction to any medicines, including vaccines?"
    EXTRA_SUPPORT = "Does your child need extra support during vaccination sessions?"
    PAST_MENACWY_VACCINE = (
        "Has your child had a meningitis (MenACWY) vaccination in the last 5 years?"
    )
    PAST_TDIPV_VACCINE = "Has your child had a tetanus, diphtheria and polio vaccination in the last 5 years?"


class PreScreeningCheck(StrEnum):
    KNOW_VACCINATION = "knows what the vaccination is for, and is happy to have it"
    NOT_ACUTELY_UNWELL = "is not acutely unwell"
    NOT_ALREADY_HAD = "has not already had this vaccination"
    NOT_PREGNANT = "is not pregnant"
    NO_RELEVANT_ALLERGIES = "has no allergies which would prevent vaccination"
    NO_RELEVANT_MEDICATION = "is not taking any medication which prevents vaccination"


class ConsentRefusalReason(StrEnum):
    VACCINE_ALREADY_RECEIVED = "Vaccine already received"
    VACCINE_WILL_BE_GIVEN_ELSEWHERE = "Vaccine will be given elsewhere"
    MEDICAL_REASONS = "Medical reasons"
    PERSONAL_CHOICE = "Personal choice"
    OTHER = "Other"

    @property
    def requires_details(self) -> bool:
        return self is not ConsentRefusalReason.PERSONAL_CHOICE


class ConsentMethod(StrEnum):
    PHONE = "By phone"
    PAPER = "Paper"
    IN_PERSON = "In person"


class ReportFormat(StrEnum):
    CAREPLUS = "CarePlus"
    CSV = "CSV"
    SYSTMONE = "SystmOne"

    @property
    def headers(self) -> str:
        report_headers = {
            ReportFormat.CAREPLUS: "NHS Number,Surname,Forename,Date of Birth,Address Line 1,Person Giving Consent,Ethnicity,Date Attended,Time Attended,Venue Type,Venue Code,Staff Type,Staff Code,Attended,Reason Not Attended,Suspension End Date,Vaccine 1,Vaccine Code 1,Dose 1,Reason Not Given 1,Site 1,Manufacturer 1,Batch No 1,Vaccine 2,Vaccine Code 2,Dose 2,Reason Not Given 2,Site 2,Manufacturer 2,Batch No 2,Vaccine 3,Vaccine Code 3,Dose 3,Reason Not Given 3,Site 3,Manufacturer 3,Batch No 3,Vaccine 4,Vaccine Code 4,Dose 4,Reason Not Given 4,Site 4,Manufacturer 4,Batch No 4,Vaccine 5,Vaccine Code 5,Dose 5,Reason Not Given 5,Site 5,Manufacturer 5,Batch No 5",
            ReportFormat.CSV: "ORGANISATION_CODE,SCHOOL_URN,SCHOOL_NAME,CARE_SETTING,CLINIC_NAME,PERSON_FORENAME,PERSON_SURNAME,PERSON_DATE_OF_BIRTH,PERSON_DATE_OF_DEATH,YEAR_GROUP,PERSON_GENDER_CODE,PERSON_ADDRESS_LINE_1,PERSON_POSTCODE,NHS_NUMBER,NHS_NUMBER_STATUS_CODE,GP_ORGANISATION_CODE,GP_NAME,CONSENT_STATUS,CONSENT_DETAILS,HEALTH_QUESTION_ANSWERS,TRIAGE_STATUS,TRIAGED_BY,TRIAGE_DATE,TRIAGE_NOTES,GILLICK_STATUS,GILLICK_ASSESSMENT_DATE,GILLICK_ASSESSED_BY,GILLICK_ASSESSMENT_NOTES,GILLICK_NOTIFY_PARENTS,VACCINATED,DATE_OF_VACCINATION,TIME_OF_VACCINATION,PROGRAMME_NAME,VACCINE_GIVEN,PERFORMING_PROFESSIONAL_EMAIL,PERFORMING_PROFESSIONAL_FORENAME,PERFORMING_PROFESSIONAL_SURNAME,BATCH_NUMBER,BATCH_EXPIRY_DATE,ANATOMICAL_SITE,ROUTE_OF_VACCINATION,DOSE_SEQUENCE,DOSE_VOLUME,REASON_NOT_VACCINATED,LOCAL_PATIENT_ID,SNOMED_PROCEDURE_CODE,REASON_FOR_INCLUSION,RECORD_CREATED,RECORD_UPDATED",
            ReportFormat.SYSTMONE: "Practice code,NHS number,Surname,Middle name,Forename,Gender,Date of Birth,House name,House number and road,Town,Postcode,Vaccination,Part,Admin date,Batch number,Expiry date,Dose,Reason,Site,Method,Notes",
        }
        return report_headers[self]


class Clinic(NamedTuple):
    name: str

    def __str__(self):
        return self.name

    def to_onboarding(self):
        return {"name": self.name}


class School(NamedTuple):
    name: str
    urn: str

    def __str__(self):
        return self.name

    def to_onboarding(self):
        return self.urn


class Team(NamedTuple):
    key: str
    name: str
    email: str
    phone: str

    def __str__(self):
        return self.name

    def to_onboarding(self):
        return {self.key: {"name": self.name, "email": self.email, "phone": self.phone}}


class Organisation(NamedTuple):
    name: str
    ods_code: str
    email: str
    phone: str

    def __str__(self):
        return f"{self.name} ({self.ods_code})"

    def to_onboarding(self):
        return {
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "ods_code": self.ods_code,
            "careplus_venue_code": self.ods_code,
            "privacy_notice_url": "https://example.com/privacy",
            "privacy_policy_url": "https://example.com/privacy",
        }


class User(NamedTuple):
    username: str
    password: str
    role: str

    def __str__(self):
        return self.username

    def to_onboarding(self):
        return {
            "email": self.username,
            "password": self.password,
            "given_name": self.role,
            "family_name": self.role,
            "fallback_role": self.role,
        }


class Relationship(StrEnum):
    DAD = "Dad"
    MUM = "Mum"
    GUARDIAN = "Guardian"
    CARER = "Carer"
    OTHER = "Other"

    @property
    def generate_name(self) -> str:
        if self == Relationship.DAD:
            return faker.name_male()
        if self == Relationship.MUM:
            return faker.name_female()
        return faker.name_nonbinary()


class Parent(NamedTuple):
    full_name: str
    relationship: str
    email_address: str

    @property
    def name_and_relationship(self) -> str:
        return f"{self.full_name} ({self.relationship})"

    @classmethod
    def get(cls, relationship: Relationship) -> "Parent":
        return cls(
            full_name=relationship.generate_name,
            relationship=str(relationship),
            email_address=faker.email(),
        )


class Child(NamedTuple):
    first_name: str
    last_name: str
    nhs_number: str
    address: tuple[str, str, str, str]
    date_of_birth: date
    parents: tuple[Parent, Parent]

    def __str__(self):
        return f"{self.last_name}, {self.first_name}"

    @property
    def name(self) -> tuple[str, str]:
        return self.first_name, self.last_name
