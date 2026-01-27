# Zephyr Scale Integration for Pytest

This module provides automatic test case creation and execution reporting for Zephyr Scale (formerly Zephyr for Jira).

## Overview

The integration replaces the previous custom Jira approach with proper Zephyr Scale support, providing:

- Automatic test case creation from pytest docstrings
- Real-time test execution reporting
- Screenshot capture and attachment
- Test cycle management
- Comprehensive test result tracking

## Configuration

Set the following environment variables:

### Required
- `JIRA_URL`: Your Jira instance URL (e.g., `https://your-company.atlassian.net`)
- `JIRA_USERNAME`: Your Jira username/email
- `JIRA_API_TOKEN`: Your Jira API token
- `JIRA_PROJECT_KEY`: The project key in Jira (e.g., `TEST`)

### Optional
- `ZEPHYR_SCALE_TOKEN`: Zephyr Scale API token (defaults to JIRA_API_TOKEN if not provided)
- `ZEPHYR_INTEGRATION_ENABLED`: Enable/disable integration (default: `true`)
- `JIRA_SCREENSHOTS_DIR`: Screenshot storage directory (default: `screenshots`)
- `JIRA_MAX_RETRIES`: Maximum retry attempts (default: `3`)
- `JIRA_TIMEOUT`: Request timeout in seconds (default: `30`)
- `TEST_ENVIRONMENT`: Test environment name for executions (default: `local`)

## Features

### Automatic Test Case Creation

Test cases are automatically created in Zephyr Scale based on pytest function docstrings:

```python
def test_user_login():
    \"\"\"
    Test: User can successfully log in to the application
    Steps:
    1. Navigate to login page
    2. Enter valid credentials
    3. Click login button
    Verification:
    - User is redirected to dashboard
    - Welcome message is displayed
    \"\"\"
    # Your test code here
```

### Test Execution Tracking

Each test run creates:
- A test cycle for the execution session
- Individual test executions linked to test cases
- Results (Pass/Fail/Blocked/Not Executed)
- Error messages for failed tests
- Screenshot attachments

### Screenshot Management

Screenshots are automatically captured:
- At test start
- On test completion (pass/fail)
- Attached to test executions in Zephyr Scale
- Cleaned up after reporting

## Architecture

### Key Components

- **ZephyrClient**: Handles Zephyr Scale REST API interactions
- **ZephyrTestReporter**: Manages test reporting workflow
- **ZephyrTestCase/ZephyrTestExecution**: Data models for test entities
- **Auto-fixtures**: Automatic pytest integration

### Changes from Previous Implementation

1. **API Integration**: Uses Zephyr Scale REST API instead of basic Jira API
2. **Test Management**: Proper test case and execution entities instead of comments
3. **Cycle Management**: Automatic test cycle creation for organized execution tracking
4. **Enhanced Metadata**: Support for folders, environments, and proper test statuses

## Usage

The integration works automatically when:
1. Environment variables are configured
2. Tests have proper docstrings
3. `ZEPHYR_INTEGRATION_ENABLED=true`

### Manual Usage

```python
from mavis.test.jira_integration import ZephyrTestReporter, ZephyrTestCase

reporter = ZephyrTestReporter()
test_case = ZephyrTestCase(
    summary="Manual Test Case",
    description="A manually created test case",
    test_steps=[],
    project_key="TEST"
)

test_case_id = reporter.client.create_test_case(test_case)
```

## Dependencies

- `zephyr-python-api`: Zephyr Scale API client
- `requests`: HTTP client for API calls
- `playwright`: For screenshot capture

## Migration from Previous Implementation

The new Zephyr Scale integration replaces the custom Jira comment-based approach with proper test management:

### Before (Custom Jira)
- Test cases as regular Jira issues
- Execution results as comments
- Manual test case management

### After (Zephyr Scale)
- Dedicated test case entities
- Proper execution tracking
- Automated test cycle management
- Enhanced reporting capabilities

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Verify API token has correct permissions
2. **Test Case Creation Fails**: Check project key and folder permissions
3. **Screenshots Not Attached**: Ensure screenshot directory is writable

### Logging

Enable debug logging to troubleshoot issues:

```python
import logging
logging.getLogger('mavis.test.jira_integration').setLevel(logging.DEBUG)
```

## API Reference

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `JIRA_URL` | Jira instance URL | None | Yes |
| `JIRA_USERNAME` | Jira username | None | Yes |
| `JIRA_API_TOKEN` | Jira API token | None | Yes |
| `JIRA_PROJECT_KEY` | Project key | `TEST` | Yes |
| `ZEPHYR_SCALE_TOKEN` | Zephyr token | `JIRA_API_TOKEN` | No |
| `ZEPHYR_INTEGRATION_ENABLED` | Enable integration | `true` | No |
| `JIRA_SCREENSHOTS_DIR` | Screenshot directory | `screenshots` | No |
| `TEST_ENVIRONMENT` | Test environment | `local` | No |