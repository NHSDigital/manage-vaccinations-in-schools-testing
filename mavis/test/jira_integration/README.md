# Jira Integration for Pytest

This package provides automated test result reporting to Jira using Zephyr Squad/Scale.

## How It Works

When pytest tests run, this integration automatically:
1. Searches for a Jira test case matching the test name
2. Creates a new test case if one doesn't exist
3. Creates a test execution in the specified test cycle
4. Updates the execution status based on the test result (PASS/FAIL/SKIPPED)

## Configuration

All environment variables below are **required** for the integration to work. If any are missing or invalid, the integration will be disabled and tests will run without Jira reporting.

```bash
export JIRA_INTEGRATION_ENABLED=true
export JIRA_REPORTING_URL=https://your-jira-instance.atlassian.net
export JIRA_API_TOKEN=your-api-token
export JIRA_PROJECT_KEY=MAV
export JIRA_PROJECT_ID=10001
export JIRA_TEST_CYCLE_NAME="Sprint 1"
export JIRA_TEST_CYCLE_VERSION="1.0.0"
```

### Environment Variables

- `JIRA_INTEGRATION_ENABLED` - Enable/disable integration (default: `true`)
- `JIRA_REPORTING_URL` - **Required**. Base URL of your Jira instance
- `JIRA_API_TOKEN` - **Required**. Jira API token
- `JIRA_PROJECT_KEY` - **Required**. Project key (e.g., MAV)
- `JIRA_PROJECT_ID` - **Required**. Numeric project ID
- `JIRA_TEST_CYCLE_NAME` - **Required**. Name of the test cycle to report to
- `JIRA_TEST_CYCLE_VERSION` - **Required**. Version of the test cycle (must match exactly)

## Architecture

The package consists of:

- **config.py** - Configuration management from environment variables
- **models.py** - Data models and result mapping
- **client.py** - Jira/Zephyr REST API client
- **reporter.py** - Main reporter logic (initializes once per test session)
- **hooks.py** - Pytest hooks integration

### Initialization

The integration initializes at the start of the pytest session (`pytest_configure` hook):
1. Loads configuration from environment variables
2. Validates all required fields are present
3. Creates an authenticated Jira client
4. Looks up the test cycle ID by name and version
5. If any step fails, the integration is disabled and an info message is logged

This "fail fast" approach ensures configuration errors are caught immediately before any tests run.

## API Endpoints Used

### Jira REST API (v2)
- `GET /rest/api/2/issue/{issueKey}` - Get issue details
- `POST /rest/api/2/issue` - Create test cases
- `GET /rest/api/2/search` - Search for test cases by name

### Zephyr Squad API
- `GET /rest/zapi/latest/cycle` - Get test cycles
- `POST /rest/zapi/latest/execution` - Create test execution
- `PUT /rest/zapi/latest/execution/{executionId}/execute` - Update status
- `GET /rest/zapi/latest/util/testExecutionStatus` - Get status IDs

## Result Mapping

| Pytest Outcome | Jira/Zephyr Status |
|----------------|-------------------|
| passed         | PASS              |
| failed         | FAIL              |
| skipped        | UNEXECUTED        |

## Disabling Integration

To disable the integration:
```bash
export JIRA_INTEGRATION_ENABLED=false
```

The integration will also be automatically disabled if:
- Any required environment variable is missing or empty
- The specified test cycle name is not found in Jira
- The specified test cycle version doesn't match
- Authentication fails
- Any API connection error occurs during initialization

When disabled, tests will run normally without Jira reporting, and you'll see a log message explaining why.
