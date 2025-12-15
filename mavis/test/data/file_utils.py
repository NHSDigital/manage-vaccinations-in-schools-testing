import json
import uuid
from datetime import datetime
from pathlib import Path

import pandas as pd

from mavis.test.constants import DeliverySite, Vaccine
from mavis.test.data_models import Child, School
from mavis.test.utils import get_current_datetime, normalize_whitespace


def read_scenario_list_from_file(input_file_path: Path) -> str | None:
    try:
        _df = pd.read_csv(input_file_path)
        return (
            ", ".join(_df["TEST_DESC_IGNORED"].tolist())
            if "TEST_DESC_IGNORED" in _df.columns
            else None
        )
    except pd.errors.EmptyDataError:
        return None


def get_session_id(path: Path) -> str:
    data_frame = pd.read_excel(path, sheet_name="Vaccinations", dtype=str)
    session_ids = data_frame["SESSION_ID"].dropna()
    session_ids = session_ids[session_ids.str.strip() != ""]

    if session_ids.empty:
        msg = "No valid SESSION_ID found in the file."
        raise ValueError(msg)
    return session_ids.iloc[0]


def create_child_list_from_file(
    file_path: Path,
    *,
    is_vaccinations: bool,
) -> list[str]:
    _file_df = pd.read_csv(file_path)

    if is_vaccinations:
        _cols = ["PERSON_SURNAME", "PERSON_FORENAME"]
    else:
        _cols = ["CHILD_LAST_NAME", "CHILD_FIRST_NAME"]

    last_name_list = _file_df[_cols[0]].apply(normalize_whitespace)
    first_name_list = _file_df[_cols[1]].apply(normalize_whitespace)
    return last_name_list.str.cat(first_name_list, sep=", ").tolist()


def increment_date_of_birth_for_records(file_path: Path) -> None:
    _file_df = pd.read_csv(file_path)
    _file_df["CHILD_DATE_OF_BIRTH"] = pd.to_datetime(
        _file_df["CHILD_DATE_OF_BIRTH"],
    ) + pd.Timedelta(days=1)
    _file_df.to_csv(file_path, index=False)


def create_fhir_immunization_payload(
    vaccine: Vaccine,
    child: Child,
    school: School,
    delivery_site: DeliverySite,
    vaccination_time: datetime,
) -> dict:
    """Create a FHIR Immunization resource payload using FileGenerator pattern.

    This loads a FHIR R4 Immunization template and substitutes placeholders
    using the same pattern as FileGenerator for consistency.
    """
    # Load template file
    template_path = Path(__file__).parent / "fhir_immunization_template.json.template"

    with template_path.open("r") as f:
        template_content = f.read()

    # Generate unique IDs for this immunization
    immunization_id = str(uuid.uuid4())

    # Create replacements dictionary using FileGenerator pattern
    replacements = {
        "<<IMMUNIZATION_ID>>": immunization_id,
        "<<VACCINE_CODE>>": vaccine.imms_api_code,
        "<<VACCINE_NAME>>": vaccine.name,
        "<<PATIENT_NHS_NUMBER>>": child.nhs_number,
        "<<PATIENT_FAMILY_NAME>>": child.last_name,
        "<<PATIENT_GIVEN_NAME>>": child.first_name,
        "<<PATIENT_GENDER>>": "unknown",  # Child model doesn't have gender
        "<<PATIENT_BIRTH_DATE>>": child.date_of_birth.strftime("%Y-%m-%d"),
        "<<PATIENT_POSTAL_CODE>>": child.address[3],
        "<<VACCINATION_TIME>>": vaccination_time.strftime("%Y-%m-%dT%H:%M:%S+00:00"),
        "<<RECORDED_TIME>>": get_current_datetime().strftime("%Y-%m-%dT%H:%M:%S+00:00"),
        "<<SCHOOL_URN>>": school.urn,
        "<<DELIVERY_SITE_CODE>>": delivery_site.imms_api_code,
        "<<DELIVERY_SITE_DISPLAY>>": delivery_site.value,
        "<<TARGET_DISEASE_CODE>>": vaccine.target_disease_code,
        "<<TARGET_DISEASE_DISPLAY>>": vaccine.target_disease_display,
    }

    # Apply replacements using FileGenerator pattern
    payload_content = template_content
    for placeholder, value in replacements.items():
        payload_content = payload_content.replace(placeholder, value)

    return json.loads(payload_content)
