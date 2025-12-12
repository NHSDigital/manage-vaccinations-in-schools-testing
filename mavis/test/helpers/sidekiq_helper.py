import base64
import os
import re
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

    def _get_authenticity_token(self) -> str:
        """Get authenticity token from Sidekiq recurring-jobs page.

        Returns:
            The authenticity token string

        Raises:
            requests.HTTPError: If the API request fails
            ValueError: If authenticity token is not found in response
        """
        url = f"{self.sidekiq_url}/recurring-jobs"

        request_headers = {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
        }

        response = self.session.get(url, headers=request_headers, timeout=30)
        response.raise_for_status()

        # Extract authenticity token from HTML response
        # Try multiple patterns as the token can appear in different formats
        patterns = [
            r'name=["\']authenticity_token["\'][^>]*value=["\']([^"\']+)["\']',
            r'value=["\']([^"\']+)["\'][^>]*name=["\']authenticity_token["\']',
            r'<input[^>]*name=["\']authenticity_token["\'][^>]*value=["\']([^"\']+)["\']',
            r'<meta[^>]*name=["\']csrf-token["\'][^>]*content=["\']([^"\']+)["\']',
            r'"authenticity_token"[^:]*:\s*["\']([^"\']+)["\']',
        ]

        token = None
        for pattern in patterns:
            token_match = re.search(pattern, response.text, re.IGNORECASE)
            if token_match:
                token = token_match.group(1)
                break

        if not token:
            msg = "Authenticity token not found in response"
            raise ValueError(msg)

        return token

    def run_recurring_job(
        self, job_name: str, timeout: int = 300, poll_interval: int = 5
    ) -> dict[str, Any]:
        """Run a recurring Sidekiq job by name and wait for completion.

        This method triggers a recurring job to run immediately and then polls
        the Sidekiq API until the job completes or fails.

        Args:
            job_name: The name of the recurring job to run
            timeout: Maximum time to wait for job completion in seconds (default: 300)
            poll_interval: Time between status checks in seconds (default: 2)

        Returns:
            Dict containing the final job status and execution details

        Raises:
            requests.HTTPError: If the API request fails
            requests.RequestException: If there's a network or connection error
            TimeoutError: If the job doesn't complete within the timeout period
        """
        # Get initial stats to track job execution
        initial_stats = self._get_sidekiq_stats()
        initial_enqueued = initial_stats.get("enqueued", 0)
        initial_processed = initial_stats.get("processed", 0)
        initial_failed = initial_stats.get("failed", 0)

        # Get authenticity token for POST request
        authenticity_token = self._get_authenticity_token()

        # Enqueue the recurring job - try the standard Rails RESTful route
        enqueue_url = f"{self.sidekiq_url}/recurring-jobs/{job_name}/enqueue"

        # Prepare request headers for form submission (match browser behavior exactly)
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

        # Prepare form data with authenticity token (as URL-encoded form data)
        form_data = {
            "authenticity_token": authenticity_token,
            "_method": "post",  # Some Rails apps need this
        }

        response = self.session.post(
            enqueue_url,
            headers=request_headers,
            data=form_data,
            timeout=30,
            allow_redirects=True,  # Follow any redirects after POST
        )

        enqueue_response = response
        enqueue_response.raise_for_status()

        # Poll for job completion by monitoring enqueued count
        start_time = time.time()
        job_was_enqueued = False

        while time.time() - start_time < timeout:
            # Check current stats
            current_stats = self._get_sidekiq_stats()
            current_enqueued = current_stats["sidekiq"]["enqueued"]

            # Check if job was enqueued (count increased by 1 or more)
            if current_enqueued > initial_enqueued and job_was_enqueued is False:
                job_was_enqueued = True

            # Job completed when it was enqueued and count is back to initial level
            if job_was_enqueued and current_enqueued <= initial_enqueued:
                return {
                    "status": "completed",
                    "job_name": job_name,
                    "enqueue_status_code": enqueue_response.status_code,
                    "execution_time": round(time.time() - start_time, 2),
                    "stats": {
                        "initial_enqueued": initial_enqueued,
                        "max_enqueued": max(current_enqueued, initial_enqueued + 1),
                        "final_enqueued": current_enqueued,
                        "initial_processed": initial_processed,
                        "initial_failed": initial_failed,
                    },
                    "message": f"Recurring job '{job_name}' completed",
                }

            # Wait before next check
            time.sleep(poll_interval)

        # Job didn't complete within timeout
        msg = f"Job '{job_name}' did not complete within {timeout} seconds"
        raise TimeoutError(msg)

    def _get_sidekiq_stats(self) -> dict[str, Any]:
        """Internal method to get Sidekiq stats.

        Returns:
            Dict containing Sidekiq statistics
        """
        url = f"{self.sidekiq_url}/stats"

        # Prepare request headers
        request_headers = {"Accept": "application/json"}

        response = self.session.get(url, headers=request_headers, timeout=30)
        response.raise_for_status()
        return response.json() if response.content else {}

    def get_job_status(self, job_name: str) -> dict[str, Any]:
        """Get the status of a recurring job.

        Args:
            job_name: The name of the job to check

        Returns:
            Dict containing job status information

        Raises:
            requests.HTTPError: If the API request fails
        """
        url = f"{self.sidekiq_url}/recurring/{job_name}"

        # Prepare request headers
        request_headers = {"Accept": "application/json"}

        response = self.session.get(url, headers=request_headers, timeout=30)
        response.raise_for_status()

        return {
            "status_code": response.status_code,
            "job_name": job_name,
            "data": response.json() if response.content else {},
        }

    def list_recurring_jobs(self) -> dict[str, Any]:
        """List all recurring jobs in Sidekiq.

        Returns:
            Dict containing list of all recurring jobs

        Raises:
            requests.HTTPError: If the API request fails
        """
        url = f"{self.sidekiq_url}/recurring"

        # Prepare request headers
        request_headers = {"Accept": "application/json"}

        response = self.session.get(url, headers=request_headers, timeout=30)
        response.raise_for_status()

        return {
            "status_code": response.status_code,
            "jobs": response.json() if response.content else [],
        }

    def get_sidekiq_stats(self) -> dict[str, Any]:
        """Get general Sidekiq statistics.

        Returns:
            Dict containing Sidekiq stats (processed, failed, busy, etc.)

        Raises:
            requests.HTTPError: If the API request fails
        """
        return self._get_sidekiq_stats()
