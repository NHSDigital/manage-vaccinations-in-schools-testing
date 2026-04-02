import logging
import random
import re
import time
import unicodedata
from datetime import date, datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

import httpx
from faker import Faker
from playwright.sync_api import Locator, Page, expect
from pypdf import PdfReader

from mavis.test.annotations import step
from mavis.test.constants import MMRV_ELIGIBILITY_CUTOFF_DOB

faker = Faker()

# Configure API logging
_api_logger = logging.getLogger("mavis.api")
_api_log_path = Path("logs") / "api.log"
_api_log_path.parent.mkdir(parents=True, exist_ok=True)

# Set up file handler for API logs
_api_handler = logging.FileHandler(_api_log_path)
_api_handler.setLevel(logging.INFO)
_api_formatter = logging.Formatter(
    "%(asctime)s | %(message)s", datefmt="%Y-%m-%d %H:%M:%S"
)
_api_handler.setFormatter(_api_formatter)
_api_logger.addHandler(_api_handler)
_api_logger.setLevel(logging.INFO)
# Don't propagate to root logger (prevents console output during tests)
_api_logger.propagate = False

# Completely disable httpx's built-in logging to prevent any credential leaks
logging.getLogger("httpx").disabled = True

# Maximum length for API response text in logs
MAX_API_RESPONSE_LOG_LENGTH = 1000


def _mask_sensitive_data(text: str) -> str:
    """Mask sensitive data in text for logging.

    Masks:
    - Bearer tokens
    - Access tokens in JSON
    - JWT tokens (including client_assertion)
    - Authorization headers
    - API keys
    - Client secrets
    - Passwords
    """
    # Mask Bearer tokens in headers or text
    text = re.sub(r"Bearer [A-Za-z0-9._-]+", "Bearer ***REDACTED***", text)

    # Mask access_token in JSON responses
    text = re.sub(
        r'"access_token"\s*:\s*"[^"]+?"', '"access_token": "***REDACTED***"', text
    )

    # Mask refresh_token in JSON
    text = re.sub(
        r'"refresh_token"\s*:\s*"[^"]+?"', '"refresh_token": "***REDACTED***"', text
    )

    # Mask client_assertion (JWT used in OAuth)
    text = re.sub(
        r'"client_assertion"\s*:\s*"[^"]+?"',
        '"client_assertion": "***REDACTED***"',
        text,
    )

    # Mask client_secret
    text = re.sub(
        r'"client_secret"\s*:\s*"[^"]+?"', '"client_secret": "***REDACTED***"', text
    )

    # Mask password fields
    text = re.sub(r'"password"\s*:\s*"[^"]+?"', '"password": "***REDACTED***"', text)

    # Mask API keys
    text = re.sub(r'"api_key"\s*:\s*"[^"]+?"', '"api_key": "***REDACTED***"', text)
    text = re.sub(r'"apiKey"\s*:\s*"[^"]+?"', '"apiKey": "***REDACTED***"', text)

    # Mask JWT tokens anywhere (eyJ... pattern)
    text = re.sub(
        r"\beyJ[A-Za-z0-9._-]{20,}\b",
        "***JWT_REDACTED***",
        text,
    )

    # Mask Authorization header values in JSON
    text = re.sub(
        r'"authorization"\s*:\s*"[^"]+?"',
        '"authorization": "***REDACTED***"',
        text,
        flags=re.IGNORECASE,
    )

    # Mask session tokens or similar
    text = re.sub(
        r'"session_token"\s*:\s*"[^"]+?"',
        '"session_token": "***REDACTED***"',
        text,
    )
    text = re.sub(r'"token"\s*:\s*"[^"]+?"', '"token": "***REDACTED***"', text)

    return text


def _sanitize_headers(headers: httpx.Headers) -> dict[str, str]:
    """Remove or mask sensitive headers for logging.

    Args:
        headers: httpx.Headers object

    Returns:
        Dictionary with sensitive headers redacted
    """
    safe_headers = dict(headers)

    # Redact sensitive headers (case-insensitive)
    sensitive_keys = [
        "authorization",
        "x-api-key",
        "cookie",
        "set-cookie",
        "x-auth-token",
        "x-access-token",
        "x-session-token",
        "proxy-authorization",
        "www-authenticate",
        "api-key",
        "apikey",
    ]
    
    # Convert header keys to lowercase for comparison
    lower_headers = {k.lower(): k for k in safe_headers.keys()}
    
    for sensitive_key in sensitive_keys:
        if sensitive_key in lower_headers:
            original_key = lower_headers[sensitive_key]
            safe_headers[original_key] = "***REDACTED***"

    return safe_headers


def _log_request(request: httpx.Request) -> None:
    """Event hook to log httpx requests with sanitized headers.
    
    Note: Request body is intentionally NOT logged to prevent credential leaks,
    as POST/PUT bodies may contain sensitive data like passwords, tokens, etc.
    """
    headers_str = ", ".join(
        f"{k}: {v}" for k, v in _sanitize_headers(request.headers).items()
    )
    _api_logger.info(
        f"REQUEST | {request.method} | {request.url} | HEADERS: {headers_str}"
    )


def _log_response(response: httpx.Response) -> None:
    """Event hook to log httpx responses with masked sensitive data."""
    # Read the response content if not already read (for streaming responses)
    response.read()

    # Truncate and mask response body
    response_text = response.text
    if len(response_text) > MAX_API_RESPONSE_LOG_LENGTH:
        response_text = response_text[:MAX_API_RESPONSE_LOG_LENGTH] + "... [truncated]"

    masked_response = _mask_sensitive_data(response_text)

    # Log response with headers
    headers_str = ", ".join(f"{k}: {v}" for k, v in _sanitize_headers(response.headers).items())

    _api_logger.info(
        f"RESPONSE | {response.request.method} | {response.request.url} | "
        f"STATUS: {response.status_code} | HEADERS: {headers_str} | BODY: {masked_response}"
    )


# Create a default httpx client with logging event hooks
def get_logged_httpx_client(**kwargs) -> httpx.Client:
    """Get an httpx.Client configured with API logging event hooks.

    Args:
        **kwargs: Additional arguments to pass to httpx.Client

    Returns:
        httpx.Client with logging configured
    """
    event_hooks = kwargs.pop("event_hooks", {})
    event_hooks.setdefault("request", []).append(_log_request)
    event_hooks.setdefault("response", []).append(_log_response)

    return httpx.Client(event_hooks=event_hooks, **kwargs)


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


def generate_random_dob_for_mmr_not_mmrv() -> date:
    """
    Generate random date of birth for MMR eligibility (not MMRV).

    Children born before 2020-01-01 are eligible for MMR but not MMRV.
    This generates dates between Sept 1, 2014 and Dec 31, 2019.
    """
    start_date = date(MMRV_ELIGIBILITY_CUTOFF_DOB.year - 6, 9, 1)
    end_date = MMRV_ELIGIBILITY_CUTOFF_DOB - timedelta(days=1)
    random_days = random.randint(0, (end_date - start_date).days)
    return date.fromordinal(start_date.toordinal() + random_days)


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


def click_secondary_navigation_item(link: Locator) -> None:
    if link.get_by_role("strong").is_visible():
        return
    link.click()
    link.get_by_role("strong").wait_for()


def format_nhs_number(nhs_number: str) -> str:
    return f"{nhs_number[:3]} {nhs_number[3:6]} {nhs_number[6:]}"


def normalize_text(text: str) -> str:
    """Normalize text by handling ligatures and whitespace.

    Useful for comparing text extracted from PDFs where ligatures
    and whitespace formatting may differ from source text.
    """
    # Normalize Unicode (NFKD decomposes ligatures)
    text = unicodedata.normalize("NFKD", text)
    pdf_ligatures = {
        "\ufb00": "ff",
        "\ufb01": "fi",
        "\ufb02": "fl",
        "\ufb03": "ffi",
        "\ufb04": "ffl",
    }
    # Replace common ligatures that might not decompose
    for ligature, replacement in pdf_ligatures.items():
        text = text.replace(ligature, replacement)
    # Normalize whitespace
    text = re.sub(r"\s+", " ", text)
    return text.lower()


def read_pdf_as_normalized_text(pdf_path: Path) -> str:
    """Read a PDF file and return its text content normalized.

    Extracts text from all pages of the PDF and normalizes it by
    handling ligatures and whitespace to facilitate text comparison.

    Args:
        pdf_path: Path to the PDF file to read

    Returns:
        Normalized text content from the PDF
    """
    reader = PdfReader(pdf_path)
    pdf_text = ""
    for pdf_page in reader.pages:
        pdf_text += pdf_page.extract_text()
    return normalize_text(pdf_text)


def assert_questions_in_pdf(
    pdf_text_normalized: str,
    questions: list,
    context: str = "PDF",
) -> None:
    """Assert that all questions are present in normalized PDF text.

    Args:
        pdf_text_normalized: The normalized PDF text to search in
        questions: List of questions to verify
        context: Context description for error messages (default: "PDF")

    Raises:
        AssertionError: If any question is not found in the PDF
    """

    for question in questions:
        question_normalized = normalize_text(str(question))

        assert question_normalized in pdf_text_normalized, (  # noqa: S101
            f"Health question '{question}' not found in {context}"
        )
