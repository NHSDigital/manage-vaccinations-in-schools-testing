from .fixtures import (
    add_vaccine_batch,
    authenticate_api,
    base_url,
    basic_auth_credentials,
    basic_auth_token,
    browser_context_args,
    browser_type,
    children,
    clinics,
    delete_team_after_tests,
    file_generator,
    healthcare_assistant,
    log_in_as_medical_secretary,
    log_in_as_nurse,
    log_in_as_prescriber,
    medical_secretary,
    nurse,
    onboarding,
    organisation,
    prescriber,
    programmes_enabled,
    reset_before_each_module,
    schedule_mmr_session_and_get_consent_url,
    schedule_session_and_get_consent_url,
    schools,
    set_feature_flags,
    setup_session_and_batches_with_fixed_child,
    subteam,
    superuser,
    team,
    upload_offline_vaccination,
    year_groups,
)
from .hooks import pytest_runtest_logreport, pytest_sessionfinish, pytest_sessionstart

# Import jira integration conditionally to avoid blocking
try:
    from .jira_integration.auto_fixtures import (
        auto_jira_integration,
        jira_reporter_session,
    )
    from .jira_integration.fixtures import jira_reporter
    from .jira_integration.jira_hooks import (
        pytest_configure,
        pytest_runtest_logreport,
        pytest_runtest_makereport,
        pytest_runtest_teardown,
    )

    _JIRA_AVAILABLE = True
except Exception as e:
    import logging

    logging.getLogger(__name__).warning("Failed to import jira integration: %s", e)
    _JIRA_AVAILABLE = False

__all__ = [
    "add_vaccine_batch",
    "authenticate_api",
    "base_url",
    "basic_auth_credentials",
    "basic_auth_token",
    "browser_context_args",
    "browser_type",
    "children",
    "clinics",
    "delete_team_after_tests",
    "file_generator",
    "healthcare_assistant",
    "log_in_as_medical_secretary",
    "log_in_as_nurse",
    "log_in_as_prescriber",
    "medical_secretary",
    "nurse",
    "onboarding",
    "organisation",
    "prescriber",
    "programmes_enabled",
    "pytest_runtest_logreport",
    "pytest_sessionfinish",
    "pytest_sessionstart",
    "reset_before_each_module",
    "schedule_mmr_session_and_get_consent_url",
    "schedule_session_and_get_consent_url",
    "schools",
    "set_feature_flags",
    "setup_session_and_batches_with_fixed_child",
    "subteam",
    "superuser",
    "team",
    "upload_offline_vaccination",
    "year_groups",
]

# Add jira integration exports only if available
if _JIRA_AVAILABLE:
    __all__.extend(
        [
            "auto_jira_integration",
            "jira_reporter",
            "jira_reporter_session",
            "pytest_configure",
            "pytest_runtest_logreport",
            "pytest_runtest_makereport",
            "pytest_runtest_teardown",
        ]
    )
