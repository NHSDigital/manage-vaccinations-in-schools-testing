from datetime import date, datetime, timedelta

from faker import Faker
import re
import time
from playwright.sync_api import Page, Locator, expect

faker = Faker()


def format_datetime_for_upload_link(now: datetime) -> str:
    am_or_pm = now.strftime(format="%p").lower()

    try:
        # Linux (Github Action)
        date_string = now.strftime(format="%-d %B %Y at %-I:%M")
    except ValueError:
        # Windows (Dev VDI)
        date_string = now.strftime(format="%#d %B %Y at %#I:%M")

    return f"{date_string}{am_or_pm}"


def get_current_datetime() -> str:
    """
    Get the current date and time in a compact format.

    Returns:
        str: Current date and time in "YYYYMMDDHHMMSS" format.
    """
    return datetime.now().strftime("%Y%m%d%H%M%S")


def get_current_time() -> str:
    """
    Get the current time in a HH:MM:SS format.

    Returns:
        str: Current date and time in "HH:MM:SS" format.
    """
    return datetime.now().strftime("%H:%M:%S")


def get_offset_date(offset_days: int) -> str:
    """
    Get a date offset by a specified number of days.
    Skips weekends if the offset is non-zero.

    Args:
        offset_days (int): Number of days to offset (positive or negative).

    Returns:
        str: Offset date in "YYYYMMDD" format.
    """
    _offset_date = datetime.now() + timedelta(days=offset_days)
    if offset_days != 0:
        while _offset_date.weekday() >= 5:
            _offset_date = _offset_date + timedelta(days=1)
    return _offset_date.strftime("%Y%m%d")


def get_date_of_birth_for_year_group(year_group: int) -> date:
    academic_year = date.today().year - year_group - 6

    start_date = date(academic_year, 9, 1)
    end_date = date(academic_year + 1, 8, 31)

    return faker.date_between(start_date, end_date)


def generate_random_string(target_length: int = 100, spaces: bool = False) -> str:
    generated_string = ""
    if spaces:
        sentence = faker.sentence()
        while len(sentence) < target_length:
            sentence += " " + faker.word()
        generated_string = sentence[:target_length]
    else:
        generated_string = "".join(
            faker.random_choices(
                elements="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
                length=target_length,
            )
        )
    return generated_string


def normalize_whitespace(string: str) -> str:
    """
    Normalize whitespace in a string:
    - Remove zero-width joiners
    - Replace non-breaking spaces with regular spaces
    - Collapse consecutive whitespace to a single space
    - Strip leading/trailing whitespace
    """
    string = string.replace("\u200d", "")
    string = string.replace("\u00a0", " ")
    return re.sub(r"\s+", " ", string).strip()


def reload_until_element_is_visible(page: Page, tag: Locator, seconds: int = 30):
    for i in range(seconds * 2):
        if tag.is_visible():
            break

        time.sleep(0.5)

        page.reload()
    else:
        expect(tag).to_be_visible()
