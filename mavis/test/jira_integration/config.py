import os
from dataclasses import dataclass


@dataclass
class JiraConfig:
    """Configuration for Jira integration."""

    url: str
    api_token: str
    project_key: str
    project_id: str
    test_cycle_name: str
    test_cycle_version: str
    enabled: bool

    @classmethod
    def from_env(cls) -> "JiraConfig":
        """Create configuration from environment variables."""
        enabled = os.getenv("JIRA_INTEGRATION_ENABLED", "true").lower() == "true"

        url = os.getenv("JIRA_REPORTING_URL", "")
        api_token = os.getenv("JIRA_API_TOKEN", "")
        project_key = os.getenv("JIRA_PROJECT_KEY", "")
        project_id = os.getenv("JIRA_PROJECT_ID", "")
        test_cycle_name = os.getenv("JIRA_TEST_CYCLE_NAME", "")
        test_cycle_version = os.getenv("JIRA_TEST_CYCLE_VERSION", "")

        return cls(
            url=url,
            api_token=api_token,
            project_key=project_key,
            project_id=project_id,
            test_cycle_name=test_cycle_name,
            test_cycle_version=test_cycle_version,
            enabled=enabled,
        )

    def is_valid(self) -> bool:
        """Check if configuration has all required fields."""
        return bool(
            self.enabled
            and self.url
            and self.api_token
            and self.project_key
            and self.project_id
            and self.test_cycle_name
            and self.test_cycle_version
        )
