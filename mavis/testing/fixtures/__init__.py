import pytest

from ..mavis_constants import test_data_values

from .credentials import admin, basic_auth, nurse, superuser
from .models import (
    children_page,
    consent_doubles_page,
    consent_hpv_page,
    dashboard_page,
    import_records_page,
    log_in_page,
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


organisation = test_data_values.ORG_CODE


@pytest.fixture
def log_in_as_nurse(nurse, log_in_page):
    log_in_page.navigate()
    log_in_page.log_in_and_select_role(**nurse, organisation=organisation)
    yield
    log_in_page.log_out()


@pytest.fixture
def log_in_as_admin(admin, log_in_page):
    log_in_page.navigate()
    log_in_page.log_in_and_select_role(**admin, organisation=organisation)
    yield
    log_in_page.log_out()


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
    "log_in_page",
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
