from typing import NamedTuple


class School(NamedTuple):
    name: str
    urn: str

    def __str__(self):
        return self.name
