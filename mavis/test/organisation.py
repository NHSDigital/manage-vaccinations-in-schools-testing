from typing import NamedTuple


class Organisation(NamedTuple):
    name: str
    ods_code: str

    def __str__(self):
        return f"{self.name} ({self.ods_code})"
