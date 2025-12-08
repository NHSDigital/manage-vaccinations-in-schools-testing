from pathlib import Path

import pandas as pd

from mavis.test.utils import (
    normalize_whitespace,
)


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
