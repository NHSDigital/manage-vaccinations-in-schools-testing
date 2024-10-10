import time
from datetime import datetime


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
