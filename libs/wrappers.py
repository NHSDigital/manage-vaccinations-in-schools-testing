import time
from datetime import datetime, timedelta

from libs.constants import escape_characters


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
    _ampm = datetime.now().strftime(format="%p").lower()
    try:
        _dt = datetime.now().strftime(format="%-d %B %Y at %-I:%M")  # Linux (Github Action)
    except:
        _dt = datetime.now().strftime(format="%#d %B %Y at %#I:%M")  # Windows (Dev PC)
    return f"{_dt}{_ampm}"


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


def get_future_date(offset_days: int) -> str:
    _future_date = datetime.now() + timedelta(days=offset_days)
    while _future_date.weekday() >= 5:
        _future_date = _future_date + timedelta(days=1)
    return _future_date.strftime("%Y%m%d")
