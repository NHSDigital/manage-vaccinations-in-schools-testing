"""
Data models for JIRA integration.
"""

from dataclasses import dataclass
from datetime import datetime
from enum import Enum


class TestResult(Enum):
    """Test result enumeration for Jira."""

    PASS = "Pass"  # noqa: S105
    FAIL = "Fail"
    BLOCKED = "Blocked"
    SKIPPED = "To Do"
    IN_PROGRESS = "In Progress"


@dataclass
class TestStep:
    """Represents a test step in JIRA."""

    step: str
    expected_result: str
    actual_result: str | None = None
    status: TestResult | None = None


@dataclass
class JiraTestCase:
    """Represents a test case in Jira."""

    summary: str
    description: str
    test_steps: list[TestStep]
    project_key: str
    priority: str = "Medium"
    labels: list[str] | None = None
    folder: str | None = None
    objective: str | None = None
    issue_key: str | None = None
    issue_id: int | None = None


@dataclass
class JiraTestExecution:
    """Represents a test execution in Jira."""

    test_case_key: str
    test_plan_key: str | None = None
    execution_status: TestResult = TestResult.IN_PROGRESS
    executed_by: str | None = None
    execution_date: datetime | None = None
    comment: str | None = None
    attachments: list[str] | None = None  # File paths to attachments
    execution_key: str | None = None
    environment: str | None = None
