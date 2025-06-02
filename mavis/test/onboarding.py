from typing import NamedTuple


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
