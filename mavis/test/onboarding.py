from attr import dataclass

from mavis.test.data_models import (
    Clinic,
    NationalReportingTeam,
    Organisation,
    PointOfCareTeam,
    School,
    Subteam,
    User,
)


@dataclass
class PointOfCareOnboarding:
    organisation: Organisation
    team: PointOfCareTeam
    subteam: Subteam
    users: dict[str, User]
    clinics: list[Clinic]
    schools: dict[str, list[School]]
    programmes: str

    @classmethod
    def get_onboarding_data_for_tests(
        cls, base_url: str, year_groups: dict[str, int], programmes: str
    ) -> "PointOfCareOnboarding":
        subteam = Subteam.generate()
        organisation = Organisation.generate()
        team = PointOfCareTeam.generate(subteam, organisation)
        users = {
            role: User.generate(role)
            for role in (
                "nurse",
                "medical_secretary",
                "superuser",
                "prescriber",
                "healthcare_assistant",
            )
        }
        clinics = [Clinic.generate()]
        schools = School.get_from_testing_api(base_url, year_groups)

        return cls(
            organisation=organisation,
            team=team,
            subteam=subteam,
            users=users,
            clinics=clinics,
            schools=schools,
            programmes=programmes,
        )

    def to_dict(self) -> dict[str, object]:
        return {
            "clinics": {self.subteam.key: [it.to_onboarding() for it in self.clinics]},
            "team": self.team.to_onboarding(),
            "organisation": self.organisation.to_onboarding(),
            "programmes": self.programmes,
            "schools": {
                self.subteam.key: [
                    school.to_onboarding()
                    for schools_list in self.schools.values()
                    for school in schools_list
                ],
            },
            "subteams": self.subteam.to_onboarding(),
            "users": [it.to_onboarding() for it in self.users.values()],
        }


@dataclass
class NationalReportingOnboarding:
    organisation: Organisation
    team: NationalReportingTeam
    users: dict[str, User]
    programmes: str

    @classmethod
    def get_onboarding_data_for_tests(
        cls, programmes: str
    ) -> "NationalReportingOnboarding":
        organisation = Organisation.generate()
        team = NationalReportingTeam.generate(organisation)
        users = {
            role: User.generate(role)
            for role in (
                "nurse",
                "medical_secretary",
                "superuser",
                "prescriber",
                "healthcare_assistant",
            )
        }

        return cls(
            organisation=organisation,
            team=team,
            users=users,
            programmes=programmes,
        )

    def to_dict(self) -> dict[str, object]:
        return {
            "team": self.team.to_onboarding(),
            "organisation": self.organisation.to_onboarding(),
            "programmes": self.programmes,
            "users": [it.to_onboarding() for it in self.users.values()],
        }
