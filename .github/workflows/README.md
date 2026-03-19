# GitHub Workflows

This is a quick reference for how each end-to-end test workflow works and how they can be configured if necessary.

## End-to-End tests (`end-to-end-tests.yaml`)

A **reusable workflow** (`workflow_call`) used by `ci.yaml` and other workflows. Can also be triggered manually (`workflow_dispatch`).

Runs Playwright end-to-end tests with a number of configurable inputs and generates an Allure report.

Use this if:
* You want to run the tests against a deployed environment of Mavis (e.g. qa, training, sandbox-beta) to check that they are passing
  * The default workflow fields are best in this case.
* You want to generate evidence that a feature is working
  * You can ensure screenshots are taken on every step by setting the "Take screenshots on every step" option to `true`
  * In this case you probably only want to run relevant tests. You should supply the path to the test(s) in the "Tests to run" field e.g. `tests/test_start.py` or `tests/test_start.py::test_start_page_elements_visible`

## Continuous Integration (`ci.yaml`)

Triggered on every **pull request**. Determines whether to run end-to-end tests against the staging environment or a local container build:

* If you are developing a branch of Mavis and need to make corresponding changes to the end-to-end-tests, you should ensure your branch in this testing repo has the same name as the branch in the [Mavis application repo](https://github.com/NHSDigital/manage-vaccinations-in-schools). If this is the case, the tests are run against a freshly built container of the Mavis branch.
* Otherwise, tests are run against the QA staging environment (`qa.mavistesting.com`).

A final gating job (`ensure-run-success`) ensures the PR can only be merged if one of the two test runs succeeds.

## End-to-End tests — all devices (`end-to-end-tests-all-devices.yaml`)

**Scheduled** nightly at 03:00 UTC, or triggered manually. Runs the full end-to-end test suite in a matrix across all supported browsers and devices (up to 2 in parallel):

## End-to-End tests with Jira integration (`end-to-end-tests-release.yaml`)

Identical to `end-to-end-tests.yaml` but additionally posts results to a Jira test cycle. Requires the `JIRA_API_TOKEN` secret and accepts a `jira_test_cycle_version` input (default: `Unscheduled`).

## Accessibility tests (`accessibility.yaml`)

**Scheduled** nightly at 02:00 UTC, or triggered manually. Runs the accessibility test suite using Playwright.

Supports the same device and environment options as the main end-to-end test workflow. When triggered manually, you can also choose the target environment (QA, training, sandbox-alpha, sandbox-beta) and specific programmes to test.
