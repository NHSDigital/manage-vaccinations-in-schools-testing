import csv
import random
from pathlib import Path

import requests
from dateutil.relativedelta import relativedelta

from mavis.test.constants import Relationship
from mavis.test.data_models import Child, Parent, Patient
from mavis.test.helpers.pds_api_helper import PdsApiHelper
from mavis.test.utils import get_todays_date

with (Path(__file__).parent / "pds.csv").open(newline="") as file:
    reader = csv.DictReader(file)
    patients = [Patient.from_csv_row(row) for row in reader]


def get_random_child_patient_without_date_of_death(token: str) -> Child:
    patients_without_date_of_death = [
        patient for patient in patients if not patient.date_of_death
    ]

    cutoff_date = get_todays_date() - relativedelta(years=22)

    child_patients_without_date_of_death = [
        patient
        for patient in patients_without_date_of_death
        if patient.date_of_birth >= cutoff_date
    ]

    pds_api_helper = PdsApiHelper(token)
    checked_nhs_numbers = set()
    while True:
        if len(checked_nhs_numbers) == len(child_patients_without_date_of_death):
            msg = "All patients in PDS export are outdated"
            raise RuntimeError(msg)

        child = random.choice(child_patients_without_date_of_death)
        if child.nhs_number in checked_nhs_numbers:
            continue

        checked_nhs_numbers.add(child.nhs_number)
        try:
            child_in_pds = pds_api_helper.get_patient_by_nhs_number(child.nhs_number)
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 404:  # noqa: PLR2004
                continue
            raise
        except ValueError:
            continue

        if child == child_in_pds:
            break

    return Child(
        child.given_name,
        child.family_name,
        child.nhs_number,
        child.address,
        child.date_of_birth,
        9,
        (Parent.get(Relationship.DAD), Parent.get(Relationship.MUM)),
    )
