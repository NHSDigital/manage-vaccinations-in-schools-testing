import re
import time
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

from faker import Faker
from playwright.sync_api import Locator, Page, expect

faker = Faker()

DEFAULT_TIMEOUT_SECONDS = 30

MAVIS_NOTE_LENGTH_LIMIT = 1000


def format_datetime_for_upload_link(now: datetime) -> str:
    am_or_pm = now.strftime(format="%p").lower()

    try:
        # Linux (Github Action)
        date_string = now.strftime(format="%-d %B %Y at %-I:%M")
    except ValueError:
        # Windows (Dev VDI)
        date_string = now.strftime(format="%#d %B %Y at %#I:%M")

    return f"{date_string}{am_or_pm}"


def get_current_datetime() -> datetime:
    """Get the current date and time.

    Returns:
        datetime: Current date and time.

    """
    return datetime.now(tz=ZoneInfo("Europe/London"))


def get_current_datetime_compact() -> str:
    """Get the current date and time in a compact format.

    Returns:
        str: Current date and time in "YYYYMMDDHHMMSS" format.

    """
    return get_current_datetime().strftime("%Y%m%d%H%M%S")


def get_current_time_hms_format() -> str:
    """Get the current time in a HH:MM:SS format.

    Returns:
        str: Current date and time in "HH:MM:SS" format.

    """
    return get_current_datetime().strftime("%H:%M:%S")


def get_todays_date() -> date:
    """Get today's date using UK timezone.

    Returns:
        date: date object representing today's date in UK timezone.

    """
    return get_current_datetime().date()


def get_offset_date(offset_days: int, *, skip_weekends: bool = False) -> date:
    """Get a date offset by a specified number of days. Skips weekend dates by default.

    Args:
        offset_days (int): Number of days to offset (positive or negative).

    Returns:
        str: Offset date in "YYYYMMDD" format.

    """
    _offset_date = get_todays_date() + timedelta(days=offset_days)
    if skip_weekends:
        day_of_week_saturday = 5
        while _offset_date.weekday() >= day_of_week_saturday:
            _offset_date = _offset_date + timedelta(days=1)
    return _offset_date


def get_offset_date_compact_format(
    offset_days: int, *, skip_weekends: bool = False
) -> str:
    """Get a date offset by a specified number of days. Skips weekend dates by default.

    Args:
        offset_days (int): Number of days to offset (positive or negative).

    Returns:
        str: Offset date in "YYYYMMDD" format.

    """
    _offset_date = get_todays_date() + timedelta(days=offset_days)
    if skip_weekends:
        day_of_week_saturday = 5
        while _offset_date.weekday() >= day_of_week_saturday:
            _offset_date = _offset_date + timedelta(days=1)
    return _offset_date.strftime("%Y%m%d")


def get_date_of_birth_for_year_group(year_group: int) -> date:
    today = get_todays_date()
    academic_year = today.year - year_group - 6

    if today >= date(today.year, 9, 1):
        academic_year += 1

    start_date = date(academic_year, 9, 1)
    end_date = date(academic_year + 1, 8, 31)

    return faker.date_between(start_date, end_date)


def generate_random_string(
    target_length: int, *, generate_spaced_words: bool = False
) -> str:
    generated_string = ""
    if generate_spaced_words:
        sentence = faker.sentence()
        while len(sentence) < target_length:
            sentence += " " + faker.word()
        generated_string = sentence[:target_length]
    else:
        generated_string = "".join(
            faker.random_choices(
                elements="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
                length=target_length,
            ),
        )
    return generated_string


def normalize_whitespace(string: str) -> str:
    """Normalize whitespace in a string:
    - Remove zero-width joiners
    - Replace non-breaking spaces with regular spaces
    - Collapse consecutive whitespace to a single space
    - Strip leading/trailing whitespace
    """
    string = string.replace("\u200d", "")
    string = string.replace("\u00a0", " ")
    return re.sub(r"\s+", " ", string).strip()


def reload_until_element_is_visible(
    page: Page, tag: Locator, seconds: int = DEFAULT_TIMEOUT_SECONDS
) -> None:
    for _ in range(seconds * 2):
        if tag.is_visible():
            break

        time.sleep(0.5)

        page.reload()
    else:
        expect(tag).to_be_visible()
