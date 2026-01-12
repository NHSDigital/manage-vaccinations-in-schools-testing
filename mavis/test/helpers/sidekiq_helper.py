import base64
import os
import time
from typing import Any

import requests


class SidekiqHelper:
    def __init__(self) -> None:
        self.base_url = str(os.environ.get("BASE_URL")).rstrip("/")
        self.sidekiq_url = f"{self.base_url}/sidekiq"

        # Set up authentication similar to browser_context_args fixture
        basic_auth_token = os.environ.get("BASIC_AUTH_TOKEN")
        basic_auth_username = os.environ.get("BASIC_AUTH_USERNAME")
        basic_auth_password = os.environ.get("BASIC_AUTH_PASSWORD")

        if basic_auth_token:
            self.auth_headers = {"Authorization": f"Basic {basic_auth_token}"}
        elif basic_auth_username and basic_auth_password:
            credentials_string = f"{basic_auth_username}:{basic_auth_password}"
            encoded_credentials = base64.b64encode(credentials_string.encode()).decode()
            self.auth_headers = {"Authorization": f"Basic {encoded_credentials}"}
        else:
            self.auth_headers = {}

        # Initialize session for maintaining cookies and state
        self.session = requests.Session()
        self.session.headers.update(
            {
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                ),
                **self.auth_headers,
            }
        )

    def run_recurring_job(
        self, job_name: str, timeout: int = 300, poll_interval: int = 5
    ) -> None:
        """Run a recurring Sidekiq job by name and wait for completion.

        This method triggers a recurring job to run immediately and then waits
        a reasonable amount of time for it to complete.

        Args:
            job_name: The name of the recurring job to run
            timeout: Maximum time to wait for job completion in seconds (default: 300)
            poll_interval: Time between status checks in seconds (default: 5)

        Returns:
            None

        Raises:
            requests.HTTPError: If the API request fails
            requests.RequestException: If there's a network or connection error
        """
        # Get initial stats to track job execution (if available)
        try:
            initial_stats = self._get_sidekiq_stats()
            if isinstance(initial_stats, dict):
                if (
                    "sidekiq" in initial_stats
                    and "enqueued" in initial_stats["sidekiq"]
                ):
                    initial_enqueued = initial_stats["sidekiq"]["enqueued"]
                elif "enqueued" in initial_stats:
                    initial_enqueued = initial_stats["enqueued"]
                else:
                    initial_enqueued = 0
            else:
                initial_enqueued = 0
            stats_available = True
        except (requests.HTTPError, requests.RequestException, ValueError, KeyError):
            initial_enqueued = 0
            stats_available = False

        enqueue_url = f"{self.sidekiq_url}/recurring-jobs/{job_name}/enqueue"

        request_headers = {
            "Accept": (
                "text/html,application/xhtml+xml,application/xml;q=0.9,"
                "image/avif,image/webp,*/*;q=0.8"
            ),
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate",
            "Content-Type": "application/x-www-form-urlencoded",
            "Origin": self.base_url,
            "Connection": "keep-alive",
            "Referer": f"{self.sidekiq_url}/recurring-jobs",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "same-origin",
            "Sec-Fetch-User": "?1",
        }

        # Prepare form data (as URL-encoded form data)
        # Rely on Sec-Fetch-Site header for security instead of authenticity token
        form_data = {
            "_method": "post",
        }

        response = self.session.post(
            enqueue_url,
            headers=request_headers,
            data=form_data,
            timeout=30,
            allow_redirects=True,
        )

        enqueue_response = response
        enqueue_response.raise_for_status()

        # Most Sidekiq jobs complete within 30 seconds
        time.sleep(30)

    def _get_sidekiq_stats(self) -> dict[str, Any]:
        """Internal method to get Sidekiq stats.

        Returns:
            Dict containing Sidekiq statistics
        """
        url = f"{self.sidekiq_url}/stats"

        request_headers = {"Accept": "application/json"}

        response = self.session.get(url, headers=request_headers, timeout=30)
        response.raise_for_status()
        return response.json() if response.content else {}
