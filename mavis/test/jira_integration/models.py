"""
Data models for JIRA integration.
"""

from dataclasses import dataclass
from datetime import datetime
from enum import Enum


class TestResult(Enum):
    """Test result enumeration for Zephyr Scale."""

    PASS = "Pass"  # noqa: S105
    FAIL = "Fail"
    BLOCKED = "Blocked"
    SKIPPED = "Not Executed"
    IN_PROGRESS = "In Progress"


@dataclass
class TestStep:
    """Represents a test step in JIRA."""

    step: str
    expected_result: str
    actual_result: str | None = None
    status: TestResult | None = None


@dataclass
class ZephyrTestCase:
    """Represents a test case in Zephyr Scale."""

    summary: str
    description: str
    test_steps: list[TestStep]
    project_key: str
    priority: str = "Medium"
    labels: list[str] | None = None
    folder: str | None = None
    objective: str | None = None
    test_case_id: int | None = None
    jira_key: str | None = None


@dataclass
class ZephyrTestExecution:
    """Represents a test execution in Zephyr Scale."""

    test_case_id: int
    test_cycle_id: int | None = None
    execution_status: TestResult = TestResult.IN_PROGRESS
    executed_by: str | None = None
    execution_date: datetime | None = None
    comment: str | None = None
    attachments: list[str] | None = None  # File paths to attachments
    execution_id: int | None = None
    environment: str | None = None
