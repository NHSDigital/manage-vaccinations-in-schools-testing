import os
import time
from typing import Any

import requests


class SidekiqHelper:
    def __init__(self) -> None:
        self.base_url = str(os.environ.get("BASE_URL")).rstrip("/")
        self.sidekiq_url = f"{self.base_url}/sidekiq"

    def run_recurring_job(
        self, job_name: str, timeout: int = 300, poll_interval: int = 2
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
        initial_processed = initial_stats.get("processed", 0)
        initial_failed = initial_stats.get("failed", 0)

        # Enqueue the recurring job
        enqueue_url = f"{self.sidekiq_url}/recurring/{job_name}/enqueue"

        enqueue_response = requests.post(
            url=enqueue_url,
            headers={"Accept": "application/json", "Content-Type": "application/json"},
            timeout=30,
        )

        enqueue_response.raise_for_status()

        # Poll for job completion
        start_time = time.time()

        while time.time() - start_time < timeout:
            # Check current stats
            current_stats = self._get_sidekiq_stats()
            current_processed = current_stats.get("processed", 0)
            current_failed = current_stats.get("failed", 0)

            # Check if any jobs are currently running
            busy_count = current_stats.get("busy", 0)

            # If processed or failed count increased and no jobs are busy,
            # job likely completed
            if (
                current_processed > initial_processed or current_failed > initial_failed
            ) and busy_count == 0:
                job_status = (
                    "completed" if current_failed == initial_failed else "failed"
                )

                return {
                    "status": job_status,
                    "job_name": job_name,
                    "enqueue_status_code": enqueue_response.status_code,
                    "execution_time": round(time.time() - start_time, 2),
                    "stats": {
                        "initial_processed": initial_processed,
                        "final_processed": current_processed,
                        "initial_failed": initial_failed,
                        "final_failed": current_failed,
                        "jobs_processed": current_processed - initial_processed,
                        "jobs_failed": current_failed - initial_failed,
                    },
                    "message": f"Recurring job '{job_name}' {job_status}",
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
        response = requests.get(
            url=url, headers={"Accept": "application/json"}, timeout=30
        )
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

        response = requests.get(
            url=url, headers={"Accept": "application/json"}, timeout=30
        )

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

        response = requests.get(
            url=url, headers={"Accept": "application/json"}, timeout=30
        )

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
