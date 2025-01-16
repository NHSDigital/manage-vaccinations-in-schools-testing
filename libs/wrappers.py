import base64
import os
import subprocess
import time
from datetime import datetime, timedelta

from libs.constants import escape_characters, file_encoding


def convert_time_units_to_seconds(time_unit: str) -> int:
    """
    Convert time units to seconds
    For example: "1m" to 60
                "1h" to 3600

    Args:
        time_unit (str): time unit to convert

    Returns:
        int: Number of seconds
    """
    seconds = 0
    if time_unit[-1].lower() == "m":
        seconds = int(time_unit[0:-1]) * 60
    elif time_unit[-1].lower() == "h":
        seconds = int(time_unit[0:-1]) * 60 * 60
    else:
        seconds = int(time_unit.lower().replace("s", ""))
    return seconds


def wait(timeout: str):
    seconds = convert_time_units_to_seconds(time_unit=timeout)
    time.sleep(seconds)


def get_link_formatted_date_time():
    _am_or_pm = datetime.now().strftime(format="%p").lower()
    try:
        _dt = datetime.now().strftime(format="%-d %B %Y at %-I:%M")  # Linux (Github Action)
    except:
        _dt = datetime.now().strftime(format="%#d %B %Y at %#I:%M")  # Windows (Dev VDI)
    return f"{_dt}{_am_or_pm}"


def get_new_datetime() -> str:
    return datetime.now().strftime("%Y%m%d%H%M%S")


def clean_text(text: str) -> str:
    for _chr in escape_characters.UI_FORMATTING:
        text = text.replace(_chr, "")
    return text


def clean_file_name(file_name: str) -> str:
    for _chr in escape_characters.FILE_NAME:
        file_name = file_name.replace(_chr, "")
    return file_name


def get_offset_date(offset_days: int) -> str:
    _offset_date = datetime.now() + timedelta(days=offset_days)
    if offset_days != 0:
        while _offset_date.weekday() >= 5:
            _offset_date = _offset_date + timedelta(days=1)
    return _offset_date.strftime("%Y%m%d")


def get_project_root() -> str:
    _project_root = os.path.dirname(__file__)
    while os.path.basename(_project_root.lower()) != "manage-vaccinations-in-schools-testing":
        _project_root = os.path.dirname(_project_root)
    return _project_root


def get_base64_encoded_string(text):
    text_bytes = text.encode(file_encoding.ASCII)
    return base64.b64encode(text_bytes).decode(file_encoding.ASCII)


def get_base64_decoded_string(encoded_string):
    base64_bytes = encoded_string.encode(file_encoding.ASCII)
    return base64.b64decode(base64_bytes).decode(file_encoding.ASCII)


def run_shell_command(command: str) -> str:
    subprocess.run(command)
