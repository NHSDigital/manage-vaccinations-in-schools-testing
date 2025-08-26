import os
import urllib.parse
from datetime import date
from enum import StrEnum
from typing import NamedTuple

from faker import Faker

faker = Faker("en_GB")


class ConsentOption(StrEnum):
    INJECTION = "Injection"
    NASAL_SPRAY = "Nasal spray"
    BOTH = ""


class Programme(StrEnum):
    FLU = "flu"
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
                return [Vaccine.FLUENZ]
            case self.HPV:
                return [Vaccine.GARDASIL_9]
            case self.MENACWY:
                return [Vaccine.MENQUADFI, Vaccine.MENVEO, Vaccine.NIMENRIX]
            case self.TD_IPV:
                return [Vaccine.REVAXIS]

    def health_questions(self, consent_option: ConsentOption = ConsentOption.INJECTION):
        includes_nasal = consent_option is not ConsentOption.INJECTION
        includes_injection = consent_option is not ConsentOption.NASAL_SPRAY

        flu_questions = [
            HealthQuestion.ASTHMA_STEROIDS if includes_nasal else None,
            HealthQuestion.ASTHMA_INTENSIVE_CARE if includes_nasal else None,
            HealthQuestion.IMMUNE_SYSTEM if includes_nasal else None,
            HealthQuestion.HOUSEHOLD_IMMUNE_SYSTEM if includes_nasal else None,
            HealthQuestion.BLEEDING_DISORDER_FLU if includes_injection else None,
            HealthQuestion.EGG_ALLERGY if includes_nasal else None,
            HealthQuestion.SEVERE_ALLERGIC_REACTION_NASAL if includes_nasal else None,
            HealthQuestion.SEVERE_ALLERGIC_REACTION_INJECTED
            if includes_injection
            else None,
            HealthQuestion.MEDICAL_CONDITIONS_FLU,
            HealthQuestion.ASPIRIN if includes_nasal else None,
            HealthQuestion.FLU_PREVIOUSLY,
            HealthQuestion.EXTRA_SUPPORT,
        ]
        flu_questions = [q for q in flu_questions if q is not None]

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
            Programme.FLU: flu_questions,
        }
        return programme_specific_questions[self]

    def pre_screening_checks(
        self, consent_option: ConsentOption = ConsentOption.INJECTION
    ):
        checks = [
            PreScreeningCheck.NOT_ACUTELY_UNWELL,
            PreScreeningCheck.NO_RELEVANT_ALLERGIES,
            PreScreeningCheck.NOT_ALREADY_HAD,
            PreScreeningCheck.KNOW_VACCINATION,
        ]

        if self.group == "doubles":
            checks.append(PreScreeningCheck.NO_RELEVANT_MEDICATION)

        if self is self.TD_IPV:
            checks.append(PreScreeningCheck.NOT_PREGNANT)

        if self is self.FLU and consent_option is ConsentOption.NASAL_SPRAY:
            checks.append(PreScreeningCheck.NO_ASTHMA_FLARE_UP)

        return checks

    @property
    def year_groups(self) -> list[int]:
        match self:
            case self.FLU:
                return list(range(0, 12))
            case self.HPV:
                return list(range(8, 12))
            case self.MENACWY | self.TD_IPV:
                return list(range(9, 12))


class Vaccine(StrEnum):
    # Flu
    FLUENZ = "Fluenz"

    # HPV
    GARDASIL_9 = "Gardasil 9"

    # MenACWY
    MENQUADFI = "MenQuadfi"
    MENVEO = "Menveo"
    NIMENRIX = "Nimenrix"

    # Td/IPV
    REVAXIS = "Revaxis"


class DeliverySite(StrEnum):
    LEFT_ARM_UPPER = "Left arm (upper position)"
    RIGHT_ARM_UPPER = "Right arm (upper position)"
    LEFT_ARM_LOWER = "Left arm (lower position)"
    RIGHT_ARM_LOWER = "Right arm (lower position)"

    @classmethod
    def from_code(cls, code: str) -> "DeliverySite":
        sites = {
            "368208006": DeliverySite.LEFT_ARM_UPPER,
            "368209003": DeliverySite.RIGHT_ARM_UPPER,
        }
        return sites[code]


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

    # flu
    ASTHMA_STEROIDS = "Does your child take oral steroids for their asthma?"
    ASTHMA_INTENSIVE_CARE = (
        "Has your child ever been admitted to intensive care because of their asthma?"
    )
    IMMUNE_SYSTEM = "Does your child have a disease or treatment that severely affects their immune system?"
    HOUSEHOLD_IMMUNE_SYSTEM = "Is your child in regular close contact with anyone currently having treatment that severely affects their immune system?"
    BLEEDING_DISORDER_FLU = "Does your child have a bleeding disorder or are they taking anticoagulant therapy?"
    EGG_ALLERGY = "Has your child ever been admitted to intensive care due to a severe allergic reaction (anaphylaxis) to egg?"
    SEVERE_ALLERGIC_REACTION_NASAL = "Has your child had a severe allergic reaction (anaphylaxis) to a previous dose of the nasal flu vaccine, or any ingredient of the vaccine?"
    SEVERE_ALLERGIC_REACTION_INJECTED = "Has your child had a severe allergic reaction (anaphylaxis) to a previous dose of the injected flu vaccine, or any ingredient of the vaccine?"
    MEDICAL_CONDITIONS_FLU = "Does your child have any other medical conditions the immunisation team should be aware of?"
    ASPIRIN = "Does your child take regular aspirin?"
    FLU_PREVIOUSLY = "Has your child had a flu vaccination in the last 3 months?"


class PreScreeningCheck(StrEnum):
    KNOW_VACCINATION = "knows what the vaccination is for, and is happy to have it"
    NOT_ACUTELY_UNWELL = "is not acutely unwell"
    NOT_ALREADY_HAD = "has not already had this vaccination"
    NOT_PREGNANT = "is not pregnant"
    NO_RELEVANT_ALLERGIES = "has no allergies which would prevent vaccination"
    NO_RELEVANT_MEDICATION = "is not taking any medication which prevents vaccination"
    NO_ASTHMA_FLARE_UP = "if they have asthma, has not had a flare-up of symptoms in the past 72 hours, including wheezing or needing to use a reliever inhaler more than usual"


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
    site: str

    def __str__(self):
        return self.name

    @property
    def urn_and_site(self):
        if self.site:
            return self.urn + self.site
        else:
            return self.urn

    def to_onboarding(self):
        return self.urn_and_site


class Organisation(NamedTuple):
    ods_code: str

    def to_onboarding(self):
        return {
            "ods_code": self.ods_code,
        }


class Subteam(NamedTuple):
    key: str
    name: str
    email: str
    phone: str

    def __str__(self):
        return self.name

    def to_onboarding(self):
        return {self.key: {"name": self.name, "email": self.email, "phone": self.phone}}


class Team(NamedTuple):
    name: str
    workgroup: str
    careplus_venue_code: str
    email: str
    phone: str

    def __str__(self):
        return f"{self.name}"

    def to_onboarding(self):
        return {
            "name": self.name,
            "workgroup": self.workgroup,
            "email": self.email,
            "phone": self.phone,
            "careplus_venue_code": self.careplus_venue_code,
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
    year_group: int
    parents: tuple[Parent, Parent]

    def __str__(self):
        return f"{self.last_name}, {self.first_name}"

    @property
    def name(self) -> tuple[str, str]:
        return self.first_name, self.last_name


class ImmsEndpoints(StrEnum):
    AUTH = "/oauth2/token"
    CREATE = "/immunisation-fhir-api/FHIR/R4/Immunization"
    READ = "/immunisation-fhir-api/FHIR/R4/Immunization"
    SEARCH = "/immunisation-fhir-api/FHIR/R4/Immunization/_search"
    UPDATE = "/immunisation-fhir-api/FHIR/R4/Immunization/"
    DELETE = "/immunisation-fhir-api/FHIR/R4/Immunization/"

    @property
    def to_url(self) -> str:
        return urllib.parse.urljoin(
            os.getenv("IMMS_BASE_URL", "PROVIDEURL"), self.value
        )
