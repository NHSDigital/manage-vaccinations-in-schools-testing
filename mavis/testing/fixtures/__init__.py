import pytest

from .credentials import admin, basic_auth, nurse, superuser
from .models import (
    children_page,
    consent_doubles_page,
    consent_hpv_page,
    dashboard_page,
    import_records_page,
    login_page,
    programmes_page,
    school_moves_page,
    sessions_page,
    start_page,
    unmatched_page,
    vaccines_page,
)
from .playwright import base_url, browser_context_args, browser_type_launch_args, page
from .playwright_operations import screenshot, screenshots_path, playwright_operations
from .reset import reset_endpoint, skip_reset, reset_environment, playwright


@pytest.fixture
def log_in_as_nurse(nurse, login_page, start_page):
    start_page.navigate_and_start()
    login_page.log_in(**nurse)
    yield
    login_page.log_out()


@pytest.fixture
def log_in_as_admin(admin, login_page, start_page):
    start_page.navigate_and_start()
    login_page.log_in(**admin)
    yield
    login_page.log_out()


__all__ = (
    "admin",
    "base_url",
    "basic_auth",
    "browser_context_args",
    "browser_type_launch_args",
    "children_page",
    "consent_doubles_page",
    "consent_hpv_page",
    "dashboard_page",
    "import_records_page",
    "log_in_as_admin",
    "log_in_as_nurse",
    "login_page",
    "nurse",
    "page",
    "playwright",
    "playwright_operations",
    "programmes_page",
    "reset_endpoint",
    "reset_environment",
    "school_moves_page",
    "screenshot",
    "screenshots_path",
    "sessions_page",
    "skip_reset",
    "start_page",
    "superuser",
    "unmatched_page",
    "vaccines_page",
)
