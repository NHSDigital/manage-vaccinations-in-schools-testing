from abc import ABC, abstractmethod

from attr import dataclass

from mavis.test.data_models import (
    Clinic,
    NationalReportingTeam,
    Organisation,
    PointOfCareTeam,
    School,
    Subteam,
    Team,
    User,
)


@dataclass
class Onboarding(ABC):
    organisation: Organisation
    team: Team
    users: dict[str, User]
    programmes: str

    @staticmethod
    def _generate_users() -> dict[str, User]:
        return {
            role: User.generate(role)
            for role in (
                "nurse",
                "medical_secretary",
                "superuser",
                "prescriber",
                "healthcare_assistant",
            )
        }

    def _base_dict(self) -> dict[str, object]:
        return {
            "organisation": self.organisation.to_onboarding(),
            "team": self.team.to_onboarding(),
            "programmes": self.programmes,
            "users": [it.to_onboarding() for it in self.users.values()],
        }

    @abstractmethod
    def to_dict(self) -> dict[str, object]:
        """
        Convert onboarding data to dictionary format.
        Must be implemented by subclasses.
        """


@dataclass
class PointOfCareOnboarding(Onboarding):
    subteam: Subteam
    clinics: list[Clinic]
    schools: dict[str, list[School]]

    @classmethod
    def get_onboarding_data_for_tests(
        cls, base_url: str, year_groups: dict[str, int], programmes: str
    ) -> "PointOfCareOnboarding":
        organisation = Organisation.generate()
        subteam = Subteam.generate()
        team = PointOfCareTeam.generate(subteam, organisation)
        users = cls._generate_users()
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
        base = self._base_dict()
        base.update(
            {
                "clinics": {
                    self.subteam.key: [it.to_onboarding() for it in self.clinics]
                },
                "schools": {
                    self.subteam.key: [
                        school.to_onboarding()
                        for schools_list in self.schools.values()
                        for school in schools_list
                    ],
                },
                "subteams": self.subteam.to_onboarding(),
            }
        )
        return base


@dataclass
class NationalReportingOnboarding(Onboarding):
    @classmethod
    def get_onboarding_data_for_tests(
        cls, programmes: str
    ) -> "NationalReportingOnboarding":
        organisation = Organisation.generate()
        team = NationalReportingTeam.generate(organisation)
        users = cls._generate_users()

        return cls(
            organisation=organisation,
            team=team,
            users=users,
            programmes=programmes,
        )

    def to_dict(self) -> dict[str, object]:
        return self._base_dict()
