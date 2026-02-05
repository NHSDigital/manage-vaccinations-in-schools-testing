"""Data models for Jira integration."""

from enum import Enum


class TestResult(Enum):
    """Test result mapping between pytest and Jira/Zephyr."""

    PASS = "PASS"  # noqa: S105
    FAIL = "FAIL"
    SKIPPED = "UNEXECUTED"

    @classmethod
    def from_pytest_outcome(cls, outcome: str) -> "TestResult":
        """Convert pytest outcome to Jira test result.

        Args:
            outcome: pytest outcome string (passed, failed, skipped)

        Returns:
            TestResult enum value
        """
        mapping = {
            "passed": cls.PASS,
            "failed": cls.FAIL,
            "skipped": cls.SKIPPED,
        }
        return mapping.get(outcome.lower(), cls.FAIL)
