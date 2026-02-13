"""Jira integration configuration."""

import os
from dataclasses import dataclass
from pathlib import Path


@dataclass
class JiraConfig:
    jira_reporting_url: str | None
    jira_api_token: str | None
    project_key: str
    screenshots_dir: Path = Path("screenshots")
    max_retries: int = 3
    timeout: int = 30
    enabled: bool = True
    screenshot_all_steps: bool = False
    test_cycle_version: str | None = None
    test_cycle_key: str | None = None
    zephyr_project_id: str | None = None

    @classmethod
    def from_env(cls) -> "JiraConfig":
        """Create JIRA configuration from environment variables."""
        jira_reporting_url = os.getenv("JIRA_REPORTING_URL")
        if jira_reporting_url and not jira_reporting_url.endswith("/rest/api/2/"):
            jira_reporting_url = f"{jira_reporting_url.rstrip('/')}/rest/api/2/"

        screenshot_all_steps = (
            os.getenv("SCREENSHOT_ALL_STEPS", "false").lower() == "true"
        )

        return cls(
            jira_reporting_url=jira_reporting_url,
            jira_api_token=os.getenv("JIRA_API_TOKEN"),
            project_key=os.getenv("JIRA_PROJECT_KEY", "MAV"),
            screenshots_dir=Path(os.getenv("JIRA_SCREENSHOTS_DIR", "screenshots")),
            max_retries=int(os.getenv("JIRA_MAX_RETRIES", "3")),
            timeout=int(os.getenv("JIRA_TIMEOUT", "30")),
            enabled=os.getenv("JIRA_INTEGRATION_ENABLED", "true").lower() == "true",
            screenshot_all_steps=screenshot_all_steps,
            test_cycle_version=os.getenv(
                "JIRA_TEST_CYCLE_VERSION", default="Unscheduled"
            ),
            test_cycle_key=os.getenv("JIRA_TEST_CYCLE_KEY", default="Ad hoc"),
            zephyr_project_id=os.getenv("ZEPHYR_PROJECT_ID"),
        )

    def is_valid(self) -> bool:
        """Check if configuration is valid for JIRA integration."""
        return (
            self.enabled
            and self.jira_reporting_url is not None
            and self.jira_api_token is not None
            and self.jira_reporting_url.strip()
            and self.jira_api_token.strip()
        )

    def is_enabled_and_configured(self) -> bool:
        """Centralized check for enabled and properly configured JIRA integration."""
        return self.is_valid()

    use_jira_integration = is_enabled_and_configured


@dataclass
class JiraIntegrationConfig:
    """Configuration for pure JIRA integration.

    Alternative configuration class for JIRA integration.
    Like JiraConfig, this respects the JIRA_INTEGRATION_ENABLED flag.
    Set JIRA_INTEGRATION_ENABLED=false to completely disable integration.
    """

    jira_reporting_url: str
    jira_api_token: str
    project_key: str
    screenshots_dir: Path = Path("screenshots")
    max_retries: int = 3
    timeout: int = 30
    enabled: bool = True
    use_bearer_auth: bool = True
    screenshot_all_steps: bool = False
    test_cycle_version: str | None = None
    test_cycle_key: str | None = None
    zephyr_project_id: str | None = None
