import os
import urllib.parse
from enum import StrEnum

from faker import Faker

faker = Faker("en_GB")


class ConsentOption(StrEnum):
    INJECTION = "Injection"
    NASAL_SPRAY = "Nasal spray"
    NASAL_SPRAY_OR_INJECTION = ""
    MMR_WITHOUT_GELATINE = "Without gelatine"
    MMR_EITHER = "Either"


class PreScreeningCheck(StrEnum):
    KNOW_VACCINATION = "knows what the vaccination is for, and agrees to have it"
    NOT_ACUTELY_UNWELL = "is not acutely unwell"
    NO_OTHER_CONTRAINDICATIONS = (
        "has no other contraindications which prevent vaccination"
    )
    NOT_PREGNANT = "is not pregnant"
    NO_RELEVANT_MEDICATION = "is not taking any medication which prevents vaccination"
    NO_ASTHMA_FLARE_UP = (
        "if they have asthma, has not had a flare-up of symptoms in the past 72 hours,"
        " including wheezing or needing to use a reliever inhaler more than usual"
    )


class HealthQuestion(StrEnum):
    BLEEDING_DISORDER = (
        "Does your child have a bleeding disorder or another medical condition they"
        " receive treatment for?"
    )
    SEVERE_ALLERGIES = "Does your child have any severe allergies?"
    MEDICAL_CONDITIONS = (
        "Does your child have any medical conditions for which they receive treatment?"
    )
    REACTION = (
        "Has your child ever had a severe reaction to any medicines,"
        " including vaccines?"
    )
    EXTRA_SUPPORT = "Does your child need extra support during vaccination sessions?"
    PAST_MENACWY_VACCINE = (
        "Has your child had a meningitis (MenACWY) vaccination in the last 5 years?"
    )
    PAST_TDIPV_VACCINE = (
        "Has your child had a tetanus, diphtheria and polio vaccination in the"
        " last 5 years?"
    )

    # flu
    ASTHMA_STEROIDS = "Does your child take oral steroids for their asthma?"
    ASTHMA_INTENSIVE_CARE = (
        "Has your child ever been admitted to intensive care because of their asthma?"
    )
    IMMUNE_SYSTEM = (
        "Does your child have a disease or treatment that severely affects"
        " their immune system?"
    )
    HOUSEHOLD_IMMUNE_SYSTEM = (
        "Is your child in regular close contact with anyone currently having treatment"
        " that severely affects their immune system?"
    )
    BLEEDING_DISORDER_FLU = (
        "Does your child have a bleeding disorder or are they taking"
        " anticoagulant therapy?"
    )
    EGG_ALLERGY = (
        "Has your child ever been admitted to intensive care due to a"
        " severe allergic reaction (anaphylaxis) to egg?"
    )
    SEVERE_ALLERGIC_REACTION_NASAL = (
        "Has your child had a severe allergic reaction (anaphylaxis) to a previous dose"
        " of the nasal flu vaccine, or any ingredient of the vaccine?"
    )
    SEVERE_ALLERGIC_REACTION_INJECTED = (
        "Has your child had a severe allergic reaction (anaphylaxis) to a previous dose"
        " of the injected flu vaccine, or any ingredient of the vaccine?"
    )
    MEDICAL_CONDITIONS_FLU = (
        "Does your child have any other medical conditions the immunisation team"
        " should be aware of?"
    )
    ASPIRIN = "Does your child take regular aspirin?"
    FLU_PREVIOUSLY = "Has your child had a flu vaccination in the last 3 months?"

    # MMR
    MMR_BLEEDING_DISORDER = "Does your child have a bleeding disorder"
    MMR_ANTICOAGULANTS = (
        "Does your child take blood-thinning medicine (anticoagulants)?"
    )
    MMR_TRANSFUSION = (
        "Has your child received a blood or plasma transfusion,"
        " or immunoglobulin in the last 3 months?"
    )
    MMR_ALLERGIC_REACTION = (
        "Has your child had a severe allergic reaction (anaphylaxis) to a previous dose"
        " of MMR or any other vaccine?"
    )
    MMR_ALLERGIC_REACTION_NEOMYCIN = (
        "Has your child ever had a severe allergic reaction (anaphylaxis) to neomycin?"
    )
    MMR_TREATMENT = (
        "Does your child have a disease or treatment that severely affects"
        " their immune system?"
    )
    MMR_TB_TEST = (
        "Has your child had any of the following in the last 4 weeks, or are they due"
        " to have them in the next 4 weeks: TB skin test, chickenpox vaccine, or"
        " yellow fever vaccine?"
    )
    MMR_OTHER_MEDICAL_CONDITIONS = (
        "Does the child have any other medical conditions we should know about?"
    )
    MMR_EXTRA_SUPPORT = (
        "Does your child need extra support during vaccination sessions?"
    )
    MMR_EITHER_GELATINE = (
        "Has your child ever had a severe allergic reaction (anaphylaxis) to gelatine?"
    )


class TallyCategory(StrEnum):
    NEEDS_CONSENT = "Needs consent"
    HAS_A_REFUSAL = "Has a refusal"
    VACCINATED = "Vaccinated"
    DUE_VACCINATION = "Due vaccination"
    DUE_INJECTION = "Due injection"
    DUE_NASAL_SPRAY = "Due nasal spray"
    NEEDS_TRIAGE = "Needs triage"
    UNABLE_TO_VACCINATE = "Unable to vaccinate"


class Programme(StrEnum):
    FLU = "flu"
    HPV = "HPV"
    MENACWY = "MenACWY"
    MMR = "MMR"
    TD_IPV = "Td/IPV"

    @property
    def group(self) -> str:
        if self in {Programme.MENACWY, Programme.TD_IPV}:
            return "doubles"
        return self.value

    def health_questions(
        self, consent_option: ConsentOption = ConsentOption.INJECTION
    ) -> list[HealthQuestion]:
        includes_nasal = consent_option is not ConsentOption.INJECTION
        includes_injection = consent_option is not ConsentOption.NASAL_SPRAY
        mmr_either = consent_option is ConsentOption.MMR_EITHER

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

        mmr_questions = [
            HealthQuestion.MMR_BLEEDING_DISORDER,
            HealthQuestion.MMR_ANTICOAGULANTS,
            HealthQuestion.MMR_TRANSFUSION,
            HealthQuestion.MMR_ALLERGIC_REACTION,
            HealthQuestion.MMR_ALLERGIC_REACTION_NEOMYCIN,
            HealthQuestion.MMR_TREATMENT,
            HealthQuestion.MMR_TB_TEST,
            HealthQuestion.MMR_OTHER_MEDICAL_CONDITIONS,
            HealthQuestion.MMR_EXTRA_SUPPORT,
            HealthQuestion.MMR_EITHER_GELATINE if mmr_either else None,
        ]
        mmr_questions = [q for q in mmr_questions if q is not None]

        common_doubles_questions = [
            HealthQuestion.BLEEDING_DISORDER,
            HealthQuestion.SEVERE_ALLERGIES,
            HealthQuestion.REACTION,
            HealthQuestion.EXTRA_SUPPORT,
        ]
        programme_specific_questions = {
            Programme.MENACWY: [
                *common_doubles_questions,
                HealthQuestion.PAST_MENACWY_VACCINE,
            ],
            Programme.TD_IPV: [
                *common_doubles_questions,
                HealthQuestion.PAST_TDIPV_VACCINE,
            ],
            Programme.HPV: [
                HealthQuestion.SEVERE_ALLERGIES,
                HealthQuestion.MEDICAL_CONDITIONS,
                HealthQuestion.REACTION,
                HealthQuestion.EXTRA_SUPPORT,
            ],
            Programme.FLU: flu_questions,
            Programme.MMR: mmr_questions,
        }
        return programme_specific_questions[self]

    def pre_screening_checks(
        self,
        consent_option: ConsentOption = ConsentOption.INJECTION,
    ) -> list[PreScreeningCheck]:
        checks = [
            PreScreeningCheck.NOT_ACUTELY_UNWELL,
            PreScreeningCheck.NO_OTHER_CONTRAINDICATIONS,
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
                return list(range(12))
            case self.HPV:
                return list(range(8, 12))
            case self.MMR:
                return list(range(12))
            case self.MENACWY | self.TD_IPV:
                return list(range(9, 12))

    @property
    def tally_categories(self) -> list[str]:
        common_categories = [
            TallyCategory.NEEDS_CONSENT,
            TallyCategory.HAS_A_REFUSAL,
            TallyCategory.VACCINATED,
            TallyCategory.NEEDS_TRIAGE,
            TallyCategory.UNABLE_TO_VACCINATE,
        ]
        if self is self.FLU:
            return [
                *common_categories,
                TallyCategory.DUE_INJECTION,
                TallyCategory.DUE_NASAL_SPRAY,
            ]
        return [*common_categories]


class Vaccine(StrEnum):
    # Flu
    FLUENZ = "Fluenz"
    SEQUIRUS = "Cell-based Trivalent Influenza Vaccine Seqirus"

    # HPV
    GARDASIL_9 = "Gardasil 9"

    # MenACWY
    MENQUADFI = "MenQuadfi"
    MENVEO = "Menveo"
    NIMENRIX = "Nimenrix"

    # MMR
    MMR_VAXPRO = "MMR VaxPro"
    PRIORIX = "Priorix"

    # Td/IPV
    REVAXIS = "Revaxis"

    @property
    def imms_api_code(self) -> str:
        code_map = {
            self.SEQUIRUS: "43207411000001105",
            self.FLUENZ: "43208811000001106",
            self.GARDASIL_9: "33493111000001108",
        }
        return code_map[self]

    @property
    def programme(self) -> Programme:
        programme_mapping = {
            Vaccine.FLUENZ: Programme.FLU,
            Vaccine.SEQUIRUS: Programme.FLU,
            Vaccine.GARDASIL_9: Programme.HPV,
            Vaccine.MENQUADFI: Programme.MENACWY,
            Vaccine.MENVEO: Programme.MENACWY,
            Vaccine.NIMENRIX: Programme.MENACWY,
            Vaccine.REVAXIS: Programme.TD_IPV,
            Vaccine.MMR_VAXPRO: Programme.MMR,
            Vaccine.PRIORIX: Programme.MMR,
        }
        return programme_mapping[self]


class DeliverySite(StrEnum):
    LEFT_ARM_UPPER = "Left arm (upper position)"
    RIGHT_ARM_UPPER = "Right arm (upper position)"
    LEFT_ARM_LOWER = "Left arm (lower position)"
    RIGHT_ARM_LOWER = "Right arm (lower position)"
    NOSE = "Nose"

    @classmethod
    def from_imms_api_code(cls, code: str) -> "DeliverySite":
        sites = {
            "368208006": DeliverySite.LEFT_ARM_UPPER,
            "368209003": DeliverySite.RIGHT_ARM_UPPER,
            "279549004": DeliverySite.NOSE,
        }
        return sites[code]


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
    CAREPLUS = "CSV for CarePlus (System C)"
    CSV = "CSV"
    SYSTMONE = "CSV for SystmOne (TPP)"

    @property
    def headers(self) -> str:
        report_headers = {
            ReportFormat.CAREPLUS: (
                "NHS Number,Surname,Forename,Date of Birth,Address Line 1,"
                "Person Giving Consent,Ethnicity,Date Attended,Time Attended,"
                "Venue Type,Venue Code,Staff Type,Staff Code,Attended,"
                "Reason Not Attended,Suspension End Date,Vaccine 1,Vaccine Code 1,"
                "Dose 1,Reason Not Given 1,Site 1,Manufacturer 1,Batch No 1,Vaccine 2,"
                "Vaccine Code 2,Dose 2,Reason Not Given 2,Site 2,Manufacturer 2,"
                "Batch No 2,Vaccine 3,Vaccine Code 3,Dose 3,Reason Not Given 3,Site 3,"
                "Manufacturer 3,Batch No 3,Vaccine 4,Vaccine Code 4,Dose 4,"
                "Reason Not Given 4,Site 4,Manufacturer 4,Batch No 4,Vaccine 5,"
                "Vaccine Code 5,Dose 5,Reason Not Given 5,Site 5,Manufacturer 5,"
                "Batch No 5"
            ),
            ReportFormat.CSV: (
                "ORGANISATION_CODE,SCHOOL_URN,SCHOOL_NAME,CARE_SETTING,CLINIC_NAME,"
                "PERSON_FORENAME,PERSON_SURNAME,PERSON_DATE_OF_BIRTH,"
                "PERSON_DATE_OF_DEATH,YEAR_GROUP,PERSON_GENDER_CODE,"
                "PERSON_ADDRESS_LINE_1,PERSON_POSTCODE,NHS_NUMBER,"
                "NHS_NUMBER_STATUS_CODE,GP_ORGANISATION_CODE,GP_NAME,CONSENT_STATUS,"
                "CONSENT_DETAILS,HEALTH_QUESTION_ANSWERS,TRIAGE_STATUS,TRIAGED_BY,"
                "TRIAGE_DATE,TRIAGE_NOTES,GILLICK_STATUS,GILLICK_ASSESSMENT_DATE,"
                "GILLICK_ASSESSED_BY,GILLICK_ASSESSMENT_NOTES,GILLICK_NOTIFY_PARENTS,"
                "VACCINATED,DATE_OF_VACCINATION,TIME_OF_VACCINATION,PROGRAMME_NAME,"
                "VACCINE_GIVEN,PROTOCOL,PERFORMING_PROFESSIONAL_EMAIL,"
                "PERFORMING_PROFESSIONAL_FORENAME,PERFORMING_PROFESSIONAL_SURNAME,"
                "SUPPLIER_EMAIL,SUPPLIER_FORENAME,SUPPLIER_SURNAME,BATCH_NUMBER,"
                "BATCH_EXPIRY_DATE,ANATOMICAL_SITE,ROUTE_OF_VACCINATION,DOSE_SEQUENCE,"
                "DOSE_VOLUME,REASON_NOT_VACCINATED,LOCAL_PATIENT_ID,"
                "SNOMED_PROCEDURE_CODE,REASON_FOR_INCLUSION,RECORD_CREATED,"
                "RECORD_UPDATED"
            ),
            ReportFormat.SYSTMONE: (
                "Practice code,NHS number,Surname,Middle name,Forename,Gender,"
                "Date of Birth,House name,House number and road,Town,Postcode,"
                "Vaccination,Part,Admin date,Batch number,Expiry date,Dose,Reason,Site,"
                "Method,Notes"
            ),
        }
        return report_headers[self]


SCHOOL_MOVE_HEADERS = {
    "NHS_REF",
    "SURNAME",
    "FORENAME",
    "GENDER",
    "DOB",
    "ADDRESS1",
    "ADDRESS2",
    "ADDRESS3",
    "TOWN",
    "POSTCODE",
    "COUNTY",
    "ETHNIC_OR",
    "ETHNIC_DESCRIPTION",
    "NATIONAL_URN_NO",
    "BASE_NAME",
    "STARTDATE",
    "STUD_ID",
    "DES_NUMBER",
}


class Relationship(StrEnum):
    DAD = "Dad"
    MUM = "Mum"
    GUARDIAN = "Guardian"
    CARER = "Carer"
    OTHER = "Other"

    @property
    def generate_name(self) -> str:
        if self is Relationship.DAD:
            return faker.name_male()
        if self is Relationship.MUM:
            return faker.name_female()
        return faker.name_nonbinary()


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
            os.getenv("IMMS_BASE_URL", "PROVIDEURL"),
            self.value,
        )
