"""
Data models for JIRA integration.
"""

from dataclasses import dataclass
from datetime import datetime
from enum import Enum


class TestResult(Enum):
    """Test result enumeration."""

    PASS = "PASSED"  # noqa: S105
    FAIL = "FAILED"
    BLOCKED = "BLOCKED"
    SKIPPED = "SKIPPED"


@dataclass
class TestStep:
    """Represents a test step in JIRA."""

    step: str
    expected_result: str
    actual_result: str | None = None
    status: TestResult | None = None


@dataclass
class JiraTestCase:
    """Represents a test case in JIRA."""

    summary: str
    description: str
    test_steps: list[TestStep]
    project_key: str
    priority: str = "Medium"
    labels: list[str] | None = None
    jira_key: str | None = None


@dataclass
class JiraTestExecution:
    """Represents a test execution in JIRA."""

    test_case_key: str
    execution_status: TestResult
    executed_by: str
    execution_date: datetime
    comment: str | None = None
    attachments: list[str] | None = None  # File paths to attachments
    execution_key: str | None = None
