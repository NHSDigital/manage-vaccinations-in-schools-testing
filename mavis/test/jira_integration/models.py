"""
Data models for JIRA test management integration.
"""

from dataclasses import dataclass
from datetime import datetime
from enum import Enum


class TestResult(Enum):
    """Test result enumeration for test management."""

    PASS = "Pass"  # noqa: S105
    FAIL = "Fail"
    BLOCKED = "Blocked"
    NOT_EXECUTED = "Not Executed"
    IN_PROGRESS = "In Progress"
    SKIPPED = "Skipped"


@dataclass
class TestStep:
    """Represents a test step."""

    description: str
    expected_result: str
    actual_result: str | None = None
    status: TestResult | None = None


@dataclass
class JiraTestCase:
    """Represents a JIRA test case."""

    name: str
    description: str
    precondition: str | None = None
    test_steps: list[TestStep] | None = None
    project_id: int | None = None
    priority: str = "Normal"
    labels: list[str] | None = None
    folder_id: int | None = None
    objective: str | None = None
    test_case_id: int | None = None
    key: str | None = None


@dataclass
class JiraTestCycle:
    """Represents a JIRA test cycle."""

    name: str
    description: str | None = None
    project_id: int | None = None
    planned_start_date: datetime | None = None
    planned_end_date: datetime | None = None
    folder_id: int | None = None
    cycle_id: int | None = None
    key: str | None = None


@dataclass
class JiraTestExecution:
    """Represents a JIRA test execution."""

    test_case_key: str
    test_cycle_key: str | None = None
    execution_status: TestResult = TestResult.NOT_EXECUTED
    executed_by: str | None = None
    execution_date: datetime | None = None
    comment: str | None = None
    attachments: list[str] | None = None
    execution_id: int | None = None
    environment: str | None = None
    actual_end_date: datetime | None = None
    execution_time: int | None = None
