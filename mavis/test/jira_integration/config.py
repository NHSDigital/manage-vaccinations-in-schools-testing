"""Jira integration configuration."""

import os
from dataclasses import dataclass
from pathlib import Path


@dataclass
class JiraConfig:
    """Configuration for JIRA integration."""

    jira_url: str | None
    jira_username: str | None
    jira_api_token: str | None
    project_key: str
    screenshots_dir: Path = Path("screenshots")
    max_retries: int = 3
    timeout: int = 30
    enabled: bool = True
    attach_passed_screenshots: bool = False
    test_cycle_version: str | None = None
    test_cycle_key: str | None = None
    zephyr_api_token: str | None = None
    zephyr_project_id: str | None = None
    zephyr_url: str | None = None

    @classmethod
    def from_env(cls) -> "JiraConfig":
        """Create JIRA configuration from environment variables."""
        jira_url = os.getenv("JIRA_URL")
        if jira_url and not jira_url.endswith("/rest/api/2/"):
            jira_url = f"{jira_url.rstrip('/')}/rest/api/2/"

        return cls(
            jira_url=jira_url,
            jira_username=os.getenv("JIRA_USERNAME"),
            jira_api_token=os.getenv("JIRA_API_TOKEN"),
            project_key=os.getenv("JIRA_PROJECT_KEY", "MAV"),
            screenshots_dir=Path(os.getenv("JIRA_SCREENSHOTS_DIR", "screenshots")),
            max_retries=int(os.getenv("JIRA_MAX_RETRIES", "3")),
            timeout=int(os.getenv("JIRA_TIMEOUT", "30")),
            enabled=os.getenv("JIRA_INTEGRATION_ENABLED", "true").lower() == "true",
            attach_passed_screenshots=os.getenv(
                "JIRA_ATTACH_PASSED_SCREENSHOTS", "false"
            ).lower()
            == "true",
            test_cycle_version=os.getenv(
                "JIRA_TEST_CYCLE_VERSION", default="Unscheduled"
            ),
            test_cycle_key=os.getenv("JIRA_TEST_CYCLE_KEY", default="Ad hoc"),
            zephyr_api_token=os.getenv("ZEPHYR_API_TOKEN"),
            zephyr_project_id=os.getenv("ZEPHYR_PROJECT_ID"),
            zephyr_url=os.getenv("ZEPHYR_URL"),
        )

    def is_valid(self) -> bool:
        """Check if configuration is valid for JIRA integration."""
        return (
            self.enabled
            and self.jira_url is not None
            and self.jira_api_token is not None
            and self.jira_url.strip() != ""
            and self.jira_api_token.strip() != ""
        )

    def use_jira_integration(self) -> bool:
        """Check if JIRA integration is properly configured."""
        return (
            self.enabled
            and self.jira_url is not None
            and self.jira_api_token is not None
            and self.jira_url.strip() != ""
            and self.jira_api_token.strip() != ""
        )


@dataclass
class JiraIntegrationConfig:
    """Configuration for pure JIRA integration."""

    jira_url: str
    jira_username: str
    jira_api_token: str
    project_key: str
    screenshots_dir: Path = Path("screenshots")
    max_retries: int = 3
    timeout: int = 30
    enabled: bool = True
    use_bearer_auth: bool = True
    attach_passed_screenshots: bool = False
    test_cycle_version: str | None = None
    test_cycle_key: str | None = None
    zephyr_api_token: str | None = None
    zephyr_project_id: str | None = None
    zephyr_url: str | None = None

    @classmethod
    def from_env(cls) -> "JiraIntegrationConfig":
        """Create configuration from environment variables."""
        jira_url = os.getenv("JIRA_URL", "")
        if jira_url and not jira_url.endswith("/"):
            jira_url = jira_url.rstrip("/")

        return cls(
            jira_url=jira_url,
            jira_username=os.getenv("JIRA_USERNAME", ""),
            jira_api_token=os.getenv("JIRA_API_TOKEN", ""),
            project_key=os.getenv("JIRA_PROJECT_KEY", "MAV"),
            screenshots_dir=Path(os.getenv("JIRA_SCREENSHOTS_DIR", "screenshots")),
            max_retries=int(os.getenv("JIRA_MAX_RETRIES", "3")),
            timeout=int(os.getenv("JIRA_TIMEOUT", "30")),
            enabled=os.getenv("JIRA_INTEGRATION_ENABLED", "true").lower() == "true",
            use_bearer_auth=True,
            attach_passed_screenshots=os.getenv(
                "JIRA_ATTACH_PASSED_SCREENSHOTS", "false"
            ).lower()
            == "true",
            test_cycle_version=os.getenv(
                "JIRA_TEST_CYCLE_VERSION", default="Unscheduled"
            ),
            test_cycle_key=os.getenv("JIRA_TEST_CYCLE_KEY", default="Ad hoc"),
            zephyr_api_token=os.getenv("ZEPHYR_API_TOKEN"),
            zephyr_project_id=os.getenv("ZEPHYR_PROJECT_ID"),
            zephyr_url=os.getenv("ZEPHYR_URL"),
        )

    def is_valid(self) -> bool:
        """Check if configuration is valid for JIRA integration."""
        return (
            self.enabled
            and bool(self.jira_url)
            and bool(self.jira_api_token)
            and bool(self.project_key)
            and len(self.jira_url.strip()) > 0
            and len(self.jira_api_token.strip()) > 0
            and len(self.project_key.strip()) > 0
        )
