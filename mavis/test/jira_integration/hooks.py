"""Pytest hooks for Jira integration."""

import logging

import pytest

from .reporter import JiraReporter

logger = logging.getLogger(__name__)

# Global reporter instance
_jira_reporter: JiraReporter | None = None


def pytest_configure(config: pytest.Config) -> None:  # noqa: ARG001
    """Initialize Jira reporter at start of test session.

    Args:
        config: Pytest configuration object (unused)
    """
    global _jira_reporter  # noqa: PLW0603

    try:
        _jira_reporter = JiraReporter()
        logger.info("Jira integration enabled")
    except ValueError as e:
        logger.info("Jira integration disabled: %s", e)
        _jira_reporter = None
    except Exception:
        logger.exception("Failed to initialize Jira reporter")
        _jira_reporter = None


def pytest_runtest_makereport(item: pytest.Item, call: pytest.CallInfo) -> None:
    """Hook called when test report is being created.

    Args:
        item: Test item
        call: Call information
    """
    # Only report results after the test call phase (actual test execution)
    if call.when != "call":
        return

    if not _jira_reporter:
        return

    try:
        # Get test name from item
        test_name = item.nodeid

        # Determine outcome
        if call.excinfo is None:
            outcome = "passed"
            error_message = None
        elif call.excinfo.typename == "Skipped":
            outcome = "skipped"
            error_message = str(call.excinfo.value)
        else:
            outcome = "failed"
            error_message = str(call.excinfo.value) if call.excinfo else None

        # Report to Jira
        _jira_reporter.report_test_result(
            test_name=test_name,
            outcome=outcome,
            error_message=error_message,
        )

    except Exception:
        logger.exception("Error in pytest_runtest_makereport")


def pytest_sessionfinish(session: pytest.Session, exitstatus: int) -> None:  # noqa: ARG001
    """Hook called when test session finishes.

    Args:
        session: Pytest session (unused)
        exitstatus: Exit status (unused)
    """
    if _jira_reporter:
        logger.info("Jira integration session finished")
