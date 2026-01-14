import random
import re
import time
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

from faker import Faker
from playwright.sync_api import Locator, Page, expect

from mavis.test.annotations import step

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


def get_current_datetime() -> datetime:
    return datetime.now(tz=ZoneInfo("Europe/London"))


def get_current_datetime_compact() -> str:
    return get_current_datetime().strftime("%Y%m%d%H%M%S")


def get_formatted_date_for_session_dates(date: date) -> str:
    try:
        # Linux (Github Action)
        return date.strftime(format="%-d %B %Y")
    except ValueError:
        # Windows (Dev VDI)
        return date.strftime(format="%#d %B %Y")


def get_formatted_date_without_year(date: date) -> str:
    try:
        # Linux (Github Action)
        return date.strftime(format="%-d %B")
    except ValueError:
        # Windows (Dev VDI)
        return date.strftime(format="%#d %B")


def get_day_month_year_from_compact_date(compact_date: str) -> tuple[int, int, int]:
    day = int(compact_date[-2:])
    month = int(compact_date[4:6])
    year = int(compact_date[:4])
    return day, month, year


def get_current_time_hms_format() -> str:
    return get_current_datetime().strftime("%H:%M:%S")


def get_todays_date() -> date:
    return get_current_datetime().date()


def get_offset_date(offset_days: int, *, skip_weekends: bool = False) -> date:
    _offset_date = get_todays_date() + timedelta(days=offset_days)

    if skip_weekends:
        day_of_week_saturday = 5
        while _offset_date.weekday() >= day_of_week_saturday:
            _offset_date = _offset_date + timedelta(days=1)

    return _offset_date


def get_offset_date_compact_format(
    offset_days: int, *, skip_weekends: bool = False
) -> str:
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


def random_datetime_earlier_today(input_time: datetime) -> datetime:
    midnight = input_time.replace(hour=0, minute=0, second=0, microsecond=0)
    delta_minutes = int((input_time - midnight).total_seconds() // 60)
    random_offset = random.randint(0, delta_minutes)
    random_dt = input_time - timedelta(minutes=random_offset)
    return random_dt.replace(second=0, microsecond=0)


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
    zwj = "\u200d"
    string = string.replace(zwj, "")

    nbsp = "\u00a0"
    string = string.replace(nbsp, " ")

    return re.sub(r"\s+", " ", string).strip()


POSTCODE_PATTERN = re.compile(
    r"""
    \A
    ([A-PR-UWYZ01][A-HJ-Z0]?)           # area
    ([0-9IO][0-9A-HJKMNPR-YIO]?)        # district
    \s*([0-9IO])                        # sector
    ([ABD-HJLNPQ-Z]{2})                 # unit
    \Z
    """,
    re.IGNORECASE | re.VERBOSE,
)


def normalize_postcode(postcode: str) -> str:
    match = POSTCODE_PATTERN.match(postcode.replace(" ", ""))
    if not match:
        msg = f"Invalid postcode format: {postcode}"
        raise ValueError(msg)

    area = match.group(1)
    district = match.group(2)
    sector = match.group(3)
    unit = match.group(4)

    # Replace 0/1 with O/I in area
    area = area.replace("0", "O").replace("1", "I")

    # Replace O/I with 0/1 in district
    district = district.replace("O", "0").replace("I", "1")

    return f"{area}{district} {sector}{unit}"


DEFAULT_TIMEOUT_SECONDS = 30


@step("Reload page until {1} is visible", page_object=False)
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


@step("Reload page until {1} is not visible", page_object=False)
def reload_until_element_is_not_visible(
    page: Page, tag: Locator, seconds: int = DEFAULT_TIMEOUT_SECONDS
) -> None:
    for _ in range(seconds * 2):
        if not tag.is_visible():
            break

        time.sleep(0.5)

        page.reload()
    else:
        expect(tag).to_be_hidden()


def expect_alert_text(page: Page, text: str) -> None:
    expect(page.get_by_role("alert")).to_contain_text(text)


def expect_details(page: Page, key: str, value: str) -> None:
    detail_key = page.locator(
        ".nhsuk-summary-list__key",
        has_text=re.compile(f"^{key}$"),
    ).first
    detail_value = detail_key.locator("xpath=following-sibling::*[1]")

    expect(detail_value).to_contain_text(value)
