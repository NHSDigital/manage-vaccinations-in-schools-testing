"""JIRA integration configuration."""

import os
from dataclasses import dataclass
from pathlib import Path
from typing import Optional


@dataclass
class JiraConfig:
    """Configuration for JIRA integration."""
    url: Optional[str]
    username: Optional[str] 
    api_token: Optional[str]
    project_key: str = "TEST"
    screenshots_dir: Path = Path("screenshots")
    max_retries: int = 3
    timeout: int = 30
    enabled: bool = True

    @classmethod
    def from_env(cls) -> 'JiraConfig':
        """Create configuration from environment variables."""
        return cls(
            url=os.getenv("JIRA_URL"),
            username=os.getenv("JIRA_USERNAME"),
            api_token=os.getenv("JIRA_API_TOKEN"),
            project_key=os.getenv("JIRA_PROJECT_KEY", "TEST"),
            screenshots_dir=Path(os.getenv("JIRA_SCREENSHOTS_DIR", "screenshots")),
            max_retries=int(os.getenv("JIRA_MAX_RETRIES", "3")),
            timeout=int(os.getenv("JIRA_TIMEOUT", "30")),
            enabled=os.getenv("JIRA_INTEGRATION_ENABLED", "true").lower() == "true",
        )

    def is_valid(self) -> bool:
        """Check if configuration is valid for JIRA integration."""
        return all([self.url, self.username, self.api_token]) and self.enabled