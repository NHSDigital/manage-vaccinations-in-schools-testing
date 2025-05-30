from typing import NamedTuple


class Clinic(NamedTuple):
    name: str

    def __str__(self):
        return self.name
